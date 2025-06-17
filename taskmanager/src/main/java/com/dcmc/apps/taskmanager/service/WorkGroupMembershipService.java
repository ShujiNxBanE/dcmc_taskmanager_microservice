package com.dcmc.apps.taskmanager.service;

import com.dcmc.apps.taskmanager.domain.User;
import com.dcmc.apps.taskmanager.domain.WorkGroup;
import com.dcmc.apps.taskmanager.domain.WorkGroupMembership;
import com.dcmc.apps.taskmanager.domain.enumeration.GroupRole;
import com.dcmc.apps.taskmanager.repository.UserRepository;
import com.dcmc.apps.taskmanager.repository.WorkGroupMembershipRepository;
import com.dcmc.apps.taskmanager.repository.WorkGroupRepository;
import com.dcmc.apps.taskmanager.security.SecurityUtils;
import com.dcmc.apps.taskmanager.service.dto.WorkGroupMembershipDTO;
import com.dcmc.apps.taskmanager.service.mapper.WorkGroupMembershipMapper;
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

    public WorkGroupMembershipService(
        WorkGroupMembershipRepository workGroupMembershipRepository,
        WorkGroupMembershipMapper workGroupMembershipMapper,
        UserRepository userRepository, WorkGroupRepository workGroupRepository) {
        this.workGroupMembershipRepository = workGroupMembershipRepository;
        this.workGroupMembershipMapper = workGroupMembershipMapper;
        this.userRepository = userRepository;
        this.workGroupRepository = workGroupRepository;
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

    public boolean isOwner(Long groupId) {
        String username = SecurityUtils.getCurrentUserLogin().orElseThrow();
        return workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(username, groupId)
            .map(membership -> membership.getRole() == GroupRole.OWNER)
            .orElse(false);
    }

    private void assertOwnerOrModerator(Long groupId) {
        WorkGroupMembership membership = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(getCurrentUsername(), groupId)
            .orElseThrow(() -> new AccessDeniedException("You are not a member of this group."));

        if (membership.getRole() != GroupRole.OWNER && membership.getRole() != GroupRole.MODERATOR) {
            throw new AccessDeniedException("Only OWNER or MODERATOR can perform this action.");
        }
    }


    private String getCurrentUsername() {
        return SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new AccessDeniedException("Unauthenticated user"));
    }

    public void transferOwnership(Long groupId, String newOwnerUsername) {
        if (!isOwner(groupId)) {
            throw new AccessDeniedException("Only the OWNER can transfer ownership.");
        }

        WorkGroupMembership currentOwner = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(getCurrentUsername(), groupId)
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
        // Verifica si el actual es OWNER o MODERATOR
        WorkGroupMembership currentMembership = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(getCurrentUsername(), groupId)
            .orElseThrow(() -> new AccessDeniedException("You are not a member of this group."));

        if (!(currentMembership.getRole() == GroupRole.OWNER || currentMembership.getRole() == GroupRole.MODERATOR)) {
            throw new AccessDeniedException("Only the OWNER or MODERATOR can promote to moderator.");
        }

        // Verifica que el target user esté en el grupo
        WorkGroupMembership membership = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(username, groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found in group"));

        // Promover a MODERATOR
        membership.setRole(GroupRole.MODERATOR);
        workGroupMembershipRepository.save(membership);
    }


    public void demoteModerator(Long groupId, String username) {
        if (!isOwner(groupId)) {
            throw new AccessDeniedException("Only the OWNER can remove moderators.");
        }

        WorkGroupMembership membership = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(username, groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found in group"));

        if (membership.getRole() == GroupRole.MODERATOR) {
            membership.setRole(GroupRole.MEMBER);
            workGroupMembershipRepository.save(membership);
        } else {
            throw new IllegalStateException("Only moderators can be removed.");
        }
    }

    @Transactional
    public void addMember(Long groupId, String username) {
        assertOwnerOrModerator(groupId);

        User user = userRepository.findOneByLogin(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        WorkGroup group = workGroupRepository.findById(groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        if (workGroupMembershipRepository.findByUser_LoginAndWorkGroup_Id(username, groupId).isPresent()) {
            throw new IllegalStateException("User already belongs to the group.");
        }

        Optional<WorkGroupMembership> oldMembership = workGroupMembershipRepository.findByUser_LoginAndWorkGroupIsNull(username);

        if (oldMembership.isPresent()) {
            WorkGroupMembership membership = oldMembership.get();
            membership.setWorkGroup(group);
            membership.setRole(GroupRole.MEMBER);
            workGroupMembershipRepository.save(membership);
        } else {
            WorkGroupMembership membership = new WorkGroupMembership();
            membership.setUser(user);
            membership.setWorkGroup(group);
            membership.setRole(GroupRole.MEMBER);
            workGroupMembershipRepository.save(membership);
        }
    }
    @Transactional
    public void removeMember(Long groupId, String username) {
        assertOwnerOrModerator(groupId);

        Optional<WorkGroupMembership> membershipOpt = workGroupMembershipRepository.findByUser_LoginAndWorkGroup_Id(username, groupId);

        if (membershipOpt.isEmpty()) {
            throw new BadRequestAlertException("Membership not found", "workGroupMembership", "membershipnotfound");
        }

        WorkGroupMembership membership = membershipOpt.get();

        if (membership.getRole() == GroupRole.OWNER) {
            throw new BadRequestAlertException("Cannot remove the group owner", "workGroupMembership", "cannotremoveowner");
        }

        membership.setWorkGroup(null);
        workGroupMembershipRepository.save(membership);
    }

    @Transactional
    public void leaveGroup(Long groupId) {
        WorkGroupMembership membership = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(getCurrentUsername(), groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "You are not a member of this group."));

        if (membership.getRole() != GroupRole.MEMBER) {
            throw new AccessDeniedException("Only MEMBERS can leave the group themselves.");
        }

        membership.setWorkGroup(null);
        workGroupMembershipRepository.save(membership);
    }


}
