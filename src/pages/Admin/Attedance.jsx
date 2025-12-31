import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {  
  Search, Clock, Edit2, Home, 
  Calendar, Briefcase, CheckCircle2, Download, ShieldCheck, MapPin, AlertCircle
} from "lucide-react";

const AdminPortal = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [activeMainTab, setActiveMainTab] = useState("Dashboard"); 
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null); 
  const [originalStaff, setOriginalStaff] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");

  const ADMIN_ID = "DVN-CORE-028"; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5006/employees");
        setEmployees(res.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  // --- EXPORT LOG LOGIC (Functioning) ---
  const handleExport = (dataToExport, fileName = "Attendance_Log.csv") => {
    if (dataToExport.length === 0) return alert("No data available to export!");

    // CSV Headers
    const headers = ["Employee_ID", "Name", "Check_In", "Check_Out", "Status", "Work_Minutes"];
    
    // Convert JSON to CSV Rows
    const csvRows = [
      headers.join(","), // Header row
      ...dataToExport.map(row => [
        row.employee_id,
        row.firstName,
        row.check_in || "N/A",
        row.check_out || "N/A",
        row.status || "ABSENT",
        row.work_minutes || "0"
      ].join(","))
    ].join("\n");

    // Create Blob and Download
    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const id = emp.employee_id || "";
      const name = emp.firstName || "";
      return id.toLowerCase().includes(searchTerm.toLowerCase()) || 
             name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [employees, searchTerm]);

  const myData = useMemo(() => {
    return employees.find(emp => emp.employee_id === ADMIN_ID) || {};
  }, [employees, ADMIN_ID]);

  const handleOpenEdit = (emp) => {
    setOriginalStaff(emp);
    setEditingStaff({ ...emp });
    setIsShiftModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-600 antialiased" style={{ fontFamily: "'Public Sans', sans-serif" }}>
      
      {/* --- TOP NAVIGATION --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/dashboard")} className="group flex items-center justify-center w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-600 transition-all shadow-sm">
            <Home size={22} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>
          
          <nav className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200">
            {["Dashboard", "MyAdmin"].map((tab) => (
              <button key={tab} onClick={() => setActiveMainTab(tab)} className={`px-6 py-2.5 rounded-xl text-[11px] font-bold tracking-wider transition-all ${activeMainTab === tab ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>
                {tab === "Dashboard" ? "TEAM OVERVIEW" : "MY ATTENDANCE"}
              </button>
            ))}
          </nav>
        </div>

        {/* Header Export Button */}
        <button 
          onClick={() => handleExport(employees, "Team_Attendance.csv")}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-bold tracking-wide hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
        >
          <Download size={16} /> DOWNLOAD TEAM LOGS
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        {activeMainTab === "Dashboard" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff Attendance</h1>
                  <p className="text-sm text-slate-400 font-medium">Monitoring {employees.length} Employees</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Search ID or Name..." className="bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm w-72 outline-none focus:border-indigo-600 transition-all font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {/* Table remains same */}
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emp_ID</th>
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Staff Name</th>
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check-In</th>
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check-Out</th>
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="p-5 text-center text-[10px] font-bold text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.employee_id} className="hover:bg-slate-50/50">
                      <td className="p-5 text-sm font-bold text-indigo-600">{emp.employee_id}</td>
                      <td className="p-5 text-sm font-semibold text-slate-700">{emp.firstName}</td>
                      <td className="p-5 text-sm font-bold text-slate-700">{emp.check_in || "--:--"}</td>
                      <td className="p-5 text-sm font-bold text-slate-700">{emp.check_out || "--:--"}</td>
                      <td className="p-5"><span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${emp.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{emp.status || 'ABSENT'}</span></td>
                      <td className="p-5 text-center"><button onClick={() => handleOpenEdit(emp)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={14}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black">{myData.firstName?.[0] || "A"}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-slate-900">{myData.firstName || "Admin User"}</h2>
                    <ShieldCheck size={18} className="text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-slate-400 text-xs font-medium uppercase tracking-wider">
                    <span className="text-indigo-600 font-bold">{myData.employee_id}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin size={12}/> {myData.location || "Office Base"}</span>
                  </div>
                </div>
              </div>
              {/* My Attendance Export Button */}
              <button 
                onClick={() => handleExport([myData], `Log_${myData.employee_id}.csv`)}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-100 bg-slate-50 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all"
              >
                <Download size={14}/> Export My Log
              </button>
            </div>

            {/* Rest of the UI remains same... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between h-40">
                <div className="flex items-center gap-2 text-slate-400 mb-4 text-[10px] font-black uppercase tracking-widest"><Clock size={16}/> Entry / Exit</div>
                <div className="flex justify-between items-end">
                  <div><p className="text-[9px] text-slate-400 font-bold uppercase">In</p><p className="text-2xl font-black">{myData.check_in || "--:--"}</p></div>
                  <div className="text-right"><p className="text-[9px] text-slate-400 font-bold uppercase">Out</p><p className="text-2xl font-black">{myData.check_out || "--:--"}</p></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between h-40">
                <div className="flex items-center gap-2 text-slate-400 mb-4 text-[10px] font-black uppercase tracking-widest"><CheckCircle2 size={16}/> Status</div>
                <div className="flex justify-between items-end">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${myData.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>{myData.status || 'ABSENT'}</span>
                  <div className="text-right"><p className="text-[9px] text-slate-400 font-bold uppercase">Logged</p><p className="text-2xl font-black text-indigo-600">{myData.work_minutes || 0} Min</p></div>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex flex-col justify-between h-40 shadow-xl shadow-slate-200">
                <div className="flex items-center gap-2 text-indigo-400 mb-4 text-[10px] font-black uppercase tracking-widest"><Briefcase size={16}/> Assignment</div>
                <div><h4 className="text-xl font-bold">{myData.shift_type || "General Shift"}</h4><p className="text-[10px] text-slate-400">Node ID: {myData.employee_id}</p></div>
              </div>
            </div>

            <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><Calendar size={20}/></div>
                  <div><p className="text-xs font-bold text-indigo-900">System Analytics Dashboard</p><p className="text-[10px] text-indigo-400 uppercase font-medium">Real-time data sync active</p></div>
               </div>
               <button onClick={() => setActiveMainTab("Dashboard")} className="text-[10px] font-black text-indigo-600 bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-600 hover:text-white transition-all">VIEW TEAM ANALYTICS</button>
            </div>
          </div>
        )}
      </main>

      {/* Comparison Modal remains same */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/30">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 border border-slate-100">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-3"><Edit2 className="text-indigo-600" /> Modification</h2>
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-4 opacity-60">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><AlertCircle size={12}/> Original</p>
                    <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Check In</p><p className="font-bold text-slate-700">{originalStaff?.check_in || "--:--"}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest"><Edit2 size={12}/> Modifying</p>
                    <div className="bg-indigo-50/30 border border-indigo-100 p-6 rounded-3xl space-y-3">
                        <p className="text-[9px] font-bold text-indigo-400 uppercase">Adjust Time</p>
                        <input type="time" value={editingStaff?.check_in || ""} onChange={(e) => setEditingStaff({...editingStaff, check_in: e.target.value})} className="w-full bg-white mt-1 p-2 rounded-xl text-sm font-bold ring-1 ring-indigo-100 outline-none" />
                    </div>
                </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsShiftModalOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Cancel</button>
              <button onClick={() => setIsShiftModalOpen(false)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg">SAVE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;