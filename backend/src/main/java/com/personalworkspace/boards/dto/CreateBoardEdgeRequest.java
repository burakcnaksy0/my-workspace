package com.personalworkspace.boards.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateBoardEdgeRequest(
        @NotNull(message = "Kaynak öğe ID zorunludur")
        UUID sourceItemId,

        @NotNull(message = "Hedef öğe ID zorunludur")
        UUID targetItemId,

        @Size(max = 255, message = "Bağlantı etiketi en fazla 255 karakter olabilir")
        String label
) {}
