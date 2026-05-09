import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building, Send } from 'lucide-react';

const BankDetailsSetup = () => {
  const { user, setUser } = useContext(AuthContext);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [IFSC, setIFSC] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { bankName, accountNumber, IFSC };
      console.log('[FRONTEND BANK DETAILS] Submitting payload:', payload);
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      await axios.put('/users/me/bank-details', payload, config);
      
      alert('Bank Details saved successfully!');
      
      const updatedUser = { ...user, hasBankDetails: true }; // Allowing bypass locally so frontend redirect triggers
      setUser(updatedUser);
      localStorage.setItem('popconnect_user', JSON.stringify(updatedUser));
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit bank details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
            <Building size={32} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Welcome to POP CONNECT</h2>
        <p className="text-center text-gray-500 mb-8 font-medium">Please provide your bank details to complete setup.</p>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-semibold">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Name</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
              value={bankName} onChange={(e) => setBankName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Account Number</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
              value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">IFSC Code</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
              value={IFSC} onChange={(e) => setIFSC(e.target.value)}
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors mt-6"
          >
            {loading ? 'Submitting...' : <><Send size={18} className="mr-2" /> Complete Setup</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BankDetailsSetup;
