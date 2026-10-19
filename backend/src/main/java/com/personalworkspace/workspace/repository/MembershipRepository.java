package com.personalworkspace.workspace.repository;

import com.personalworkspace.workspace.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, UUID> {
    List<Membership> findByUserId(UUID userId);
    Optional<Membership> findByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
    boolean existsByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
}
