package com.personalworkspace.boards.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BatchUpdateItemsRequest(
        @NotEmpty(message = "Güncellenecek öğe listesi boş olamaz")
        @Valid
        List<UpdateBoardItemPositionRequest> items
) {}
