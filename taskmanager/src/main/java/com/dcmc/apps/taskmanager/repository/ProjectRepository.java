package com.dcmc.apps.taskmanager.repository;

import com.dcmc.apps.taskmanager.domain.Project;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Project entity.
 *
 * When extending this class, extend ProjectRepositoryWithBagRelationships too.
 * For more information refer to https://github.com/jhipster/generator-jhipster/issues/17990.
 */
@Repository
public interface ProjectRepository
    extends ProjectRepositoryWithBagRelationships, JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
    @Query("select project from Project project where project.creator.login = ?#{authentication.name}")
    List<Project> findByCreatorIsCurrentUser();

    default Optional<Project> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findOneWithToOneRelationships(id));
    }

    default List<Project> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships());
    }

    default Page<Project> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships(pageable));
    }

    @Query(
        value = "select project from Project project left join fetch project.creator left join fetch project.workGroup",
        countQuery = "select count(project) from Project project"
    )
    Page<Project> findAllWithToOneRelationships(Pageable pageable);

    @Query("select project from Project project left join fetch project.creator left join fetch project.workGroup")
    List<Project> findAllWithToOneRelationships();

    @Query("select project from Project project left join fetch project.creator left join fetch project.workGroup where project.id =:id")
    Optional<Project> findOneWithToOneRelationships(@Param("id") Long id);

    List<Project> findByWorkGroup_IdAndIsActiveTrue(Long workGroupId);

    Optional<Project> findByIdAndIsActiveTrue(Long id);

}
