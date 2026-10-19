package com.personalworkspace.common.bootstrap;

import com.personalworkspace.identity.entity.User;
import com.personalworkspace.identity.repository.UserRepository;
import com.personalworkspace.workspace.entity.Area;
import com.personalworkspace.workspace.entity.Membership;
import com.personalworkspace.workspace.entity.Workspace;
import com.personalworkspace.workspace.repository.AreaRepository;
import com.personalworkspace.workspace.repository.MembershipRepository;
import com.personalworkspace.workspace.repository.WorkspaceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final MembershipRepository membershipRepository;
    private final AreaRepository areaRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin-username:admin}")
    private String adminUsername;

    @Value("${app.bootstrap.admin-password:}")
    private String adminPassword;

    @Value("${app.bootstrap.default-workspace:Kişisel Çalışma Alanım}")
    private String defaultWorkspaceName;

    public DataInitializer(
            UserRepository userRepository,
            WorkspaceRepository workspaceRepository,
            MembershipRepository membershipRepository,
            AreaRepository areaRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.membershipRepository = membershipRepository;
        this.areaRepository = areaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        long userCount = userRepository.count();
        if (userCount > 0) {
            log.info("Veritabanında mevcut kullanıcı(lar) bulundu (Adet: {}). Bootstrap atlanıyor.", userCount);
            return;
        }

        log.info("Veritabanı boş. İlk kurulum (Bootstrap) süreci başlatılıyor...");

        if (adminPassword == null || adminPassword.trim().isEmpty()) {
            throw new IllegalStateException(
                "BOOTSTRAP_ADMIN_PASSWORD ortam değişkeni tanımlanmamış! " +
                "Sistem güvenliği gereği varsayılan zayıf parola kabul edilmez. " +
                "Lütfen .env dosyasında güçlü bir BOOTSTRAP_ADMIN_PASSWORD belirleyin."
            );
        }

        // 1. Create Initial Admin User
        User adminUser = new User(adminUsername.trim(), passwordEncoder.encode(adminPassword.trim()));
        adminUser = userRepository.save(adminUser);
        log.info("Başlangıç kullanıcısı '{}' oluşturuldu.", adminUser.getUsername());

        // 2. Create Default Workspace
        Workspace workspace = new Workspace(defaultWorkspaceName.trim(), adminUser.getId());
        workspace = workspaceRepository.save(workspace);
        log.info("Varsayılan çalışma alanı '{}' oluşturuldu.", workspace.getName());

        // 3. Create Ownership Membership
        Membership membership = new Membership(workspace.getId(), adminUser.getId(), "OWNER");
        membershipRepository.save(membership);

        // 4. Create Initial Default Areas
        createDefaultAreas(workspace.getId());

        log.info("Bootstrap süreci başarıyla tamamlandı.");
    }

    private void createDefaultAreas(java.util.UUID workspaceId) {
        Area career = new Area(workspaceId, "İş ve Kariyer", "briefcase", "#3b82f6", 0);
        career.setDescription("Profesyonel hedefler, projeler ve kariyer planlaması");

        Area learning = new Area(workspaceId, "Yazılım Öğrenimi", "code", "#8b5cf6", 1);
        learning.setDescription("Teknoloji, mimari notlar ve kodlama pratikleri");

        Area sports = new Area(workspaceId, "Spor", "activity", "#10b981", 2);
        sports.setDescription("Antrenmanlar, beslenme ve fiziksel sağlık");

        Area personal = new Area(workspaceId, "Kişisel", "user", "#f59e0b", 3);
        personal.setDescription("Günlük alışkanlıklar, finans ve kişisel işler");

        areaRepository.save(career);
        areaRepository.save(learning);
        areaRepository.save(sports);
        areaRepository.save(personal);

        log.info("4 adet başlangıç alanı (İş ve Kariyer, Yazılım Öğrenimi, Spor, Kişisel) eklendi.");
    }
}
