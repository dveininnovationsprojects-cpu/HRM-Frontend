import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Play, CheckCircle2, Clock, Calendar, User, 
  Plus, MessageSquare, History, Send, Bell, X, Layout
} from 'lucide-react';

const API_URL = "http://localhost:8080/api";

// Create axios instance to handle Cookies/CORS consistently
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for Cookie-based CORS validation
});

const Projects = () => {
  const [tasks, setTasks] = useState([]);
  const [projectsDropdown, setProjectsDropdown] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  
  // States aligned with Backend Entity
  const [newAssignment, setNewAssignment] = useState({
    projectId: '', 
    moduleName: '', 
    employeeId: '', 
    estimatedHours: '', 
    startDate: '', 
    endDate: ''
  });

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole"); 
  const userId = localStorage.getItem("userId");

  const getHeaders = () => ({ Authorization: `Bearer ${token}` });

  useEffect(() => {
    fetchData();
    if (userRole === 'TL') fetchAdminProjects();
  }, []);

  // 1. Fetching Tasks based on Role
  const fetchData = async () => {
    try {
      // Dynamic routing based on role context
      const endpoint = userRole === 'TL' ? '/tl/team-tasks' : `/employee/my-tasks/${userId}`;
      const res = await api.get(endpoint, { headers: getHeaders() });
      setTasks(res.data);
    } catch (err) { 
      console.error("Fetch Tasks Error:", err); 
    }
  };

  // 2. Fetch Projects uploaded by Admin (for TL Assignment)
  const fetchAdminProjects = async () => {
    try {
      const res = await api.get('/admin/projects-list', { headers: getHeaders() });
      setProjectsDropdown(res.data);
    } catch (err) { 
      console.error("Admin Projects Fetch Error:", err); 
    }
  };

  // 3. Post Daily Update (Employee Work)
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects/daily-update', {
        taskId: selectedTask.id,
        updateText: statusUpdate,
        updatedBy: userId,
        updateDate: new Date().toISOString().split('T')[0] // Backend friendly date
      }, { headers: getHeaders() });
      
      setStatusUpdate("");
      setSelectedTask(null);
      fetchData(); // Refresh list to show new 'lastUpdate'
    } catch (err) { 
      alert(err.response?.data?.message || "Failed to post status update."); 
    }
  };

  // 4. TL Assign Module Logic
  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      // Logic to send new assignment to backend
      await api.post('/tl/assign-task', newAssignment, { headers: getHeaders() });
      alert("Task successfully assigned to resource!");
      setShowAssignForm(false);
      setNewAssignment({ projectId: '', moduleName: '', employeeId: '', estimatedHours: '', startDate: '', endDate: '' });
      fetchData();
    } catch (err) {
      alert("Assignment failed. Check Resource ID or Project status.");
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      
      {/* Header & Notification */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">PROJECT TRACKER</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">
            {userRole === 'TL' ? 'Team Performance Hub' : 'Personal Project Workspace'}
          </p>
        </div>
        
        {userRole === 'TL' && (
          <button 
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-200"
          >
            {showAssignForm ? <X size={18}/> : <Plus size={18}/>}
            {showAssignForm ? "Close Form" : "Assign New Module"}
          </button>
        )}
      </div>

      {/* TL Assign Form */}
      {showAssignForm && userRole === 'TL' && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm mb-10 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Layout className="text-indigo-600" size={20}/> New Task Assignment
          </h3>
          <form onSubmit={handleAssignTask}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Project</label>
                <select 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500 font-medium text-sm"
                  onChange={(e) => setNewAssignment({...newAssignment, projectId: e.target.value})}
                  required
                >
                  <option value="">Choose from Admin Uploads...</option>
                  {projectsDropdown.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Module Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Backend Integration" 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500 text-sm"
                  onChange={(e) => setNewAssignment({...newAssignment, moduleName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assign To (Emp ID)</label>
                <input 
                  type="text" 
                  placeholder="EMP-102" 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500 text-sm"
                  onChange={(e) => setNewAssignment({...newAssignment, employeeId: e.target.value})}
                  required
                />
              </div>
            </div>
            <button type="submit" className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all w-full md:w-auto">Confirm & Dispatch</button>
          </form>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Module Details</th>
              {userRole === 'TL' && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Resource</th>}
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Status Update</th>
              <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Efficiency</th>
              <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Hours</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tasks.map((task) => {
              const eff = task.actualHoursTaken > 0 ? ((task.estimatedHours / task.actualHoursTaken) * 100).toFixed(0) : 100;
              return (
                <tr key={task.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{task.moduleName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{task.projectName}</p>
                  </td>
                  {userRole === 'TL' && (
                    <td className="px-8 py-6 font-bold text-slate-600 text-sm underline decoration-indigo-200 underline-offset-4">{task.empName}</td>
                  )}
                  <td className="px-8 py-6">
                    <p className="text-xs text-slate-500 italic max-w-[220px] truncate">{task.lastUpdate || "No status update yet"}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className={`text-sm font-black ${eff >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{eff}%</span>
                      <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full ${eff >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{width: `${Math.min(eff, 100)}%`}}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center font-bold text-slate-700 text-sm">
                    {task.estimatedHours}h / <span className="text-indigo-600">{task.actualHoursTaken || 0}h</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => setSelectedTask(task)} className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm">
                      <MessageSquare size={18}/>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Update Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Post Daily Status</h2>
            <p className="text-sm text-slate-500 mb-8 font-medium italic underline decoration-indigo-200">Ref: {selectedTask.moduleName}</p>
            <form onSubmit={handleUpdateStatus} className="space-y-6">
              <textarea 
                className="w-full p-6 bg-slate-50 border-none rounded-[2rem] focus:ring-2 ring-indigo-500 h-40 text-sm outline-none resize-none font-medium text-slate-700 shadow-inner"
                placeholder="Briefly describe what you achieved today..."
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                required
              />
              <div className="flex gap-4">
                <button type="button" onClick={() => setSelectedTask(null)} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-900">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-[1.5rem] font-bold hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                  <Send size={18}/> Post Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;