package com.dcmc.apps.taskmanager.repository;

import com.dcmc.apps.taskmanager.domain.WorkGroup;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the WorkGroup entity.
 */
@SuppressWarnings("unused")
@Repository
public interface WorkGroupRepository extends JpaRepository<WorkGroup, Long> {}
