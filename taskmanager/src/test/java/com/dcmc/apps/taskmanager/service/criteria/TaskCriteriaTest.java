package com.dcmc.apps.taskmanager.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class TaskCriteriaTest {

    @Test
    void newTaskCriteriaHasAllFiltersNullTest() {
        var taskCriteria = new TaskCriteria();
        assertThat(taskCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void taskCriteriaFluentMethodsCreatesFiltersTest() {
        var taskCriteria = new TaskCriteria();

        setAllFilters(taskCriteria);

        assertThat(taskCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void taskCriteriaCopyCreatesNullFilterTest() {
        var taskCriteria = new TaskCriteria();
        var copy = taskCriteria.copy();

        assertThat(taskCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(taskCriteria)
        );
    }

    @Test
    void taskCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var taskCriteria = new TaskCriteria();
        setAllFilters(taskCriteria);

        var copy = taskCriteria.copy();

        assertThat(taskCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(taskCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var taskCriteria = new TaskCriteria();

        assertThat(taskCriteria).hasToString("TaskCriteria{}");
    }

    private static void setAllFilters(TaskCriteria taskCriteria) {
        taskCriteria.id();
        taskCriteria.title();
        taskCriteria.priority();
        taskCriteria.status();
        taskCriteria.createTime();
        taskCriteria.updateTime();
        taskCriteria.archived();
        taskCriteria.commentsId();
        taskCriteria.creatorId();
        taskCriteria.workGroupId();
        taskCriteria.assignedToId();
        taskCriteria.parentProjectId();
        taskCriteria.distinct();
    }

    private static Condition<TaskCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getTitle()) &&
                condition.apply(criteria.getPriority()) &&
                condition.apply(criteria.getStatus()) &&
                condition.apply(criteria.getCreateTime()) &&
                condition.apply(criteria.getUpdateTime()) &&
                condition.apply(criteria.getArchived()) &&
                condition.apply(criteria.getCommentsId()) &&
                condition.apply(criteria.getCreatorId()) &&
                condition.apply(criteria.getWorkGroupId()) &&
                condition.apply(criteria.getAssignedToId()) &&
                condition.apply(criteria.getParentProjectId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<TaskCriteria> copyFiltersAre(TaskCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getTitle(), copy.getTitle()) &&
                condition.apply(criteria.getPriority(), copy.getPriority()) &&
                condition.apply(criteria.getStatus(), copy.getStatus()) &&
                condition.apply(criteria.getCreateTime(), copy.getCreateTime()) &&
                condition.apply(criteria.getUpdateTime(), copy.getUpdateTime()) &&
                condition.apply(criteria.getArchived(), copy.getArchived()) &&
                condition.apply(criteria.getCommentsId(), copy.getCommentsId()) &&
                condition.apply(criteria.getCreatorId(), copy.getCreatorId()) &&
                condition.apply(criteria.getWorkGroupId(), copy.getWorkGroupId()) &&
                condition.apply(criteria.getAssignedToId(), copy.getAssignedToId()) &&
                condition.apply(criteria.getParentProjectId(), copy.getParentProjectId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
