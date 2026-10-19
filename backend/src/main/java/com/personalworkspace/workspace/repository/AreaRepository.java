package com.personalworkspace.workspace.repository;

import com.personalworkspace.workspace.entity.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AreaRepository extends JpaRepository<Area, UUID> {
    List<Area> findByWorkspaceIdOrderBySortOrderAsc(UUID workspaceId);
    Optional<Area> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
    boolean existsByWorkspaceIdAndNameIgnoreCase(UUID workspaceId, String name);
}
