import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Clock, Calendar, AlertCircle, Timer, 
  CheckCircle, Briefcase, RefreshCw, LogIn, LogOut, Filter, X 
} from "lucide-react";

// Axios defaults for Cookie handling
axios.defaults.withCredentials = true;
const API_BASE = "http://localhost:8081/api/attendance";

const EmployeeAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchMyAttendance = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/my`);
      const sortedData = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendanceData(sortedData);
      setFilteredData(sortedData); // Initial state
    } catch (error) {
      console.error("Backend Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  // Filter Logic
  const handleFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both Start and End dates");
      return;
    }
    const filtered = attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });
    setFilteredData(filtered);
  };

  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
    setFilteredData(attendanceData);
  };

  const formatWorkTime = (minutes) => {
    if (!minutes) return "0h 0m";
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">
            Attendance <span className="text-blue-600 underline">Vault</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-[0.2em]">Cookie-Auth Secured System</p>
        </div>
        
        {/* DATE FILTER UI */}
        <div className="bg-white p-4 rounded-2xl border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase">From:</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-100 border-2 border-slate-900 rounded-lg px-2 py-1 font-bold text-sm" 
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase">To:</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-100 border-2 border-slate-900 rounded-lg px-2 py-1 font-bold text-sm" 
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleFilter}
              className="bg-slate-900 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Filter size={20} />
            </button>
            <button 
              onClick={clearFilter}
              className="bg-slate-200 text-slate-900 p-2 rounded-lg hover:bg-rose-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* STATS SUMMARY (Based on Filtered Data) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 border-2 border-slate-900 rounded-xl"><CheckCircle className="text-blue-600"/></div>
              <h3 className="font-black text-slate-400 uppercase text-xs">Total Records</h3>
            </div>
            <p className="text-5xl font-black text-slate-900">{filteredData.length}</p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-100 border-2 border-slate-900 rounded-xl"><Timer className="text-emerald-600"/></div>
              <h3 className="font-black text-slate-400 uppercase text-xs">Work Hours</h3>
            </div>
            <p className="text-4xl font-black text-slate-900">
              {(filteredData.reduce((acc, curr) => acc + (curr.workMinutes || 0), 0) / 60).toFixed(1)} <span className="text-xl">Hrs</span>
            </p>
          </div>
        </div>

        {/* MAIN TABLE */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-6 border-b-4 border-slate-900">Date</th>
                  <th className="px-8 py-6 border-b-4 border-slate-900">Timing</th>
                  <th className="px-8 py-6 border-b-4 border-slate-900">Duration</th>
                  <th className="px-8 py-6 border-b-4 border-slate-900">Status</th>
                  <th className="px-8 py-6 border-b-4 border-slate-900">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-slate-100">
                {filteredData.length > 0 ? (
                  filteredData.map((record) => (
                    <tr key={record.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6 font-black text-slate-700">{record.date}</td>
                      <td className="px-8 py-6 font-bold">
                        <div className="flex flex-col text-[10px]">
                          <span className="text-emerald-600">IN: {record.checkIn}</span>
                          <span className="text-rose-600">OUT: {record.checkOut || "Active"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-900">{formatWorkTime(record.workMinutes)}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg border-2 text-[10px] font-black uppercase ${
                          record.status === "PRESENT" ? "bg-green-100 border-green-700 text-green-700" : "bg-red-100 border-red-700 text-red-700"
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs text-slate-400 italic font-bold">
                        {record.remarks || "No data"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center font-black text-slate-300 uppercase tracking-widest">
                      {loading ? "Decrypting Cloud Logs..." : "Zero Records Found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;