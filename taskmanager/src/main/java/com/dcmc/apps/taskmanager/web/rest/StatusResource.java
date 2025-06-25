package com.dcmc.apps.taskmanager.web.rest;

import com.dcmc.apps.taskmanager.repository.StatusRepository;
import com.dcmc.apps.taskmanager.service.StatusService;
import com.dcmc.apps.taskmanager.service.dto.StatusDTO;
import com.dcmc.apps.taskmanager.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.dcmc.apps.taskmanager.domain.Status}.
 */
@RestController
@RequestMapping("/api/groups/{groupId}/statuses")
public class StatusResource {

    private final StatusService statusService;
    private final StatusRepository statusRepository;
    private static final Logger LOG = LoggerFactory.getLogger(StatusResource.class);
    private static final String ENTITY_NAME = "taskmanagerStatus";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    public StatusResource(StatusService statusService, StatusRepository statusRepository) {
        this.statusService = statusService;
        this.statusRepository = statusRepository;
    }

    @PostMapping("")
    public ResponseEntity<StatusDTO> createStatus(
        @PathVariable("groupId") Long groupId,
        @RequestBody StatusDTO statusDTO) throws URISyntaxException {
        LOG.debug("REST request to save Status : {}", statusDTO);
        if (statusDTO.getId() != null) {
            throw new BadRequestAlertException("A new status cannot already have an ID", ENTITY_NAME, "idexists");
        }
        statusDTO = statusService.save(groupId, statusDTO);
        return ResponseEntity.created(new URI("/api/groups/" + groupId + "/statuses/" + statusDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, statusDTO.getId().toString()))
            .body(statusDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StatusDTO> updateStatus(
        @PathVariable("groupId") Long groupId,
        @PathVariable("id") Long id,
        @RequestBody StatusDTO statusDTO) throws URISyntaxException {
        LOG.debug("REST request to update Status : {}, {}", id, statusDTO);
        if (statusDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, statusDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!statusRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        statusDTO = statusService.update(groupId, statusDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, statusDTO.getId().toString()))
            .body(statusDTO);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<StatusDTO> partialUpdateStatus(
        @PathVariable("groupId") Long groupId,
        @PathVariable("id") Long id,
        @RequestBody StatusDTO statusDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update Status partially : {}, {}", id, statusDTO);
        if (statusDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, statusDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!statusRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<StatusDTO> result = statusService.partialUpdate(groupId, statusDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, statusDTO.getId().toString())
        );
    }

    @GetMapping("")
    public List<StatusDTO> getAllStatuses(@PathVariable("groupId") Long groupId) {
        LOG.debug("REST request to get all Statuses");
        return statusService.findAll(groupId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StatusDTO> getStatus(@PathVariable("groupId") Long groupId, @PathVariable("id") Long id) {
        LOG.debug("REST request to get Status : {}", id);
        Optional<StatusDTO> statusDTO = statusService.findOne(groupId, id);
        return ResponseUtil.wrapOrNotFound(statusDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStatus(@PathVariable("groupId") Long groupId, @PathVariable("id") Long id) {
        LOG.debug("REST request to delete Status : {}", id);
        statusService.delete(groupId, id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}

