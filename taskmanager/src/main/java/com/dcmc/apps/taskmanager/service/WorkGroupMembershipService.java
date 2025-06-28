package com.dcmc.apps.taskmanager.service;

import com.dcmc.apps.taskmanager.domain.User;
import com.dcmc.apps.taskmanager.domain.WorkGroup;
import com.dcmc.apps.taskmanager.domain.WorkGroupMembership;
import com.dcmc.apps.taskmanager.domain.enumeration.GroupRole;
import com.dcmc.apps.taskmanager.repository.UserRepository;
import com.dcmc.apps.taskmanager.repository.WorkGroupMembershipRepository;
import com.dcmc.apps.taskmanager.repository.WorkGroupRepository;
import com.dcmc.apps.taskmanager.service.dto.UserGroupViewDTO;
import com.dcmc.apps.taskmanager.service.dto.WorkGroupMembershipDTO;
import com.dcmc.apps.taskmanager.service.mapper.WorkGroupMembershipMapper;

import java.util.List;
import java.util.Optional;

import com.dcmc.apps.taskmanager.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service Implementation for managing {@link com.dcmc.apps.taskmanager.domain.WorkGroupMembership}.
 */
@Service
@Transactional
public class WorkGroupMembershipService {

    private static final Logger LOG = LoggerFactory.getLogger(WorkGroupMembershipService.class);

    private final WorkGroupMembershipRepository workGroupMembershipRepository;

    private final WorkGroupMembershipMapper workGroupMembershipMapper;
    private final UserRepository userRepository;
    private final WorkGroupRepository workGroupRepository;
    private final SecurityUtilsService securityUtilsService;

    public WorkGroupMembershipService(
        WorkGroupMembershipRepository workGroupMembershipRepository,
        WorkGroupMembershipMapper workGroupMembershipMapper,
        UserRepository userRepository, WorkGroupRepository workGroupRepository,
        SecurityUtilsService securityUtilsService) {
        this.workGroupMembershipRepository = workGroupMembershipRepository;
        this.workGroupMembershipMapper = workGroupMembershipMapper;
        this.userRepository = userRepository;
        this.workGroupRepository = workGroupRepository;
        this.securityUtilsService = securityUtilsService;
    }

    /**
     * Save a workGroupMembership.
     *
     * @param workGroupMembershipDTO the entity to save.
     * @return the persisted entity.
     */
    public WorkGroupMembershipDTO save(WorkGroupMembershipDTO workGroupMembershipDTO) {
        LOG.debug("Request to save WorkGroupMembership : {}", workGroupMembershipDTO);
        WorkGroupMembership workGroupMembership = workGroupMembershipMapper.toEntity(workGroupMembershipDTO);
        workGroupMembership = workGroupMembershipRepository.save(workGroupMembership);
        return workGroupMembershipMapper.toDto(workGroupMembership);
    }

    /**
     * Update a workGroupMembership.
     *
     * @param workGroupMembershipDTO the entity to save.
     * @return the persisted entity.
     */
    public WorkGroupMembershipDTO update(WorkGroupMembershipDTO workGroupMembershipDTO) {
        LOG.debug("Request to update WorkGroupMembership : {}", workGroupMembershipDTO);
        WorkGroupMembership workGroupMembership = workGroupMembershipMapper.toEntity(workGroupMembershipDTO);
        workGroupMembership = workGroupMembershipRepository.save(workGroupMembership);
        return workGroupMembershipMapper.toDto(workGroupMembership);
    }

