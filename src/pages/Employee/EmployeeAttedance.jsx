import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, Calendar, AlertCircle, Timer, CheckCircle } from "lucide-react";

const EmployeeAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Retrieve the logged-in user's ID (e.g., "emp-01")
  const userId = localStorage.getItem("userId"); 

  const fetchMyAttendance = async () => {
    try {
      // Filtering: Fetch only records matching this employee's ID
      const response = await axios.get(`http://localhost:5006/attendance?employeeId=${userId}`);
      // Sort by date (newest first)
      const sortedData = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendanceData(sortedData);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMyAttendance();
    }
  }, [userId]);

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Attendance Log</h1>
        <p className="text-slate-500 font-medium">Viewing records for ID: <span className="text-blue-600 font-bold">{userId}</span></p>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><CheckCircle size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Days</p>
            <p className="text-2xl font-black text-slate-800">{attendanceData.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Timer size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total OT</p>
            <p className="text-2xl font-black text-slate-800">
              {attendanceData.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0)} hrs
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertCircle size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Late Counts</p>
            <p className="text-2xl font-black text-slate-800">
              {attendanceData.filter(item => item.lateMinutes > 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="text-blue-600" size={22} /> Monthly Records
          </h2>
          <button 
            onClick={fetchMyAttendance}
            className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all"
          >
            Refresh Data
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Check-In</th>
                <th className="px-8 py-5">Check-Out</th>
                <th className="px-8 py-5">Late (Mins)</th>
                <th className="px-8 py-5">OT (Hrs)</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceData.length > 0 ? (
                attendanceData.map((record) => (
                  <tr key={record.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5 font-bold text-slate-700">{record.date}</td>
                    <td className="px-8 py-5 text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div> {record.checkIn}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-600 font-medium">{record.checkOut}</td>
                    <td className="px-8 py-5">
                      {record.lateMinutes > 0 ? (
                        <span className="text-red-600 font-black text-sm bg-red-50 px-2 py-1 rounded-md">
                          +{record.lateMinutes}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-8 py-5 font-black text-blue-600">{record.overtimeHours || 0}</td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tighter ${
                        record.status === "Present" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    {loading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-bold text-sm uppercase">Syncing Records...</p>
                      </div>
                    ) : (
                      <p className="text-slate-400 font-medium">No attendance data found for this period.</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;