package com.dcmc.apps.taskmanager.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.dcmc.apps.taskmanager.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class WorkGroupMembershipDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(WorkGroupMembershipDTO.class);
        WorkGroupMembershipDTO workGroupMembershipDTO1 = new WorkGroupMembershipDTO();
        workGroupMembershipDTO1.setId(1L);
        WorkGroupMembershipDTO workGroupMembershipDTO2 = new WorkGroupMembershipDTO();
        assertThat(workGroupMembershipDTO1).isNotEqualTo(workGroupMembershipDTO2);
        workGroupMembershipDTO2.setId(workGroupMembershipDTO1.getId());
        assertThat(workGroupMembershipDTO1).isEqualTo(workGroupMembershipDTO2);
        workGroupMembershipDTO2.setId(2L);
        assertThat(workGroupMembershipDTO1).isNotEqualTo(workGroupMembershipDTO2);
        workGroupMembershipDTO1.setId(null);
        assertThat(workGroupMembershipDTO1).isNotEqualTo(workGroupMembershipDTO2);
    }
}
