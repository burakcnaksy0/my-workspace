package com.personalworkspace.workspace.service;

import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.workspace.entity.Membership;
import com.personalworkspace.workspace.repository.MembershipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class WorkspaceAccessService {

    private final MembershipRepository membershipRepository;

    public WorkspaceAccessService(MembershipRepository membershipRepository) {
        this.membershipRepository = membershipRepository;
    }

    /**
     * Verifies user has access to the workspace.
     * To prevent leaking existence of other users' workspaces, throws 404 ResourceNotFoundException
     * if the user is not a member.
     */
    public Membership checkWorkspaceAccess(UUID workspaceId, UUID userId) {
        return membershipRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Çalışma alanı bulunamadı: " + workspaceId));
    }

    public boolean hasAccess(UUID workspaceId, UUID userId) {
        return membershipRepository.existsByWorkspaceIdAndUserId(workspaceId, userId);
    }
}
