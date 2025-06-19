package com.dcmc.apps.taskmanager.service.dto;

import com.dcmc.apps.taskmanager.domain.enumeration.Priority;
import com.dcmc.apps.taskmanager.domain.enumeration.TaskStatus;
import jakarta.validation.constraints.NotNull;

public class TaskUpdateDTO {

    @NotNull
    private String title;

    private String description;

    @NotNull
    private Priority priority;

    public Boolean getArchived() {
        return Archived;
    }

    public void setArchived(Boolean archived) {
        Archived = archived;
    }

    @NotNull
    private Boolean Archived;

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @NotNull
    private TaskStatus status;
}
