package com.personalworkspace.workspace.service;

import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.workspace.dto.AreaDto;
import com.personalworkspace.workspace.dto.CreateAreaRequest;
import com.personalworkspace.workspace.dto.UpdateAreaRequest;
import com.personalworkspace.workspace.entity.Area;
import com.personalworkspace.workspace.repository.AreaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AreaService {

    private final AreaRepository areaRepository;
    private final WorkspaceAccessService accessService;

    public AreaService(AreaRepository areaRepository, WorkspaceAccessService accessService) {
        this.areaRepository = areaRepository;
        this.accessService = accessService;
    }

    @Transactional(readOnly = true)
    public List<AreaDto> getAreas(UUID workspaceId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);
        return areaRepository.findByWorkspaceIdOrderBySortOrderAsc(workspaceId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public AreaDto createArea(UUID workspaceId, CreateAreaRequest request, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        int nextOrder = request.sortOrder() != null
                ? request.sortOrder()
                : areaRepository.findByWorkspaceIdOrderBySortOrderAsc(workspaceId).size();

        Area area = new Area(
                workspaceId,
                request.name().trim(),
                request.icon() != null ? request.icon().trim() : "folder",
                request.color() != null ? request.color().trim() : "#3b82f6",
                nextOrder
        );
        area.setDescription(request.description());

        area = areaRepository.save(area);
        return toDto(area);
    }

    public AreaDto updateArea(UUID workspaceId, UUID areaId, UpdateAreaRequest request, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        Area area = areaRepository.findByIdAndWorkspaceId(areaId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Alan bulunamadı: " + areaId));

        area.setName(request.name().trim());
        area.setDescription(request.description());
        if (request.icon() != null) area.setIcon(request.icon().trim());
        if (request.color() != null) area.setColor(request.color().trim());
        if (request.sortOrder() != null) area.setSortOrder(request.sortOrder());

        area = areaRepository.save(area);
        return toDto(area);
    }

    public void deleteArea(UUID workspaceId, UUID areaId, UUID userId) {
        accessService.checkWorkspaceAccess(workspaceId, userId);

        Area area = areaRepository.findByIdAndWorkspaceId(areaId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Alan bulunamadı: " + areaId));

        areaRepository.delete(area);
    }

    private AreaDto toDto(Area a) {
        return new AreaDto(
                a.getId(),
                a.getWorkspaceId(),
                a.getName(),
                a.getDescription(),
                a.getIcon(),
                a.getColor(),
                a.getSortOrder()
        );
    }
}
