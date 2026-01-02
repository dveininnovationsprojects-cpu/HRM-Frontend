import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar.jsx"; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { 
  User, Lock, Bell, Moon, Sun, Save, ShieldCheck, Home, 
  Monitor, Building2, History, ChevronRight
} from 'lucide-react';

const API_BASE_URL = "http://localhost:8081/api"; // Updated to your Spring Boot port

const Setting = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile State mapped to your EmployeeDTO.java
  const [profile, setProfile] = useState({
    fullName: "",
    email: "", // From UserDTO
    role: "",  // From UserDTO
    department: "",
    position: "",
    id: "", // employeeId
    address: ""
  });

  // Password State mapped to ChangePasswordRequest.java
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: ""
  });

  // 1. FETCH PROFILE: Using your EmployeeController endpoints
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Assuming you store username or userId in localStorage during login
        const username = localStorage.getItem("username"); 
        
        // Step A: Get Employee details via your backend
        // Note: You might need a "get-me" endpoint or use the ID stored in login
        const empId = localStorage.getItem("employeeId"); 
        const response = await axios.get(`${API_BASE_URL}/employees/${empId}`);
        
        setProfile({
          ...response.data,
          fullName: response.data.fullName,
          department: response.data.department,
          position: response.data.position,
          id: response.data.id
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // 2. SAVE PROFILE: Using EmployeeController PUT /{id}
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Mapping to your EmployeeDTO structure
      const updateData = {
        fullName: profile.fullName,
        department: profile.department,
        position: profile.position,
        address: profile.address,
        phone: profile.phone
      };

      await axios.put(`${API_BASE_URL}/employees/${profile.id}`, updateData);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Failed to update profile. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // 3. CHANGE PASSWORD: Using your ChangePasswordRequest DTO
  // Note: Ensure your AuthController has a change-password mapping
  const handleChangePassword = async () => {
    if (!passwords.newPassword || !passwords.oldPassword) {
        return alert("Please fill all password fields");
    }
    setLoading(true);
    try {
      // This matches your ChangePasswordRequest.java fields
      const requestBody = {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      };
      
      await axios.post(`${API_BASE_URL}/auth/change-password`, requestBody);
      alert("Password updated successfully!");
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (error) {
      alert("Error updating password. Verify your current password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#fcfdfe] min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-10">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Home size={14} />
              <ChevronRight size={14} />
              <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900">System Preferences</h2>
            <p className="text-slate-500 text-sm">Configure your personal and organization-wide HRMS environment.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all"
          >
            Exit Settings
          </button>
        </header>

        <div className="flex gap-10">
          <div className="w-72 space-y-1">
            {[
              { id: 'profile', label: 'My Profile', icon: <User size={18}/> },
              { id: 'company', label: 'Organization Profile', icon: <Building2 size={18}/> },
              { id: 'security', label: 'Security & Privacy', icon: <Lock size={18}/> },
              { id: 'notifications', label: 'Push Notifications', icon: <Bell size={18}/> },
              { id: 'appearance', label: 'Interface Settings', icon: <Monitor size={18}/> },
              { id: 'logs', label: 'Audit Logs', icon: <History size={18}/> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-200" 
                  : "bg-transparent text-slate-500 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  {item.label}
                </div>
                {activeTab === item.id && <ChevronRight size={16} />}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/50 p-12 overflow-hidden relative">
            
            {loading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                <p className="font-bold text-blue-600 animate-pulse">Synchronizing with Server...</p>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-center gap-6 mb-10">
                   <div className="w-24 h-24 rounded-full bg-blue-50 border-4 border-white shadow-lg flex items-center justify-center text-blue-600 text-2xl font-black">
                     {profile.fullName?.substring(0, 2).toUpperCase() || "JD"}
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-slate-900">{profile.fullName || "Loading..."}</h3>
                     <p className="text-slate-400 font-medium">{profile.position} • {profile.department}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Employee ID</label>
                    <input type="text" value={profile.id || ""} disabled className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-500 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                    <input 
                      type="text" 
                      value={profile.fullName || ""} 
                      onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-100 transition-all outline-none" 
                    />
                  </div>
                </div>
                <button 
                  onClick={handleSaveProfile} 
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center gap-2"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="animate-in fade-in duration-500">
                <h3 className="text-xl font-black text-slate-900 mb-2">Password & Authentication</h3>
                <p className="text-slate-500 text-sm mb-8">Ensure your account remains secure by updating your password regularly.</p>
                
                <div className="space-y-6 max-w-md">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 mb-6">
                    <ShieldCheck className="text-emerald-500" />
                    <p className="text-xs font-bold text-emerald-800">Security: Use a strong password for your account.</p>
                  </div>
                  <input 
                    type="password" 
                    placeholder="Current Password" 
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                  />
                  <input 
                    type="password" 
                    placeholder="New Password" 
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                  />
                  <button 
                    onClick={handleChangePassword}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all"
                  >
                    Update Credentials
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="animate-in fade-in duration-500">
                <h3 className="text-xl font-black text-slate-900 mb-6">Security Audit Logs</h3>
                <p className="text-slate-400 text-sm">System logs are pulled from the main server audit trails.</p>
              </div>
            )}
            
            {activeTab === 'appearance' && (
              <div className="animate-in fade-in duration-500">
                <h3 className="text-xl font-black text-slate-900 mb-8">Appearance</h3>
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                      {isDarkMode ? <Moon size={24}/> : <Sun size={24}/>}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Visual Theme</p>
                      <p className="text-xs text-slate-500">Switch between light and dark interface</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`w-14 h-8 rounded-full p-1 transition-all ${isDarkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-all transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
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

export default Setting;