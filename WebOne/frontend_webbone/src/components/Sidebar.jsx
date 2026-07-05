import React from 'react';
import { logout } from '../utils/auth';
import { Link, useLocation } from 'react-router-dom';
import useProfile from '../hooks/useProfile';
import SkeletonBlock from './SkeletonBlock.jsx';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ) },
  { to: '/files', label: 'Project', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
    </svg>
  ) },
  { to: '/visualizer', label: 'Visualizer', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 13v4M11 9v8M15 5v12M19 11v6" />
    </svg>
  ) },
  { to: '/railprofile', label: 'RailProfile', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ) },
  { to: '/tgm', label: 'TGM', icon: (
    <span className="font-bold text-xs select-none bg-slate-100 px-1 py-0.5 rounded border border-slate-200">TGM</span>
  ) },
  { to: '/general-configuration', label: 'Configuration', icon: (
    <span className="font-bold text-xs select-none bg-slate-100 px-1 py-0.5 rounded border border-slate-200">CFG</span>
  ) },
  { to: '/maintenance', label: 'Maintenance', icon: (
    <span className="font-bold text-xs select-none bg-slate-100 px-1 py-0.5 rounded border border-slate-200">MNT</span>
  ) },
];

const Sidebar = ({ collapsed: collapsedProp = false, setCollapsed: setCollapsedProp = () => {} }) => {
  const { profile, loading } = useProfile();
  const location = useLocation();
  const collapsed = collapsedProp;
  const setCollapsed = setCollapsedProp;
  // show skeletons while profile is loading for a smoother UX
  // (Sidebar will still render collapsed toggle etc once loaded)
  const role = profile?.role.toLowerCase();

  const initials = (profile && profile.name) ? profile.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : '';

  return (
    <div className={`flex flex-col md:sticky md:top-0 md:h-screen md:overflow-y-auto px-4 py-6 bg-white text-slate-800 shadow-md transition-all duration-200 w-full ${collapsed ? 'md:w-16' : 'md:w-64'}`}>
      <div className="mb-8 flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          {loading ? (
            <SkeletonBlock className={`h-6 ${collapsed ? 'w-8' : 'w-28'}`} />
          ) : (
            <span className={`text-xl font-bold text-blue-600 select-none transition-all duration-200 ${collapsed ? 'opacity-0 max-w-0 overflow-hidden' : 'opacity-100'}`}>RailPulse</span>
          )}
        </div>
        <button aria-expanded={!collapsed} onClick={() => setCollapsed(c => !c)} className="p-1 rounded hover:bg-slate-100">
          <svg className={`w-5 h-5 transform transition-transform duration-200 ${collapsed ? '-rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1">
          {loading ? (
            // skeleton nav: icons + text bars
            Array.from({ length: navLinks.length }).map((_, i) => (
              <li key={i}>
                <div className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg`}>
                  <div className="flex-shrink-0">
                    <SkeletonBlock className="w-5 h-5 rounded-full" />
                  </div>
                  {!collapsed && <SkeletonBlock className="ml-3 h-4 w-28" />}
                </div>
              </li>
            ))
          ) : (
            navLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  aria-label={link.label}
                  className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg transition-colors font-medium text-sm hover:bg-blue-50 hover:text-blue-700 ${location.pathname.startsWith(link.to) ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}`}
                >
                  <span className={`${collapsed ? '' : 'mr-2'} flex-shrink-0`}>{link.icon}</span>
                  <span className={`transition-all duration-200 ${collapsed ? 'opacity-0 max-w-0 overflow-hidden' : 'opacity-100 ml-1'}`}>{link.label}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </nav>
      
      {/* Spacer to push admin section and profile to bottom */}
      <div className="flex-1"></div>
      {/* Admin Settings Menu - Placed at bottom */}
      {(role === 'admin' || role === 'superadmin') && (
        <div className="mt-auto mb-6">
          <div className={`mb-2 text-xs uppercase tracking-wider text-blue-600 font-semibold transition-opacity duration-200 ${collapsed ? 'opacity-0 max-w-0 overflow-hidden' : 'opacity-100'}`}>Admin settings</div>
          <ul className="space-y-1">
            <li>
              <Link to="/admin/users" className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg transition-colors font-medium text-sm hover:bg-blue-50 hover:text-blue-700 ${location.pathname.startsWith('/admin/users') ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}`}>
                <span className={`${collapsed ? '' : 'mr-2'} flex-shrink-0`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                <span className={`${collapsed ? 'opacity-0 max-w-0 overflow-hidden' : ''}`}>Users</span>
              </Link>
            </li>
            {role === 'superadmin' && (
              <>
                <li>
                  <Link to="/admin/clients" className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg transition-colors font-medium text-sm hover:bg-blue-50 hover:text-blue-700 ${location.pathname.startsWith('/admin/clients') ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}`}>
                    <span className={`${collapsed ? '' : 'mr-2'} flex-shrink-0`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </span>
                    <span className={`${collapsed ? 'opacity-0 max-w-0 overflow-hidden' : ''}`}>Aziende</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/settings" className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg transition-colors font-medium text-sm hover:bg-blue-50 hover:text-blue-700 ${location.pathname.startsWith('/admin/settings') ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}`}>
                    <span className={`${collapsed ? '' : 'mr-2'} flex-shrink-0`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-1a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <span className={`${collapsed ? 'opacity-0 max-w-0 overflow-hidden' : ''}`}>Settings</span>
                  </Link>
                </li>
                <li>
                </li>
              </>
            )}
          </ul>
        </div>
      )}

      <div className="pt-6 border-t border-slate-200">
        {loading ? (
          <div className="mb-3 flex items-center justify-between">
            {collapsed ? (
              <div className="mx-auto">
                <SkeletonBlock className="w-10 h-10 rounded-full" />
              </div>
            ) : (
              <div className="w-full">
                <SkeletonBlock className="h-5 w-36 mb-2" />
                <SkeletonBlock className="h-3 w-40" />
              </div>
            )}
          </div>
        ) : (!loading && profile ? (
          <div className="mb-3 flex items-center justify-between">
            {collapsed ? (
              <div className="mx-auto">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">{initials}</div>
              </div>
            ) : (
              <div>
                <div className={`font-semibold text-slate-800 transition-opacity duration-200`}>{profile.name}</div>
                <div className={`text-xs text-slate-500 transition-opacity duration-200`}>{profile.email}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500">Loading...</div>
        ))}
        <button
          className={`w-full py-2 mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center justify-center shadow-sm`}
          onClick={logout}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className={`ml-0 transition-all duration-200 ${collapsed ? 'opacity-0 max-w-0 overflow-hidden' : 'ml-2 opacity-100'}`}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
