import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { Home, Upload, Search, List, History, ArrowUpDown, Star, Loader2, IndianRupee, BarChart3, Clock, Briefcase, CheckCircle2, ChevronDown, FileSpreadsheet, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx'; // Import for Excel handling

const API_BASE_URL = "http://localhost:5000/api"; 

const RecruitmentSystem = () => {
  const [view, setView] = useState('dashboard');
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  const [jobForm, setJobForm] = useState({
    role: '', experience: '', category: 'Full-time', location: '', salary: '', skills: '', description: ''
  });

  // --- NEW FUNCTIONALITIES START ---

  // 1. Function to Export Selected Candidates to Excel
  const downloadSelectedReport = () => {
    const selectedCandidates = applications.filter(app => app.status === 'Selected');
    
    if (selectedCandidates.length === 0) {
      alert("No selected candidates found to download.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(selectedCandidates);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected_Candidates");
    
    // Generates the Excel file and triggers download
    XLSX.writeFile(workbook, "Selected_Candidates_Report.xlsx");
  };

  // 2. Function to Import Candidates from Excel
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // Process and Save imported data to backend
      try {
        for (const candidate of data) {
          // Add a temporary ID if missing
          const newCandidate = { ...candidate, id: candidate.id || Date.now() + Math.random() };
          await axios.post(`${API_BASE_URL}/applications`, newCandidate);
        }
        alert(`${data.length} candidates imported successfully!`);
        fetchAllData(); // Refresh the table
      } catch (err) {
        console.error("Import Error:", err);
        alert("Failed to save imported data to server.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- NEW FUNCTIONALITIES END ---

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [appRes, jobRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/applications`),
        axios.get(`${API_BASE_URL}/jobs`)
      ]);
      setApplications(appRes.data);
      setJobs(jobRes.data);
    } catch (err) {
      console.error("Backend Error:", err);
      setError("Database connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    const now = new Date();
    const newJob = { 
      ...jobForm, 
      id: Date.now(), 
      postedBy: "HR Admin", 
      postedDate: now.toLocaleDateString(),
      postedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/jobs`, newJob);
      if (response.status === 200 || response.status === 201) {
        setJobs([newJob, ...jobs]);
        alert(`Notification: New Job Opening for ${jobForm.role} has been broadcasted!`);
        setJobForm({ role: '', experience: '', category: 'Full-time', location: '', salary: '', skills: '', description: '' });
        setView('feed');
      }
    } catch (err) {
      console.error("Post Error:", err);
      alert("Failed to connect to backend server.");
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setShowSortMenu(false); 
  };

  const sortedApplications = useMemo(() => {
    let sortableItems = [...applications];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [applications, sortConfig]);

  const filteredApps = useMemo(() => {
    return sortedApplications.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedApplications, searchQuery]);

  const candidateColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Candidate Name' },
    { key: 'position', label: 'Position' },
    { key: 'status', label: 'Status' }
  ];

  const auditColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Candidate Name' },
    { key: 'experience', label: 'Experience' },
    { key: 'score', label: 'Score' },
    { key: 'ctc', label: 'CTC' },
    { key: 'status', label: 'Status' }
  ];

  const getReferralStars = (refId) => {
    return applications.filter(app => app.referralId === refId && app.status === "Selected").length;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-500 font-bold tracking-tighter uppercase text-xs">Syncing Database...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div 
              className="bg-white border border-slate-200 p-2 rounded-lg text-slate-500 cursor-pointer hover:bg-slate-50 transition-all shadow-sm" 
              onClick={() => navigate('/dashboard')} 
            >
              <Home size={20} />
            </div>
            
            <nav className="hidden md:flex gap-1">
              {['dashboard', 'feed', 'viewApplications', 'auditLogs'].map((id) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    view === id ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1')}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* NEW EXCEL BUTTONS */}
            <div className="flex gap-2">
                <label className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-bold text-emerald-600 hover:bg-emerald-100 cursor-pointer transition-all shadow-sm">
                   <FileSpreadsheet size={14} /> Import Excel
                   <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
                </label>
                
                <button 
                  onClick={downloadSelectedReport}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-sm"
                >
                  <Download size={14} /> Export Hired
                </button>
            </div>

            {(view === 'viewApplications' || view === 'auditLogs') && (
              <div className="relative">
                <button 
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <ArrowUpDown size={14} /> 
                  Sort By: <span className="text-blue-600">{sortConfig.key.toUpperCase()}</span>
                  <ChevronDown size={14} />
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-100">
                    <p className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Column</p>
                    {(view === 'viewApplications' ? candidateColumns : auditColumns).map((col) => (
                      <button
                        key={col.key}
                        onClick={() => requestSort(col.key)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center justify-between ${sortConfig.key === col.key ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-600'}`}
                      >
                        {col.label}
                        {sortConfig.key === col.key && (
                          <span className="text-[10px] uppercase">{sortConfig.direction}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-48 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* REST OF YOUR UI REMAINS EXACTLY THE SAME */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="text-blue-600" size={20} /> Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard label="Total Apps" value={applications.length} color="text-blue-600" />
                  <StatCard label="Hired" value={applications.filter(a => a.status === 'Selected').length} color="text-emerald-600" />
                  <StatCard label="Growth" value="+12%" color="text-purple-600" />
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{name: 'Oct', v: 40}, {name: 'Nov', v: 55}, {name: 'Dec', v: 45}]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="v" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Upload className="text-orange-500" size={20} /> Upload Job Posting
                </h2>
                <form onSubmit={handleJobSubmit} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg space-y-4">
                  <div className="space-y-3">
                    <input 
                      required placeholder="Job Role (e.g. Java Dev)" 
                      className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none"
                      value={jobForm.role} onChange={(e) => setJobForm({...jobForm, role: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        placeholder="Exp (e.g. 5+ Yrs)" 
                        className="p-3 bg-slate-50 border-none rounded-xl text-sm outline-none"
                        value={jobForm.experience} onChange={(e) => setJobForm({...jobForm, experience: e.target.value})}
                      />
                      <select 
                        className="p-3 bg-slate-50 border-none rounded-xl text-sm outline-none text-slate-500"
                        value={jobForm.category} onChange={(e) => setJobForm({...jobForm, category: e.target.value})}
                      >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Hybrid</option>
                        <option>Remote</option>
                      </select>
                    </div>
                    <input 
                      placeholder="Skills (e.g. React, Node)" 
                      className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none"
                      value={jobForm.skills} onChange={(e) => setJobForm({...jobForm, skills: e.target.value})}
                    />
                    <textarea 
                      placeholder="Brief Job Description" 
                      className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none h-20 resize-none"
                      value={jobForm.description} onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Post and Notify Users
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {view === 'viewApplications' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Current Applications</h2>
              <span className="text-[10px] font-black text-slate-400 uppercase">Sorting by: {sortConfig.key}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Candidate</th>
                    <th className="px-6 py-3">Position</th>
                    <th className="px-6 py-3">Contact Details</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500">{app.id}</td>
                      <td className="px-6 py-4 font-bold">{app.name}</td>
                      <td className="px-6 py-4">{app.position}</td>
                      <td className="px-6 py-4 text-xs">
                        <div>{app.email}</div>
                        <div className="text-slate-400">{app.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${app.status === 'Selected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'auditLogs' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Detailed Audit Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Exp</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">CTC</th>
                    <th className="px-4 py-3">Referral</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-mono text-slate-400">{app.id}</td>
                      <td className="px-4 py-4 font-bold">{app.name}</td>
                      <td className="px-4 py-4 text-[10px] font-bold text-blue-500">{app.experience}</td>
                      <td className="px-4 py-4 font-bold text-blue-600">{app.score}%</td>
                      <td className="px-4 py-4 font-bold"><IndianRupee size={12} className="inline"/>{app.ctc}</td>
                      <td className="px-4 py-4">
                        <div className="flex text-amber-400">
                          {[...Array(getReferralStars(app.referralId))].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${app.status === 'Selected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'feed' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">{job.postedDate}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">{job.postedTime}</span>
                  </div>
                  <div className="mb-4">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">{job.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{job.role}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills?.split(',').map((skill, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">{skill.trim()}</span>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm text-slate-500 mb-6">
                    <p className="flex items-center gap-2"><Briefcase size={14}/> {job.experience} experience</p>
                    <p className="line-clamp-3 text-xs leading-relaxed">{job.description}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Posted by {job.postedBy}</span>
                    <button className="text-blue-600 text-xs font-bold hover:underline">Apply Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:scale-[1.02]">
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);

export default RecruitmentSystem;