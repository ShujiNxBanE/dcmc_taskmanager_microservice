package com.dcmc.apps.taskmanager.web.rest;

import com.dcmc.apps.taskmanager.repository.WorkGroupRepository;
import com.dcmc.apps.taskmanager.service.SecurityUtilsService;
import com.dcmc.apps.taskmanager.service.WorkGroupService;
import com.dcmc.apps.taskmanager.service.dto.PromotionRequestDTO;
import com.dcmc.apps.taskmanager.service.dto.UserDTO;
import com.dcmc.apps.taskmanager.service.dto.WorkGroupDTO;
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
 * REST controller for managing {@link com.dcmc.apps.taskmanager.domain.WorkGroup}.
 */
@RestController
@RequestMapping("/api/work-groups")
public class WorkGroupResource {

    private static final Logger LOG = LoggerFactory.getLogger(WorkGroupResource.class);

    private static final String ENTITY_NAME = "taskmanagerWorkGroup";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final WorkGroupService workGroupService;

    private final WorkGroupRepository workGroupRepository;

    private final SecurityUtilsService securityUtilsService;

    public WorkGroupResource(
        WorkGroupService workGroupService,
        WorkGroupRepository workGroupRepository,
        SecurityUtilsService securityUtilsService
    ) {
        this.workGroupService = workGroupService;
        this.workGroupRepository = workGroupRepository;
        this.securityUtilsService = securityUtilsService;
    }

    @GetMapping("/hello")
    public ResponseEntity<String> sayHello() {
        return ResponseEntity.ok("Hola desde el microservicio TaskManager!");
    }

    /**
     * {@code POST  /work-groups} : Create a new workGroup.
     *
     * @param workGroupDTO the workGroupDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new workGroupDTO, or with status {@code 400 (Bad Request)} if the workGroup has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/create-group")
    public ResponseEntity<WorkGroupDTO> createWorkGroup(@Valid @RequestBody WorkGroupDTO workGroupDTO) throws URISyntaxException {
        LOG.debug("REST request to save WorkGroup : {}", workGroupDTO);
        if (workGroupDTO.getId() != null) {
            throw new BadRequestAlertException("A new workGroup cannot already have an ID", ENTITY_NAME, "idexists");
        }
        workGroupDTO = workGroupService.save(workGroupDTO);
        return ResponseEntity.created(new URI("/api/work-groups/" + workGroupDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, workGroupDTO.getId().toString()))
            .body(workGroupDTO);
    }

    /**
     * {@code PUT  /work-groups/:id} : Updates an existing workGroup.
     *
     * @param id the id of the workGroupDTO to save.
     * @param workGroupDTO the workGroupDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated workGroupDTO,
     * or with status {@code 400 (Bad Request)} if the workGroupDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the workGroupDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/{id}")
    public ResponseEntity<WorkGroupDTO> updateWorkGroup(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody WorkGroupDTO workGroupDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update WorkGroup : {}, {}", id, workGroupDTO);
        if (workGroupDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, workGroupDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!workGroupRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        workGroupDTO = workGroupService.update(workGroupDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, workGroupDTO.getId().toString()))
            .body(workGroupDTO);
    }

    /**
     * {@code PATCH  /work-groups/:id} : Partial updates given fields of an existing workGroup, field will ignore if it is null
     *
     * @param id the id of the workGroupDTO to save.
     * @param workGroupDTO the workGroupDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated workGroupDTO,
     * or with status {@code 400 (Bad Request)} if the workGroupDTO is not valid,
     * or with status {@code 404 (Not Found)} if the workGroupDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the workGroupDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<WorkGroupDTO> partialUpdateWorkGroup(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody WorkGroupDTO workGroupDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update WorkGroup partially : {}, {}", id, workGroupDTO);
        if (workGroupDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, workGroupDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!workGroupRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<WorkGroupDTO> result = workGroupService.partialUpdate(workGroupDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, workGroupDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /work-groups} : get all the workGroups.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of workGroups in body.
     */
    @GetMapping("")
    public ResponseEntity<List<WorkGroupDTO>> getAllWorkGroups() {
        LOG.debug("REST request to get all WorkGroups");
        List<WorkGroupDTO> list = workGroupService.findAll();
        return ResponseEntity.ok().body(list);
    }


    /**
     * {@code GET  /work-groups/:id} : get the "id" workGroup.
     *
     * @param id the id of the workGroupDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the workGroupDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkGroupDTO> getWorkGroup(@PathVariable("id") Long id) {
        LOG.debug("REST request to get WorkGroup : {}", id);
        Optional<WorkGroupDTO> workGroupDTO = workGroupService.findOne(id);
        return ResponseUtil.wrapOrNotFound(workGroupDTO);
    }

    /**
     * {@code DELETE  /work-groups/:id} : delete the "id" workGroup.
     *
     * @param id the id of the workGroupDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkGroup(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete WorkGroup : {}", id);
        workGroupService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    @PostMapping("/{groupId}/add-member")
    public ResponseEntity<Void> addMember(
        @PathVariable Long groupId,
        @Valid @RequestBody PromotionRequestDTO dto
    ) {
        LOG.debug("REST request to add user {} to group {}", dto.getUsername(), groupId);
        workGroupService.addMember(groupId, dto.getUsername());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{groupId}/remove-member")
    public ResponseEntity<Void> removeMember(
        @PathVariable Long groupId,
        @Valid @RequestBody PromotionRequestDTO dto
    ) {
        LOG.debug("REST request to remove user {} from group {}", dto.getUsername(), groupId);
        workGroupService.removeMember(groupId, dto.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{groupId}/moderator/{username}/add")
    public ResponseEntity<Void> addModerator(
        @PathVariable Long groupId,
        @PathVariable String username
    ) {
        workGroupService.addModerator(groupId, username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{groupId}/moderator/{username}/delete")
    public ResponseEntity<Void> removeModerator(
        @PathVariable Long groupId,
        @PathVariable String username
    ) {
        workGroupService.removeModerator(groupId, username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<Void> leaveGroup(@PathVariable Long groupId) {
        LOG.debug("REST request to leave group {}", groupId);
        workGroupService.leaveGroup(groupId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("group/{groupId}/members")
    public ResponseEntity<List<UserDTO>> getActiveMemberDTOs(@PathVariable("groupId") Long groupId) {
        LOG.debug("REST request to get active members (DTO) of group {}", groupId);
        List<UserDTO> users = workGroupService.getActiveMemberByGroup(groupId);
        return ResponseEntity.ok(users);
    }
}
