import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Users, BookOpen, FileText, CreditCard, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-xl mr-4 ${colorClass}`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    users: 0,
    lectures: 0,
    reports: 0,
    honorariums: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [lecRes, repRes, honRes] = await Promise.all([
          axios.get('/lectures'),
          axios.get('/reports/activity'),
          axios.get('/honorariums')
        ]);
        
        let usersCount = 0;
        if (user.role === 'Admin' || user.role === 'FacultyCoordinator') {
          const uRes = await axios.get('/users');
          usersCount = uRes.data.length;
        }

        setStats({
          users: usersCount,
          lectures: lecRes.data.length,
          reports: repRes.data.length,
          honorariums: honRes.data.length
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, {user.name.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-2 font-medium">Here's what's happening with your academic management system today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(user.role === 'Admin' || user.role === 'FacultyCoordinator') && (
          <StatCard title="Total Users" value={stats.users} icon={Users} colorClass="bg-blue-50 text-blue-600" />
        )}
        <StatCard title="Lectures" value={stats.lectures} icon={BookOpen} colorClass="bg-indigo-50 text-indigo-600" />
        <StatCard title="Reports" value={stats.reports} icon={FileText} colorClass="bg-purple-50 text-purple-600" />
        <StatCard title="Honorariums" value={stats.honorariums} icon={CreditCard} colorClass="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
        <div className="flex items-center mb-6">
          <Activity className="text-indigo-600 mr-3" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Recent Activity Context</h2>
        </div>
        <p className="text-gray-600 leading-relaxed max-w-2xl">
          You are currently logged in as a <strong>{user.role}</strong>. Use the sidebar to navigate to your specific tasks mapping to your current real-time data constraints. All workflow paths are secured and mapped accurately to database models matching our strict state machine validation.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
