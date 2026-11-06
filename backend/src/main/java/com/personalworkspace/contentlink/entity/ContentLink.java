package com.personalworkspace.contentlink.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/**
 * İki içerik (görev/not/çizim) arasındaki yönsüz çapraz referans.
 * Yönsüzlük sözleşmesi: servis katmanı uçları sözlüksel olarak sıralayıp
 * kanonik yönde saklar; okuma tarafı iki yönü birlikte döner.
 */
@Entity
@Table(name = "content_links")
public class ContentLink {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 20)
    private ContentRefType sourceType;

    @Column(name = "source_id", nullable = false)
    private UUID sourceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private ContentRefType targetType;

    @Column(name = "target_id", nullable = false)
    private UUID targetId;

    @Column(length = 255)
    private String label;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(UUID workspaceId) { this.workspaceId = workspaceId; }

    public ContentRefType getSourceType() { return sourceType; }
    public void setSourceType(ContentRefType sourceType) { this.sourceType = sourceType; }

    public UUID getSourceId() { return sourceId; }
    public void setSourceId(UUID sourceId) { this.sourceId = sourceId; }

    public ContentRefType getTargetType() { return targetType; }
    public void setTargetType(ContentRefType targetType) { this.targetType = targetType; }

    public UUID getTargetId() { return targetId; }
    public void setTargetId(UUID targetId) { this.targetId = targetId; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
