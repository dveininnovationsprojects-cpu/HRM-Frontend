import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Clock, CheckCircle2, Search, Home, Loader2, 
  Edit3, X, ChevronRight, PlusCircle, Briefcase, UserCheck
} from 'lucide-react';

const ProjectPerformance = () => {
  const navigate = useNavigate();
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New States for Assignment Form
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({
    projectId: '',
    tlId: '',
    deadline: ''
  });

  // Modal State for Designation Update
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const API_URL = "http://localhost:8080/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // 1. Fetch performance data
      const perfRes = await axios.get(`${API_URL}/tl/all-assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerformanceData(perfRes.data);

      // 2. Fetch Projects for dropdown
      const projRes = await axios.get(`${API_URL}/admin/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projRes.data);

      // 3. Fetch Team Leaders for dropdown
      const tlRes = await axios.get(`${API_URL}/admin/team-leaders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamLeaders(tlRes.data);

    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // POST request to your backend to link project to TL
      await axios.post(`${API_URL}/admin/assign-project`, assignmentForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAssignModalOpen(false);
      fetchInitialData(); // Refresh list
      alert("Project Assigned Successfully!");
    } catch (err) {
      alert("Error assigning project. Check if the TL is already assigned.");
    } finally {
      setUpdating(false);
    }
  };

  const calculateEfficiency = (est, act) => {
    if (!act || act === 0) return 0;
    const eff = (est / act) * 100;
    return eff > 150 ? 150 : eff.toFixed(1);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-500 font-bold animate-pulse uppercase tracking-tighter">Initializing Environment...</p>
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
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Management</h1>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span>Admin Console</span>
                <ChevronRight size={14} />
                <span className="text-blue-600 font-bold">Allocation Control</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search TL or Project..." 
                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none w-full md:w-72 shadow-sm focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* NEW ASSIGN BUTTON */}
            <button 
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <PlusCircle size={18} />
              Assign Project
            </button>
          </div>
        </div>
      </div>

      {/* PROJECT ASSIGNMENT MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <Briefcase size={20} />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Assign New Project</h3>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleAssignSubmit} className="p-10 space-y-6">
              {/* Project Selection */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Project</label>
                <select 
                  required
                  className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={assignmentForm.projectId}
                  onChange={(e) => setAssignmentForm({...assignmentForm, projectId: e.target.value})}
                >
                  <option value="">Choose Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                </select>
              </div>

              {/* Team Leader Selection */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Team Leader</label>
                <select 
                  required
                  className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={assignmentForm.tlId}
                  onChange={(e) => setAssignmentForm({...assignmentForm, tlId: e.target.value})}
                >
                  <option value="">Select Leader</option>
                  {teamLeaders.map(tl => <option key={tl.id} value={tl.id}>{tl.fullName}</option>)}
                </select>
              </div>

              {/* Deadline */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Deadline</label>
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
                {updating ? 'Processing...' : 'Initialize Assignment'}
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project/Module</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Efficiency</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Leader</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {performanceData.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No active assignments found</td>
                </tr>
              ) : (
                performanceData
                  .filter(p => p.employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || p.module?.project?.projectName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {item.employee.fullName.charAt(0)}
                        </div>
                        <p className="font-bold text-slate-900">{item.employee.fullName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-xs font-black text-blue-600 uppercase mb-1">{item.module?.project?.projectName}</p>
                      <p className="text-sm font-bold text-slate-700">{item.module?.moduleName}</p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-sm font-black text-slate-900">{calculateEfficiency(item.module?.estimatedHours, item.actualHoursTaken)}%</span>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${calculateEfficiency(item.module?.estimatedHours, item.actualHoursTaken)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <UserCheck size={14} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-600">{item.module?.project?.teamLeader?.fullName || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => navigate(`/employee-profile/${item.employee.id}`)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all">
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

export default ProjectPerformance;