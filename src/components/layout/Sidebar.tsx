import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Building2,
  CheckSquare,
  ShieldCheck,
  CalendarCheck,
  Bot,
  BookOpen,
  BarChart3,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'AICTE Official Portal', to: '/official', icon: ShieldCheck, badge: 'Official' },
    { name: 'AICTE Courses', to: '/courses', icon: GraduationCap, badge: 'Catalog' },
    { name: 'Guidelines & Norms', to: '/guidelines', icon: BookOpen, badge: 'APH 26-27' },
    { name: 'Applications', to: '/applications', icon: FileText },
    { name: 'Document Scrutiny', to: '/scrutiny', icon: CheckSquare },
    { name: 'Institutions', to: '/institutions', icon: Building2 },
    { name: 'Compliance Monitor', to: '/compliance', icon: ShieldCheck },
    { name: 'Expert Visits (EVC)', to: '/evc', icon: CalendarCheck },
    { name: 'AI Agent Center', to: '/agents', icon: Bot, badge: '5 Agents' },
    { name: 'RAG Knowledge', to: '/knowledge', icon: Sparkles },
    { name: 'Reports & Analytics', to: '/reports', icon: BarChart3 },
    { name: 'Audit Trail', to: '/audit', icon: History },
    { name: 'Settings & SLA', to: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0b1329] text-slate-300 transition-all duration-200 border-r border-slate-800/80 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 bg-[#090f20]">
        {!collapsed ? (
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold shadow-md shadow-blue-500/20">
              RF
            </div>
            <div className="leading-tight truncate">
              <span className="font-semibold text-white tracking-tight text-base block">RegulaFlow AI</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">AICTE Workflow · SIH26262</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-sm shadow-md">
            RF
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/60 transition-colors hidden md:block"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/90 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon size={19} className="shrink-0" />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User / Portal Indicator */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090f20]/60">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
              {user?.name?.slice(0, 2).toUpperCase() || 'RF'}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Authorized Officer'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.role?.replace(/_/g, ' ') || 'OFFICER'}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
              {user?.role?.slice(0, 2).toUpperCase() || 'RF'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
