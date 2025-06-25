package com.dcmc.apps.taskmanager.service;

import com.dcmc.apps.taskmanager.domain.Priority;
import com.dcmc.apps.taskmanager.repository.PriorityRepository;
import com.dcmc.apps.taskmanager.service.dto.PriorityDTO;
import com.dcmc.apps.taskmanager.service.mapper.PriorityMapper;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.dcmc.apps.taskmanager.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.dcmc.apps.taskmanager.domain.Priority}.
 */
@Service
@Transactional
public class PriorityService {

    private static final Logger LOG = LoggerFactory.getLogger(PriorityService.class);

    private final PriorityRepository priorityRepository;

    private final PriorityMapper priorityMapper;

    private final SecurityUtilsService securityUtilsService;

    public PriorityService(PriorityRepository priorityRepository,
                           PriorityMapper priorityMapper,
                           SecurityUtilsService securityUtilsService) {
        this.priorityRepository = priorityRepository;
        this.priorityMapper = priorityMapper;
        this.securityUtilsService = securityUtilsService;
    }

    /**
     * Save a priority.
     *
     * @param priorityDTO the entity to save.
     * @return the persisted entity.
     */
    public PriorityDTO save(PriorityDTO priorityDTO) {

        if (!securityUtilsService.isCurrentUserAdmin()) {
            throw new AccessDeniedException("Only admins can create priorities.");
        }
        LOG.debug("Request to save Priority : {}", priorityDTO);
        if (priorityDTO.getIsHidden() == null) {
            priorityDTO.setIsHidden(false);
        }
        Priority priority = priorityMapper.toEntity(priorityDTO);
        priority = priorityRepository.save(priority);
        return priorityMapper.toDto(priority);
    }

    /**
     * Update a priority.
     *
     * @param priorityDTO the entity to save.
     * @return the persisted entity.
     */
    public PriorityDTO update(PriorityDTO priorityDTO) {
        if (!securityUtilsService.isCurrentUserAdmin()) {
            throw new AccessDeniedException("Only admins can update priorities.");
        }
        LOG.debug("Request to update Priority : {}", priorityDTO);
        Priority priority = priorityMapper.toEntity(priorityDTO);
        priority = priorityRepository.save(priority);
        return priorityMapper.toDto(priority);
    }

    /**
     * Partially update a priority.
     *
     * @param priorityDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<PriorityDTO> partialUpdate(PriorityDTO priorityDTO) {
        LOG.debug("Request to partially update Priority : {}", priorityDTO);

        return priorityRepository
            .findById(priorityDTO.getId())
            .map(existingPriority -> {
                priorityMapper.partialUpdate(existingPriority, priorityDTO);

                return existingPriority;
            })
            .map(priorityRepository::save)
            .map(priorityMapper::toDto);
    }

    /**
     * Get all the priorities.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<PriorityDTO> findAll() {
        LOG.debug("Request to get all Priorities");
        return priorityRepository.findAll().stream().map(priorityMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one priority by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<PriorityDTO> findOne(Long id) {
        LOG.debug("Request to get Priority : {}", id);
        return priorityRepository.findById(id).map(priorityMapper::toDto);
    }

    /**
     * Delete the priority by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        if (!securityUtilsService.isCurrentUserAdmin()) {
            throw new AccessDeniedException("Only admins can delete priorities.");
        }
        LOG.debug("Request to delete Priority : {}", id);
        priorityRepository.deleteById(id);
    }

    public PriorityDTO hide(Long id) {
        if (!securityUtilsService.isCurrentUserAdmin()) {
            throw new AccessDeniedException("Only admins can hide priorities.");
        }

        Priority priority = priorityRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Priority not found with id: " + id));

        priority.setIsHidden(true);
        priority = priorityRepository.save(priority);
        return priorityMapper.toDto(priority);
    }

    public PriorityDTO unhide(Long id) {
        if (!securityUtilsService.isCurrentUserAdmin()) {
            throw new AccessDeniedException("Only admins can unhide priorities.");
        }

        Priority priority = priorityRepository.findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Priority not found", "priority", "notfound"));

        if (!Boolean.TRUE.equals(priority.getIsHidden())) {
            throw new BadRequestAlertException("Priority is not hidden", "priority", "notHidden");
        }

        priority.setIsHidden(false);
        priority = priorityRepository.save(priority);
        return priorityMapper.toDto(priority);
    }

}
