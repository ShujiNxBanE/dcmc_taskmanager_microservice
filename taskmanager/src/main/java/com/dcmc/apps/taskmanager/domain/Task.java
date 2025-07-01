package com.dcmc.apps.taskmanager.domain;

import com.dcmc.apps.taskmanager.domain.enumeration.Priority;
import com.dcmc.apps.taskmanager.domain.enumeration.TaskStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * A Task.
 */
@Entity
@Table(name = "task")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Task implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "title", nullable = false)
    private String title;


    @Column(name = "description", nullable = false)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TaskStatus status;

    @NotNull
    @Column(name = "create_time", nullable = false)
    private Instant createTime;

    @NotNull
    @Column(name = "update_time", nullable = false)
    private Instant updateTime;

    @Column(name = "archived")
    private Boolean archived;

    @Column(name = "is_active")
    private Boolean isActive;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "taskRef")
    @JsonIgnoreProperties(value = { "author", "task", "project", "taskRef" }, allowSetters = true)
    private Set<Comment> comments = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    private WorkGroup workGroup;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "rel_task__assigned_to",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "assigned_to_id")
    )
    private Set<User> assignedTos = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "subTasks", "creator", "workGroup", "members" }, allowSetters = true)
    private Project parentProject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_task_id")
    private Task parentTask;

    @OneToMany(mappedBy = "parentTask", fetch = FetchType.LAZY)
    private Set<Task> subTasks = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "priority_id")
    private com.dcmc.apps.taskmanager.domain.Priority priorityEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private Status statusEntity;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public com.dcmc.apps.taskmanager.domain.Priority getPriorityEntity() {
        return priorityEntity;
    }

    public void setPriorityEntity(com.dcmc.apps.taskmanager.domain.Priority priorityEntity) {
        this.priorityEntity = priorityEntity;
    }

    public Status getStatusEntity() {
        return statusEntity;
    }

    public void setStatusEntity(Status statusEntity) {
        this.statusEntity = statusEntity;
    }

    public Set<Task> getSubTasks() {
        return subTasks;
    }

    public void setSubTasks(Set<Task> subTasks) {
        this.subTasks = subTasks;
    }

    public Task getParentTask() {
        return parentTask;
    }

    public void setParentTask(Task parentTask) {
        this.parentTask = parentTask;
    }

    public Long getId() {
        return this.id;
    }

    public Task id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return this.title;
    }

    public Task title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return this.description;
    }

    public Task description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Priority getPriority() {
        return this.priority;
    }

    public Task priority(Priority priority) {
        this.setPriority(priority);
        return this;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public TaskStatus getStatus() {
        return this.status;
    }

    public Task status(TaskStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Instant getCreateTime() {
        return this.createTime;
    }

    public Task createTime(Instant createTime) {
        this.setCreateTime(createTime);
        return this;
    }

    public void setCreateTime(Instant createTime) {
        this.createTime = createTime;
    }

    public Instant getUpdateTime() {
        return this.updateTime;
    }

    public Task updateTime(Instant updateTime) {
        this.setUpdateTime(updateTime);
        return this;
    }

    public void setUpdateTime(Instant updateTime) {
        this.updateTime = updateTime;
    }

    public Boolean getArchived() {
        return this.archived;
    }

    public Task archived(Boolean archived) {
        this.setArchived(archived);
        return this;
    }

    public void setArchived(Boolean archived) {
        this.archived = archived;
    }

    public Set<Comment> getComments() {
        return this.comments;
    }

    public void setComments(Set<Comment> comments) {
        if (this.comments != null) {
            this.comments.forEach(i -> i.setTaskRef(null));
        }
        if (comments != null) {
            comments.forEach(i -> i.setTaskRef(this));
        }
        this.comments = comments;
    }

    public Task comments(Set<Comment> comments) {
        this.setComments(comments);
        return this;
    }

    public Task addComments(Comment comment) {
        this.comments.add(comment);
        comment.setTaskRef(this);
        return this;
    }

    public Task removeComments(Comment comment) {
        this.comments.remove(comment);
        comment.setTaskRef(null);
        return this;
    }

    public User getCreator() {
        return this.creator;
    }

    public void setCreator(User user) {
        this.creator = user;
    }

    public Task creator(User user) {
        this.setCreator(user);
        return this;
    }

    public WorkGroup getWorkGroup() {
        return this.workGroup;
    }

    public void setWorkGroup(WorkGroup workGroup) {
        this.workGroup = workGroup;
    }

    public Task workGroup(WorkGroup workGroup) {
        this.setWorkGroup(workGroup);
        return this;
    }

    public Set<User> getAssignedTos() {
        return this.assignedTos;
    }

    public void setAssignedTos(Set<User> users) {
        this.assignedTos = users;
    }

    public Task assignedTos(Set<User> users) {
        this.setAssignedTos(users);
        return this;
    }

    public Task addAssignedTo(User user) {
        this.assignedTos.add(user);
        return this;
    }

    public Task removeAssignedTo(User user) {
        this.assignedTos.remove(user);
        return this;
    }

    public Project getParentProject() {
        return this.parentProject;
    }

    public void setParentProject(Project project) {
        this.parentProject = project;
    }

    public Task parentProject(Project project) {
        this.setParentProject(project);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Task)) {
            return false;
        }
        return getId() != null && getId().equals(((Task) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Task{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", description='" + getDescription() + "'" +
            ", priority='" + getPriority() + "'" +
            ", status='" + getStatus() + "'" +
            ", createTime='" + getCreateTime() + "'" +
            ", updateTime='" + getUpdateTime() + "'" +
            ", archived='" + getArchived() + "'" +
            "}";
    }
}
