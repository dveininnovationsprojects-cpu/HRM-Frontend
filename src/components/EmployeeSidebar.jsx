import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/logo-1.png"; 
import { 
  LayoutDashboard, CalendarCheck, FileText, Settings, 
  LogOut, BarChart3, ChevronRight, Briefcase, Award, Bell
} from "lucide-react";

const API_URL = "http://localhost:8080/api";

const EmployeeSidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: localStorage.getItem("userName") || "User",
    role: localStorage.getItem("userRole") || "EMPLOYEE",
    designation: ""
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchFullProfile = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (token && userId) {
        try {
          const headers = { Authorization: `Bearer ${token}` };
          
          // Fetching from EmployeeController /api/employees/{id}
          const res = await axios.get(`${API_URL}/employees/${userId}`, { headers });
          
          setUser({ 
            name: res.data.fullName, 
            role: localStorage.getItem("userRole"), 
            designation: res.data.designationStatus // e.g., TRAINEE, TRAINER
          });

          // Fetch notifications count based on NotificationController
          const notifyRes = await axios.get(`${API_URL}/notifications/unread`, { headers });
          setUnreadCount(notifyRes.data.length);

        } catch (err) {
          console.error("Sidebar sync error:", err);
        }
      }
    };
    fetchFullProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  // Base items for all employees
  const navItems = [
    { to: "/employee-dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard", end: true },
    { to: "/employee/tasks", icon: <Briefcase size={18} />, label: "My Modules" },
    { to: "/employee/attendance", icon: <CalendarCheck size={18} />, label: "Attendance" },
    { to: "/employee/leave", icon: <FileText size={18} />, label: "Leave Requests" },
  ];

  // Logic for Team Leads or Managers (Based on ManagerController)
  const isManagement = ["TL", "TEAM_LEAD", "MANAGER", "ADMIN"].includes(user.role);
  if (isManagement) {
    navItems.splice(2, 0, { 
      to: "/project-performance", 
      icon: <BarChart3 size={18} />, 
      label: "Project Analytics" 
    });
  }

  // Logic for Trainees (Based on EmployeeRankDTO)
  if (user.designation === "TRAINEE") {
    navItems.push({ 
      to: "/trainee-rankings", 
      icon: <Award size={18} />, 
      label: "My Rankings" 
    });
  }

  navItems.push({ to: "/employee-setting", icon: <Settings size={18} />, label: "Settings" });

  return (
    <div className="w-64 bg-[#0f172a] min-h-screen text-slate-300 flex flex-col fixed left-0 top-0 border-r border-slate-800 shadow-2xl z-50 font-sans">
      
      {/* Logo Section */}
      <div className="p-8 flex items-center justify-center">
        <img 
          src={Logo} 
          alt="CoreSync Logo" 
          className="h-12 w-auto object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = '<h1 class="text-white font-black text-2xl">CORE<span class="text-indigo-500">SYNC</span></h1>';
          }}
        />
      </div>

      {/* User Profile Card */}
      <div className="px-4 mb-6">
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-center gap-3 relative">
          <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-white truncate">{user.name}</h2>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
              {user.designation || user.role}
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-[#0f172a]">
              {unreadCount}
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink 
            key={item.to}
            to={item.to} 
            end={item.end}
            className={({isActive}) => 
              `group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon} <span>{item.label}</span>
            </div>
            <ChevronRight size={14} className={`transition-transform duration-300 ${isActive ? 'rotate-90' : 'opacity-0 group-hover:opacity-100'}`} />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 mt-auto border-t border-slate-800/50">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut size={18} /> Logout 
        </button>
      </div>
    </div>
  );
};

export default EmployeeSidebar;