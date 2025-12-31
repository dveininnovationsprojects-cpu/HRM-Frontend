import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import { Check, X, Filter, History, Search, User } from "lucide-react";

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [filterDept, setFilterDept] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const departments = ["Finance & Accounts", "Marketing", "IT", "Non-IT", "Operation", "others"];
  const leaveTypes = ["Sick Leave", "Casual Leave", "Emergency Leave", "Loss of Pay"];

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      // Backend api connect panni data eduka
      const response = await axios.get("http://localhost:5006/leaves");
      setLeaves(response.data);
    } catch (err) {
      console.error("Error fetching leaves", err);
    }
  };

  const handleAction = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5006/leaves/${id}`, { status: newStatus });
      alert(`Leave ${newStatus} Successfully!`);
      fetchLeaves(); // Refresh data
    } catch (err) {
      alert("Action failed!");
    }
  };

  // --- SORTING & FILTERING LOGIC ---
  const filteredLeaves = leaves.filter((leave) => {
    const matchesDept = filterDept === "All" || leave.department === filterDept;
    const matchesType = filterType === "All" || leave.type === filterType;
    const matchesSearch = leave.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesType && matchesSearch;
  });

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Admin Leave Control</h1>
            <p className="text-slate-500 text-sm italic">Approve or reject staff leave requests</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <Search size={18} className="ml-2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              className="outline-none bg-transparent text-sm p-2 w-48"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Sorting Filters Area */}
        <div className="flex gap-4 mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 flex-1">
            <Filter size={18} className="text-blue-600" />
            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Sort By:</span>
            
            <select 
              className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
              onChange={(e) => setFilterDept(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select 
              className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Leave Types</option>
              {leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-2 text-slate-400 px-4 border-l">
            <History size={18} />
            <span className="text-xs font-bold uppercase tracking-tighter">History Enabled</span>
          </div>
        </div>

        {/* Leave Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1e293b] text-white">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Employee & Dept</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Leave Details</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Dates & Duration</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-blue-50/30 transition-all">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><User size={20}/></div>
                      <div>
                        <p className="font-bold text-slate-800">{leave.name}</p>
                        <p className="text-[10px] font-black text-blue-500 uppercase">{leave.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-bold text-slate-700">{leave.type}</p>
                    <p className="text-[11px] text-slate-400 italic">"{leave.reason}"</p>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-slate-600">{leave.startDate} to {leave.endDate}</p>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">3 Days</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                      leave.status === "Approved" ? "bg-green-50 text-green-600 border-green-100" :
                      leave.status === "Rejected" ? "bg-red-50 text-red-600 border-red-100" :
                      "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="p-6">
                    {leave.status === "Pending" ? (
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleAction(leave.id, "Approved")}
                          className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all"
                        >
                          <Check size={18}/>
                        </button>
                        <button 
                          onClick={() => handleAction(leave.id, "Rejected")}
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                        >
                          <X size={18}/>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-[10px] font-black text-slate-300 uppercase italic">Decision Made</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeaves.length === 0 && (
            <div className="p-20 text-center text-slate-400 italic font-bold">No leave applications found for this filter.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LeaveManagement;