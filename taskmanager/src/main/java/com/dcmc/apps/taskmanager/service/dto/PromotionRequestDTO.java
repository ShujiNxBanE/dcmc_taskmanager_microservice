package com.dcmc.apps.taskmanager.service.dto;

import jakarta.validation.constraints.NotBlank;

public class PromotionRequestDTO {
    @NotBlank
    private String username;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
