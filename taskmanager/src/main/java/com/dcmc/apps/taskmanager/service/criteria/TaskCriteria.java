package com.dcmc.apps.taskmanager.service.criteria;

import com.dcmc.apps.taskmanager.domain.enumeration.Priority;
import com.dcmc.apps.taskmanager.domain.enumeration.TaskStatus;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.dcmc.apps.taskmanager.domain.Task} entity. This class is used
 * in {@link com.dcmc.apps.taskmanager.web.rest.TaskResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /tasks?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TaskCriteria implements Serializable, Criteria {

    /**
     * Class for filtering Priority
     */
    public static class PriorityFilter extends Filter<Priority> {

        public PriorityFilter() {}

        public PriorityFilter(PriorityFilter filter) {
            super(filter);
        }

        @Override
        public PriorityFilter copy() {
            return new PriorityFilter(this);
        }
    }

    /**
     * Class for filtering TaskStatus
     */
    public static class TaskStatusFilter extends Filter<TaskStatus> {

        public TaskStatusFilter() {}

        public TaskStatusFilter(TaskStatusFilter filter) {
            super(filter);
        }

        @Override
        public TaskStatusFilter copy() {
            return new TaskStatusFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter title;

    private PriorityFilter priority;

    private TaskStatusFilter status;

    private InstantFilter createTime;

    private InstantFilter updateTime;

    private BooleanFilter archived;

    private LongFilter commentsId;

    private StringFilter creatorId;

    private LongFilter workGroupId;

    private StringFilter assignedToId;

    private LongFilter parentProjectId;

    private Boolean distinct;

    public TaskCriteria() {}

    public TaskCriteria(TaskCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.title = other.optionalTitle().map(StringFilter::copy).orElse(null);
        this.priority = other.optionalPriority().map(PriorityFilter::copy).orElse(null);
        this.status = other.optionalStatus().map(TaskStatusFilter::copy).orElse(null);
        this.createTime = other.optionalCreateTime().map(InstantFilter::copy).orElse(null);
        this.updateTime = other.optionalUpdateTime().map(InstantFilter::copy).orElse(null);
        this.archived = other.optionalArchived().map(BooleanFilter::copy).orElse(null);
        this.commentsId = other.optionalCommentsId().map(LongFilter::copy).orElse(null);
        this.creatorId = other.optionalCreatorId().map(StringFilter::copy).orElse(null);
        this.workGroupId = other.optionalWorkGroupId().map(LongFilter::copy).orElse(null);
        this.assignedToId = other.optionalAssignedToId().map(StringFilter::copy).orElse(null);
        this.parentProjectId = other.optionalParentProjectId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public TaskCriteria copy() {
        return new TaskCriteria(this);
    }

    public LongFilter getId() {
        return id;
    }

    public Optional<LongFilter> optionalId() {
        return Optional.ofNullable(id);
    }

    public LongFilter id() {
        if (id == null) {
            setId(new LongFilter());
        }
        return id;
    }

    public void setId(LongFilter id) {
        this.id = id;
    }

    public StringFilter getTitle() {
        return title;
    }

    public Optional<StringFilter> optionalTitle() {
        return Optional.ofNullable(title);
    }

    public StringFilter title() {
        if (title == null) {
            setTitle(new StringFilter());
        }
        return title;
    }

    public void setTitle(StringFilter title) {
        this.title = title;
    }

    public PriorityFilter getPriority() {
        return priority;
    }

    public Optional<PriorityFilter> optionalPriority() {
        return Optional.ofNullable(priority);
    }

    public PriorityFilter priority() {
        if (priority == null) {
            setPriority(new PriorityFilter());
        }
        return priority;
    }

    public void setPriority(PriorityFilter priority) {
        this.priority = priority;
    }

    public TaskStatusFilter getStatus() {
        return status;
    }

    public Optional<TaskStatusFilter> optionalStatus() {
        return Optional.ofNullable(status);
    }

    public TaskStatusFilter status() {
        if (status == null) {
            setStatus(new TaskStatusFilter());
        }
        return status;
    }

    public void setStatus(TaskStatusFilter status) {
        this.status = status;
    }

    public InstantFilter getCreateTime() {
        return createTime;
    }

    public Optional<InstantFilter> optionalCreateTime() {
        return Optional.ofNullable(createTime);
    }

    public InstantFilter createTime() {
        if (createTime == null) {
            setCreateTime(new InstantFilter());
        }
        return createTime;
    }

    public void setCreateTime(InstantFilter createTime) {
        this.createTime = createTime;
    }

    public InstantFilter getUpdateTime() {
        return updateTime;
    }

    public Optional<InstantFilter> optionalUpdateTime() {
        return Optional.ofNullable(updateTime);
    }

    public InstantFilter updateTime() {
        if (updateTime == null) {
            setUpdateTime(new InstantFilter());
        }
        return updateTime;
    }

    public void setUpdateTime(InstantFilter updateTime) {
        this.updateTime = updateTime;
    }

    public BooleanFilter getArchived() {
        return archived;
    }

    public Optional<BooleanFilter> optionalArchived() {
        return Optional.ofNullable(archived);
    }

    public BooleanFilter archived() {
        if (archived == null) {
            setArchived(new BooleanFilter());
        }
        return archived;
    }

    public void setArchived(BooleanFilter archived) {
        this.archived = archived;
    }

    public LongFilter getCommentsId() {
        return commentsId;
    }

    public Optional<LongFilter> optionalCommentsId() {
        return Optional.ofNullable(commentsId);
    }

    public LongFilter commentsId() {
        if (commentsId == null) {
            setCommentsId(new LongFilter());
        }
        return commentsId;
    }

    public void setCommentsId(LongFilter commentsId) {
        this.commentsId = commentsId;
    }

    public StringFilter getCreatorId() {
        return creatorId;
    }

    public Optional<StringFilter> optionalCreatorId() {
        return Optional.ofNullable(creatorId);
    }

    public StringFilter creatorId() {
        if (creatorId == null) {
            setCreatorId(new StringFilter());
        }
        return creatorId;
    }

    public void setCreatorId(StringFilter creatorId) {
        this.creatorId = creatorId;
    }

    public LongFilter getWorkGroupId() {
        return workGroupId;
    }

    public Optional<LongFilter> optionalWorkGroupId() {
        return Optional.ofNullable(workGroupId);
    }

    public LongFilter workGroupId() {
        if (workGroupId == null) {
            setWorkGroupId(new LongFilter());
        }
        return workGroupId;
    }

    public void setWorkGroupId(LongFilter workGroupId) {
        this.workGroupId = workGroupId;
    }

    public StringFilter getAssignedToId() {
        return assignedToId;
    }

    public Optional<StringFilter> optionalAssignedToId() {
        return Optional.ofNullable(assignedToId);
    }

    public StringFilter assignedToId() {
        if (assignedToId == null) {
            setAssignedToId(new StringFilter());
        }
        return assignedToId;
    }

    public void setAssignedToId(StringFilter assignedToId) {
        this.assignedToId = assignedToId;
    }

    public LongFilter getParentProjectId() {
        return parentProjectId;
    }

    public Optional<LongFilter> optionalParentProjectId() {
        return Optional.ofNullable(parentProjectId);
    }

    public LongFilter parentProjectId() {
        if (parentProjectId == null) {
            setParentProjectId(new LongFilter());
        }
        return parentProjectId;
    }

    public void setParentProjectId(LongFilter parentProjectId) {
        this.parentProjectId = parentProjectId;
    }

    public Boolean getDistinct() {
        return distinct;
    }

    public Optional<Boolean> optionalDistinct() {
        return Optional.ofNullable(distinct);
    }

    public Boolean distinct() {
        if (distinct == null) {
            setDistinct(true);
        }
        return distinct;
    }

    public void setDistinct(Boolean distinct) {
        this.distinct = distinct;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        final TaskCriteria that = (TaskCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(title, that.title) &&
            Objects.equals(priority, that.priority) &&
            Objects.equals(status, that.status) &&
            Objects.equals(createTime, that.createTime) &&
            Objects.equals(updateTime, that.updateTime) &&
            Objects.equals(archived, that.archived) &&
            Objects.equals(commentsId, that.commentsId) &&
            Objects.equals(creatorId, that.creatorId) &&
            Objects.equals(workGroupId, that.workGroupId) &&
            Objects.equals(assignedToId, that.assignedToId) &&
            Objects.equals(parentProjectId, that.parentProjectId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            title,
            priority,
            status,
            createTime,
            updateTime,
            archived,
            commentsId,
            creatorId,
            workGroupId,
            assignedToId,
            parentProjectId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TaskCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalTitle().map(f -> "title=" + f + ", ").orElse("") +
            optionalPriority().map(f -> "priority=" + f + ", ").orElse("") +
            optionalStatus().map(f -> "status=" + f + ", ").orElse("") +
            optionalCreateTime().map(f -> "createTime=" + f + ", ").orElse("") +
            optionalUpdateTime().map(f -> "updateTime=" + f + ", ").orElse("") +
            optionalArchived().map(f -> "archived=" + f + ", ").orElse("") +
            optionalCommentsId().map(f -> "commentsId=" + f + ", ").orElse("") +
            optionalCreatorId().map(f -> "creatorId=" + f + ", ").orElse("") +
            optionalWorkGroupId().map(f -> "workGroupId=" + f + ", ").orElse("") +
            optionalAssignedToId().map(f -> "assignedToId=" + f + ", ").orElse("") +
            optionalParentProjectId().map(f -> "parentProjectId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
