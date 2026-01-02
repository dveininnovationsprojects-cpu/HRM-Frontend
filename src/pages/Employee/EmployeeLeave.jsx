import React, { useState, useEffect } from "react";
import axios from "axios";
import { Send, Clock, CheckCircle, XCircle, Calendar, Loader2 } from "lucide-react";

// 1. Axios Instance with CORS & Cookie Validation
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // Required for cookie-based session/CORS validation
});

const EmployeeLeave = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    leaveType: "", 
    startDate: "",
    endDate: "",
    reason: ""
  });

  const userId = localStorage.getItem("userId");
  const leaveTypes = ["SICK_LEAVE", "CASUAL_LEAVE", "EMERGENCY_LEAVE", "LOSS_OF_PAY"];

  // Headers including JWT if your backend uses both Token + Cookies
  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  // 2. Fetch Personal Leave History
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/leaves/my`, { headers: getHeaders() });
      setLeaveHistory(response.data);
    } catch (error) {
      console.error("Backend Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchLeaves();
  }, [userId]);

  // 3. Submit Leave Request
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const leavePayload = {
      ...formData,
      employeeId: parseInt(userId),
      status: "PENDING",
      requestDate: new Date().toISOString().split('T')[0]
    };

    try {
      await api.post(`/leaves/apply`, leavePayload, { headers: getHeaders() });
      alert("Application Sent Successfully!");
      setShowForm(false);
      fetchLeaves(); 
    } catch (error) {
      const errorMsg = error.response?.data?.message || "CORS/Validation Failed";
      alert(errorMsg);
    }
  };

  const getCount = (status) => leaveHistory.filter(l => l.status === status).length;

  if (loading && leaveHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">My Leave Portal</h1>
          <p className="text-slate-500 font-medium">Track and apply for your time-off requests</p>
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 uppercase text-xs tracking-widest"
        >
          <Calendar size={18}/> Request Leave
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Clock size={32}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending</p><p className="text-3xl font-black text-slate-800">{getCount("PENDING")}</p></div>
        </div>
        <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle size={32}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Approved</p><p className="text-3xl font-black text-emerald-600">{getCount("APPROVED")}</p></div>
        </div>
        <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><XCircle size={32}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rejected</p><p className="text-3xl font-black text-rose-600">{getCount("REJECTED")}</p></div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">
          Application History
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-10 py-6">Leave Type</th>
                <th className="px-10 py-6">Duration</th>
                <th className="px-10 py-6">Reason</th>
                <th className="px-10 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaveHistory.map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-10 py-7">
                    <span className="font-black text-slate-800 text-sm tracking-tight">{leave.leaveType?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-10 py-7 text-sm text-slate-500 font-bold uppercase tracking-tighter">
                    {leave.startDate} <span className="mx-2 text-slate-200">→</span> {leave.endDate}
                  </td>
                  <td className="px-10 py-7 text-sm text-slate-500 italic max-w-xs truncate font-medium">"{leave.reason}"</td>
                  <td className="px-10 py-7">
                    <div className="flex justify-center">
                      <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        leave.status === "APPROVED" ? "bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-50" : 
                        leave.status === "REJECTED" ? "bg-rose-100 text-rose-700 shadow-sm shadow-rose-50" : 
                        "bg-amber-100 text-amber-700 shadow-sm shadow-amber-50"
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaveHistory.length === 0 && (
            <div className="p-24 text-center">
              <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-xs">No Records Found</p>
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-6">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl p-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">New Request</h2>
            <p className="text-slate-500 mb-10 font-medium">Please provide details for your time-off application.</p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Category</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-black text-slate-700 transition-all appearance-none"
                  required
                  onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                >
                  <option value="">Choose Leave Type</option>
                  {leaveTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Start Date</label>
                  <input type="date" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl outline-none font-black text-slate-700 focus:border-indigo-500 focus:bg-white transition-all" onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">End Date</label>
                  <input type="date" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl outline-none font-black text-slate-700 focus:border-indigo-500 focus:bg-white transition-all" onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Reason</label>
                <textarea 
                  placeholder="Tell us why you need this leave..." 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] outline-none min-h-[140px] font-medium text-slate-700 focus:border-indigo-500 focus:bg-white transition-all" 
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="flex gap-6 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-5 font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest text-[10px]">Cancel</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-[10px]">
                  <Send size={18}/> Send Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeave;