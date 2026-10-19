package com.personalworkspace.notes.repository;

import com.personalworkspace.notes.entity.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {

    Optional<Note> findByIdAndWorkspaceId(UUID id, UUID workspaceId);

    List<Note> findTop5ByWorkspaceIdOrderByUpdatedAtDesc(UUID workspaceId);

    @Query("""
        SELECT DISTINCT n FROM Note n
        LEFT JOIN n.tags t
        WHERE n.workspaceId = :workspaceId
          AND (:areaId IS NULL OR n.areaId = :areaId)
          AND (:tag IS NULL OR :tag = '' OR LOWER(t.name) = LOWER(:tag))
          AND (:q IS NULL OR :q = '' OR LOWER(n.title) LIKE LOWER(CONCAT('%', :q, '%')) OR (n.contentText IS NOT NULL AND LOWER(n.contentText) LIKE LOWER(CONCAT('%', :q, '%'))))
    """)
    Page<Note> searchNotes(
        @Param("workspaceId") UUID workspaceId,
        @Param("areaId") UUID areaId,
        @Param("tag") String tag,
        @Param("q") String q,
        Pageable pageable
    );

    long countByWorkspaceId(UUID workspaceId);
}
