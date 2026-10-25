package com.personalworkspace.boards.repository;

import com.personalworkspace.boards.entity.BoardItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BoardItemRepository extends JpaRepository<BoardItem, UUID> {
    List<BoardItem> findByBoardIdOrderBySortOrderAsc(UUID boardId);
    Optional<BoardItem> findByIdAndBoardId(UUID id, UUID boardId);
    Optional<BoardItem> findByBoardIdAndItemTypeAndItemId(UUID boardId, String itemType, UUID itemId);
    List<BoardItem> findByColumnId(UUID columnId);
    void deleteByBoardId(UUID boardId);

    @Modifying
    @Query("DELETE FROM BoardItem bi WHERE bi.itemType = :itemType AND bi.itemId = :itemId")
    void deleteByItemTypeAndItemId(@Param("itemType") String itemType, @Param("itemId") UUID itemId);
}
