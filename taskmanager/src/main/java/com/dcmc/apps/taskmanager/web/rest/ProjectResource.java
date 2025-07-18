package com.dcmc.apps.taskmanager.web.rest;

import com.dcmc.apps.taskmanager.repository.ProjectRepository;
import com.dcmc.apps.taskmanager.service.ProjectQueryService;
import com.dcmc.apps.taskmanager.service.ProjectService;
import com.dcmc.apps.taskmanager.service.criteria.ProjectCriteria;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.dcmc.apps.taskmanager.domain.Project}.
 */
@RestController
@RequestMapping("/api/projects")
public class ProjectResource {

    private static final Logger LOG = LoggerFactory.getLogger(ProjectResource.class);

    private static final String ENTITY_NAME = "taskmanagerProject";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ProjectService projectService;

    private final ProjectRepository projectRepository;

    private final ProjectQueryService projectQueryService;

    public ProjectResource(ProjectService projectService, ProjectRepository projectRepository, ProjectQueryService projectQueryService) {
        this.projectService = projectService;
        this.projectRepository = projectRepository;
        this.projectQueryService = projectQueryService;
    }

    /**
     * {@code POST  /projects} : Create a new project.
     *
     * @param projectDTO the projectDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new projectDTO, or with status {@code 400 (Bad Request)} if the project has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ProjectDTO> createProject(@Valid @RequestBody ProjectDTO projectDTO) throws URISyntaxException {
        LOG.debug("REST request to save Project : {}", projectDTO);
        if (projectDTO.getId() != null) {
            throw new BadRequestAlertException("A new project cannot already have an ID", ENTITY_NAME, "idexists");
        }
        projectDTO = projectService.save(projectDTO);
        return ResponseEntity.created(new URI("/api/projects/" + projectDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, projectDTO.getId().toString()))
            .body(projectDTO);
    }

    /**
     * {@code PATCH  /projects/:id} : Partial updates given fields of an existing project, field will ignore if it is null
     *
     * @param id the id of the projectDTO to save.
     * @param projectDTO the projectDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated projectDTO,
     * or with status {@code 400 (Bad Request)} if the projectDTO is not valid,
     * or with status {@code 404 (Not Found)} if the projectDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the projectDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ProjectDTO> partialUpdateProject(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ProjectDTO projectDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Project partially : {}, {}", id, projectDTO);
        if (projectDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, projectDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!projectRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ProjectDTO> result = projectService.partialUpdate(projectDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, projectDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /projects} : get all the projects.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of projects in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ProjectDTO>> getAllProjects(
        ProjectCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get Projects by criteria: {}", criteria);

        Page<ProjectDTO> page = projectQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /projects/count} : count all the projects.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countProjects(ProjectCriteria criteria) {
        LOG.debug("REST request to count Projects by criteria: {}", criteria);
        return ResponseEntity.ok().body(projectQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /projects/:id} : get the "id" project.
     *
     * @param id the id of the projectDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the projectDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProject(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Project : {}", id);
        Optional<ProjectDTO> projectDTO = projectService.findOne(id);
        return ResponseUtil.wrapOrNotFound(projectDTO);
    }

    @PostMapping("/create-in/work-group/{workGroupId}")
    public ResponseEntity<ProjectDTO> createProjectCustom(
        @PathVariable Long workGroupId,
        @Valid @RequestBody ProjectCreateDTO dto
    ) throws URISyntaxException {
        LOG.debug("REST request to create Project in WorkGroup {}: {}", workGroupId, dto);
        ProjectDTO result = projectService.createProject(dto, workGroupId);
        return ResponseEntity.created(new URI("/api/projects/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, "project", result.getId().toString()))
            .body(result);
    }

    @PostMapping("/{id}/update")
    public ResponseEntity<ProjectDTO> updateProject(
        @PathVariable("id") Long id,
        @Valid @RequestBody ProjectUpdateDTO projectUpdateDTO
    ) {
        ProjectDTO updated = projectService.updateProject(id, projectUpdateDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/in-work-group/{workGroupId}")
    public ResponseEntity<List<ProjectDTO>> getActiveProjectsByWorkGroup(@PathVariable Long workGroupId) {
        List<ProjectDTO> projects = projectService.findActiveProjectsByWorkGroup(workGroupId);
        return ResponseEntity.ok(projects);
    }

    @PostMapping("/{id}/assign-users")
    public ResponseEntity<Void> assignUsersToProject(
        @PathVariable("id") Long projectId,
        @RequestBody ProjectAssignUsersDTO assignUsersDTO) {

        projectService.assignUsersToProject(projectId, assignUsersDTO.getUserIds());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{projectId}/unassign/{userId}")
    public ResponseEntity<Void> unassignUser(
        @PathVariable Long projectId,
        @PathVariable String userId
    ) {
        projectService.unassignUserFromProject(projectId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<ProjectDTO>> getAssignedProjects() {
        List<ProjectDTO> projects = projectService.findActiveAssignedProjectsForCurrentUser();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/my-created")
    public ResponseEntity<List<MinimalProjectDTO>> getMyCreatedProjects() {
        List<MinimalProjectDTO> projects = projectService.getCreatedProjectsByCurrentUser();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ProjectDTO>> getAllActiveProjects() {
        List<ProjectDTO> activeProjects = projectService.findAllActiveProjects();
        return ResponseEntity.ok(activeProjects);
    }

    @GetMapping("/{projectId}/assigned-users")
    public ResponseEntity<List<UserDTO>> getAssignedUsers(@PathVariable Long projectId) {
        List<UserDTO> users = projectService.getAssignedUsersByProject(projectId);
        return ResponseEntity.ok(users);
    }

}
