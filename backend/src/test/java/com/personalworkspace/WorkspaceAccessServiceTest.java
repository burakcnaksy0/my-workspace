package com.personalworkspace;

import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.workspace.entity.Membership;
import com.personalworkspace.workspace.repository.MembershipRepository;
import com.personalworkspace.workspace.service.WorkspaceAccessService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class WorkspaceAccessServiceTest {

    private final MembershipRepository membershipRepository = mock(MembershipRepository.class);
    private final WorkspaceAccessService accessService = new WorkspaceAccessService(membershipRepository);

    @Test
    @DisplayName("checkWorkspaceAccess should return Membership when user is a member")
    void checkWorkspaceAccess_AuthorizedUser_ReturnsMembership() {
        UUID workspaceId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Membership membership = new Membership(workspaceId, userId, "OWNER");

        when(membershipRepository.findByWorkspaceIdAndUserId(workspaceId, userId))
                .thenReturn(Optional.of(membership));

        Membership result = accessService.checkWorkspaceAccess(workspaceId, userId);
        assertNotNull(result);
        assertEquals(workspaceId, result.getWorkspaceId());
        assertEquals(userId, result.getUserId());
    }

    @Test
    @DisplayName("checkWorkspaceAccess should throw ResourceNotFoundException (404) for isolation when user has no access")
    void checkWorkspaceAccess_UnauthorizedUser_ThrowsResourceNotFoundException() {
        UUID workspaceId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(membershipRepository.findByWorkspaceIdAndUserId(workspaceId, userId))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                accessService.checkWorkspaceAccess(workspaceId, userId)
        );
    }
}
