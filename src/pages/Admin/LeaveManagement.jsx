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

  // API Config to match your AuthController (port 8080 and withCredentials)
  const api = axios.create({
    baseURL: "http://localhost:8080/api/leaves",
    withCredentials: true,
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      // Connecting to your LeaveController.java -> @GetMapping("/all")
      const response = await api.get("/all");
      setLeaves(response.data);
    } catch (err) {
      console.error("Error fetching leaves", err);
    }
  };

  const handleAction = async (id, action) => {
    try {
      // Connecting to your LeaveController.java -> @PostMapping("/approve/{id}") or /reject/{id}
      const endpoint = action === "Approved" ? `/approve/${id}` : `/reject/${id}`;
      await api.post(endpoint);
      
      alert(`Leave ${action} Successfully!`);
      fetchLeaves(); // Refresh the table
    } catch (err) {
      alert("Action failed! Check admin permissions.");
      console.error(err);
    }
  };

  // --- SORTING & FILTERING LOGIC ---
  // Note: Since Backend DTO uses 'leaveType' and 'status'
  const filteredLeaves = leaves.filter((leave) => {
    const matchesDept = filterDept === "All" || leave.department === filterDept;
    const matchesType = filterType === "All" || leave.leaveType === filterType;
    
    // Fallback to ID or EmployeeID if Name isn't in your current LeaveDTO
    const searchTarget = leave.employeeId?.toString() || ""; 
    const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
    
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
              placeholder="Search by ID..." 
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
            <span className="text-xs font-bold uppercase tracking-tighter">Backend Synced</span>
          </div>
        </div>

        {/* Leave Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1e293b] text-white">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Employee ID</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Leave Details</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Dates & Session</th>
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
                        <p className="font-bold text-slate-800">EMP-{leave.employeeId}</p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase">Staff</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-slate-700">{leave.leaveType}</p>
                    <p className="text-[10px] text-slate-400 italic line-clamp-1">{leave.reason}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-slate-700">{leave.startDate} to {leave.endDate}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Session: {leave.session || "Full Day"}</p>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      leave.status === "PENDING" ? "bg-amber-100 text-amber-600" : 
                      leave.status === "APPROVED" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="p-6">
                    {leave.status === "PENDING" ? (
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleAction(leave.id, "Approved")}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleAction(leave.id, "Rejected")}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-center text-[10px] font-bold text-slate-300 italic uppercase">Processed</p>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400 italic text-sm">
                    No leave requests found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default LeaveManagement;