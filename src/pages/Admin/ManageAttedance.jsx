import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle, Search, Loader2 } from "lucide-react";

const ManageAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5006/employees");
      setEmployees(res.data.filter(emp => emp.status === "active"));
    } catch (err) {
      console.error("Error fetching live data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    const interval = setInterval(fetchAttendanceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" }); // Updated to array type
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log("Uploaded Biometric Data:", jsonData);
      alert("Biometric file uploaded successfully! Syncing data...");
    };
    reader.readAsArrayBuffer(file); // Changed from BinaryString to ArrayBuffer
  };

  const filteredEmployees = employees.filter(emp =>
    emp.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
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
            <button className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
              ATTENDANCE REPORT
            </button>
          </div>
        </div>

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
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Present: {employees.length}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"></span> Absent: 0</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="font-medium">Syncing live data...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase">S.No</th>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase">Name</th>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase text-center">Emp Id</th>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase">Department</th>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEmployees.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 text-sm font-medium text-slate-400">{index + 1}</td>
                    <td className="p-5">
                      <p className="text-sm font-bold text-slate-800">{emp.username}</p>
                    </td>
                    <td className="p-5 text-center text-sm font-mono text-slate-500">{emp.id}</td>
                    <td className="p-5">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        {emp.department || "General"}
                      </span>
                    </td>
                    <td className="p-5 flex justify-end gap-2">
                      <button className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all">PRESENT</button>
                      <button className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-rose-600 hover:text-white transition-all">ABSENT</button>
                      <button className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-amber-600 hover:text-white transition-all">SICK</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAttendance;