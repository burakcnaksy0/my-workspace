-- 14. CONTENT LINKS — içerikler arası yönsüz çapraz referanslar (ContentLink)
-- Görev / Not / Çizim arasındaki isteğe bağlı bağlantılar. Bağlantı yönsüzdür:
-- okuma tarafı source ve target uçlarının ikisini birlikte döner.

CREATE TABLE content_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    source_type VARCHAR(20) NOT NULL,
    source_id UUID NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id UUID NOT NULL,
    label VARCHAR(255),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_content_links_pair UNIQUE (source_type, source_id, target_type, target_id),
    CONSTRAINT ck_content_links_source_type CHECK (source_type IN ('TASK', 'NOTE', 'DRAWING')),
    CONSTRAINT ck_content_links_target_type CHECK (target_type IN ('TASK', 'NOTE', 'DRAWING')),
    -- Aynı içerik kendine bağlanamaz (yönsüz tekilleştirme servis seviyesinde yapılır)
    CONSTRAINT ck_content_links_not_self CHECK (NOT (source_type = target_type AND source_id = target_id))
);

CREATE INDEX idx_content_links_source ON content_links (source_type, source_id);
CREATE INDEX idx_content_links_target ON content_links (target_type, target_id);
CREATE INDEX idx_content_links_workspace ON content_links (workspace_id);
