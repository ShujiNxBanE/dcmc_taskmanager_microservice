    package com.dcmc.apps.taskmanager.repository;

    import com.dcmc.apps.taskmanager.domain.WorkGroup;
    import org.springframework.data.jpa.repository.*;
    import org.springframework.stereotype.Repository;

    import java.util.List;

    /**
     * Spring Data JPA repository for the WorkGroup entity.
     */
    @SuppressWarnings("unused")
    @Repository
    public interface WorkGroupRepository extends JpaRepository<WorkGroup, Long> {
        List<WorkGroup> findAllByIsActiveTrue();
    }
