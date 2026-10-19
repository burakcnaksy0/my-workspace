import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Phase 2 Auth & App Component', () => {
  it('renders LoginForm when user is unauthenticated', async () => {
    // Mock /api/auth/me to return 401
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ title: 'Unauthorized', status: 401 }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });
    }) as unknown as typeof fetch;

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Güvenli Oturum Girişi')).toBeInTheDocument();
      expect(screen.getByText('Personal Workspace')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument();
    });
  });

  it('renders Dashboard when login is successful', async () => {
    global.fetch = vi.fn().mockImplementation((url: string, options?: RequestInit) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({}),
        });
      }
      if (url.includes('/api/auth/login') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              id: 'user-1',
              username: 'admin',
              status: 'ACTIVE',
              defaultWorkspaceId: 'ws-1',
              defaultWorkspaceName: 'Kişisel Çalışma Alanım',
            }),
        });
      }
      if (url.includes('/api/workspaces/ws-1/dashboard')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              totalTasks: 5,
              todoTasks: 2,
              inProgressTasks: 1,
              doneTasks: 2,
              overdueCount: 0,
              overdueTasks: [],
              dueTodayTasks: [],
              recentlyCompletedTasks: [],
            }),
        });
      }
      if (url.includes('/api/workspaces/ws-1/areas')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve([
              { id: 'area-1', name: 'İş ve Kariyer', icon: 'briefcase', color: '#3b82f6', sortOrder: 0 },
              { id: 'area-2', name: 'Yazılım Öğrenimi', icon: 'code', color: '#8b5cf6', sortOrder: 1 },
            ]),
        });
      }
      if (url.includes('/api/workspaces')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve([
              {
                id: 'ws-1',
                name: 'Kişisel Çalışma Alanım',
                ownerId: 'user-1',
                role: 'OWNER',
                createdAt: new Date().toISOString(),
              },
            ]),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });
    }) as unknown as typeof fetch;

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Genel Bakış').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Kişisel Çalışma Alanım').length).toBeGreaterThan(0);
    });
  });
});
