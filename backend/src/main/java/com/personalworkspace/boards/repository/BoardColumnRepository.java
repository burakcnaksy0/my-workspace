package com.personalworkspace.boards.repository;

import com.personalworkspace.boards.entity.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BoardColumnRepository extends JpaRepository<BoardColumn, UUID> {
    List<BoardColumn> findByBoardIdOrderBySortOrderAsc(UUID boardId);
    Optional<BoardColumn> findByIdAndBoardId(UUID id, UUID boardId);
    void deleteByBoardId(UUID boardId);
}
