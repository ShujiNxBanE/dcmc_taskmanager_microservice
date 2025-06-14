package com.dcmc.apps.taskmanager.repository;

import com.dcmc.apps.taskmanager.domain.WorkGroupMembership;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the WorkGroupMembership entity.
 */
@Repository
public interface WorkGroupMembershipRepository extends JpaRepository<WorkGroupMembership, Long> {
    @Query(
        "select workGroupMembership from WorkGroupMembership workGroupMembership where workGroupMembership.user.login = ?#{authentication.name}"
    )
    List<WorkGroupMembership> findByUserIsCurrentUser();

    default Optional<WorkGroupMembership> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<WorkGroupMembership> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<WorkGroupMembership> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select workGroupMembership from WorkGroupMembership workGroupMembership left join fetch workGroupMembership.user left join fetch workGroupMembership.workGroup",
        countQuery = "select count(workGroupMembership) from WorkGroupMembership workGroupMembership"
    )
    Page<WorkGroupMembership> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select workGroupMembership from WorkGroupMembership workGroupMembership left join fetch workGroupMembership.user left join fetch workGroupMembership.workGroup"
    )
    List<WorkGroupMembership> findAllWithToOneRelationships();

    @Query(
        "select workGroupMembership from WorkGroupMembership workGroupMembership left join fetch workGroupMembership.user left join fetch workGroupMembership.workGroup where workGroupMembership.id =:id"
    )
    Optional<WorkGroupMembership> findOneWithToOneRelationships(@Param("id") Long id);
}
