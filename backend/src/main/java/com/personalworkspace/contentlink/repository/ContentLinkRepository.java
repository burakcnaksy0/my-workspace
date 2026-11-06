package com.personalworkspace.contentlink.repository;

import com.personalworkspace.contentlink.entity.ContentLink;
import com.personalworkspace.contentlink.entity.ContentRefType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ContentLinkRepository extends JpaRepository<ContentLink, UUID> {

    /** Bir içeriğe bağlı TÜM bağlantılar (hem source hem target tarafı). */
    @Query("""
            SELECT l FROM ContentLink l
            WHERE l.workspaceId = :workspaceId
              AND ((l.sourceType = :type AND l.sourceId = :id)
                OR (l.targetType = :type AND l.targetId = :id))
            ORDER BY l.createdAt DESC
            """)
    List<ContentLink> findAllRelated(
            @Param("workspaceId") UUID workspaceId,
            @Param("type") ContentRefType type,
            @Param("id") UUID id);

    boolean existsByWorkspaceIdAndSourceTypeAndSourceIdAndTargetTypeAndTargetId(
            UUID workspaceId, ContentRefType sourceType, UUID sourceId,
            ContentRefType targetType, UUID targetId);

    /** İçerik silindiğinde iki yöndeki yetim bağlantıları temizler. */
    void deleteBySourceTypeAndSourceId(ContentRefType type, UUID id);

    void deleteByTargetTypeAndTargetId(ContentRefType type, UUID id);
}
