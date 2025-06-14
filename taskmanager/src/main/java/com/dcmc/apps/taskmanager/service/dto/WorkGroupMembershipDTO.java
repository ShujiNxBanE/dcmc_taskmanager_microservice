package com.dcmc.apps.taskmanager.service.dto;

import com.dcmc.apps.taskmanager.domain.enumeration.GroupRole;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.dcmc.apps.taskmanager.domain.WorkGroupMembership} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class WorkGroupMembershipDTO implements Serializable {

    private Long id;

    @NotNull
    private GroupRole role;

    private UserDTO user;

    private WorkGroupDTO workGroup;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public GroupRole getRole() {
        return role;
    }

    public void setRole(GroupRole role) {
        this.role = role;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public WorkGroupDTO getWorkGroup() {
        return workGroup;
    }

    public void setWorkGroup(WorkGroupDTO workGroup) {
        this.workGroup = workGroup;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof WorkGroupMembershipDTO)) {
            return false;
        }

        WorkGroupMembershipDTO workGroupMembershipDTO = (WorkGroupMembershipDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, workGroupMembershipDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "WorkGroupMembershipDTO{" +
            "id=" + getId() +
            ", role='" + getRole() + "'" +
            ", user=" + getUser() +
            ", workGroup=" + getWorkGroup() +
            "}";
    }
}
