import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Briefcase, Clock, Zap, Award, 
  Loader2, BookOpen, Star, TrendingUp 
} from "lucide-react";

const API_BASE_URL = "http://localhost:8080/api";

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId"); // Assumes stored during login
        const headers = { Authorization: `Bearer ${token}` };

        // Concurrent fetching aligned with your Controller endpoints
        const [tasksRes, attendanceRes, profileRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/employee/tasks`, { headers }),
          axios.get(`${API_BASE_URL}/attendance/my`, { headers }),
          axios.get(`${API_BASE_URL}/employees/${userId}`, { headers })
        ]);

        setTasks(tasksRes.data);
        setAttendance(attendanceRes.data);
        setProfile(profileRes.data);
        setError(null);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to sync with server. Please verify your session.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Determine if the user is a trainee based on your backend's designationStatus
  const isTrainee = profile?.designationStatus === "TRAINEE";

  const stats = [
    { 
      label: "My Active Modules", 
      value: tasks.filter(t => t.status !== 'COMPLETED').length, 
      info: "Pending completion",
      icon: <Briefcase size={20} className="text-indigo-600" /> 
    },
    { 
      label: "Current Status", 
      value: profile?.designationStatus || "Permanent", 
      info: profile?.department || "General",
      icon: isTrainee ? <BookOpen size={20} className="text-amber-500" /> : <Star size={20} className="text-emerald-500" />
    },
    { 
      label: "Work Hours", 
      value: attendance.length > 0 ? `${attendance[0].workMinutes || 0}m` : "0m", 
      info: "Latest session",
      icon: <Clock size={20} className="text-blue-500" /> 
    },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
      <p className="text-slate-500 font-bold animate-pulse">Synchronizing CoreSync Data...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      {/* Header aligned with User Profile */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Welcome back, {profile?.fullName || 'User'}!
        </h1>
        <p className="text-slate-500 font-medium">
          {isTrainee ? "Trainee Development Tracking" : "Employee Performance Dashboard"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl text-sm font-bold">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              <p className="text-xs font-bold mt-2 text-slate-500">{stat.info}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Progress Table - Left 2 Columns */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={20} />
              <h2 className="text-lg font-black text-slate-900">Module Progress</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black">
                <tr>
                  <th className="px-6 py-4">Assigned Module</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.length > 0 ? tasks.map((task, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700">{task.module?.moduleName || "General Task"}</p>
                      <p className="text-[10px] text-slate-400">ID: #{task.id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {new Date(task.deadline).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                        task.status === 'COMPLETED' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400 italic">No active modules assigned yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Trainee Performance or Shift Info */}
        <div className="space-y-6">
          <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Award size={20} className="text-indigo-300" />
              {isTrainee ? "Learning Track" : "Shift Details"}
            </h2>
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <p className="text-xs text-indigo-200 font-bold uppercase">Biometric ID</p>
                <p className="text-xl font-black">{profile?.biometricId || 'Not Linked'}</p>
              </div>
              
              {isTrainee && (
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <p className="text-xs text-indigo-200 font-bold uppercase">Learning Status</p>
                  <p className="text-lg font-bold">Phase: {profile?.designationStatus}</p>
                  <div className="w-full bg-white/20 h-2 rounded-full mt-2">
                    <div className="bg-indigo-400 h-full rounded-full w-[65%]"></div>
                  </div>
                </div>
              )}

              <button className="w-full py-3 bg-white text-indigo-900 rounded-xl font-black text-sm hover:bg-indigo-50 transition-colors">
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;