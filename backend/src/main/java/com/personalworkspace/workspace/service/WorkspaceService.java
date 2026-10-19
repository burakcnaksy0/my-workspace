package com.personalworkspace.workspace.service;

import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.workspace.dto.WorkspaceDto;
import com.personalworkspace.workspace.entity.Membership;
import com.personalworkspace.workspace.entity.Workspace;
import com.personalworkspace.workspace.repository.MembershipRepository;
import com.personalworkspace.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final MembershipRepository membershipRepository;
    private final WorkspaceAccessService accessService;

    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            MembershipRepository membershipRepository,
            WorkspaceAccessService accessService) {
        this.workspaceRepository = workspaceRepository;
        this.membershipRepository = membershipRepository;
        this.accessService = accessService;
    }

    @Transactional(readOnly = true)
    public List<WorkspaceDto> getUserWorkspaces(UUID userId) {
        List<Membership> memberships = membershipRepository.findByUserId(userId);
        return memberships.stream().map(m -> {
            Workspace w = workspaceRepository.findById(m.getWorkspaceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Çalışma alanı bulunamadı"));
            return new WorkspaceDto(
                    w.getId(),
                    w.getName(),
                    w.getOwnerId(),
                    w.getSettings(),
                    m.getRole(),
                    w.getCreatedAt()
            );
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkspaceDto getWorkspace(UUID workspaceId, UUID userId) {
        Membership membership = accessService.checkWorkspaceAccess(workspaceId, userId);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Çalışma alanı bulunamadı"));
        return new WorkspaceDto(
                workspace.getId(),
                workspace.getName(),
                workspace.getOwnerId(),
                workspace.getSettings(),
                membership.getRole(),
                workspace.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public WorkspaceDto getDefaultWorkspaceForUser(UUID userId) {
        List<WorkspaceDto> workspaces = getUserWorkspaces(userId);
        if (workspaces.isEmpty()) {
            throw new ResourceNotFoundException("Kullanıcıya ait aktif bir çalışma alanı bulunamadı");
        }
        return workspaces.get(0);
    }

    public WorkspaceDto createWorkspace(String name, UUID userId) {
        Workspace workspace = new Workspace(name, userId);
        workspace = workspaceRepository.save(workspace);

        Membership membership = new Membership(workspace.getId(), userId, "OWNER");
        membershipRepository.save(membership);

        return new WorkspaceDto(
                workspace.getId(),
                workspace.getName(),
                workspace.getOwnerId(),
                workspace.getSettings(),
                membership.getRole(),
                workspace.getCreatedAt()
        );
    }
}
