package com.dcmc.apps.taskmanager.web.rest;

import com.dcmc.apps.taskmanager.repository.WorkGroupMembershipRepository;
import com.dcmc.apps.taskmanager.service.WorkGroupMembershipService;
import com.dcmc.apps.taskmanager.service.dto.OwnershipTransferDTO;
import com.dcmc.apps.taskmanager.service.dto.PromotionRequestDTO;
import com.dcmc.apps.taskmanager.service.dto.WorkGroupMembershipDTO;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.dcmc.apps.taskmanager.domain.WorkGroupMembership}.
 */
@RestController
@RequestMapping("/api/work-group-memberships")
public class WorkGroupMembershipResource {

    private static final Logger LOG = LoggerFactory.getLogger(WorkGroupMembershipResource.class);

    private static final String ENTITY_NAME = "taskmanagerWorkGroupMembership";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final WorkGroupMembershipService workGroupMembershipService;

    private final WorkGroupMembershipRepository workGroupMembershipRepository;

    public WorkGroupMembershipResource(
        WorkGroupMembershipService workGroupMembershipService,
        WorkGroupMembershipRepository workGroupMembershipRepository
    ) {
        this.workGroupMembershipService = workGroupMembershipService;
        this.workGroupMembershipRepository = workGroupMembershipRepository;
    }

    /**
     * {@code POST  /work-group-memberships} : Create a new workGroupMembership.
     *
     * @param workGroupMembershipDTO the workGroupMembershipDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new workGroupMembershipDTO, or with status {@code 400 (Bad Request)} if the workGroupMembership has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<WorkGroupMembershipDTO> createWorkGroupMembership(
        @Valid @RequestBody WorkGroupMembershipDTO workGroupMembershipDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to save WorkGroupMembership : {}", workGroupMembershipDTO);
        if (workGroupMembershipDTO.getId() != null) {
            throw new BadRequestAlertException("A new workGroupMembership cannot already have an ID", ENTITY_NAME, "idexists");
        }
        workGroupMembershipDTO = workGroupMembershipService.save(workGroupMembershipDTO);
        return ResponseEntity.created(new URI("/api/work-group-memberships/" + workGroupMembershipDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, workGroupMembershipDTO.getId().toString()))
            .body(workGroupMembershipDTO);
    }

    /**
     * {@code PUT  /work-group-memberships/:id} : Updates an existing workGroupMembership.
     *
     * @param id the id of the workGroupMembershipDTO to save.
     * @param workGroupMembershipDTO the workGroupMembershipDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated workGroupMembershipDTO,
     * or with status {@code 400 (Bad Request)} if the workGroupMembershipDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the workGroupMembershipDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<WorkGroupMembershipDTO> updateWorkGroupMembership(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody WorkGroupMembershipDTO workGroupMembershipDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update WorkGroupMembership : {}, {}", id, workGroupMembershipDTO);
        if (workGroupMembershipDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, workGroupMembershipDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!workGroupMembershipRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        workGroupMembershipDTO = workGroupMembershipService.update(workGroupMembershipDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, workGroupMembershipDTO.getId().toString()))
            .body(workGroupMembershipDTO);
    }

    /**
     * {@code PATCH  /work-group-memberships/:id} : Partial updates given fields of an existing workGroupMembership, field will ignore if it is null
     *
     * @param id the id of the workGroupMembershipDTO to save.
     * @param workGroupMembershipDTO the workGroupMembershipDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated workGroupMembershipDTO,
     * or with status {@code 400 (Bad Request)} if the workGroupMembershipDTO is not valid,
     * or with status {@code 404 (Not Found)} if the workGroupMembershipDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the workGroupMembershipDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<WorkGroupMembershipDTO> partialUpdateWorkGroupMembership(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody WorkGroupMembershipDTO workGroupMembershipDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update WorkGroupMembership partially : {}, {}", id, workGroupMembershipDTO);
        if (workGroupMembershipDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, workGroupMembershipDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!workGroupMembershipRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<WorkGroupMembershipDTO> result = workGroupMembershipService.partialUpdate(workGroupMembershipDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, workGroupMembershipDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /work-group-memberships} : get all the workGroupMemberships.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of workGroupMemberships in body.
     */
    @GetMapping("")
    public ResponseEntity<List<WorkGroupMembershipDTO>> getAllWorkGroupMemberships(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of WorkGroupMemberships");
        Page<WorkGroupMembershipDTO> page;
        if (eagerload) {
            page = workGroupMembershipService.findAllWithEagerRelationships(pageable);
        } else {
            page = workGroupMembershipService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /work-group-memberships/:id} : get the "id" workGroupMembership.
     *
     * @param id the id of the workGroupMembershipDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the workGroupMembershipDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkGroupMembershipDTO> getWorkGroupMembership(@PathVariable("id") Long id) {
        LOG.debug("REST request to get WorkGroupMembership : {}", id);
        Optional<WorkGroupMembershipDTO> workGroupMembershipDTO = workGroupMembershipService.findOne(id);
        return ResponseUtil.wrapOrNotFound(workGroupMembershipDTO);
    }

    /**
     * {@code DELETE  /work-group-memberships/:id} : delete the "id" workGroupMembership.
     *
     * @param id the id of the workGroupMembershipDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkGroupMembership(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete WorkGroupMembership : {}", id);
        workGroupMembershipService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    @PostMapping("/transfer-ownership/{groupId}")
    public ResponseEntity<Void> transferOwnership(
        @PathVariable Long groupId,
        @Valid @RequestBody OwnershipTransferDTO dto
    ) {
        LOG.debug("REST request to transfer ownership of group {} to {}", groupId, dto.getNewOwnerUsername());
        workGroupMembershipService.transferOwnership(groupId, dto.getNewOwnerUsername());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/promote-to-moderator/{groupId}")
    public ResponseEntity<Void> promoteToModerator(
        @PathVariable Long groupId,
        @Valid @RequestBody PromotionRequestDTO dto
    ) {
        LOG.debug("REST request to promote user {} to moderator in group {}", dto.getUsername(), groupId);
        workGroupMembershipService.promoteToModerator(groupId, dto.getUsername());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/demote-moderator/{groupId}")
    public ResponseEntity<Void> demoteModerator(
        @PathVariable Long groupId,
        @Valid @RequestBody PromotionRequestDTO dto
    ) {
        LOG.debug("REST request to demote user {} from moderator in group {}", dto.getUsername(), groupId);
        workGroupMembershipService.demoteModerator(groupId, dto.getUsername());
        return ResponseEntity.ok().build();
    }

}
