package com.dcmc.apps.taskmanager.service;

import com.dcmc.apps.taskmanager.domain.*;
import com.dcmc.apps.taskmanager.domain.enumeration.GroupRole;
import com.dcmc.apps.taskmanager.repository.*;
import com.dcmc.apps.taskmanager.security.SecurityUtils;
import com.dcmc.apps.taskmanager.service.dto.UserDTO;
import com.dcmc.apps.taskmanager.service.dto.WorkGroupDTO;
import com.dcmc.apps.taskmanager.service.mapper.WorkGroupMapper;

import java.util.List;
import java.util.Optional;

import com.dcmc.apps.taskmanager.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.dcmc.apps.taskmanager.domain.WorkGroup}.
 */
@Service
@Transactional
public class WorkGroupService {

    private static final Logger LOG = LoggerFactory.getLogger(WorkGroupService.class);

    private final WorkGroupRepository workGroupRepository;

    private final WorkGroupMapper workGroupMapper;
    private final UserRepository userRepository;
    private final WorkGroupMembershipRepository workGroupMembershipRepository;

    private final SecurityUtilsService securityUtilsService;

    public WorkGroupService(
        WorkGroupRepository workGroupRepository,
        WorkGroupMapper workGroupMapper,
        UserRepository userRepository,
        WorkGroupMembershipRepository workGroupMembershipRepository,
        SecurityUtilsService securityUtilsService) {
        this.workGroupRepository = workGroupRepository;
        this.workGroupMapper = workGroupMapper;
        this.userRepository = userRepository;
        this.workGroupMembershipRepository = workGroupMembershipRepository;
        this.securityUtilsService = securityUtilsService;
    }

    /**
     * Save a workGroup.
     *
     * @param workGroupDTO the entity to save.
     * @return the persisted entity.
     */
    public WorkGroupDTO save(WorkGroupDTO workGroupDTO) {
        LOG.debug("Request to save WorkGroup : {}", workGroupDTO);
        WorkGroup workGroup = workGroupMapper.toEntity(workGroupDTO);
        workGroup = workGroupRepository.save(workGroup);

        String currentUserName = SecurityUtils.getCurrentUserLogin().orElseThrow();
        User user = userRepository.findOneByLogin(currentUserName).orElseThrow();

        WorkGroupMembership membership = new WorkGroupMembership();
        membership.setUser(user);
        membership.setWorkGroup(workGroup);
        membership.setRole(GroupRole.OWNER);
        workGroupMembershipRepository.save(membership);

        return workGroupMapper.toDto(workGroup);
    }

    /**
     * Update a workGroup.
     *
     * @param workGroupDTO the entity to save.
     * @return the persisted entity.
     */
    public WorkGroupDTO update(WorkGroupDTO workGroupDTO) {
        LOG.debug("Request to update WorkGroup : {}", workGroupDTO);

        // Asegura que solo el OWNER pueda actualizar
        if (!securityUtilsService.isOwner(workGroupDTO.getId())) {
            throw new AccessDeniedException("Only the OWNER can update the WorkGroup.");
        }

        WorkGroup workGroup = workGroupMapper.toEntity(workGroupDTO);
        workGroup = workGroupRepository.save(workGroup);
        return workGroupMapper.toDto(workGroup);
    }


    /**
     * Partially update a workGroup.
     *
     * @param workGroupDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<WorkGroupDTO> partialUpdate(WorkGroupDTO workGroupDTO) {
        LOG.debug("Request to partially update WorkGroup : {}", workGroupDTO);

        return workGroupRepository
            .findById(workGroupDTO.getId())
            .map(existingWorkGroup -> {
                workGroupMapper.partialUpdate(existingWorkGroup, workGroupDTO);

                return existingWorkGroup;
            })
            .map(workGroupRepository::save)
            .map(workGroupMapper::toDto);
    }


    @Transactional(readOnly = true)
    public List<WorkGroupDTO> findAll() {
        LOG.debug("Request to get all WorkGroups");
        return workGroupMapper.toDto(workGroupRepository.findAllByIsActiveTrue());
    }

    /**
     * Get one workGroup by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<WorkGroupDTO> findOne(Long id) {
        LOG.debug("Request to get WorkGroup : {}", id);
        return workGroupRepository.findById(id).map(workGroupMapper::toDto);
    }

    /**
     * Delete the workGroup by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to logically delete WorkGroup : {}", id);
        workGroupRepository.findById(id).ifPresent(workGroup -> {
            workGroup.setIsActive(false);
            workGroupRepository.save(workGroup);
        });
    }

    @Transactional
    public void addMember(Long groupId, String username) {
        securityUtilsService.assertOwnerOrModerator(groupId);

        User user = userRepository.findOneByLogin(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        WorkGroup group = workGroupRepository.findById(groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // Verificar si ya está activo
        Optional<WorkGroupMembership> existingActiveMembership =
            workGroupMembershipRepository.findByUser_LoginAndWorkGroup_Id(username, groupId);

        if (existingActiveMembership.isPresent() && Boolean.TRUE.equals(existingActiveMembership.get().getInGroup())) {
            throw new IllegalStateException("User already belongs to the group.");
        }

        // Buscar membresía inactiva en ese grupo
        Optional<WorkGroupMembership> oldMembership =
            workGroupMembershipRepository.findByUser_LoginAndWorkGroup_Id(username, groupId);

        WorkGroupMembership membership = oldMembership.orElseGet(WorkGroupMembership::new);

        membership.setUser(user);
        membership.setWorkGroup(group);
        membership.setRole(GroupRole.MEMBER);
        membership.setInGroup(true);

        workGroupMembershipRepository.save(membership);
    }


    @Transactional
    public void removeMember(Long groupId, String username) {
        securityUtilsService.assertOwnerOrModerator(groupId);

        WorkGroupMembership membership = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(username, groupId)
            .orElseThrow(() -> new BadRequestAlertException("Membership not found", "workGroupMembership", "membershipnotfound"));

        if (membership.getRole() == GroupRole.OWNER) {
            throw new BadRequestAlertException("Cannot remove the group owner", "workGroupMembership", "cannotremoveowner");
        }

        membership.setInGroup(false);
        workGroupMembershipRepository.save(membership);
    }


    @Transactional
    public void leaveGroup(Long groupId) {
        WorkGroupMembership membership = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(securityUtilsService.getCurrentUser(), groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "You are not a member of this group."));

        if (membership.getRole() != GroupRole.MEMBER) {
            throw new AccessDeniedException("Only MEMBERS can leave the group themselves.");
        }

        membership.setInGroup(false);
        workGroupMembershipRepository.save(membership);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getActiveMemberByGroup(Long groupId) {
        return workGroupMembershipRepository.findByWorkGroup_IdAndIsInGroupTrue(groupId)
            .stream()
            .map(WorkGroupMembership::getUser)
            .map(UserDTO::new)
            .toList();
    }
}
