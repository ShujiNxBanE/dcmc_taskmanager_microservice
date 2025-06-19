package com.dcmc.apps.taskmanager.service.dto;

import com.dcmc.apps.taskmanager.domain.enumeration.Priority;
import com.dcmc.apps.taskmanager.domain.enumeration.TaskStatus;
import jakarta.validation.constraints.NotNull;

public class TaskCreateDTO {

    @NotNull
    private String title;

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

    private String description;

    @NotNull
    private Priority priority;

    @NotNull
    private TaskStatus status;
}
