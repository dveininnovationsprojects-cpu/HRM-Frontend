import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Clock, CheckCircle2, Search, Home, Loader2, 
  Edit3, X, ChevronRight, PlusCircle, Briefcase, UserCheck, BarChart3
} from 'lucide-react';

const ProjectPerformance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data States based on your DTOs
  const [projectOptions, setProjectOptions] = useState([]); // ProjectOptionDTO
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectDetails, setProjectDetails] = useState(null); // ProjectAnalyticsReportDTO

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Form State for Assignment
  const [assignmentForm, setAssignmentForm] = useState({
    projectId: '',
    deadline: '',
    notes: ''
  });

  const API_URL = "http://localhost:8080/api/performance";
  const ADMIN_API = "http://localhost:8080/api/admin"; // For assignments
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchProjectList();
  }, []);

  // 1. Get projects based on User Role (Handled by your Controller)
  const fetchProjectList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/projects`, { headers });
      setProjectOptions(res.data);
      
      if (res.data.length > 0) {
        const firstId = res.data[0].id;
        setSelectedProjectId(firstId);
        fetchProjectDetails(firstId);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch specific report using ProjectAnalyticsReportDTO
  const fetchProjectDetails = async (projectId) => {
    try {
      const res = await axios.get(`${API_URL}/projects/${projectId}`, { headers });
      setProjectDetails(res.data);
    } catch (error) {
      console.error("Error fetching report:", error);
    }
  };

  const handleProjectChange = (projectId) => {
    setSelectedProjectId(projectId);
    fetchProjectDetails(projectId);
  };

  // 3. Handle Assignment Submission
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.post(`${ADMIN_API}/assign-project`, assignmentForm, { headers });
      setIsAssignModalOpen(false);
      alert("Project Assigned Successfully!");
      fetchProjectDetails(selectedProjectId); // Refresh current view
    } catch (err) {
      alert(err.response?.data?.message || "Error assigning project.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-500 font-bold animate-pulse uppercase tracking-tighter">Syncing Analytics...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/Dashboard')} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-sm hover:bg-slate-50 transition-all">
              <Home size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Performance</h1>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span>Performance</span>
                <ChevronRight size={14} />
                <span className="text-blue-600 font-bold">Analysis Console</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search module..." 
                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none w-full md:w-64 shadow-sm focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select 
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none shadow-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              {projectOptions.map(p => (
                <option key={p.id} value={p.id}>{p.projectName}</option>
              ))}
            </select>

            <button 
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <PlusCircle size={18} />
              New Assignment
            </button>
          </div>
        </div>
      </div>

      {/* OVERALL PROJECT STATS */}
      {projectDetails && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Progress" value={`${projectDetails.progressPercentage}%`} icon={<CheckCircle2/>} color="blue" />
          <StatCard label="Total Est." value={`${projectDetails.totalEstimatedHours}h`} icon={<Clock/>} color="slate" />
          <StatCard label="Total Act." value={`${projectDetails.totalActualHours}h`} icon={<BarChart3/>} color="orange" />
          <StatCard label="Efficiency" value={`${projectDetails.overallEfficiency}%`} icon={<TrendingUp/>} color="emerald" />
        </div>
      )}

      {/* ASSIGNMENT MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white"><Briefcase size={20} /></div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Initialize Assignment</h3>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleAssignSubmit} className="p-10 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Project</label>
                <select 
                  required
                  className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={assignmentForm.projectId}
                  onChange={(e) => setAssignmentForm({...assignmentForm, projectId: e.target.value})}
                >
                  <option value="">Choose Project</option>
                  {projectOptions.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={assignmentForm.deadline}
                  onChange={(e) => setAssignmentForm({...assignmentForm, deadline: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={updating}
                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl"
              >
                {updating ? 'Processing...' : 'Deploy Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PERFORMANCE TABLE */}
      <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Module Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Specialist</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Efficiency Score</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!projectDetails || projectDetails.modules?.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No module data found</td>
                </tr>
              ) : (
                projectDetails.modules
                  .filter(m => m.moduleName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((module) => (
                  <tr key={module.moduleId} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-900">{module.moduleName}</p>
                      <p className="text-[10px] font-black text-blue-500 uppercase">MID-{module.moduleId}</p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <UserCheck size={14} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-600">{module.assignedToName || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-sm font-black text-slate-900">{module.efficiency}%</span>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${module.efficiency >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min(module.efficiency, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        module.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {module.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all">
                        <Edit3 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    orange: "text-orange-600 bg-orange-50",
    slate: "text-slate-600 bg-slate-50"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default ProjectPerformance;