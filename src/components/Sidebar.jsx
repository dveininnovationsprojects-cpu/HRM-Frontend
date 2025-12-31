import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, CalendarCheck, FileText,
  CreditCard, UserPlus, Briefcase, Settings as SettingsIcon, LogOut, Bell
} from "lucide-react";

// Logo import
import logo from "../assets/logo-1.png"; 

const Sidebar = ({ pendingRequests = [] }) => {
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);

  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { title: "Employee", icon: <Users size={18} />, path: "/employees" },
    { title: "Attendance", icon: <CalendarCheck size={18} />, path: "/attendance" },
    { title: "Leave", icon: <FileText size={18} />, path: "/admin/leaves" }, 
    { title: "Payroll", icon: <CreditCard size={18} />, path: "/payroll" },
    { title: "Recruitment", icon: <UserPlus size={18} />, path: "/recruitment" },
    { title: "Project Performance", icon: <Briefcase size={18} />, path: "/project-performance" },
    { title: "Settings", icon: <SettingsIcon size={18} />, path: "/setting" },
  ];

  return (
    <div className="w-64 bg-[#020617] h-screen fixed left-0 top-0 text-white p-6 shadow-xl flex flex-col z-50 border-r border-slate-800/50">
      
      {/* Branding Section with Logo Symbol only */}
      <div className="mb-10 flex items-center justify-between relative">
        <div className="flex justify-center">
          <img 
            src={logo} 
            alt="DVein Symbol" 
            className="h-12 w-auto object-contain transition-transform duration-500 hover:scale-110" 
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/40 rounded-lg"
          >
            <Bell size={20} />
            {pendingRequests.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#020617]"></span>
            )}
          </button>

          {showNotif && (
            <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in duration-200">
              <h4 className="px-4 pb-2 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">New Requests</h4>
              <div className="max-h-60 overflow-y-auto">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((req) => (
                    <div key={req.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <p className="text-[11px] font-bold text-slate-800">{req.name} applied {req.type}</p>
                      <p className="text-[9px] text-slate-400">{req.days} days request</p>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-[11px] text-slate-400 italic text-center">No new notifications</p>
                )}
              </div>
              <Link 
                to="/admin/leaves" 
                onClick={() => setShowNotif(false)} 
                className="block text-center pt-2 text-[10px] font-black text-blue-600 uppercase hover:underline"
              >
                View All in Leaves
              </Link>
            </div>
          )}
        </div>
      </div>

      <nav className="space-y-1 flex-grow overflow-y-auto custom-scrollbar">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <span className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"}`}>
                {item.icon}
              </span>
              <span className="text-[13px] font-semibold">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-slate-800/50 mt-auto">
        <Link 
          to="/" 
          className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all group" 
          onClick={() => localStorage.clear()}
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-bold">Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;