import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Search, Activity, Users, Settings, TrendingUp, 
  ShieldCheck, BookOpen, GraduationCap
} from "lucide-react";

const API_BASE_URL = "http://localhost:8080/api"; // Updated to match your Spring Boot port

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ totalStaff: 0, activeTasks: 0 });
  const [trainingBrief, setTrainingBrief] = useState({ activeBatch: "N/A", performance: 0 });

  const token = localStorage.getItem("token");

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true 
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchDashboardData();
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Parallel data fetching for better performance
      const [projectRes, empRes, trainingRes] = await Promise.allSettled([
        apiClient.get("/admin/projects-list"),
        apiClient.get("/admin/employees"),
        apiClient.get("/admin/training-summary") // Assuming this endpoint exists
      ]);

      if (projectRes.status === "fulfilled") setProjects(projectRes.value.data || []);
      
      setStats({
        totalStaff: empRes.status === "fulfilled" ? empRes.value.data?.length : 0,
        activeTasks: projectRes.status === "fulfilled" ? projectRes.value.data?.length : 0
      });

      // Mocking training data if endpoint isn't ready yet
      setTrainingBrief({ 
        activeBatch: "FullStack-Jan-26", 
        performance: 82 
      });

    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Syncing Environment...</p>
    </div>
  );

  return (
    <div className="flex bg-[#F1F5F9] min-h-screen font-sans text-slate-700">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-8 overflow-x-hidden">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin <span className="text-blue-600">Console</span></h1>
            <p className="text-slate-500 text-sm font-medium">Node: {window.location.hostname} | Status: Online</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl flex items-center px-4 py-2.5 shadow-sm focus-within:ring-2 ring-blue-500/20 w-full md:w-auto">
            <Search size={18} className="text-slate-400 mr-3" />
            <input 
              type="text" 
              placeholder="Filter modules..." 
              className="outline-none bg-transparent text-sm w-full md:w-64" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Users />} label="Total Staff" value={stats.totalStaff} color="bg-blue-600" />
          <StatCard icon={<Activity />} label="Ongoing Projects" value={stats.activeTasks} color="bg-emerald-500" />
          <StatCard icon={<GraduationCap />} label="Training Avg" value={`${trainingBrief.performance}%`} color="bg-orange-500" />
          <StatCard icon={<ShieldCheck />} label="Security" value="Active" color="bg-indigo-600" />
        </section>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
               <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Settings size={18} /> Administrative Tools</h3>
               <div className="grid grid-cols-3 gap-4">
                 <QuickBtn icon={<Users />} label="Staff" onClick={() => navigate("/employees")} color="text-blue-600" hover="hover:border-blue-300" />
                 <QuickBtn icon={<Activity />} label="Attendance" onClick={() => navigate("/attendance")} color="text-emerald-600" hover="hover:border-emerald-300" />
                 <QuickBtn icon={<BookOpen />} label="Training" onClick={() => navigate("/training")} color="text-orange-500" hover="hover:border-orange-300" />
               </div>
            </div>

            {/* Project Feed */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
              <h4 className="font-bold mb-6 flex justify-between items-center text-lg text-slate-800">
                Operational Projects <TrendingUp size={20} className="text-emerald-500" />
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.slice(0, 4).map((p, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-black text-slate-800">{p.projectName}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-lg font-bold">STABLE</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `75%` }} className="h-full bg-blue-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
               <h2 className="text-4xl font-black tabular-nums relative z-10">
                 {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
               </h2>
               <p className="text-slate-400 text-xs mt-2 relative z-10 font-bold uppercase tracking-widest">{currentTime.toDateString()}</p>
               <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl"></div>
            </div>

            {/* Training Mini-App */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm border-t-4 border-t-orange-500">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-slate-900">Training Metric</h4>
                  <GraduationCap size={20} className="text-orange-500" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Group</p>
                      <p className="text-sm font-bold text-slate-800">{trainingBrief.activeBatch}</p>
                    </div>
                    <p className="text-2xl font-black text-orange-600">{trainingBrief.performance}%</p>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${trainingBrief.performance}%` }} 
                      className="h-full bg-orange-500" 
                    />
                  </div>
                  <button 
                    onClick={() => navigate("/employee/trainingsystem")}
                    className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all"
                  >
                    Manage Hub
                  </button>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable Sub-components for cleaner code
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-current/20`}>{icon}</div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
  </div>
);

const QuickBtn = ({ icon, label, onClick, color, hover }) => (
  <button onClick={onClick} className={`flex flex-col items-center p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 ${hover} transition-all group`}>
    <div className={`${color} group-hover:scale-110 transition-transform`}>{React.cloneElement(icon, { size: 24 })}</div>
    <span className="text-[10px] font-bold mt-2 uppercase tracking-tighter">{label}</span>
  </button>
);

export default Dashboard;