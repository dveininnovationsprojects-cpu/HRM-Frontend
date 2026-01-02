import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Search, Edit2, Home, Download, Upload
} from "lucide-react";
// --- API CONFIGURATION ---
const API_BASE_URL = "http://localhost:8080/api/attendance";
axios.defaults.withCredentials = true;

const Attendance = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [activeMainTab, setActiveMainTab] = useState("Dashboard"); 
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  // Get current username for "My Attendance" (Assume it's stored during login)
  const CURRENT_USERNAME = localStorage.getItem("username") || ""; 

  // --- 1. FETCH ALL DATA (For Admin/HR) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/all`);
      setEmployees(res.data);
    } catch (err) { 
      console.error("Fetch Error:", err);
      if (err.response?.status === 403) alert("Access Denied: Admin/HR only");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. UPDATE ATTENDANCE STATUS (Admin Action) ---
  const handleUpdateAttendance = async () => {
    try {
      // Backend: @PutMapping("/admin-update/{id}") @RequestParam String status
      await axios.put(`${API_BASE_URL}/admin-update/${editingStaff.id}`, null, {
        params: { status: editingStaff.status }
      });
      
      alert("Status updated successfully!");
      setIsShiftModalOpen(false);
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update record.");
    }
  };

  // --- 3. FILE UPLOAD LOGIC ---
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert(res.data);
      fetchData();
    } catch (err) {
      alert("Upload failed");
    }
  };

  // --- 4. EXPORT LOGIC ---
  const handleExport = (dataToExport, fileName = "Attendance_Log.csv") => {
    if (!dataToExport || dataToExport.length === 0) return alert("No data available!");
    const headers = ["ID", "Employee_ID", "Date", "In", "Out", "Status", "Minutes"];
    const csvRows = [
      headers.join(","),
      ...dataToExport.map(row => [
        row.id,
        row.employeeId,
        row.date,
        row.checkIn || "--",
        row.checkOut || "--",
        row.status || "ABSENT",
        row.workMinutes || "0"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const myData = useMemo(() => {
    return employees.filter(emp => String(emp.employeeId) === String(CURRENT_USERNAME));
  }, [employees, CURRENT_USERNAME]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-600 antialiased font-sans">
      
      {/* TOP NAVIGATION */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/dashboard")} className="group flex items-center justify-center w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-600 transition-all shadow-sm">
            <Home size={22} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>
          
          <nav className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200">
            {["Dashboard", "MyAdmin"].map((tab) => (
              <button key={tab} onClick={() => setActiveMainTab(tab)} className={`px-6 py-2.5 rounded-xl text-[11px] font-bold tracking-wider transition-all ${activeMainTab === tab ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`}>
                {tab === "Dashboard" ? "TEAM OVERVIEW" : "MY ATTENDANCE"}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          <button onClick={handleFileUpload} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"><Upload size={16}/></button>
          <button onClick={() => handleExport(employees)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-bold hover:bg-indigo-600 transition-all shadow-lg"><Download size={16} /> EXPORT</button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        {activeMainTab === "Dashboard" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance Dashboard</h1>
                  <p className="text-sm text-slate-400 font-medium">Monitoring {employees.length} entries</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Search Employee ID..." className="bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm w-72 outline-none focus:border-indigo-600 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee ID</th>
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check-In</th>
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check-Out</th>
                    <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="p-5 text-center text-[10px] font-bold text-slate-400 uppercase">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan="6" className="p-10 text-center font-bold">Syncing with Backend...</td></tr>
                  ) : filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="p-5 text-sm font-bold text-indigo-600">{emp.employeeId}</td>
                      <td className="p-5 text-sm font-semibold">{emp.date}</td>
                      <td className="p-5 text-sm font-bold">{emp.checkIn || "--:--"}</td>
                      <td className="p-5 text-sm font-bold">{emp.checkOut || "--:--"}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${emp.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{emp.status}</span>
                      </td>
                      <td className="p-5 text-center"><button onClick={() => {setEditingStaff(emp); setIsShiftModalOpen(true);}} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={14}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">My Personal Logs ({CURRENT_USERNAME})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myData.map(record => (
                <div key={record.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-slate-400 uppercase">{record.date}</span>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold">{record.status}</span>
                   </div>
                   <div className="flex justify-between">
                      <div><p className="text-[10px] text-slate-400 font-bold">IN</p><p className="text-xl font-black">{record.checkIn || "--:--"}</p></div>
                      <div><p className="text-[10px] text-slate-400 font-bold">OUT</p><p className="text-xl font-black">{record.checkOut || "--:--"}</p></div>
                      <div className="text-right"><p className="text-[10px] text-slate-400 font-bold">MINS</p><p className="text-xl font-black text-indigo-600">{record.workMinutes}</p></div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/30">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><Edit2 size={20} className="text-indigo-600"/> Update Status</h2>
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Staff ID</p>
                <p className="font-bold">{editingStaff?.employeeId}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-indigo-600 uppercase ml-2">New Status</label>
                <select 
                  className="w-full mt-1 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-sm font-bold outline-none"
                  value={editingStaff?.status}
                  onChange={(e) => setEditingStaff({...editingStaff, status: e.target.value})}
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="LATE">LATE</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsShiftModalOpen(false)} className="flex-1 py-4 text-xs font-bold text-slate-400">CANCEL</button>
              <button onClick={handleUpdateAttendance} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-bold shadow-lg hover:bg-indigo-700">SAVE STATUS</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;