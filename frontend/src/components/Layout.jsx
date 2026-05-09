import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  CalendarCheck, 
  CreditCard,
  LogOut,
  Building
} from 'lucide-react';
import clsx from 'clsx';

const SidebarLink = ({ to, icon: Icon, children }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => clsx(
      "flex items-center px-4 py-3 my-1 rounded-xl transition-all duration-200 font-medium",
      isActive 
        ? "bg-indigo-50 text-indigo-700 shadow-sm" 
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    )}
  >
    <Icon className="mr-3" size={20} />
    {children}
  </NavLink>
);

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar surface */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
        <div className="p-6 flex items-center">
          <div className="bg-indigo-600 p-2 rounded-lg text-white mr-3 shadow-md">
            <Building size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">POP CONNECT</h1>
            <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">{user.role}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <SidebarLink to="/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
          
          {(user.role === 'Admin' || user.role === 'FacultyCoordinator') && (
            <SidebarLink to="/users" icon={Users}>User Management</SidebarLink>
          )}
          
          <SidebarLink to="/lectures" icon={BookOpen}>Lectures</SidebarLink>
          
          <SidebarLink to="/reports" icon={FileText}>Activity Reports</SidebarLink>
          
          <SidebarLink to="/attendance" icon={CalendarCheck}>Attendance</SidebarLink>
          
          <SidebarLink to="/honorariums" icon={CreditCard}>Honorariums</SidebarLink>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-indigo-50/50 rounded-xl p-4 flex items-center justify-between mb-4">
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <LogOut size={16} className="mr-2" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 w-full h-64 bg-indigo-600/5 -z-10 rounded-b-[4rem]"></div>
        
        {/* Dynamic header could go here, but pages will define their own headers */}
        <div className="flex-1 overflow-y-auto p-8 relative z-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
