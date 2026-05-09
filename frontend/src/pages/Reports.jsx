import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Check } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import WorkflowTimeline from '../components/WorkflowTimeline';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ subject: '', subjectCode: '', topic: '', hours: '' });
  const [expandedId, setExpandedId] = useState(null);
  
  const [assignedLectures, setAssignedLectures] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/reports/activity');
      setReports(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    if (user.role === 'PoP' || user.role === 'AssistantPoP') {
      fetchAssignedLectures();
    }
  }, [user.role]);

  const fetchAssignedLectures = async () => {
    try {
      const res = await axios.get('/lectures');
      // For auto fill, we might want lectures that aren't fully completed, or just all of them.
      setAssignedLectures(res.data);
    } catch (error) {
      console.error('Failed to fetch assigned lectures', error);
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await axios.get('/reports/activity/pdf', {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Activity_Reports.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error downloading PDF');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/reports/activity', { ...formData, hours: Number(formData.hours) });
      setShowModal(false);
      setFormData({ subject: '', subjectCode: '', topic: '', hours: '' });
      fetchReports();
    } catch (error) {
      alert('Error submitting report');
    }
  };

  const handleLectureSelect = (e) => {
    const lectureId = e.target.value;
    if (!lectureId) {
      setFormData({ subject: '', subjectCode: '', topic: '', hours: '' });
      return;
    }
    const lecture = assignedLectures.find(l => l._id === lectureId);
    if (lecture) {
      setFormData({
        ...formData,
        subject: lecture.subject,
        topic: lecture.topic,
        subjectCode: lecture.subjectCode || ''
      });
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/reports/activity/${id}/status`, { status });
      fetchReports();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating status');
    }
  };

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Activity Reports</h1>
          <p className="text-gray-500">Submit and track your teaching activities.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={downloadPDF}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center font-semibold transition-colors"
          >
            Download PDF
          </button>
          {(user.role === 'PoP' || user.role === 'AssistantPoP') && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center font-semibold transition-colors"
            >
              <Plus size={18} className="mr-2" /> Submit Report
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="py-4 px-6 font-semibold w-16">Sr No</th>
              <th className="py-4 px-6 font-semibold">PoP</th>
              <th className="py-4 px-6 font-semibold">Subject</th>
              <th className="py-4 px-6 font-semibold">Subject Code</th>
              <th className="py-4 px-6 font-semibold">Topic</th>
              <th className="py-4 px-6 font-semibold text-center w-24">Hours</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold text-right">Details</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr><td colSpan="6" className="py-8 text-center text-gray-400 font-medium">No Data Available</td></tr>
            ) : reports.map((report, idx) => (
              <React.Fragment key={report._id}>
                <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-500">{idx + 1}</td>
                  <td className="py-4 px-6 font-medium text-gray-900">{report.pop_id?.name || 'N/A'}</td>
                  <td className="py-4 px-6 font-medium text-gray-900">{report.subject}</td>
                  <td className="py-4 px-6 font-medium text-gray-900">{report.subjectCode || 'N/A'}</td>
                  <td className="py-4 px-6 text-gray-600">{report.topic}</td>
                  <td className="py-4 px-6 text-gray-700 font-bold text-center">{report.hours}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => setExpandedId(expandedId === report._id ? null : report._id)}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {expandedId === report._id ? 'Hide' : 'View Workflow'}
                    </button>
                  </td>
                </tr>
                {expandedId === report._id && (
                  <tr className="bg-indigo-50/30">
                    <td colSpan="6" className="p-6">
                      <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm animate-in zoom-in-95 duration-200">
                        <div className="flex-1">
                          <WorkflowTimeline currentStatus={report.status} type="report" />
                        </div>
                        <div className="w-full md:w-64 space-y-3 flex flex-col justify-center">
                          {(user.role === 'FacultyCoordinator' || user.role === 'Admin') && report.status === 'SUBMITTED' && (
                            <button onClick={() => updateStatus(report._id, 'FACULTY_VERIFIED')} className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-xl text-sm font-bold shadow-sm"><Check size={16} className="mr-2"/> Verify Report</button>
                          )}
                          {(user.role === 'HOD' || user.role === 'Admin') && report.status === 'FACULTY_VERIFIED' && (
                            <button onClick={() => updateStatus(report._id, 'HOD_APPROVED')} className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm font-bold shadow-sm"><Check size={16} className="mr-2"/> HOD Approve</button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Submit Report</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Lecture (Auto-fill)</label>
                <select className="w-full px-3 py-2 border rounded-xl bg-gray-50" onChange={handleLectureSelect} defaultValue="">
                  <option value="">-- Custom Entry --</option>
                  {assignedLectures.map(l => (
                    <option key={l._id} value={l._id}>{l.subject} - {l.topic}</option>
                  ))}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Subject</label><input type="text" required className="w-full px-3 py-2 border rounded-xl" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label><input type="text" required className="w-full px-3 py-2 border rounded-xl" value={formData.subjectCode} onChange={e => setFormData({...formData, subjectCode: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Topic</label><input type="text" required className="w-full px-3 py-2 border rounded-xl" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Hours</label><input type="number" step="0.5" required className="w-full px-3 py-2 border rounded-xl" value={formData.hours} onChange={e => setFormData({...formData, hours: e.target.value})} /></div>
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

export default Reports;
