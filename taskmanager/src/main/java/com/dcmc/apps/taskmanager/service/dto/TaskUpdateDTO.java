package com.dcmc.apps.taskmanager.service.dto;

import com.dcmc.apps.taskmanager.domain.enumeration.Priority;
import com.dcmc.apps.taskmanager.domain.enumeration.TaskStatus;
import jakarta.validation.constraints.NotNull;

public class TaskUpdateDTO {

    @NotNull
    private String title;

    private String description;

    @NotNull
    private Long priorityId;

    @NotNull
    private Long statusId;

    // Getters y Setters

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

    public Long getPriorityId() {
        return priorityId;
    }

    public void setPriorityId(Long priorityId) {
        this.priorityId = priorityId;
    }

    public Long getStatusId() {
        return statusId;
    }

    public void setStatusId(Long statusId) {
        this.statusId = statusId;
    }
}

