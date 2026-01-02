import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Home, BookOpen, Users, Award, Send, CheckCircle2, 
  TrendingUp, ClipboardList, UserCheck, Star, Loader2 
} from 'lucide-react';

// Configure Axios for CORS
const API_BASE_URL = "http://localhost:8081/api";
axios.defaults.withCredentials = true;

const TrainingSystem = () => {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('dashboard');
  const [userDesignation, setUserDesignation] = useState(''); // TRAINER, TRAINEE, MANAGER
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [batches, setBatches] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Form States
  const [batchForm, setBatchForm] = useState({ trainerId: '', traineeIds: [], batchName: '', endDate: '' });
  const [taskForm, setTaskForm] = useState({ moduleName: '', deadline: '' });
  const [scoreForm, setScoreForm] = useState({ traineeId: '', score: '' });

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // In real scenario, get designation from Auth context
      // For now, fetching batches and rank data
      const [batchRes, employeeRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/manager/view-batches`),
        axios.get(`${API_BASE_URL}/employees`)
      ]);
      setBatches(batchRes.data);
      setEmployees(employeeRes.data);
      
      // Assuming we determine user status from first employee match for demo
      setUserDesignation('TRAINER'); // Placeholder: Dynamic logic here
    } catch (err) {
      console.error("Connection Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 1. MANAGER: CREATE BATCH ---
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.append('trainerId', batchForm.trainerId);
    batchForm.traineeIds.forEach(id => params.append('traineeIds', id));
    params.append('batchName', batchForm.batchName);
    params.append('endDate', batchForm.endDate);

    try {
      await axios.post(`${API_BASE_URL}/manager/create-batch`, params);
      alert("Batch successfully created and trainer assigned!");
      fetchInitialData();
    } catch (err) { alert("Batch creation failed"); }
  };

  // --- 2. TRAINER: POST DAILY TASK ---
  const handlePostTask = async (e) => {
    e.preventDefault();
    try {
      // Logic calls TaskAssignment API
      await axios.post(`${API_BASE_URL}/trainer/assign-task`, taskForm);
      alert("Today's Task Module broadcasted to all Trainees!");
      setTaskForm({ moduleName: '', deadline: '' });
    } catch (err) { alert("Task post failed"); }
  };

  // --- 3. TRAINEE: LOG WORK ---
  const handleLogDailyWork = async (taskId, hours, remarks) => {
    try {
      await axios.put(`${API_BASE_URL}/employee/tasks/${taskId}/log`, null, {
        params: { hours, remarks }
      });
      alert("Daily work notes uploaded successfully!");
    } catch (err) { alert("Logging failed"); }
  };

  // --- 4. MANAGER: PROMOTION LOGIC ---
  const promoteEmployee = async (empId) => {
    try {
      await axios.put(`${API_BASE_URL}/manager/update-designation`, null, {
        params: { employeeId: empId, status: 'PERMANENT' }
      });
      alert("Employee promoted to Permanent role!");
      fetchInitialData();
    } catch (err) { alert("Promotion failed"); }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-500 font-bold uppercase text-xs">Validating Access...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-black text-xl tracking-tighter text-blue-600 italic">HRM.PRO</h1>
            <nav className="flex gap-2">
              <NavBtn active={view === 'dashboard'} onClick={() => setView('dashboard')} label="Dashboard" />
              <NavBtn active={view === 'training'} onClick={() => setView('training')} label="Training Hub" />
              <NavBtn active={view === 'ranking'} onClick={() => setView('ranking')} label="Leaderboard" />
            </nav>
          </div>
          <div className="flex items-center gap-3">
             <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
               Mode: {userDesignation}
             </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* VIEW: TRAINING HUB (Dynamic based on Role) */}
        {view === 'training' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* MANAGER SECTION: BATCH CREATION */}
            {userDesignation === 'MANAGER' && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                  <Users className="text-blue-600" /> Create Training Batch
                </h2>
                <form onSubmit={handleCreateBatch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Batch Name (e.g. Java Winter 2024)" 
                    className="p-4 bg-slate-50 rounded-2xl outline-none"
                    onChange={e => setBatchForm({...batchForm, batchName: e.target.value})}
                  />
                  <input 
                    type="date" 
                    className="p-4 bg-slate-50 rounded-2xl outline-none"
                    onChange={e => setBatchForm({...batchForm, endDate: e.target.value})}
                  />
                  <select 
                    className="p-4 bg-slate-50 rounded-2xl outline-none"
                    onChange={e => setBatchForm({...batchForm, trainerId: e.target.value})}
                  >
                    <option>Select Trainer</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                  </select>
                  <button type="submit" className="bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all">
                    Assign Trainer & Create Batch
                  </button>
                </form>
              </div>
            )}

            {/* TRAINER SECTION: POSTING TASKS & ASSESSMENT */}
            {userDesignation === 'TRAINER' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-orange-600">
                    <Send size={20} /> Daily Module Post
                  </h2>
                  <textarea 
                    placeholder="Describe Today's Task Module..."
                    className="w-full p-4 bg-slate-50 rounded-2xl h-32 mb-4 outline-none border-none"
                    value={taskForm.moduleName}
                    onChange={e => setTaskForm({...taskForm, moduleName: e.target.value})}
                  />
                  <button onClick={handlePostTask} className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all">
                    BROADCAST TO TRAINEES
                  </button>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-emerald-600">
                    <Star size={20} /> Manual Score Upload
                  </h2>
                  <div className="space-y-4">
                    <select className="w-full p-4 bg-slate-50 rounded-2xl border-none">
                      <option>Select Trainee from Batch</option>
                      {/* Mapping trainees from assigned batch */}
                    </select>
                    <input type="number" placeholder="Assessment Score (0-100)" className="w-full p-4 bg-slate-50 rounded-2xl border-none" />
                    <button className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl">UPDATE SCORE</button>
                  </div>
                </div>
              </div>
            )}

            {/* TRAINEE SECTION: DAILY WORK LOG */}
            {userDesignation === 'TRAINEE' && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-blue-600">
                  <ClipboardList size={20} /> Today's Work Journal
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-xs font-black text-blue-500 uppercase mb-1">Assigned Task</p>
                    <p className="font-bold text-slate-800">"React SpringBoot Integration & CRUD API"</p>
                  </div>
                  <textarea 
                    placeholder="Write your work notes here..."
                    className="w-full p-4 bg-slate-50 rounded-2xl h-40 outline-none border-none"
                  />
                  <button className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl">SUBMIT WORK NOTES</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: RANKING & PROMOTION */}
        {view === 'ranking' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Training Leaderboard</h2>
                <p className="text-sm text-slate-500 font-medium">Automatic rank calculation based on assessment scores</p>
              </div>
              <Award className="text-amber-500" size={40} />
            </div>
            <div className="p-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Avg Score</th>
                    <th className="px-6 py-4">Promotion Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {/* Sample Mock Data Mapping RankingDTO */}
                  {[
                    { rank: 1, name: 'Arun Kumar', score: 92, id: 101 },
                    { rank: 2, name: 'Priya Dharshini', score: 88, id: 102 },
                    { rank: 3, name: 'Siva Rama', score: 74, id: 103 },
                  ].map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-black text-blue-600 text-lg">#{row.rank}</td>
                      <td className="px-6 py-4 font-bold">{row.name}</td>
                      <td className="px-6 py-4">
                        <span className="font-black">{row.score}%</span>
                      </td>
                      <td className="px-6 py-4">
                        {row.score > 85 ? (
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Eligible</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {userDesignation === 'MANAGER' && row.score > 85 && (
                          <button 
                            onClick={() => promoteEmployee(row.id)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-600 transition-all"
                          >
                            PROMOTE
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const NavBtn = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
      active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    {label.toUpperCase()}
  </button>
);

export default TrainingSystem;