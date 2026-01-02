import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { 
  Home, Upload, Search, List, History, ArrowUpDown, Star, Loader2, 
  IndianRupee, BarChart3, Clock, Briefcase, CheckCircle2, ChevronDown, 
  FileSpreadsheet, Download, Users, BookOpen, Rocket, Award, PlusCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

// Backend Configuration
const API_BASE_URL = "http://localhost:8081/api"; 
axios.defaults.withCredentials = true;

const RecruitmentSystem = () => {
  const [view, setView] = useState('dashboard');
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: '', role: '', designation: '' });
  
  // Data States
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [batches, setBatches] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  // Forms
  const [jobForm, setJobForm] = useState({
    role: '', experience: '', category: 'Full-time', location: '', salary: '', skills: '', description: ''
  });
  const [batchForm, setBatchForm] = useState({ batchName: '', trainerId: '', traineeIds: [], endDate: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // 1. Get User Context (AuthResponse logic)
      const authRes = await axios.get(`${API_BASE_URL}/auth/me`); 
      // Note: Assuming you have a /me endpoint or neenga login pannappa save panna data
      setUser({ 
        username: authRes.data.username, 
        role: authRes.data.role, 
        designation: authRes.data.designationStatus 
      });

      // 2. Load Recruitment Data
      const [appRes, jobRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/applications`), // Recruitment specific
        axios.get(`${API_BASE_URL}/jobs`)
      ]);
      setApplications(appRes.data);
      setJobs(jobRes.data);

      // 3. Training Hub Logic based on Designation
      if (authRes.data.designationStatus === 'TRAINEE') {
        const taskRes = await axios.get(`${API_BASE_URL}/employee/tasks`);
        setMyTasks(taskRes.data);
      } else if (authRes.data.designationStatus === 'TRAINER' || authRes.data.role === 'MANAGER') {
        const batchRes = await axios.get(`${API_BASE_URL}/manager/view-batches`);
        setBatches(batchRes.data);
      }

    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- TRAINER/TRAINEE LOGIC ---

  const handleLogWork = async (taskId) => {
    const hours = prompt("Enter hours worked:");
    const remarks = prompt("Enter work notes:");
    if (hours && remarks) {
      try {
        await axios.put(`${API_BASE_URL}/employee/tasks/${taskId}/log`, null, {
          params: { hours, remarks }
        });
        alert("Daily work notes uploaded!");
        fetchInitialData();
      } catch (err) { alert("Upload failed"); }
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.append('trainerId', batchForm.trainerId);
    params.append('batchName', batchForm.batchName);
    params.append('endDate', batchForm.endDate);
    batchForm.traineeIds.forEach(id => params.append('traineeIds', id));

    try {
      await axios.post(`${API_BASE_URL}/manager/create-batch`, params);
      alert("Batch created and Trainer assigned!");
      setView('dashboard');
    } catch (err) { alert("Error creating batch"); }
  };

  // --- RECRUITMENT & EXCEL LOGIC ---

  const downloadReport = () => {
    const selected = applications.filter(app => app.status === 'Selected');
    const ws = XLSX.utils.json_to_sheet(selected);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hired_Candidates");
    XLSX.writeFile(wb, "Recruitment_Report.xlsx");
  };

  const filteredApps = useMemo(() => {
    return applications.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      return sortConfig.direction === 'asc' ? 1 : -1;
    });
  }, [applications, searchQuery, sortConfig]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Initialising HRM Systems...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <div className="font-black text-xl text-blue-600 tracking-tighter">CORE.HR</div>
            <nav className="flex gap-1">
              <NavBtn id="dashboard" label="Dashboard" active={view} set={setView} />
              {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
                <NavBtn id="recruitment" label="Recruitment" active={view} set={setView} />
              )}
              <NavBtn id="training" label="Training Hub" active={view} set={setView} />
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right mr-2 hidden md:block">
              <p className="text-[10px] font-black text-blue-600 uppercase">{user.designation || user.role}</p>
              <p className="text-xs font-bold text-slate-700">{user.username}</p>
            </div>
            <button onClick={downloadReport} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all">
              <Download size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* VIEW 1: DASHBOARD (Recruitment Analytics) */}
        {view === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Total Candidates" value={applications.length} color="text-blue-600" />
              <StatCard label="Hired" value={applications.filter(a => a.status === 'Selected').length} color="text-emerald-600" />
              <StatCard label="Active Batches" value={batches.length} color="text-orange-600" />
              <StatCard label="Tasks Pending" value={myTasks.length} color="text-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                 <h3 className="font-black mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600"/> Recruitment Yield</h3>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{n: 'Applied', v: applications.length}, {n: 'Hired', v: applications.filter(a => a.status === 'Selected').length}]}>
                        <XAxis dataKey="n" hide />
                        <Tooltip />
                        <Bar dataKey="v" fill="#3b82f6" radius={10} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <h3 className="text-xl font-black mb-4">Promotion Rank</h3>
                <p className="text-slate-400 text-sm mb-6">Based on manual assessment & training score.</p>
                <div className="space-y-4">
                  {/* Mock Ranking Logic from EmployeeRankDTO */}
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="font-bold">1. {user.username}</span>
                    <span className="text-emerald-400 font-black text-sm">94%</span>
                  </div>
                </div>
                <Rocket className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32" />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: TRAINING HUB (Trainer/Trainee Logic) */}
        {view === 'training' && (
          <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Left: Content Area */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              
              {/* TRAINEE SECTION */}
              {user.designation === 'TRAINEE' && (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200">
                  <h3 className="font-black text-lg mb-6 flex items-center gap-2 text-blue-600">
                    <BookOpen size={20}/> My Modules
                  </h3>
                  <div className="space-y-4">
                    {myTasks.map((task) => (
                      <div key={task.id} className="p-5 bg-slate-50 rounded-2xl flex justify-between items-center group">
                        <div>
                          <p className="font-bold text-slate-800">{task.moduleName || "Spring Boot Intro"}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase">Deadline: {task.deadline || 'TBA'}</p>
                        </div>
                        <button 
                          onClick={() => handleLogWork(task.id)}
                          className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all"
                        >
                          UPLOAD NOTES
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TRAINER SECTION */}
              {user.designation === 'TRAINER' && (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200">
                   <h3 className="font-black text-lg mb-6 flex items-center gap-2 text-orange-600">
                    <Users size={20}/> Batch Management
                  </h3>
                  {batches.map(batch => (
                    <div key={batch.id} className="border-b border-slate-100 py-4 flex justify-between">
                       <span className="font-bold">{batch.batchName}</span>
                       <button className="text-[10px] font-black text-blue-600 uppercase">Input Assessment Score</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Manager Controls */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                  <h4 className="font-black text-sm uppercase mb-4 flex items-center gap-2">
                    <PlusCircle size={16} className="text-blue-600"/> Create Batch
                  </h4>
                  <form onSubmit={handleCreateBatch} className="space-y-3">
                    <input 
                      placeholder="Batch Name (e.g. Java Nov)" 
                      className="w-full p-3 bg-slate-100 rounded-xl text-xs outline-none"
                      onChange={(e) => setBatchForm({...batchForm, batchName: e.target.value})}
                    />
                    <input 
                      placeholder="Trainer Employee ID" 
                      className="w-full p-3 bg-slate-100 rounded-xl text-xs outline-none"
                      onChange={(e) => setBatchForm({...batchForm, trainerId: e.target.value})}
                    />
                    <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase">
                      Confirm Batch & Assign
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: RECRUITMENT TABLE */}
        {view === 'recruitment' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
             <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                <input 
                  type="text" 
                  placeholder="Filter candidates..." 
                  className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs w-64 outline-none focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Add Candidate</button>
             </div>
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                   <tr>
                     <th className="px-6 py-4">Candidate</th>
                     <th className="px-6 py-4">Position</th>
                     <th className="px-6 py-4">Score</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{app.name}</td>
                      <td className="px-6 py-4 text-slate-500">{app.position}</td>
                      <td className="px-6 py-4 text-blue-600 font-black">{app.score || '0'}%</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${app.status === 'Selected' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:underline font-bold text-xs">View Bio</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

      </main>
    </div>
  );
};

// UI Components
const NavBtn = ({ id, label, active, set }) => (
  <button 
    onClick={() => set(id)}
    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${active === id ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {label}
  </button>
);

const StatCard = ({ label, value, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);

export default RecruitmentSystem;