package com.personalworkspace;

import com.personalworkspace.common.config.SecurityConfig;
import com.personalworkspace.common.exception.GlobalExceptionHandler;
import com.personalworkspace.common.exception.ResourceNotFoundException;
import com.personalworkspace.identity.entity.User;
import com.personalworkspace.identity.service.CustomUserDetails;
import com.personalworkspace.task.controller.TaskController;
import com.personalworkspace.task.service.TaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HTTP katmanı sözleşmesi testleri: kimlik doğrulama, CSRF, @Valid zinciri,
 * ProblemDetail gövde biçimi ve endpoint seviyesinde workspace izolasyonu (404).
 * Service katmanı mock'lanir; asis is mantigi service testlerinde kapsanmistir.
 */
@WebMvcTest(TaskController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class TaskControllerSecurityTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private TaskService taskService;

    private final UUID workspaceId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();
    private final UUID taskId = UUID.randomUUID();

    private Authentication userAuth() {
        User user = new User();
        user.setId(userId);
        user.setUsername("testuser");
        user.setPasswordHash("{noop}irrelevant");
        user.setStatus("ACTIVE");
        CustomUserDetails details = new CustomUserDetails(user);
        return new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
    }

    @Test
    @DisplayName("Kimlik doğrulaması olmayan istek 401 almalı, servise ulaşmamalı")
    void unauthenticated_requests_get401() throws Exception {
        mvc.perform(get("/api/workspaces/{ws}/tasks", workspaceId))
                .andExpect(status().isUnauthorized());

        verify(taskService, never())
                .getTasks(any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Oturumla liste ucu 200 döner")
    void authenticated_list_returns200() throws Exception {
        when(taskService.getTasks(eq(workspaceId), eq(userId), any(), any(), any(), any()))
                .thenReturn(Page.empty());

        mvc.perform(get("/api/workspaces/{ws}/tasks", workspaceId)
                        .with(authentication(userAuth())))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("CSRF token'ı olmayan mutating istek reddedilmeli")
    void mutating_withoutCsrf_isRejected() throws Exception {
        mvc.perform(post("/api/workspaces/{ws}/tasks", workspaceId)
                        .with(authentication(userAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"test\"}"))
                .andExpect(status().isForbidden());

        verify(taskService, never()).createTask(any(), any(), any());
    }

    @Test
    @DisplayName("Geçerli CSRF + geçerli gövde 201 döner")
    void create_withCsrf_returns201() throws Exception {
        when(taskService.createTask(eq(workspaceId), any(), eq(userId))).thenReturn(null);

        mvc.perform(post("/api/workspaces/{ws}/tasks", workspaceId)
                        .with(authentication(userAuth()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"gecerli gorev\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Boş başlık 422 + alan hatası üretmeli (@Valid zinciri canlıda)")
    void create_blankTitle_returns422() throws Exception {
        mvc.perform(post("/api/workspaces/{ws}/tasks", workspaceId)
                        .with(authentication(userAuth()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors.title").exists());

        verify(taskService, never()).createTask(any(), any(), any());
    }

    @Test
    @DisplayName("Geçersiz durum değeri (URGENT) PATCH'te 422 üretmeli")
    void status_invalidEnum_returns422() throws Exception {
        mvc.perform(patch("/api/workspaces/{ws}/tasks/{id}/status", workspaceId, taskId)
                        .with(authentication(userAuth()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"URGENT\",\"version\":0}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors.status").exists());
    }

    @Test
    @DisplayName("Sürüm eksikse PATCH 422 üretmeli (optimistic-lock sözleşmesi)")
    void status_missingVersion_returns422() throws Exception {
        mvc.perform(patch("/api/workspaces/{ws}/tasks/{id}/status", workspaceId, taskId)
                        .with(authentication(userAuth()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DONE\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors.version").exists());
    }

    @Test
    @DisplayName("Workspace dışı/olmayan kaynak 404 ProblemDetail döner")
    void delete_unknownTask_returns404Problem() throws Exception {
        doThrow(new ResourceNotFoundException("Görev bulunamadı"))
                .when(taskService).deleteTask(workspaceId, taskId, userId);

        mvc.perform(delete("/api/workspaces/{ws}/tasks/{id}", workspaceId, taskId)
                        .with(authentication(userAuth()))
                        .with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Resource Not Found"))
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("Başarılı silme 204 döner")
    void delete_success_returns204() throws Exception {
        mvc.perform(delete("/api/workspaces/{ws}/tasks/{id}", workspaceId, taskId)
                        .with(authentication(userAuth()))
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
