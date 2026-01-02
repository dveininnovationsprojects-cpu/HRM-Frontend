import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, Search, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Sidebar from "../../components/Sidebar";

const ManageAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);

  // Axios Instance for Backend
  const api = axios.create({
    baseURL: "http://localhost:8080/api/attendance",
    withCredentials: true,
  });

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      // Calls @GetMapping("/all") from AttendanceController
      const res = await api.get("/all");
      setAttendanceRecords(res.data);
    } catch (err) {
      console.error("Error fetching attendance", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // 1. Handle Biometric File Upload to Backend
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      // Calls @PostMapping("/upload")
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data); // "File uploaded successfully" message from Service
      fetchAttendanceData();
    } catch (err) {
      alert("Upload failed: " + (err.response?.data || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Manual Status Update (Admin Only)
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // Calls @PutMapping("/admin-update/{id}")
      await api.put(`/admin-update/${id}`, null, {
        params: { status: newStatus }
      });
      // Update local state to reflect change immediately
      setAttendanceRecords(prev => 
        prev.map(rec => rec.id === id ? { ...rec, status: newStatus } : rec)
      );
    } catch (err) {
      alert("Failed to update status. Check permissions.");
    }
  };

  const filteredAttendance = attendanceRecords.filter(rec =>
    rec.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Manage Attendance</h1>
              <p className="text-slate-500 font-medium">Daily Operations Tracking | <span className="text-blue-600">{todayDate}</span></p>
            </div>
            
            <div className="flex gap-3">
              <label className="flex items-center gap-2 bg-white border-2 border-dashed border-blue-400 px-6 py-2.5 rounded-xl cursor-pointer hover:bg-blue-50 transition-all text-blue-600 font-bold text-sm">
                <Upload size={18} />
                BIOMETRIC UPLOAD
                <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
              </label>
              <button 
                onClick={fetchAttendanceData}
                className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
              >
                REFRESH DATA
              </button>
            </div>
          </div>

          {/* Stats & Search Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by Employee ID..." 
                className="pl-10 pr-4 py-2 w-full bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span> 
                Present: {attendanceRecords.filter(r => r.status === 'PRESENT').length}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500"></span> 
                Absent: {attendanceRecords.filter(r => r.status === 'ABSENT').length}
              </span>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="font-medium">Syncing with Backend...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase">Emp ID</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase">Check In</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase">Check Out</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAttendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 text-sm font-bold text-slate-800">{rec.employeeId}</td>
                      <td className="p-5 text-sm text-slate-600 font-mono">{rec.checkIn || "--:--"}</td>
                      <td className="p-5 text-sm text-slate-600 font-mono">{rec.checkOut || "--:--"}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          rec.status === 'PRESENT' ? 'bg-green-50 text-green-700' :
                          rec.status === 'ABSENT' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-5 flex justify-end gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(rec.id, "PRESENT")}
                          className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          PRESENT
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(rec.id, "ABSENT")}
                          className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-rose-600 hover:text-white transition-all"
                        >
                          ABSENT
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(rec.id, "SICK")}
                          className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-amber-600 hover:text-white transition-all"
                        >
                          SICK
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filteredAttendance.length === 0 && (
              <div className="p-10 text-center text-slate-400 italic">No attendance records found for today.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageAttendance;