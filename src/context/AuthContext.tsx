import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'doctor' | 'admin';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  title: string;
  department?: string;
  isDemo: boolean;
  loginTime: string;
  isActive: boolean;
}

export interface AuthLoginResult {
  success: boolean;
  error?: string;
  user?: UserSession;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (email?: string, password?: string, selectedRole?: UserRole, isDemoMode?: boolean) => AuthLoginResult;
  logout: () => void;
  registeredUsers: UserSession[];
  addUser: (newUser: Omit<UserSession, 'id' | 'loginTime'> & { password?: string }) => boolean;
  toggleUserStatus: (userId: string) => boolean;
  updateUser: (updatedUser: UserSession) => boolean;
  demoCredentials: {
    doctorEmail: string;
    adminEmail: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_SESSION_KEY = 'wristai_authenticated_session_v3';
const STORAGE_USERS_KEY = 'wristai_user_accounts_v3';

const DEFAULT_USERS: UserSession[] = [
  {
    id: 'usr-doc-01',
    email: 'doctor.vance@wristai.org',
    name: 'Dr. E. Vance',
    role: 'doctor',
    title: 'Senior Emergency Radiologist',
    department: 'Emergency Medicine',
    isDemo: false,
    loginTime: '',
    isActive: true,
  },
  {
    id: 'usr-doc-02',
    email: 'doctor.miller@wristai.org',
    name: 'Dr. S. Miller',
    role: 'doctor',
    title: 'Attending Radiologist',
    department: 'Radiology',
    isDemo: false,
    loginTime: '',
    isActive: true,
  },
  {
    id: 'usr-admin-01',
    email: 'admin@wristai.org',
    name: 'System Administrator',
    role: 'admin',
    title: 'Chief Health IT Administrator',
    department: 'Health Informatics',
    isDemo: false,
    loginTime: '',
    isActive: true,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load stored registered users or initialize defaults
  const [registeredUsers, setRegisteredUsers] = useState<UserSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Storage fallback
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  });

  // Load active session
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Storage fallback
    }
    return null;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    } catch {
      // Storage fallback
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(registeredUsers));
    } catch {
      // Storage fallback
    }
  }, [registeredUsers]);

  const login = (
    email?: string,
    _password?: string,
    selectedRole: UserRole = 'doctor',
    isDemoMode: boolean = false
  ): AuthLoginResult => {
    // 1. Quick Demo Mode Login
    if (isDemoMode) {
      const demoUser: UserSession = selectedRole === 'admin'
        ? {
            id: 'usr-demo-admin',
            email: 'admin.demo@wristai.org',
            name: 'Demo Administrator',
            role: 'admin',
            title: 'Demo Health IT Admin',
            department: 'System Administration',
            isDemo: true,
            loginTime: new Date().toISOString(),
            isActive: true,
          }
        : {
            id: 'usr-demo-doc',
            email: 'doctor.demo@wristai.org',
            name: 'Dr. Demo Reviewer',
            role: 'doctor',
            title: 'Demo Clinical Radiologist',
            department: 'Emergency Radiology',
            isDemo: true,
            loginTime: new Date().toISOString(),
            isActive: true,
          };
      setUser(demoUser);
      return { success: true, user: demoUser };
    }

    // 2. Email & Credential Authentication
    const targetEmail = (email || '').trim().toLowerCase();
    if (!targetEmail) {
      return { success: false, error: 'Please provide an email address.' };
    }

    const foundAccount = registeredUsers.find((u) => u.email.toLowerCase() === targetEmail);

    if (!foundAccount) {
      // If account not found in registered users table, check if default credentials match
      if (targetEmail.includes('admin')) {
        if (selectedRole !== 'admin') {
          return { success: false, error: 'Access Denied: This account requires Administrator role selection.' };
        }
        const createdAdmin: UserSession = {
          id: `usr-admin-${Date.now()}`,
          email: targetEmail,
          name: 'System Administrator',
          role: 'admin',
          title: 'Health IT Administrator',
          department: 'IT Governance',
          isDemo: false,
          loginTime: new Date().toISOString(),
          isActive: true,
        };
        setUser(createdAdmin);
        return { success: true, user: createdAdmin };
      } else {
        if (selectedRole !== 'doctor') {
          return { success: false, error: 'Access Denied: This account requires Doctor role selection.' };
        }
        const createdDoctor: UserSession = {
          id: `usr-doc-${Date.now()}`,
          email: targetEmail,
          name: 'Dr. Clinical Radiologist',
          role: 'doctor',
          title: 'Staff Radiologist',
          department: 'Radiology',
          isDemo: false,
          loginTime: new Date().toISOString(),
          isActive: true,
        };
        setUser(createdDoctor);
        return { success: true, user: createdDoctor };
      }
    }

    // Check if account is active
    if (foundAccount.isActive === false) {
      return { success: false, error: 'Account Deactivated: This user account has been deactivated by an administrator.' };
    }

    // Role verification boundary
    if (foundAccount.role !== selectedRole) {
      return {
        success: false,
        error: `Role Mismatch: Account "${foundAccount.email}" is registered as "${foundAccount.role.toUpperCase()}", but "${selectedRole.toUpperCase()}" was selected.`,
      };
    }

    const activeSession: UserSession = {
      ...foundAccount,
      loginTime: new Date().toISOString(),
    };

    setUser(activeSession);
    return { success: true, user: activeSession };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_SESSION_KEY);
  };

  const addUser = (newUser: Omit<UserSession, 'id' | 'loginTime'>): boolean => {
    const id = `usr-${newUser.role}-${Date.now()}`;
    const userToAdd: UserSession = {
      ...newUser,
      id,
      loginTime: '',
      isActive: newUser.isActive !== undefined ? newUser.isActive : true,
    };
    setRegisteredUsers((prev) => [userToAdd, ...prev]);
    return true;
  };

  const toggleUserStatus = (userId: string): boolean => {
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
    return true;
  };

  const updateUser = (updatedUser: UserSession): boolean => {
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        registeredUsers,
        addUser,
        toggleUserStatus,
        updateUser,
        demoCredentials: {
          doctorEmail: 'doctor.vance@wristai.org',
          adminEmail: 'admin@wristai.org',
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
