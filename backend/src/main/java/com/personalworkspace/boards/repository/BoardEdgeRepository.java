package com.personalworkspace.boards.repository;

import com.personalworkspace.boards.entity.BoardEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BoardEdgeRepository extends JpaRepository<BoardEdge, UUID> {
    List<BoardEdge> findByBoardId(UUID boardId);
    Optional<BoardEdge> findByIdAndBoardId(UUID id, UUID boardId);
    void deleteByBoardId(UUID boardId);

    @Modifying
    @Query("DELETE FROM BoardEdge be WHERE be.sourceItemId = :itemId OR be.targetItemId = :itemId")
    void deleteBySourceItemIdOrTargetItemId(@Param("itemId") UUID itemId);
}
