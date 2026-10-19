package com.personalworkspace.boards.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "board_edges")
public class BoardEdge {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "board_id", nullable = false)
    private UUID boardId;

    @Column(name = "source_item_id", nullable = false)
    private UUID sourceItemId;

    @Column(name = "target_item_id", nullable = false)
    private UUID targetItemId;

    @Column
    private String label;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public BoardEdge() {}

    public BoardEdge(UUID boardId, UUID sourceItemId, UUID targetItemId, String label) {
        this.boardId = boardId;
        this.sourceItemId = sourceItemId;
        this.targetItemId = targetItemId;
        this.label = label;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBoardId() { return boardId; }
    public void setBoardId(UUID boardId) { this.boardId = boardId; }

    public UUID getSourceItemId() { return sourceItemId; }
    public void setSourceItemId(UUID sourceItemId) { this.sourceItemId = sourceItemId; }

    public UUID getTargetItemId() { return targetItemId; }
    public void setTargetItemId(UUID targetItemId) { this.targetItemId = targetItemId; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
