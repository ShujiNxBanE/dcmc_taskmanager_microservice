package com.dcmc.apps.taskmanager.web.rest;

import com.dcmc.apps.taskmanager.repository.TaskRepository;
import com.dcmc.apps.taskmanager.service.TaskQueryService;
import com.dcmc.apps.taskmanager.service.TaskService;
import com.dcmc.apps.taskmanager.service.criteria.TaskCriteria;
import com.dcmc.apps.taskmanager.service.dto.*;
import com.dcmc.apps.taskmanager.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.dcmc.apps.taskmanager.domain.Task}.
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskResource {

    private static final Logger LOG = LoggerFactory.getLogger(TaskResource.class);

    private static final String ENTITY_NAME = "taskmanagerTask";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TaskService taskService;

    private final TaskRepository taskRepository;

    private final TaskQueryService taskQueryService;

    public TaskResource(TaskService taskService, TaskRepository taskRepository, TaskQueryService taskQueryService) {
        this.taskService = taskService;
        this.taskRepository = taskRepository;
        this.taskQueryService = taskQueryService;
    }

    /**
     * {@code PATCH  /tasks/:id} : Partial updates given fields of an existing task, field will ignore if it is null
     *
     * @param id the id of the taskDTO to save.
     * @param taskDTO the taskDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated taskDTO,
     * or with status {@code 400 (Bad Request)} if the taskDTO is not valid,
     * or with status {@code 404 (Not Found)} if the taskDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the taskDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<TaskDTO> partialUpdateTask(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody TaskDTO taskDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Task partially : {}, {}", id, taskDTO);
        if (taskDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, taskDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!taskRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TaskDTO> result = taskService.partialUpdate(taskDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, taskDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /tasks/count} : count all the tasks.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countTasks(TaskCriteria criteria) {
        LOG.debug("REST request to count Tasks by criteria: {}", criteria);
        return ResponseEntity.ok().body(taskQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /tasks/:id} : get the "id" task.
     *
     * @param id the id of the taskDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the taskDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskSimpleDTO> getTaskSimple(@PathVariable("id") Long id) {
        LOG.debug("REST request to get simple Task : {}", id);
        Optional<TaskSimpleDTO> dto = taskService.findOne(id);
        return ResponseUtil.wrapOrNotFound(dto);
    }


    @GetMapping("/work-group/{workGroupId}/tasks")
    public ResponseEntity<List<TaskSimpleDTO>> getTasksByWorkGroup(@PathVariable Long workGroupId) {
        List<TaskSimpleDTO> tasks = taskService.getTasksByWorkGroupId(workGroupId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("")
    public ResponseEntity<List<TaskSimpleDTO>> getAllTasks() {
        List<TaskSimpleDTO> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/by-project/{projectId}")
    public ResponseEntity<List<TaskSimpleDTO>> getTasksByProject(@PathVariable Long projectId) {
        List<TaskSimpleDTO> tasks = taskService.getTasksByProjectId(projectId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/work-group/{groupId}/project/{projectId}/create-task")
    public ResponseEntity<TaskDTO> createTask(
        @PathVariable Long groupId,
        @PathVariable Long projectId,
        @Valid @RequestBody TaskCreateDTO dto
    ) {
        TaskDTO created = taskService.createTask(groupId, projectId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/work-group/{groupId}/project/{projectId}/parent/{parentTaskId}/create-subtask")
    public ResponseEntity<TaskDTO> createSubTask(
        @PathVariable Long groupId,
        @PathVariable Long projectId,
        @PathVariable Long parentTaskId,
        @RequestBody @Valid TaskCreateDTO dto
    ) {
        TaskDTO result = taskService.createSubTask(groupId, projectId, parentTaskId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/{taskId}/update")
    public ResponseEntity<TaskDTO> updateTask(
        @PathVariable Long taskId,
        @Valid @RequestBody TaskUpdateDTO dto
    ) {
        LOG.debug("REST request to update Task with id: {}", taskId);

        TaskDTO updatedTask = taskService.updateTask(taskId, dto);

        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, "task", updatedTask.getId().toString()))
            .body(updatedTask);
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<Void> deleteTask(@PathVariable("id") Long id) {
        taskService.softDeleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/group/{groupId}/assign-member")
    public ResponseEntity<Void> assignUsersToTaskInGroup(
        @PathVariable Long groupId,
        @RequestBody TaskAssignmentDTO dto
    ) {
        taskService.assignUsersToTask(groupId, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{taskId}/assigned-users")
    public ResponseEntity<List<UserDTO>> getAssignedUsers(@PathVariable Long taskId) {
        List<UserDTO> users = taskService.getAssignedUsers(taskId);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<Void> archiveTask(@PathVariable Long id) {
        taskService.archiveTask(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/project/{projectId}/archived-tasks")
    public ResponseEntity<List<TaskSimpleDTO>> getArchivedTasksByProject(@PathVariable Long projectId) {
        List<TaskSimpleDTO> tasks = taskService.getArchivedTasksByProject(projectId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{taskId}/subtasks")
    public ResponseEntity<List<TaskSimpleDTO>> getSubTasks(@PathVariable Long taskId) {
        List<TaskSimpleDTO> subTasks = taskService.getSubTasks(taskId);
        return ResponseEntity.ok(subTasks);
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<TaskSimpleDTO>> getAssignedMainTasks() {
        List<TaskSimpleDTO> tasks = taskService.getAssignedMainTasksForCurrentUser();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/assigned/subtasks")
    public ResponseEntity<List<TaskSimpleDTO>> getAssignedSubTasks() {
        List<TaskSimpleDTO> subtasks = taskService.getAssignedSubTasksForCurrentUser();
        return ResponseEntity.ok(subtasks);
    }

    @GetMapping("/created")
    public ResponseEntity<List<TaskSimpleDTO>> getCreatedMainTasks() {
        List<TaskSimpleDTO> tasks = taskService.getCreatedMainTasksByCurrentUser();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/created/subtasks")
    public ResponseEntity<List<TaskSimpleDTO>> getCreatedSubTasks() {
        List<TaskSimpleDTO> subtasks = taskService.getCreatedSubTasksByCurrentUser();
        return ResponseEntity.ok(subtasks);
    }

    @PostMapping("/{taskId}/unarchive")
    public ResponseEntity<Void> unarchiveTask(@PathVariable Long taskId) {
        taskService.unarchiveTask(taskId);
        return ResponseEntity.noContent().build();
    }
}
