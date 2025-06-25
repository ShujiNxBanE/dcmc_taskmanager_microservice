package com.dcmc.apps.taskmanager.service;

import com.dcmc.apps.taskmanager.domain.enumeration.GroupRole;
import com.dcmc.apps.taskmanager.domain.WorkGroupMembership;
import com.dcmc.apps.taskmanager.repository.WorkGroupMembershipRepository;
import com.dcmc.apps.taskmanager.security.SecurityUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class SecurityUtilsService {

    private final WorkGroupMembershipRepository workGroupMembershipRepository;

    public SecurityUtilsService(WorkGroupMembershipRepository workGroupMembershipRepository) {
        this.workGroupMembershipRepository = workGroupMembershipRepository;
    }

    public boolean isCurrentUserAdmin() {
        return SecurityUtils.isCurrentUserInRole("ROLE_ADMIN");
    }

    public boolean isOwner(Long groupId) {
        String username = getCurrentUser();
        return workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(username, groupId)
            .map(membership -> membership.getRole() == GroupRole.OWNER)
            .orElse(false);
    }

    public void assertOwnerOrModerator(Long groupId) {
        WorkGroupMembership membership = workGroupMembershipRepository
            .findByUser_LoginAndWorkGroup_Id(getCurrentUser(), groupId)
            .orElseThrow(() -> new AccessDeniedException("You are not a member of this group."));

        if (membership.getRole() != GroupRole.OWNER && membership.getRole() != GroupRole.MODERATOR) {
            throw new AccessDeniedException("Only OWNER or MODERATOR can perform this action.");
        }
    }

    public String getCurrentUser() {
        return SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new AccessDeniedException("Unauthenticated user"));
    }
}
