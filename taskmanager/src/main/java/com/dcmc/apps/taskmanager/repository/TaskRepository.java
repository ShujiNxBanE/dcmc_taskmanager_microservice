package com.dcmc.apps.taskmanager.repository;

import com.dcmc.apps.taskmanager.domain.Task;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Task entity.
 *
 * When extending this class, extend TaskRepositoryWithBagRelationships too.
 * For more information refer to https://github.com/jhipster/generator-jhipster/issues/17990.
 */
@Repository
public interface TaskRepository extends TaskRepositoryWithBagRelationships, JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    @Query("select task from Task task where task.creator.login = ?#{authentication.name}")
    List<Task> findByCreatorIsCurrentUser();

    default Optional<Task> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findOneWithToOneRelationships(id));
    }

    default List<Task> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships());
    }

    default Page<Task> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships(pageable));
    }

    @Query(
        value = "select task from Task task left join fetch task.creator left join fetch task.workGroup",
        countQuery = "select count(task) from Task task"
    )
    Page<Task> findAllWithToOneRelationships(Pageable pageable);

    @Query("select task from Task task left join fetch task.creator left join fetch task.workGroup")
    List<Task> findAllWithToOneRelationships();

    @Query("select task from Task task left join fetch task.creator left join fetch task.workGroup where task.id =:id")
    Optional<Task> findOneWithToOneRelationships(@Param("id") Long id);

    List<Task> findByWorkGroup_Id(Long workGroupId);

    List<Task> findByArchivedFalse();

    List<Task> findByWorkGroup_IdAndArchivedFalse(Long workGroupId);

    List<Task> findByWorkGroup_IdAndArchivedTrue(Long workGroupId);

    List<Task> findByProject_IdAndArchivedFalse(Long projectId);

    List<Task> findByParentTask_Id(Long parentTaskId);

    List<Task> findByProject_IdAndArchivedFalseAndIsActiveTrue(Long projectId);

    List<Task> findByProject_IdAndArchivedTrueAndIsActiveTrue(Long projectId);

    List<Task> findByParentTask_IdAndArchivedFalseAndIsActiveTrue(Long parentTaskId);

    List<Task> findByArchivedFalseAndIsActiveTrue();

    List<Task> findByAssignedTos_LoginAndParentTaskIsNullAndArchivedFalseAndIsActiveTrue(String login);

    List<Task> findByAssignedTos_LoginAndParentTaskIsNotNullAndArchivedFalseAndIsActiveTrue(String login);

    List<Task> findByCreator_LoginAndParentTaskIsNullAndArchivedFalseAndIsActiveTrue(String login);

    List<Task> findByCreator_LoginAndParentTaskIsNotNullAndArchivedFalseAndIsActiveTrue(String login);

}
