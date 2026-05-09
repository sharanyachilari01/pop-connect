import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit } from 'lucide-react';

const Users = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'PoP', honorariumRate: '' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/users', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'PoP', honorariumRate: '' });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating user');
    }
  };

  const promoteDemote = async (id, newRole) => {
    try {
      await axios.put(`/users/${id}/role`, { role: newRole });
      fetchUsers(); // Automatically re-renders UI without manual reload!
    } catch (error) {
      alert('Failed to update role');
    }
  };

  const handleEditRate = async (id, currentRate) => {
    const newRate = prompt(`Enter new honorarium base rate (current: ${currentRate || 0}):`, currentRate || '');
    if (newRate !== null && newRate.trim() !== '') {
      try {
        await axios.put(`/users/${id}/rate`, { honorariumRate: Number(newRate) });
        fetchUsers(); // Automatically re-renders UI without manual reload!
      } catch (error) {
        alert('Failed to update rate');
      }
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500">Manage faculty, PoPs and coordinators.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center font-semibold transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="py-4 px-6 font-semibold">Name</th>
              <th className="py-4 px-6 font-semibold">Email</th>
              <th className="py-4 px-6 font-semibold">Role</th>
              <th className="py-4 px-6 font-semibold">Base Rate (₹)</th>
              <th className="py-4 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-gray-400">No users available.</td></tr>
            ) : users.map(user => (
              <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-900">{user.name}</td>
                <td className="py-4 px-6 text-gray-600">{user.email}</td>
                <td className="py-4 px-6">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold tracking-wide">
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-6 font-medium text-gray-700">
                  {user.honorariumRate || '-'}
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  {(user.role === 'PoP' || user.role === 'AssistantPoP') && (
                    <button 
                      onClick={() => handleEditRate(user._id, user.honorariumRate)} 
                      className="text-sm font-semibold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 transition-colors shadow-sm"
                    >
                      Edit Rate
                    </button>
                  )}
                  {user.role === 'AssistantPoP' && (
                    <button onClick={() => promoteDemote(user._id, 'PoP')} className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors">Promote to PoP</button>
                  )}
                  {user.role === 'PoP' && (
                    <button onClick={() => promoteDemote(user._id, 'AssistantPoP')} className="text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg shadow-sm transition-colors">Demote to Asst.PoP</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" required className="w-full px-3 py-2 border rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" required className="w-full px-3 py-2 border rounded-xl" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" required className="w-full px-3 py-2 border rounded-xl" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 border rounded-xl" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="PoP">PoP</option>
                  <option value="AssistantPoP">Assistant PoP</option>
                  <option value="FacultyCoordinator">Faculty Coordinator</option>
                  <option value="HOD">HOD</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
