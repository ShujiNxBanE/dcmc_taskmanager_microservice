package com.dcmc.apps.taskmanager.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "status")
public class Status implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // equals y hashCode basados en id
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Status)) return false;
        return id != null && id.equals(((Status) o).id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    // toString
    @Override
    public String toString() {
        return "Status{" +
            "id=" + id +
            ", name='" + name + '\'' +
            '}';
    }
}
