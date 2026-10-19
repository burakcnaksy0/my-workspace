package com.personalworkspace.task.repository;

import com.personalworkspace.task.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    Optional<Task> findByIdAndWorkspaceId(UUID id, UUID workspaceId);

    @Query("""
        SELECT t FROM Task t
        WHERE t.workspaceId = :workspaceId
        AND (:areaId IS NULL OR t.areaId = :areaId)
        AND (:status IS NULL OR t.status = :status)
        AND (:priority IS NULL OR t.priority = :priority)
        ORDER BY
            CASE t.priority WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 WHEN 'LOW' THEN 2 END,
            t.createdAt DESC
    """)
    Page<Task> findByWorkspaceWithFilters(
            @Param("workspaceId") UUID workspaceId,
            @Param("areaId") UUID areaId,
            @Param("status") String status,
            @Param("priority") String priority,
            Pageable pageable);

    // Dashboard aggregation queries
    long countByWorkspaceIdAndStatus(UUID workspaceId, String status);

    long countByWorkspaceId(UUID workspaceId);

    @Query("""
        SELECT t FROM Task t
        WHERE t.workspaceId = :workspaceId
        AND t.status != 'DONE'
        AND t.dueAt IS NOT NULL
        AND t.dueAt < :now
        ORDER BY t.dueAt ASC
    """)
    List<Task> findOverdueTasks(@Param("workspaceId") UUID workspaceId, @Param("now") Instant now);

    @Query("""
        SELECT t FROM Task t
        WHERE t.workspaceId = :workspaceId
        AND t.status = 'DONE'
        AND t.completedAt >= :since
        ORDER BY t.completedAt DESC
    """)
    List<Task> findRecentlyCompleted(
            @Param("workspaceId") UUID workspaceId,
            @Param("since") Instant since);

    @Query("""
        SELECT t FROM Task t
        WHERE t.workspaceId = :workspaceId
        AND t.status != 'DONE'
        AND t.dueAt IS NOT NULL
        AND t.dueAt >= :now
        AND t.dueAt < :endOfDay
        ORDER BY t.dueAt ASC
    """)
    List<Task> findDueToday(
            @Param("workspaceId") UUID workspaceId,
            @Param("now") Instant now,
            @Param("endOfDay") Instant endOfDay);

    List<Task> findByWorkspaceIdAndStatusNot(UUID workspaceId, String status);

    void deleteAllByWorkspaceIdAndAreaId(UUID workspaceId, UUID areaId);
}
