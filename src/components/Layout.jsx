import React from "react";
import Sidebar from "./Sidebar";
import { ChevronLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Layout = ({ children, title }) => {
  const navigate = useNavigate();

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64">
        {/* Top Professional Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-600">
              <Home size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
          </div>
          <div className="text-xs font-medium text-slate-400 uppercase tracking-widest">
            DVein Innovations / {title}
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;