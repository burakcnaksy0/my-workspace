import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, LoginRequest } from '../types/auth';
import { Workspace, Area, CreateAreaRequest } from '../types/workspace';
import { apiRequest } from '../lib/api';

interface AuthContextType {
  user: AuthUser | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  areas: Area[];
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  setActiveWorkspace: (workspace: Workspace) => void;
  refreshAreas: () => Promise<void>;
  createArea: (areaData: CreateAreaRequest) => Promise<Area>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user details on initial mount
  const checkAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await apiRequest<AuthUser>('/api/auth/me');
      setUser(userData);
      await loadWorkspacesAndAreas(userData);
    } catch {
      // User is not authenticated yet
      setUser(null);
      setWorkspaces([]);
      setActiveWorkspace(null);
      setAreas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkspacesAndAreas = async (currentUser: AuthUser) => {
    try {
      const wsList = await apiRequest<Workspace[]>('/api/workspaces');
      setWorkspaces(wsList);

      let currentWs: Workspace | null = null;
      if (currentUser.defaultWorkspaceId) {
        currentWs = wsList.find((w) => w.id === currentUser.defaultWorkspaceId) || null;
      }
      if (!currentWs && wsList.length > 0) {
        currentWs = wsList[0];
      }
      setActiveWorkspace(currentWs);

      if (currentWs) {
        const areaList = await apiRequest<Area[]>(`/api/workspaces/${currentWs.id}/areas`);
        setAreas(areaList);
      }
    } catch (err: unknown) {
      console.error('Workspaces load error:', err);
    }
  };

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await apiRequest<AuthUser>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      setUser(userData);
      await loadWorkspacesAndAreas(userData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Giriş yapılamadı';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore error on logout
    } finally {
      setUser(null);
      setWorkspaces([]);
      setActiveWorkspace(null);
      setAreas([]);
    }
  };

  const refreshAreas = async () => {
    if (!activeWorkspace) return;
    try {
      const areaList = await apiRequest<Area[]>(`/api/workspaces/${activeWorkspace.id}/areas`);
      setAreas(areaList);
    } catch (err: unknown) {
      console.error('Error refreshing areas:', err);
    }
  };

  const createArea = async (areaData: CreateAreaRequest): Promise<Area> => {
    if (!activeWorkspace) throw new Error('Aktif çalışma alanı seçilmedi');
    const newArea = await apiRequest<Area>(`/api/workspaces/${activeWorkspace.id}/areas`, {
      method: 'POST',
      body: JSON.stringify(areaData),
    });
    setAreas((prev) => [...prev, newArea]);
    return newArea;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        activeWorkspace,
        areas,
        isLoading,
        error,
        login,
        logout,
        setActiveWorkspace,
        refreshAreas,
        createArea,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
