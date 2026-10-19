package com.personalworkspace.drawings.repository;

import com.personalworkspace.drawings.dto.DrawingSummaryDto;
import com.personalworkspace.drawings.entity.DrawingDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DrawingRepository extends JpaRepository<DrawingDocument, UUID> {

    Optional<DrawingDocument> findByIdAndWorkspaceId(UUID id, UUID workspaceId);

    @Query("""
        SELECT new com.personalworkspace.drawings.dto.DrawingSummaryDto(
            d.id, d.workspaceId, d.title, d.createdBy, d.version, d.createdAt, d.updatedAt
        )
        FROM DrawingDocument d
        WHERE d.workspaceId = :workspaceId
        ORDER BY d.updatedAt DESC
    """)
    List<DrawingSummaryDto> findSummariesByWorkspaceId(@Param("workspaceId") UUID workspaceId);

    long countByWorkspaceId(UUID workspaceId);
}
