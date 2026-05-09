import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Check, FileDown, IndianRupee, Eye, Printer } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import WorkflowTimeline from '../components/WorkflowTimeline';
import moment from 'moment';

const Honorariums = () => {
  const { user } = useContext(AuthContext);
  const [honorariums, setHonorariums] = useState([]);
  const [pops, setPops] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ pop_id: '', month: moment().format('YYYY-MM'), department: 'CSE' });
  const [expandedId, setExpandedId] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const [txDetails, setTxDetails] = useState('');

  const fetchHonorariums = async () => {
    try {
      const res = await axios.get('/honorariums');
      setHonorariums(res.data);
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
    fetchHonorariums();
    fetchPoPs();
  }, [user]);

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/honorariums/generate', formData);
      setShowModal(false);
      fetchHonorariums();
    } catch (error) {
      alert(error.response?.data?.message || 'Error generating honorarium');
    }
  };

  const updateStatus = async (id, status, details = null) => {
    try {
      await axios.put(`/honorariums/${id}/status`, { 
        status, 
        transactionDetails: details 
      });
      fetchHonorariums();
      setTxDetails('');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating status');
    }
  };

  const handlePreview = async (id) => {
    try {
      const res = await axios.get(`/honorariums/${id}/preview`);
      setPreviewHtml(res.data);
      setShowPreviewModal(true);
    } catch (error) {
      alert('Preview not available yet. Please ensure the honorarium is generated.');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(previewHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPdf = async (id, name, month) => {
    try {
      const response = await axios.get(`/honorariums/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Honorarium_${name}_${month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download PDF');
    }
  };

  if (loading) return <div>Loading honorariums...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Honorarium Management</h1>
          <p className="text-gray-500">Generate statements and track payments.</p>
        </div>
        {(user.role === 'FacultyCoordinator' || user.role === 'Admin') && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center font-semibold transition-colors"
          >
            <Plus size={18} className="mr-2" /> Generate Statement
          </button>
        )}
      </div>

      <div className="space-y-4">
        {honorariums.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 font-medium">No Data Available</div>
        ) : honorariums.map(hon => (
          <div key={hon._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div 
              className="p-6 cursor-pointer flex justify-between items-center"
              onClick={() => setExpandedId(expandedId === hon._id ? null : hon._id)}
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {moment(hon.month, 'YYYY-MM').format('MMMM YYYY')} Statement
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  {hon.pop_id?.name} • {hon.totalSessions} Sessions
                </p>
                <div className="mt-2 flex items-center text-emerald-600 font-bold text-lg">
                  <IndianRupee size={16} className="mr-1"/> {hon.amount}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <StatusBadge status={hon.status} />
              </div>
            </div>

            {expandedId === hon._id && (
              <div className="border-t border-gray-100 bg-gray-50/50 p-6 flex flex-col md:flex-row gap-8 animate-in slide-in-from-top-2 duration-200">
                <div className="flex-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <WorkflowTimeline currentStatus={hon.status} type="honorarium" />
                  
                  {hon.status === 'PAID' && (
                    <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm">
                      <p className="font-bold text-emerald-800">Payment Completed</p>
                      <p className="text-emerald-700 mt-1">Transaction Details: <span className="font-mono">{hon.transactionDetails}</span></p>
                    </div>
                  )}
                </div>
                
                <div className="w-full md:w-64 space-y-3">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Actions</h4>
                  
                  <button 
                    onClick={() => handlePreview(hon._id)}
                    className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-sm font-bold shadow-sm transition-colors mb-2"
                  >
                    <Eye size={16} className="mr-2"/> Preview
                  </button>
                  <button 
                    onClick={() => handleDownloadPdf(hon._id, hon.pop_id?.name, hon.month)}
                    className="w-full flex items-center justify-center bg-gray-900 hover:bg-black text-white py-2 rounded-xl text-sm font-bold shadow-sm transition-colors mb-4"
                  >
                    <FileDown size={16} className="mr-2"/> Download PDF
                  </button>

                  {/* FC Actions */}
                  {(user.role === 'FacultyCoordinator' || user.role === 'Admin') && hon.status === 'GENERATED' && (
                    <button onClick={() => updateStatus(hon._id, 'FACULTY_VERIFIED')} className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"><Check size={16} className="mr-2"/> FC Verify</button>
                  )}

                  {/* HOD Actions */}
                  {(user.role === 'HOD' || user.role === 'Admin') && hon.status === 'FACULTY_VERIFIED' && (
                    <button onClick={() => updateStatus(hon._id, 'HOD_APPROVED')} className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"><Check size={16} className="mr-2"/> HOD Approve</button>
                  )}

                  {/* Payment Actions (PoP explicitly marks as paid according to spec, optionally FC/Admin too) */}
                  {hon.status === 'HOD_APPROVED' && (user.role === 'PoP' || user.role === 'AssistantPoP' || user.role === 'Admin') && (
                    <div className="space-y-2 mt-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                      <label className="text-xs font-bold text-gray-700">Transaction Reference</label>
                      <input 
                        type="text" 
                        value={txDetails}
                        onChange={(e) => setTxDetails(e.target.value)}
                        placeholder="e.g. TXN123456789"
                        className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50"
                      />
                      <button 
                        onClick={() => updateStatus(hon._id, 'PAID', txDetails)} 
                        disabled={!txDetails.trim()}
                        className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-2 rounded-lg text-sm font-bold transition-colors mt-2"
                      >
                        <Check size={16} className="mr-2"/> Mark as Paid
                      </button>
                    </div>
                  )}

                  {((user.role === 'PoP' && hon.status !== 'HOD_APPROVED') ||
                    (user.role === 'HOD' && hon.status !== 'FACULTY_VERIFIED') ||
                    (user.role === 'FacultyCoordinator' && hon.status !== 'GENERATED')) && (
                      <p className="text-xs text-gray-400 italic text-center mt-4">No status actions available at this stage.</p>
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
            <h2 className="text-xl font-bold mb-4">Generate Honorarium</h2>
            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select PoP</label>
                <select required className="w-full px-3 py-2 border rounded-xl" value={formData.pop_id} onChange={e => setFormData({...formData, pop_id: e.target.value})}>
                  <option value="" disabled>Select a User</option>
                  {pops.length === 0 ? (
                    <option value="" disabled>No PoP Data Available</option>
                  ) : (
                    pops.map(p => <option key={p._id} value={p._id}>{p.name} ({p.role}) - Rate: {p.honorariumRate}</option>)
                  )}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Month (YYYY-MM)</label><input type="month" required className="w-full px-3 py-2 border rounded-xl" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label><input type="text" required className="w-full px-3 py-2 border rounded-xl" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} /></div>
              <div className="flex space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold">Honorarium Preview</h2>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center hover:bg-indigo-700"><Printer size={18} className="mr-2"/> Print</button>
                <button onClick={() => setShowPreviewModal(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300">Close</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-8 bg-gray-100 flex justify-center">
              <div className="bg-white p-10 shadow-lg w-full max-w-3xl" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Honorariums;
