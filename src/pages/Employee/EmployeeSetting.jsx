import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, Lock, Moon, Sun, Save, ShieldCheck, 
  Monitor, Camera, ArrowLeft, Mail, Briefcase, 
  BadgeCheck, Smartphone, Key, Loader2
} from 'lucide-react';

const API_BASE_URL = "http://localhost:8080/api";

const EmployeeSetting = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // 1. THEME STATE (LocalStorage la irunthu load aagum)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [profile, setProfile] = useState({
    username: "", email: "", role: "", department: "", employeeID: ""
  });

  // 2. SECURITY STATES
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Apply Theme Effect (Body tag la dark class add pannum)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Fetch Profile on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/users/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setIs2FAEnabled(res.data.twoFactorEnabled || false);
      } catch (err) { 
        console.error("Profile Fetch Error:", err); 
      }
    };
    fetchProfile();
  }, []);

  // 3. PASSWORD CHANGE LOGIC
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
        alert("New passwords do not match!");
        return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/users/change-password`, {
        currentPassword: passwords.old,
        newPassword: passwords.new
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Password updated successfully!");
      setPasswords({ old: "", new: "", confirm: "" });
    } catch (err) { 
      alert(err.response?.data?.message || "Password update failed."); 
    } finally { 
      setLoading(false); 
    }
  };

  // 4. 2FA TOGGLE WITH EMAIL TRIGGER LOGIC
  const toggle2FA = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      // Backend API call - Ithu backend la mail trigger pannum
      const response = await axios.post(`${API_BASE_URL}/users/toggle-2fa`, 
        { userId, enabled: !is2FAEnabled }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setIs2FAEnabled(!is2FAEnabled);
        const msg = !is2FAEnabled 
          ? "2FA Enabled! Check your email for confirmation." 
          : "2FA Disabled successfully.";
        alert(msg);
      }
    } catch (err) { 
      alert("Security update failed. Please try again."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* NAVIGATION BAR */}
      <nav className={`border-b px-8 py-4 sticky top-0 z-50 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-all">
              <ArrowLeft size={20} className="text-indigo-600"/>
            </button>
            <h1 className="text-xl font-black tracking-tighter uppercase">HRMS <span className="text-indigo-600">Settings</span></h1>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 transition-all hover:ring-2 ring-indigo-500">
            {isDarkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-slate-600"/>}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* SIDEBAR TABS */}
          <div className="w-full lg:w-72 space-y-2">
            {[
              { id: 'profile', label: 'My Profile', icon: <User size={18}/> },
              { id: 'security', label: 'Security & 2FA', icon: <Lock size={18}/> },
              { id: 'appearance', label: 'Theme Settings', icon: <Monitor size={18}/> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                  ? "bg-indigo-600 text-white shadow-xl translate-x-2" 
                  : "bg-transparent text-slate-500 hover:bg-indigo-50 dark:hover:bg-slate-800"
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {/* CONTENT AREA */}
          <div className={`flex-1 rounded-[3rem] p-8 md:p-12 transition-all shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border border-slate-800 shadow-none' : 'bg-white border-slate-100'}`}>
            
            {loading && (
              <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm z-10 flex items-center justify-center rounded-[3rem]">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
              </div>
            )}

            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-2xl font-black mb-8">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</label>
                      <input type="text" readOnly value={profile.username} className={`w-full p-4 rounded-2xl outline-none font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50'}`} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Official Email</label>
                      <input type="text" readOnly value={profile.email} className={`w-full p-4 rounded-2xl outline-none font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50'}`} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Department</label>
                      <input type="text" readOnly value={profile.department} className={`w-full p-4 rounded-2xl outline-none font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50'}`} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Employee ID</label>
                      <input type="text" readOnly value={profile.employeeID} className={`w-full p-4 rounded-2xl outline-none font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50'}`} />
                   </div>
                </div>
              </div>
            )}

            {/* TAB 2: SECURITY (PASSWORD & 2FA) */}
            {activeTab === 'security' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12">
                <section>
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-indigo-600"><Key size={20}/> Change Credentials</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <input 
                        type="password" 
                        placeholder="Current Password" 
                        required 
                        className={`w-full p-4 rounded-xl outline-none transition-all focus:ring-2 ring-indigo-500 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`} 
                        onChange={e => setPasswords({...passwords, old: e.target.value})} 
                    />
                    <input 
                        type="password" 
                        placeholder="New Password" 
                        required 
                        className={`w-full p-4 rounded-xl outline-none transition-all focus:ring-2 ring-indigo-500 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`} 
                        onChange={e => setPasswords({...passwords, new: e.target.value})} 
                    />
                    <input 
                        type="password" 
                        placeholder="Confirm New Password" 
                        required 
                        className={`w-full p-4 rounded-xl outline-none transition-all focus:ring-2 ring-indigo-500 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`} 
                        onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                    />
                    <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                        Update Password
                    </button>
                  </form>
                </section>

                <hr className={isDarkMode ? 'border-slate-800' : 'border-slate-100'} />

                {/* 2FA EMAIL TOGGLE */}
                <section className={`p-8 rounded-[2rem] border-2 transition-all ${is2FAEnabled ? 'border-green-500/50 bg-green-500/5' : 'border-slate-200 dark:border-slate-800'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex gap-4">
                      <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30"><Smartphone size={28}/></div>
                      <div>
                        <h4 className="font-black text-lg">Two-Step Verification</h4>
                        <p className="text-sm text-slate-500 max-w-xs">Enable this to receive a secure code via email every time you log in.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase ${is2FAEnabled ? 'text-green-500' : 'text-slate-400'}`}>
                            {is2FAEnabled ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                            onClick={toggle2FA}
                            className={`w-16 h-9 rounded-full p-1.5 transition-all duration-300 ${is2FAEnabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${is2FAEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* TAB 3: APPEARANCE (THEME) */}
            {activeTab === 'appearance' && (
              <div className="animate-in fade-in duration-500">
                 <h3 className="text-2xl font-black mb-8">Interface Theme</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button 
                      onClick={() => setIsDarkMode(false)}
                      className={`p-8 rounded-[2.5rem] border-4 flex flex-col items-center text-center transition-all ${!isDarkMode ? 'border-indigo-600 bg-indigo-50/10' : 'border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'}`}
                    >
                      <Sun className={`mb-4 ${!isDarkMode ? 'text-indigo-600' : 'text-slate-400'}`} size={48}/>
                      <h4 className="font-black text-lg">Light Mode</h4>
                      <p className="text-xs text-slate-500 mt-1">Best for bright environments</p>
                    </button>
                    
                    <button 
                      onClick={() => setIsDarkMode(true)}
                      className={`p-8 rounded-[2.5rem] border-4 flex flex-col items-center text-center transition-all ${isDarkMode ? 'border-indigo-600 bg-indigo-600/10' : 'border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-slate-700'}`}
                    >
                      <Moon className={`mb-4 ${isDarkMode ? 'text-indigo-400' : 'text-slate-400'}`} size={48}/>
                      <h4 className="font-black text-lg">Dark Mode</h4>
                      <p className="text-xs text-slate-500 mt-1">Easier on the eyes at night</p>
                    </button>
                 </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeSetting;