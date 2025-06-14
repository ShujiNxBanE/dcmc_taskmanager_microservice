package com.dcmc.apps.taskmanager.domain;

import static com.dcmc.apps.taskmanager.domain.WorkGroupMembershipTestSamples.*;
import static com.dcmc.apps.taskmanager.domain.WorkGroupTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.dcmc.apps.taskmanager.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class WorkGroupMembershipTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(WorkGroupMembership.class);
        WorkGroupMembership workGroupMembership1 = getWorkGroupMembershipSample1();
        WorkGroupMembership workGroupMembership2 = new WorkGroupMembership();
        assertThat(workGroupMembership1).isNotEqualTo(workGroupMembership2);

        workGroupMembership2.setId(workGroupMembership1.getId());
        assertThat(workGroupMembership1).isEqualTo(workGroupMembership2);

        workGroupMembership2 = getWorkGroupMembershipSample2();
        assertThat(workGroupMembership1).isNotEqualTo(workGroupMembership2);
    }

    @Test
    void workGroupTest() {
        WorkGroupMembership workGroupMembership = getWorkGroupMembershipRandomSampleGenerator();
        WorkGroup workGroupBack = getWorkGroupRandomSampleGenerator();

        workGroupMembership.setWorkGroup(workGroupBack);
        assertThat(workGroupMembership.getWorkGroup()).isEqualTo(workGroupBack);

        workGroupMembership.workGroup(null);
        assertThat(workGroupMembership.getWorkGroup()).isNull();
    }
}
