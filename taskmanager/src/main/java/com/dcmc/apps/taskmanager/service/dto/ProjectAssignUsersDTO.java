package com.dcmc.apps.taskmanager.service.dto;

import java.util.Set;

public class ProjectAssignUsersDTO {
    private Set<String> userIds;

    public Set<String> getUserIds() {
        return userIds;
    }

    public void setUserIds(Set<String> userIds) {
        this.userIds = userIds;
    }
}
