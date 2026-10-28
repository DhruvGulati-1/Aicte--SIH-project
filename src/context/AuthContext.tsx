import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Quick demo role credentials mapping
export const DEMO_USERS: Record<UserRole, { email: string; pass: string; label: string; desc: string }> = {
  ADMIN: {
    email: 'admin@regulaflow.gov.in',
    pass: 'admin123',
    label: 'Dr. Rajiv Malhotra (Admin)',
    desc: 'Chief Technology Director, Approval Bureau'
  },
  COMPETENT_AUTHORITY: {
    email: 'ca@aicte-india.org',
    pass: 'ca123',
    label: 'Prof. Surendra Mohan (Competent Authority)',
    desc: 'Member Secretary & Executive Appellate Officer'
  },
  OFFICER: {
    email: 'officer.sharma@aicte-india.org',
    pass: 'officer123',
    label: 'Dr. Ananya Sharma (Scrutiny Officer)',
    desc: 'Senior Scrutiny Officer, Northern Regional Office'
  },
  INSTITUTION: {
    email: 'principal@iitdelhi.ac.in',
    pass: 'inst123',
    label: 'Prof. R. Venkatesh (Institution Dean)',
    desc: 'Delhi Institute of Engineering (ID: 1-10928374)'
  },
  EVC: {
    email: 'evaluator.rao@aicte-evc.org',
    pass: 'evc123',
    label: 'Dr. K. N. Rao (EVC Chairman)',
    desc: 'Chairperson, Expert Evaluation Committee'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('regulaflow_token');
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch {
          // If token expired, clear
          localStorage.removeItem('regulaflow_token');
        }
      } else {
        // Auto-login as INSTITUTION by default for immediate institution portal usability
        try {
          const res = await api.login({
            email: DEMO_USERS.INSTITUTION.email,
            password: DEMO_USERS.INSTITUTION.pass
          });
          localStorage.setItem('regulaflow_token', res.token);
          setUser(res.user);
        } catch {
          // ignore
        }
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('regulaflow_token', res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('regulaflow_token');
    setUser(null);
  };

  const switchRole = async (role: UserRole) => {
    const creds = DEMO_USERS[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
