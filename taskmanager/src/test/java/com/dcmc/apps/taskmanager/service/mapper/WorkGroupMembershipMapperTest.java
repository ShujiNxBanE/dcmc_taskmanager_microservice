package com.dcmc.apps.taskmanager.service.mapper;

import static com.dcmc.apps.taskmanager.domain.WorkGroupMembershipAsserts.*;
import static com.dcmc.apps.taskmanager.domain.WorkGroupMembershipTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class WorkGroupMembershipMapperTest {

    private WorkGroupMembershipMapper workGroupMembershipMapper;

    @BeforeEach
    void setUp() {
        workGroupMembershipMapper = new WorkGroupMembershipMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getWorkGroupMembershipSample1();
        var actual = workGroupMembershipMapper.toEntity(workGroupMembershipMapper.toDto(expected));
        assertWorkGroupMembershipAllPropertiesEquals(expected, actual);
    }
}
