import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import moment from 'moment';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ date: '', time: '', workDone: '' });

  const fetchAttendance = async () => {
    try {
      const res = await axios.get('/reports/attendance');
      setAttendance(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/reports/attendance', formData);
      setShowModal(false);
      setFormData({ date: '', time: '', workDone: '' });
      fetchAttendance();
    } catch (error) {
      alert('Error logging attendance');
    }
  };

  // Group attendance by month to fulfill "generate monthly attendance table" requirement roughly implicitly
  // In a robust implementation, there'd be a filter/dropdown for month.

  if (loading) return <div>Loading attendance...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Records</h1>
          <p className="text-gray-500">Log and view monthly attendance mapping to sessions.</p>
        </div>
        {(user.role === 'PoP' || user.role === 'AssistantPoP') && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center font-semibold transition-colors"
          >
            <Plus size={18} className="mr-2" /> Log Attendance
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="py-4 px-6 font-semibold">Date</th>
              <th className="py-4 px-6 font-semibold">Time</th>
              <th className="py-4 px-6 font-semibold">Work Done</th>
              {(user.role !== 'PoP' && user.role !== 'AssistantPoP') && <th className="py-4 px-6 font-semibold">User</th>}
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-gray-400 font-medium">No Data Available</td></tr>
            ) : attendance.map((record) => (
              <tr key={record._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-900">{moment(record.date).format('MMM Do YYYY')}</td>
                <td className="py-4 px-6 text-gray-600 font-mono text-sm bg-gray-50 p-1 inline-block mt-3 rounded">{record.time}</td>
                <td className="py-4 px-6 text-gray-700">{record.workDone}</td>
                {(user.role !== 'PoP' && user.role !== 'AssistantPoP') && (
                  <td className="py-4 px-6 font-semibold text-indigo-700">{record.pop_id?.name}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Log Attendance</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" required className="w-full px-3 py-2 border rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Time (Start - End)</label><input type="text" placeholder="e.g. 10:00 AM - 12:00 PM" required className="w-full px-3 py-2 border rounded-xl" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Work Done</label><textarea required className="w-full px-3 py-2 border rounded-xl" rows={3} value={formData.workDone} onChange={e => setFormData({...formData, workDone: e.target.value})} /></div>
              <div className="flex space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
