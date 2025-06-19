package com.dcmc.apps.taskmanager.service.dto;

import java.util.List;

public class TaskAssignmentDTO {
    private Long taskId;
    private List<String> userIds;

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public List<String> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<String> userIds) {
        this.userIds = userIds;
    }
}
