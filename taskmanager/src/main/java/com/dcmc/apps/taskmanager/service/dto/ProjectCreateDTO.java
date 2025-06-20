package com.dcmc.apps.taskmanager.service.dto;

import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

public class ProjectCreateDTO implements Serializable {

    @NotNull
    private String title;

    private String description;

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


}
