import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo-1.png"; 

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", formData, {
        withCredentials: true 
      });
      
      if (response.data) {
        const { role, id, username } = response.data;
        localStorage.setItem("userRole", role);
        localStorage.setItem("userId", id);
        localStorage.setItem("userName", username);
        
        if (role === "Admin" || role === "Manager") navigate("/project-performance");
        else navigate("/employee-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      {/* The Login Card */}
      <div className="w-full max-w-[400px] p-10 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        
        {/* Branding Area */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Logo" className="h-9 mb-4 grayscale opacity-80" />
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Login to Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">Enter your credentials to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5 ml-1">Username</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-300"
              placeholder="e.g. naveen_dev"
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-300"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-lg font-medium text-sm transition-all mt-4 shadow-sm"
          >
            {loading ? "Please wait..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <span className="text-xs text-slate-400">DVein Innovations © 2025</span>
        </div>
      </div>
    </div>
  );
};

export default Login;