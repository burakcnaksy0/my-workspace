package com.personalworkspace.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI personalWorkspaceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Personal Workspace REST API")
                        .description("Personal Workspace — Görev, Not, Çizim ve Çalışma Panosu Yönetim API Dokümantasyonu")
                        .version("1.0.0")
                        .license(new License().name("Proprietary").url("http://localhost:3000"))
                        .contact(new Contact().name("Personal Workspace Admin")));
    }
}
