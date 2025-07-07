package com.dcmc.apps.taskmanager.service;

import com.dcmc.apps.taskmanager.domain.*;
import com.dcmc.apps.taskmanager.domain.enumeration.TaskStatus;
import com.dcmc.apps.taskmanager.repository.*;
import com.dcmc.apps.taskmanager.service.dto.*;
import com.dcmc.apps.taskmanager.service.mapper.TaskMapper;


import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.dcmc.apps.taskmanager.domain.Task}.
 */
@Service
@Transactional
public class TaskService {

    private static final Logger LOG = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository taskRepository;

    private final TaskMapper taskMapper;

    private final SecurityUtilsService securityUtilsService;

    private final UserRepository userRepository;

    private final WorkGroupRepository workGroupRepository;

    private final ProjectRepository projectRepository;

    private final WorkGroupMembershipRepository workGroupMembershipRepository;

    private final PriorityRepository priorityRepository;

    private final StatusRepository statusRepository;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper,
                       SecurityUtilsService securityUtilsService,
                       UserRepository userRepository, WorkGroupRepository workGroupRepository,
                       WorkGroupMembershipRepository workGroupMembershipRepository,
                       ProjectRepository projectRepository,
                       PriorityRepository priorityRepository, StatusRepository statusRepository) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
        this.securityUtilsService = securityUtilsService;
        this.userRepository = userRepository;
        this.workGroupRepository = workGroupRepository;
        this.workGroupMembershipRepository = workGroupMembershipRepository;
        this.projectRepository = projectRepository;
        this.priorityRepository = priorityRepository;
        this.statusRepository = statusRepository;
    }

    /**
     * Save a task.
     *
     * @param taskDTO the entity to save.
     * @return the persisted entity.
     */
    public TaskDTO save(TaskDTO taskDTO) {
        LOG.debug("Request to save Task : {}", taskDTO);
        Task task = taskMapper.toEntity(taskDTO);
        task = taskRepository.save(task);
        return taskMapper.toDto(task);
    }

    /**
     * Update a task.
     *
     * @param taskDTO the entity to save.
     * @return the persisted entity.
     */
    public TaskDTO update(TaskDTO taskDTO) {
        LOG.debug("Request to update Task : {}", taskDTO);
        Task task = taskMapper.toEntity(taskDTO);
        task = taskRepository.save(task);
        return taskMapper.toDto(task);
    }

    /**
     * Partially update a task.
     *
     * @param taskDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<TaskDTO> partialUpdate(TaskDTO taskDTO) {
        LOG.debug("Request to partially update Task : {}", taskDTO);

        return taskRepository
            .findById(taskDTO.getId())
            .map(existingTask -> {
                taskMapper.partialUpdate(existingTask, taskDTO);

                return existingTask;
            })
            .map(taskRepository::save)
            .map(taskMapper::toDto);
    }

    /**
     * Get all the tasks with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<TaskDTO> findAllWithEagerRelationships(Pageable pageable) {
        return taskRepository.findAllWithEagerRelationships(pageable).map(taskMapper::toDto);
    }

    /**
     * Get one task by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TaskDetailsDTO> findOne(Long id) {
        return taskRepository.findById(id)
            .filter(task -> Boolean.TRUE.equals(task.getActive())) // opcional: solo activos
            .map(taskMapper::toDetailsDto); // ahora usamos el nuevo DTO
    }

    /**
     * Delete the task by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Task : {}", id);
        taskRepository.deleteById(id);
    }

    @Transactional
    public TaskDTO createTask(Long groupId, Long projectId, TaskCreateDTO dto) {
        Task task = new Task();

        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());

        // Obtener Priority
        Priority priority = priorityRepository.findById(dto.getPriorityId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid priority ID"));
        task.setPriorityEntity(priority);

        // Obtener Status
        Status status = statusRepository.findById(dto.getStatusId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status ID"));
        task.setStatusEntity(status);

        task.setArchived(false);
        task.setActive(true);
        task.setCreateTime(Instant.now());
        task.setUpdateTime(Instant.now());

        // Asignar creador
        String currentUserLogin = securityUtilsService.getCurrentUser();
        User creator = userRepository.findOneByLogin(currentUserLogin)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user not found"));
        task.setCreator(creator);

        // Validar WorkGroup
        WorkGroup wg = workGroupRepository.findByIdAndIsActiveTrue(groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "WorkGroup not found or inactive"));
        task.setWorkGroup(wg);

        // Validar Project
        Project project = projectRepository.findByIdAndIsActiveTrue(projectId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found or inactive"));
        if (!project.getWorkGroup().getId().equals(groupId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project does not belong to the specified WorkGroup");
        }
        task.setProject(project);
        task.setParentProject(null);
        task.setPriority(com.dcmc.apps.taskmanager.domain.enumeration.Priority.NULL);
        task.setStatus(TaskStatus.NULL);
        return taskMapper.toDto(taskRepository.save(task));
    }

    @Transactional
    public TaskDTO createSubTask(Long groupId, Long projectId, Long parentTaskId, TaskCreateDTO dto) {
        Task parentTask = taskRepository.findById(parentTaskId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent task not found"));

        if (Boolean.TRUE.equals(parentTask.getArchived())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot add subtask to an archived task");
        }

        Task subTask = new Task();
        subTask.setTitle(dto.getTitle());
        subTask.setDescription(dto.getDescription());

        // Obtener Priority
        Priority priority = priorityRepository.findById(dto.getPriorityId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid priority ID"));
        subTask.setPriorityEntity(priority);

        // Obtener Status
        Status status = statusRepository.findById(dto.getStatusId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status ID"));
        subTask.setStatusEntity(status);

        subTask.setArchived(false);
        subTask.setActive(true);
        subTask.setCreateTime(Instant.now());
        subTask.setUpdateTime(Instant.now());

        // Asignar creador
        String currentUserLogin = securityUtilsService.getCurrentUser();
        User creator = userRepository.findOneByLogin(currentUserLogin)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user not found"));
        subTask.setCreator(creator);

        // Validar WorkGroup y Project
        WorkGroup wg = workGroupRepository.findByIdAndIsActiveTrue(groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "WorkGroup not found or inactive"));
        subTask.setWorkGroup(wg);

        Project project = projectRepository.findByIdAndIsActiveTrue(projectId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found or inactive"));
        if (!project.getWorkGroup().getId().equals(groupId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project does not belong to the specified WorkGroup");
        }
        subTask.setProject(project);
        subTask.setParentTask(parentTask);

        subTask.setParentProject(null);
        subTask.setPriority(com.dcmc.apps.taskmanager.domain.enumeration.Priority.NULL);
        subTask.setStatus(TaskStatus.NULL);

        return taskMapper.toDto(taskRepository.save(subTask));
    }


    @Transactional
    public TaskDTO updateTask(Long taskId, TaskUpdateDTO dto) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        if (Boolean.TRUE.equals(task.getArchived())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Archived tasks cannot be edited");
        }

        String currentUserLogin = securityUtilsService.getCurrentUser();
        if (!task.getCreator().getLogin().equals(currentUserLogin)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the creator of the task can update it");
        }

        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setUpdateTime(Instant.now());

        // Obtener y asignar Priority
        Priority priority = priorityRepository.findById(dto.getPriorityId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid priority ID"));
        task.setPriorityEntity(priority);

        // Obtener y asignar Status
        Status status = statusRepository.findById(dto.getStatusId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status ID"));
        task.setStatusEntity(status);

        return taskMapper.toDto(taskRepository.save(task));
    }

    public List<TaskSimpleDTO> getTasksByWorkGroupId(Long workGroupId) {
        List<Task> tasks = taskRepository.findByWorkGroup_IdAndArchivedFalse(workGroupId);
        return taskMapper.toSimpleDto(tasks);
    }

    @Transactional(readOnly = true)
    public List<TaskSimpleDTO> getTasksByProjectId(Long projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        if (!Boolean.TRUE.equals(project.getActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project is not active");
        }

        List<Task> tasks = taskRepository.findByProject_IdAndArchivedFalseAndIsActiveTrue(projectId);

        return taskMapper.toSimpleDto(tasks);
    }

    public List<TaskSimpleDTO> getAllTasks() {
        List<Task> tasks = taskRepository.findByArchivedFalseAndIsActiveTrue();
        return taskMapper.toSimpleDto(tasks);
    }

    @Transactional
    public void softDeleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        String currentUserLogin = securityUtilsService.getCurrentUser();

        // Si la tarea está archivada, solo OWNER o MODERATOR pueden eliminarla
        if (Boolean.TRUE.equals(task.getArchived())) {
            Long groupId = task.getWorkGroup().getId();
            securityUtilsService.assertOwnerOrModerator(groupId);
        } else {
            // Si NO está archivada, solo el creador puede eliminarla
            if (!task.getCreator().getLogin().equals(currentUserLogin)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the creator of the task can delete it");
            }
        }

        if (Boolean.FALSE.equals(task.getActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task is already deactivated");
        }

        task.setActive(false);
        task.setUpdateTime(Instant.now());
        taskRepository.save(task);
    }

    @Transactional
    public void assignUsersToTask(Long groupId, TaskAssignmentDTO dto) {
        Task task = taskRepository.findById(dto.getTaskId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        // Verificar que los usuarios pertenezcan al grupo
        List<WorkGroupMembership> memberships = workGroupMembershipRepository
            .findByWorkGroup_IdAndIsInGroupTrue(groupId);

        Set<String> validUserIds = memberships.stream()
            .map(m -> m.getUser().getId())
            .collect(Collectors.toSet());

        for (String id : dto.getUserIds()) {
            if (!validUserIds.contains(id)) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User with ID " + id + " is not a member of the group"
                );
            }
        }

        // Obtener los usuarios a agregar
        Set<User> usersToAdd = new HashSet<>(userRepository.findAllById(dto.getUserIds()));

        if (usersToAdd.size() != dto.getUserIds().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Some user IDs do not exist");
        }

        // Verificar si ya están asignados
        Set<User> currentUsers = task.getAssignedTos();
        for (User user : usersToAdd) {
            if (currentUsers.contains(user)) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User with ID " + user.getId() + " is already assigned to the task"
                );
            }
        }

        // Asignar usuarios nuevos
        currentUsers.addAll(usersToAdd);
        task.setUpdateTime(Instant.now());
        taskRepository.save(task);
    }

    @Transactional
    public void unassignUsersFromTask(Long groupId, TaskAssignmentDTO dto) {
        Task task = taskRepository.findById(dto.getTaskId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        // Verificar que los usuarios pertenezcan al grupo
        List<WorkGroupMembership> memberships = workGroupMembershipRepository
            .findByWorkGroup_IdAndIsInGroupTrue(groupId);

        Set<String> validUserIds = memberships.stream()
            .map(m -> m.getUser().getId())
            .collect(Collectors.toSet());

        for (String id : dto.getUserIds()) {
            if (!validUserIds.contains(id)) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User with ID " + id + " is not a member of the group"
                );
            }
        }

        // Obtener usuarios a desasignar
        Set<User> usersToRemove = new HashSet<>(userRepository.findAllById(dto.getUserIds()));

        if (usersToRemove.size() != dto.getUserIds().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Some user IDs do not exist");
        }

        Set<User> currentUsers = task.getAssignedTos();

        for (User user : usersToRemove) {
            if (!currentUsers.contains(user)) {
                throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User with ID " + user.getId() + " is not assigned to the task"
                );
            }
        }

        // Desasignar usuarios
        currentUsers.removeAll(usersToRemove);
        task.setUpdateTime(Instant.now());
        taskRepository.save(task);
    }


    @Transactional(readOnly = true)
    public List<UserDTO> getAssignedUsers(Long taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        Set<User> assignedUsers = task.getAssignedTos();
        return assignedUsers.stream()
            .map(user -> {
                UserDTO dto = new UserDTO();
                dto.setId(user.getId());
                dto.setLogin(user.getLogin());
                return dto;
            })
            .collect(Collectors.toList());
    }

    @Transactional
    public void archiveTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        // Verificar que la tarea tenga status DONE
        if (!"DONE".equals(task.getStatusEntity().getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only tasks with status DONE can be archived");
        }

        // Marcar la tarea como archivada
        task.setArchived(true);
        task.setUpdateTime(Instant.now());

        taskRepository.save(task);
    }

    @Transactional(readOnly = true)
    public List<TaskSimpleDTO> getArchivedTasksByProject(Long projectId) {
        // Validar que el proyecto existe y está activo
        Project project = projectRepository.findByIdAndIsActiveTrue(projectId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found or inactive"));

        // Obtener tareas archivadas activas de ese proyecto
        List<Task> archivedTasks = taskRepository.findByProject_IdAndArchivedTrueAndIsActiveTrue(projectId);

        return taskMapper.toSimpleDto(archivedTasks);
    }

    @Transactional(readOnly = true)
    public List<TaskSimpleDTO> getSubTasks(Long parentTaskId) {
        // Buscar subtareas filtradas
        List<Task> subTasks = taskRepository.findByParentTask_IdAndArchivedFalseAndIsActiveTrue(parentTaskId);

        // Mapear a DTO simplificado
        return taskMapper.toSimpleDto(subTasks);
    }

    @Transactional(readOnly = true)
    public List<TaskSimpleDTO> getAssignedMainTasksForCurrentUser() {
        String currentUserLogin = securityUtilsService.getCurrentUser();
        List<Task> tasks = taskRepository.findByAssignedTos_LoginAndParentTaskIsNullAndArchivedFalseAndIsActiveTrue(currentUserLogin);
        return taskMapper.toSimpleDto(tasks);
    }

    @Transactional(readOnly = true)
    public List<TaskSimpleDTO> getAssignedSubTasksForCurrentUser() {
        String currentUserLogin = securityUtilsService.getCurrentUser();
        List<Task> subtasks = taskRepository.findByAssignedTos_LoginAndParentTaskIsNotNullAndArchivedFalseAndIsActiveTrue(currentUserLogin);
        return taskMapper.toSimpleDto(subtasks);
    }

    @Transactional(readOnly = true)
    public List<TaskSimpleDTO> getCreatedMainTasksByCurrentUser() {
        String currentUserLogin = securityUtilsService.getCurrentUser();
        List<Task> tasks = taskRepository.findByCreator_LoginAndParentTaskIsNullAndArchivedFalseAndIsActiveTrue(currentUserLogin);
        return taskMapper.toSimpleDto(tasks);
    }

    @Transactional(readOnly = true)
    public List<TaskSimpleDTO> getCreatedSubTasksByCurrentUser() {
        String currentUserLogin = securityUtilsService.getCurrentUser();
        List<Task> subtasks = taskRepository.findByCreator_LoginAndParentTaskIsNotNullAndArchivedFalseAndIsActiveTrue(currentUserLogin);
        return taskMapper.toSimpleDto(subtasks);
    }

    @Transactional
    public void unarchiveTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        // Verificar que la tarea esté actualmente archivada
        if (Boolean.FALSE.equals(task.getArchived())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task is not archived");
        }

        // Verificar permisos del usuario (OWNER o MODERATOR)
        Long workGroupId = task.getWorkGroup().getId();
        securityUtilsService.assertOwnerOrModerator(workGroupId);

        // Desarchivar la tarea
        task.setArchived(false);
        task.setUpdateTime(Instant.now());

        taskRepository.save(task);
    }
}
