package com.dcmc.apps.taskmanager.repository;

import com.dcmc.apps.taskmanager.domain.Comment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Comment entity.
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    @Query("select comment from Comment comment where comment.author.login = ?#{authentication.name}")
    List<Comment> findByAuthorIsCurrentUser();

    default Optional<Comment> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Comment> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Comment> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select comment from Comment comment left join fetch comment.author left join fetch comment.task left join fetch comment.project",
        countQuery = "select count(comment) from Comment comment"
    )
    Page<Comment> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select comment from Comment comment left join fetch comment.author left join fetch comment.task left join fetch comment.project"
    )
    List<Comment> findAllWithToOneRelationships();

    @Query(
        "select comment from Comment comment left join fetch comment.author left join fetch comment.task left join fetch comment.project where comment.id =:id"
    )
    Optional<Comment> findOneWithToOneRelationships(@Param("id") Long id);

    List<Comment> findAllByTask_IdOrderByCreatedDateAsc(Long taskId);
}
