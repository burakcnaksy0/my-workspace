import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch
beforeEach(() => {
  vi.resetAllMocks();
});

describe('App Component', () => {
  it('renders application title and initial layout', async () => {
    // Mock healthcheck response
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            status: 'UP',
            application: 'Personal Workspace Backend',
            version: '1.0.0',
            database: 'CONNECTED',
            databaseType: 'PostgreSQL 16',
          }),
      })
    ) as unknown as typeof fetch;

    render(<App />);

    expect(screen.getByText('Personal Workspace')).toBeInTheDocument();
    expect(screen.getByText('Aşama 1 — Altyapı ve Servis Doğrulama')).toBeInTheDocument();
    expect(screen.getByText('Frontend UI')).toBeInTheDocument();
    expect(screen.getByText('Backend API')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Aşama 1 Altyapısı Başarıyla Doğrulandı:')).toBeInTheDocument();
    });
  });
});
