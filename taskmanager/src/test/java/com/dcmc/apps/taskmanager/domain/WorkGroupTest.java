package com.dcmc.apps.taskmanager.domain;

import static com.dcmc.apps.taskmanager.domain.WorkGroupTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.dcmc.apps.taskmanager.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class WorkGroupTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(WorkGroup.class);
        WorkGroup workGroup1 = getWorkGroupSample1();
        WorkGroup workGroup2 = new WorkGroup();
        assertThat(workGroup1).isNotEqualTo(workGroup2);

        workGroup2.setId(workGroup1.getId());
        assertThat(workGroup1).isEqualTo(workGroup2);

        workGroup2 = getWorkGroupSample2();
        assertThat(workGroup1).isNotEqualTo(workGroup2);
    }
}
