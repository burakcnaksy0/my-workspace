package com.personalworkspace.contentlink.entity;

/**
 * ContentLink uçlarının işaret edebildiği içerik türleri.
 * Veritabanında VARCHAR olarak saklanır; V2 migration'daki CHECK kısıtıyla birebir aynıdır.
 */
public enum ContentRefType {
    TASK,
    NOTE,
    DRAWING
}
