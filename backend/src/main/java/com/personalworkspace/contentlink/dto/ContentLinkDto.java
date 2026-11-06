package com.personalworkspace.contentlink.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Bir bağlantının iki ucu; uç içerik silinmişse exists=false, title="Silinmiş içerik" olur.
 */
public record ContentLinkDto(
        UUID id,
        UUID workspaceId,
        String sourceType,
        UUID sourceId,
        String sourceTitle,
        boolean sourceExists,
        String targetType,
        UUID targetId,
        String targetTitle,
        boolean targetExists,
        String label,
        Instant createdAt
) {}
