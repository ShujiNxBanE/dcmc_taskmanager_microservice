package com.dcmc.apps.taskmanager.domain;

import com.dcmc.apps.taskmanager.domain.enumeration.GroupRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A WorkGroupMembership.
 */
@Entity
@Table(name = "work_group_membership")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class WorkGroupMembership implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private GroupRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    private WorkGroup workGroup;

    @Column(name = "is_in_group", nullable = false)
    private Boolean isInGroup = true;


    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public WorkGroupMembership id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public GroupRole getRole() {
        return this.role;
    }

    public WorkGroupMembership role(GroupRole role) {
        this.setRole(role);
        return this;
    }

    public void setRole(GroupRole role) {
        this.role = role;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public WorkGroupMembership user(User user) {
        this.setUser(user);
        return this;
    }

    public WorkGroup getWorkGroup() {
        return this.workGroup;
    }

    public void setWorkGroup(WorkGroup workGroup) {
        this.workGroup = workGroup;
    }

    public WorkGroupMembership workGroup(WorkGroup workGroup) {
        this.setWorkGroup(workGroup);
        return this;
    }

    public Boolean getInGroup() { return isInGroup; }

    public void setInGroup(Boolean inGroup) { isInGroup = inGroup; }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof WorkGroupMembership)) {
            return false;
        }
        return getId() != null && getId().equals(((WorkGroupMembership) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "WorkGroupMembership{" +
            "id=" + getId() +
            ", role='" + getRole() + "'" +
            "}";
    }
}
