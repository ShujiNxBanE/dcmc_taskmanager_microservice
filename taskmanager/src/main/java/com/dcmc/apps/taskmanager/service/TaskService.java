package com.dcmc.apps.taskmanager.service;

import com.dcmc.apps.taskmanager.domain.Task;
import com.dcmc.apps.taskmanager.domain.User;
import com.dcmc.apps.taskmanager.domain.WorkGroup;
import com.dcmc.apps.taskmanager.domain.WorkGroupMembership;
import com.dcmc.apps.taskmanager.repository.TaskRepository;
import com.dcmc.apps.taskmanager.repository.UserRepository;
import com.dcmc.apps.taskmanager.repository.WorkGroupMembershipRepository;
import com.dcmc.apps.taskmanager.repository.WorkGroupRepository;
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
import org.springframework.security.access.AccessDeniedException;
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

    private final WorkGroupMembershipRepository workGroupMembershipRepository;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper,
                       SecurityUtilsService securityUtilsService,
                       UserRepository userRepository, WorkGroupRepository workGroupRepository,
                       WorkGroupMembershipRepository workGroupMembershipRepository) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
        this.securityUtilsService = securityUtilsService;
        this.userRepository = userRepository;
        this.workGroupRepository = workGroupRepository;
        this.workGroupMembershipRepository = workGroupMembershipRepository;
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
    public Optional<TaskDTO> findOne(Long id) {
        LOG.debug("Request to get Task : {}", id);
        return taskRepository.findOneWithEagerRelationships(id).map(taskMapper::toDto);
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

    public TaskDTO createTaskAtWorkGroup(Long workGroupId, TaskCreateDTO dto) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setPriority(dto.getPriority());
        task.setStatus(dto.getStatus());
        task.setArchived(false);
        task.setActive(true);

        task.setCreateTime(Instant.now());
        task.setUpdateTime(Instant.now());

        // Asignar creador desde usuario autenticado
        String currentUserLogin = securityUtilsService.getCurrentUser();
        User creator = userRepository.findOneByLogin(currentUserLogin)
            .orElseThrow(() -> new IllegalArgumentException("Creator user not found"));
        task.setCreator(creator);

        // Asignar WorkGroup desde parámetro
        WorkGroup wg = workGroupRepository.findById(workGroupId)
            .orElseThrow(() -> new IllegalArgumentException("WorkGroup not found"));
        task.setWorkGroup(wg);

        // No parentProject: tarea a nivel WorkGroup
        task.setParentProject(null);

        task = taskRepository.save(task);
        return taskMapper.toDto(task);
    }

    public TaskDTO updateTaskAtWorkGroup(Long taskId, TaskUpdateDTO dto) {
        // Buscar la tarea
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        // Validar que el usuario actual es el creador de la tarea
        String currentUserLogin = securityUtilsService.getCurrentUser();
        if (!task.getCreator().getLogin().equals(currentUserLogin)) {
            throw new AccessDeniedException("Only the creator of the task can update it");
        }

        // Actualizar campos permitidos
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setPriority(dto.getPriority());
        task.setStatus(dto.getStatus());
        task.setArchived(dto.getArchived());
        task.setUpdateTime(Instant.now());

        task = taskRepository.save(task);
        return taskMapper.toDto(task);
    }

    public List<TaskSimpleDTO> getTasksByWorkGroupId(Long workGroupId) {
        List<Task> tasks = taskRepository.findByWorkGroup_IdAndArchivedFalse(workGroupId);
        return taskMapper.toSimpleDto(tasks);
    }

    public List<TaskSimpleDTO> getAllTasks() {
        List<Task> tasks = taskRepository.findByArchivedFalse();
        return taskMapper.toSimpleDto(tasks);
    }

    @Transactional
    public void softDeleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        String currentUserLogin = securityUtilsService.getCurrentUser();
        if (!task.getCreator().getLogin().equals(currentUserLogin)) {
            throw new AccessDeniedException("Only the creator of the task can delete it");
        }

        if (Boolean.FALSE.equals(task.getActive())) {
            throw new IllegalStateException("Task is already deactivated");
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
}
