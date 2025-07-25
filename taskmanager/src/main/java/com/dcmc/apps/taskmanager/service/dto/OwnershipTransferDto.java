package com.dcmc.apps.taskmanager.service.dto;

import jakarta.validation.constraints.NotBlank;

public class OwnershipTransferDTO {
    @NotBlank
    private String newOwnerUsername;

    public String getNewOwnerUsername() {
        return newOwnerUsername;
    }

    public void setNewOwnerUsername(String newOwnerUsername) {
        this.newOwnerUsername = newOwnerUsername;
    }
}
