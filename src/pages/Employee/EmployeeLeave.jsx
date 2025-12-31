import React, { useState, useEffect } from "react";
import axios from "axios";
import { Send, Clock, CheckCircle, XCircle, Bell, Calendar } from "lucide-react";

const EmployeeLeave = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: "", startDate: "", endDate: "", reason: ""
  });

  const userId = localStorage.getItem("userId");
  const leaveTypes = ["Sick Leave", "Casual Leave", "Emergency Leave", "Loss of Pay"];

  // 1. Fetch Leave History for this specific employee
  const fetchLeaves = async () => {
    try {
      const response = await axios.get(`http://localhost:5006/leaves?employeeId=${userId}`);
      setLeaveHistory(response.data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchLeaves();
  }, [userId]);

  // 2. Submit Leave Request
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newLeave = {
      ...formData,
      employeeId: userId,
      employeeName: localStorage.getItem("userName"),
      status: "Pending",
      requestDate: new Date().toLocaleDateString()
    };

    try {
      await axios.post("http://localhost:5006/leaves", newLeave);
      alert("Leave Request Sent Successfully!");
      setShowForm(false);
      fetchLeaves(); // Refresh the table
    } catch (error) {
      alert("Failed to send request.");
    }
  };

  // Helper to count statuses
  const getCount = (status) => leaveHistory.filter(l => l.status === status).length;

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-slate-500 font-medium">Request time off and monitor approval status</p>
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Calendar size={20}/> Apply New Leave
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Clock size={28}/></div>
          <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending</p><p className="text-2xl font-black">{getCount("Pending")}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><CheckCircle size={28}/></div>
          <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Approved</p><p className="text-2xl font-black text-green-600">{getCount("Approved")}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><XCircle size={28}/></div>
          <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Rejected</p><p className="text-2xl font-black text-red-600">{getCount("Rejected")}</p></div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 font-bold text-slate-700 uppercase text-xs tracking-widest">
          Recent Requests
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Dates</th>
                <th className="px-8 py-5">Reason</th>
                <th className="px-8 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaveHistory.map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-800">{leave.type}</td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                    {leave.startDate} <span className="mx-1 text-slate-300">→</span> {leave.endDate}
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 italic max-w-xs truncate">{leave.reason}</td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        leave.status === "Approved" ? "bg-green-100 text-green-700" : 
                        leave.status === "Rejected" ? "bg-red-100 text-red-700" : 
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaveHistory.length === 0 && !loading && (
            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No leave history found</div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[999] p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 animate-in fade-in zoom-in duration-200">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Request Time Off</h2>
            <p className="text-slate-500 mb-8 font-medium">Fill in the details for your leave application</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Leave Category</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 transition-all appearance-none"
                  required
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input type="date" required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-700 focus:border-blue-500" onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                  <input type="date" required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-700 focus:border-blue-500" onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Leave</label>
                <textarea 
                  placeholder="Explain why you need this time off..." 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl outline-none min-h-[120px] font-medium text-slate-700 focus:border-blue-500" 
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="flex-[2] bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-xs">
                  <Send size={18}/> Send Request
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