package com.dcmc.apps.taskmanager.service.dto;

import com.dcmc.apps.taskmanager.domain.enumeration.Priority;
import com.dcmc.apps.taskmanager.domain.enumeration.TaskStatus;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * A DTO for the {@link com.dcmc.apps.taskmanager.domain.Task} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TaskDTO implements Serializable {

    private Long id;

    @NotNull
    private String title;

    private String description;

    @NotNull
    private Priority priority;

    @NotNull
    private TaskStatus status;

    @NotNull
    private Instant createTime;

    @NotNull
    private Instant updateTime;

    private Boolean archived;

    private UserDTO creator;

    private WorkGroupDTO workGroup;

    private Set<UserDTO> assignedTos = new HashSet<>();

    private ProjectDTO parentProject;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Instant getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Instant createTime) {
        this.createTime = createTime;
    }

    public Instant getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Instant updateTime) {
        this.updateTime = updateTime;
    }

    public Boolean getArchived() {
        return archived;
    }

    public void setArchived(Boolean archived) {
        this.archived = archived;
    }

    public UserDTO getCreator() {
        return creator;
    }

    public void setCreator(UserDTO creator) {
        this.creator = creator;
    }

    public WorkGroupDTO getWorkGroup() {
        return workGroup;
    }

    public void setWorkGroup(WorkGroupDTO workGroup) {
        this.workGroup = workGroup;
    }

    public Set<UserDTO> getAssignedTos() {
        return assignedTos;
    }

    public void setAssignedTos(Set<UserDTO> assignedTos) {
        this.assignedTos = assignedTos;
    }

    public ProjectDTO getParentProject() {
        return parentProject;
    }

    public void setParentProject(ProjectDTO parentProject) {
        this.parentProject = parentProject;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TaskDTO)) {
            return false;
        }

        TaskDTO taskDTO = (TaskDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, taskDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TaskDTO{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", description='" + getDescription() + "'" +
            ", priority='" + getPriority() + "'" +
            ", status='" + getStatus() + "'" +
            ", createTime='" + getCreateTime() + "'" +
            ", updateTime='" + getUpdateTime() + "'" +
            ", archived='" + getArchived() + "'" +
            ", creator=" + getCreator() +
            ", workGroup=" + getWorkGroup() +
            ", assignedTos=" + getAssignedTos() +
            ", parentProject=" + getParentProject() +
            "}";
    }
}
