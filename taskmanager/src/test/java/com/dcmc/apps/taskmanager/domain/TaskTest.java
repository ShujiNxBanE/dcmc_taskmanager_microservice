package com.dcmc.apps.taskmanager.domain;

import static com.dcmc.apps.taskmanager.domain.CommentTestSamples.*;
import static com.dcmc.apps.taskmanager.domain.ProjectTestSamples.*;
import static com.dcmc.apps.taskmanager.domain.TaskTestSamples.*;
import static com.dcmc.apps.taskmanager.domain.WorkGroupTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.dcmc.apps.taskmanager.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class TaskTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Task.class);
        Task task1 = getTaskSample1();
        Task task2 = new Task();
        assertThat(task1).isNotEqualTo(task2);

        task2.setId(task1.getId());
        assertThat(task1).isEqualTo(task2);

        task2 = getTaskSample2();
        assertThat(task1).isNotEqualTo(task2);
    }

    @Test
    void commentsTest() {
        Task task = getTaskRandomSampleGenerator();
        Comment commentBack = getCommentRandomSampleGenerator();

        task.addComments(commentBack);
        assertThat(task.getComments()).containsOnly(commentBack);
        assertThat(commentBack.getTaskRef()).isEqualTo(task);

        task.removeComments(commentBack);
        assertThat(task.getComments()).doesNotContain(commentBack);
        assertThat(commentBack.getTaskRef()).isNull();

        task.comments(new HashSet<>(Set.of(commentBack)));
        assertThat(task.getComments()).containsOnly(commentBack);
        assertThat(commentBack.getTaskRef()).isEqualTo(task);

        task.setComments(new HashSet<>());
        assertThat(task.getComments()).doesNotContain(commentBack);
        assertThat(commentBack.getTaskRef()).isNull();
    }

    @Test
    void workGroupTest() {
        Task task = getTaskRandomSampleGenerator();
        WorkGroup workGroupBack = getWorkGroupRandomSampleGenerator();

        task.setWorkGroup(workGroupBack);
        assertThat(task.getWorkGroup()).isEqualTo(workGroupBack);

        task.workGroup(null);
        assertThat(task.getWorkGroup()).isNull();
    }

    @Test
    void parentProjectTest() {
        Task task = getTaskRandomSampleGenerator();
        Project projectBack = getProjectRandomSampleGenerator();

        task.setParentProject(projectBack);
        assertThat(task.getParentProject()).isEqualTo(projectBack);

        task.parentProject(null);
        assertThat(task.getParentProject()).isNull();
    }
}
