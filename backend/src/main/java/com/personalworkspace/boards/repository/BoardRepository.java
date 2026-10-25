package com.personalworkspace.boards.repository;

import com.personalworkspace.boards.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BoardRepository extends JpaRepository<Board, UUID> {
    Optional<Board> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
    List<Board> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);
    List<Board> findByWorkspaceIdAndAreaIdOrderByCreatedAtDesc(UUID workspaceId, UUID areaId);
}