    /**
     * Partially update a workGroupMembership.
     *
     * @param workGroupMembershipDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<WorkGroupMembershipDTO> partialUpdate(WorkGroupMembershipDTO workGroupMembershipDTO) {
        LOG.debug("Request to partially update WorkGroupMembership : {}", workGroupMembershipDTO);

        return workGroupMembershipRepository
            .findById(workGroupMembershipDTO.getId())
            .map(existingWorkGroupMembership -> {
                workGroupMembershipMapper.partialUpdate(existingWorkGroupMembership, workGroupMembershipDTO);

                return existingWorkGroupMembership;
            })
            .map(workGroupMembershipRepository::save)
            .map(workGroupMembershipMapper::toDto);
    }

    /**
     * Get all the workGroupMemberships.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<WorkGroupMembershipDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all WorkGroupMemberships");
        return workGroupMembershipRepository.findAll(pageable).map(workGroupMembershipMapper::toDto);
    }

    /**
     * Get all the workGroupMemberships with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<WorkGroupMembershipDTO> findAllWithEagerRelationships(Pageable pageable) {
        return workGroupMembershipRepository.findAllWithEagerRelationships(pageable).map(workGroupMembershipMapper::toDto);
    }

    /**
     * Get one workGroupMembership by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<WorkGroupMembershipDTO> findOne(Long id) {
        LOG.debug("Request to get WorkGroupMembership : {}", id);
        return workGroupMembershipRepository.findOneWithEagerRelationships(id).map(workGroupMembershipMapper::toDto);
    }

    /**
     * Delete the workGroupMembership by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete WorkGroupMembership : {}", id);
        workGroupMembershipRepository.deleteById(id);
    }

    public void transferOwnership(Long groupId, String newOwnerUsername) {
        if (!securityUtilsService.isOwner(groupId)) {
            throw new AccessDeniedException("Only the OWNER can transfer ownership.");
        }

        WorkGroupMembership currentOwner = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(securityUtilsService.getCurrentUser(), groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Current owner not found"));

        WorkGroupMembership newOwner = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(newOwnerUsername, groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"New user not found in group"));

        currentOwner.setRole(GroupRole.MODERATOR);
        newOwner.setRole(GroupRole.OWNER);

        workGroupMembershipRepository.save(currentOwner);
        workGroupMembershipRepository.save(newOwner);
    }

    @Transactional
    public void promoteToModerator(Long groupId, String username) {
        // Verifica si el usuario actual es OWNER o MODERATOR
        WorkGroupMembership currentMembership = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(securityUtilsService.getCurrentUser(), groupId)
            .orElseThrow(() -> new AccessDeniedException("You are not a member of this group."));

        if (!(currentMembership.getRole() == GroupRole.OWNER || currentMembership.getRole() == GroupRole.MODERATOR)) {
            throw new AccessDeniedException("Only the OWNER or MODERATOR can promote to moderator.");
        }

        // Verifica que el usuario objetivo esté en el grupo
        WorkGroupMembership targetMembership = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(username, groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found in group"));

        if (targetMembership.getRole() == GroupRole.OWNER) {
            throw new AccessDeniedException("Cannot promote the OWNER to MODERATOR.");
        }

        targetMembership.setRole(GroupRole.MODERATOR);
        workGroupMembershipRepository.save(targetMembership);
    }

    public void demoteModerator(Long groupId, String username) {
        if (!securityUtilsService.isOwner(groupId)) {
            throw new AccessDeniedException("Only the OWNER can remove moderators.");
        }

        WorkGroupMembership membership = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(username, groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found in group"));

        if (membership.getRole() != GroupRole.MODERATOR) {
            throw new BadRequestAlertException("The user is not a moderator", "workGroupMembership", "notamoderator");
        }

        membership.setRole(GroupRole.MEMBER);
        workGroupMembershipRepository.save(membership);
    }

    @Transactional(readOnly = true)
    public List<UserGroupViewDTO> findActiveGroupsForCurrentUser() {
        String login = securityUtilsService.getCurrentUser();

        List<WorkGroupMembership> memberships =
            workGroupMembershipRepository.findByUser_LoginAndIsInGroupTrueAndWorkGroup_IsActiveTrue(login);

        return memberships.stream().map(m -> {
            WorkGroup wg = m.getWorkGroup();
            UserGroupViewDTO dto = new UserGroupViewDTO();
            dto.setGroupId(wg.getId());
            dto.setGroupName(wg.getName());
            dto.setGroupDescription(wg.getDescription());
            dto.setIsActive(wg.getIsActive());
            dto.setIsInGroup(m.getInGroup());
            dto.setRole(m.getRole());
            return dto;
        }).toList();
    }




}
