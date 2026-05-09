import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Check, X, Play } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import WorkflowTimeline from '../components/WorkflowTimeline';
import moment from 'moment';

const Lectures = () => {
  const { user } = useContext(AuthContext);
  const [lectures, setLectures] = useState([]);
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ topic: '', subject: '', subjectCode: '', date: '', assigned_to: '' });
  const [expandedId, setExpandedId] = useState(null);

  const fetchLectures = async () => {
    try {
      const res = await axios.get('/lectures');
      setLectures(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoPs = async () => {
    if (user.role === 'FacultyCoordinator' || user.role === 'Admin') {
      try {
        const res = await axios.get('/users');
        setPops(res.data.filter(u => u.role === 'PoP' || u.role === 'AssistantPoP'));
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchLectures();
    fetchPoPs();
  }, [user]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/lectures', formData);
      setShowModal(false);
      setFormData({ topic: '', subject: '', subjectCode: '', date: '', assigned_to: '' });
      fetchLectures();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating lecture');
      console.error(error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/lectures/${id}/status`, { status });
      fetchLectures();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating status');
    }
  };

  if (loading) return <div>Loading lectures...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lectures</h1>
          <p className="text-gray-500">Manage lecture assignments and track statuses.</p>
        </div>
        {(user.role === 'FacultyCoordinator' || user.role === 'Admin') && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center font-semibold transition-colors"
          >
            <Plus size={18} className="mr-2" /> Assign Lecture
          </button>
        )}
      </div>

      <div className="space-y-4">
        {lectures.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 font-medium">No Data Available</div>
        ) : lectures.map(lecture => (
          <div key={lecture._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div 
              className="p-6 cursor-pointer flex justify-between items-center"
              onClick={() => setExpandedId(expandedId === lecture._id ? null : lecture._id)}
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900">{lecture.topic}</h3>
                <p className="text-sm text-gray-500">{lecture.subject} ({lecture.subjectCode}) • {moment(lecture.date).format('MMM Do YYYY')}</p>
                <div className="mt-2 text-sm font-medium text-gray-700">
                  Assigned to: <span className="text-indigo-600">{lecture.assigned_to?.name}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <StatusBadge status={lecture.status} />
              </div>
            </div>

            {expandedId === lecture._id && (
              <div className="border-t border-gray-100 bg-gray-50/50 p-6 flex flex-col md:flex-row gap-8 animate-in slide-in-from-top-2 duration-200">
                <div className="flex-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <WorkflowTimeline currentStatus={lecture.status} type="lecture" />
                </div>
                
                <div className="w-full md:w-64 space-y-3">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Available Actions</h4>
                  
                  {/* PoP Actions */}
                  {(user.role === 'PoP' || user.role === 'AssistantPoP' || user.role === 'Admin') && lecture.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(lecture._id, 'POP_APPROVED')} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"><Check size={16} className="mr-2"/> Accept Lecture</button>
                      <button onClick={() => updateStatus(lecture._id, 'POP_REJECTED')} className="w-full flex items-center justify-center bg-red-100 border border-red-200 hover:bg-red-200 text-red-700 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"><X size={16} className="mr-2"/> Reject Lecture</button>
                    </>
                  )}

                  {/* HOD Actions */}
                  {(user.role === 'HOD' || user.role === 'Admin') && lecture.status === 'POP_APPROVED' && (
                    <>
                      <button onClick={() => updateStatus(lecture._id, 'HOD_APPROVED')} className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"><Check size={16} className="mr-2"/> HOD Approve</button>
                      <button onClick={() => updateStatus(lecture._id, 'HOD_REJECTED')} className="w-full flex items-center justify-center bg-red-100 border border-red-200 hover:bg-red-200 text-red-700 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"><X size={16} className="mr-2"/> HOD Reject</button>
                    </>
                  )}

                  {/* Conducted marking */}
                  {(user.role === 'PoP' || user.role === 'AssistantPoP' || user.role === 'FacultyCoordinator' || user.role === 'Admin') && lecture.status === 'HOD_APPROVED' && (
                    <button onClick={() => updateStatus(lecture._id, 'CONDUCTED')} className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"><Play size={16} className="mr-2"/> Mark as Conducted</button>
                  )}

                  {/* No actions fallback */}
                  {((user.role === 'PoP' && lecture.status !== 'PENDING' && lecture.status !== 'HOD_APPROVED') ||
                    (user.role === 'HOD' && lecture.status !== 'POP_APPROVED') ||
                    (user.role === 'FacultyCoordinator' && lecture.status !== 'HOD_APPROVED' && lecture.status !== 'PENDING')) && (
                      <p className="text-xs text-gray-400 italic">No actions available at this stage for your role.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Assign Lecture</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Subject</label><input type="text" required className="w-full px-3 py-2 border rounded-xl" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label><input type="text" required className="w-full px-3 py-2 border rounded-xl" value={formData.subjectCode} onChange={e => setFormData({...formData, subjectCode: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Topic</label><input type="text" required className="w-full px-3 py-2 border rounded-xl" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" required className="w-full px-3 py-2 border rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (PoP)</label>
                <select required className="w-full px-3 py-2 border rounded-xl" value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})}>
                  <option value="" disabled>Select a User</option>
                  {pops.length === 0 ? (
                    <option value="" disabled>No PoP Data Available</option>
                  ) : (
                    pops.map(p => <option key={p._id} value={p._id}>{p.name} ({p.role})</option>)
                  )}
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

export default Lectures;
