package com.dcmc.apps.taskmanager.service.dto;

public class MinimalProjectDTO {

    private String title;
    private String description;
    private String creatorId;
    private Long workGroupId;

    public MinimalProjectDTO() {}

    public MinimalProjectDTO(String title, String description, String creatorId, Long workGroupId) {
        this.title = title;
        this.description = description;
        this.creatorId = creatorId;
        this.workGroupId = workGroupId;
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
