package com.dcmc.apps.taskmanager.service.dto;

public class MinimalProjectDTO {

    private Long id; // 👈 NUEVO CAMPO
    private String title;
    private String description;
    private String creatorId;
    private Long workGroupId;

    public MinimalProjectDTO() {}

    public MinimalProjectDTO(Long id, String title, String description, String creatorId, Long workGroupId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.creatorId = creatorId;
        this.workGroupId = workGroupId;
    }

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

    public String getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
    }

    public Long getWorkGroupId() {
        return workGroupId;
    }

    public void setWorkGroupId(Long workGroupId) {
        this.workGroupId = workGroupId;
    }
}
