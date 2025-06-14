package com.dcmc.apps.taskmanager.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.dcmc.apps.taskmanager.domain.Project} entity. This class is used
 * in {@link com.dcmc.apps.taskmanager.web.rest.ProjectResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /projects?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ProjectCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter title;

    private LongFilter subTasksId;

    private StringFilter creatorId;

    private LongFilter workGroupId;

    private StringFilter membersId;

    private Boolean distinct;

    public ProjectCriteria() {}

    public ProjectCriteria(ProjectCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.title = other.optionalTitle().map(StringFilter::copy).orElse(null);
        this.subTasksId = other.optionalSubTasksId().map(LongFilter::copy).orElse(null);
        this.creatorId = other.optionalCreatorId().map(StringFilter::copy).orElse(null);
        this.workGroupId = other.optionalWorkGroupId().map(LongFilter::copy).orElse(null);
        this.membersId = other.optionalMembersId().map(StringFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public ProjectCriteria copy() {
        return new ProjectCriteria(this);
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

    public LongFilter getSubTasksId() {
        return subTasksId;
    }

    public Optional<LongFilter> optionalSubTasksId() {
        return Optional.ofNullable(subTasksId);
    }

    public LongFilter subTasksId() {
        if (subTasksId == null) {
            setSubTasksId(new LongFilter());
        }
        return subTasksId;
    }

    public void setSubTasksId(LongFilter subTasksId) {
        this.subTasksId = subTasksId;
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

    public StringFilter getMembersId() {
        return membersId;
    }

    public Optional<StringFilter> optionalMembersId() {
        return Optional.ofNullable(membersId);
    }

    public StringFilter membersId() {
        if (membersId == null) {
            setMembersId(new StringFilter());
        }
        return membersId;
    }

    public void setMembersId(StringFilter membersId) {
        this.membersId = membersId;
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
        final ProjectCriteria that = (ProjectCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(title, that.title) &&
            Objects.equals(subTasksId, that.subTasksId) &&
            Objects.equals(creatorId, that.creatorId) &&
            Objects.equals(workGroupId, that.workGroupId) &&
            Objects.equals(membersId, that.membersId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, subTasksId, creatorId, workGroupId, membersId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ProjectCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalTitle().map(f -> "title=" + f + ", ").orElse("") +
            optionalSubTasksId().map(f -> "subTasksId=" + f + ", ").orElse("") +
            optionalCreatorId().map(f -> "creatorId=" + f + ", ").orElse("") +
            optionalWorkGroupId().map(f -> "workGroupId=" + f + ", ").orElse("") +
            optionalMembersId().map(f -> "membersId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
