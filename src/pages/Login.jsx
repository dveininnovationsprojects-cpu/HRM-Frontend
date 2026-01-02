import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bg.jpg";
import logo from "../assets/logo-1.png";

const HRMLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  // API Base URL matches your Spring Boot Controller
  const API_URL = "http://localhost:8080/api/auth";

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const getRedirectPath = (role) => {
    const paths = {
      "Admin": "/dashboard",
      "HR": "/dashboard",
      "Manager": "/dashboard",
      "Employee": "/employee-dashboard"
    };
    return paths[role] || "/employee-dashboard";
  };

  // Check for existing session after splash disappears
  useEffect(() => {
    if (!showSplash) {
      const savedRole = localStorage.getItem("userRole");
      if (savedRole) {
        navigate(getRedirectPath(savedRole));
      }
    }
  }, [navigate, showSplash]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/login`, 
        { 
          username: formData.username, 
          password: formData.password 
        }, 
        { 
          // CRITICAL: Allows browser to receive and send the 'jwt' HttpOnly cookie
          withCredentials: true 
        }
      );

      if (response.data) {
        const user = response.data;

        // UI-level storage (Actual auth is in the HttpOnly Cookie)
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("userName", user.username);

        navigate(getRedirectPath(user.role));
      }
    } catch (err) {
      console.error("Connection Error:", err);
      
      // Error handling strictly for the Login UI
      if (!err.response) {
        setError("Server connection failed. Is the Backend Server running?");
      } else if (err.response.status === 401 || err.response.status === 403) {
        setError("Invalid username or password.");
      } else {
        setError(err.response.data?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const commonBackgroundStyle = {
    backgroundImage: `linear-gradient(rgba(255, 253, 253, 0.68), rgba(5, 2, 31, 0.84)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  // --- 1. SPLASH SCREEN (Clean - No Errors) ---
  if (showSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" 
           style={commonBackgroundStyle}>
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 blur-[100px] rounded-full animate-[float_10s_infinite_alternate]"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="animate-[scaleIn_1s_ease-out] p-6 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white/50">
            <img src={logo} alt="DVein Logo" className="h-25 w-auto object-contain" />
          </div>
          <div className="mt-10 text-center">
            <h1 className="text-4xl font-black text-white tracking-[0.5em] uppercase">DVein</h1>
            <p className="mt-2 text-white text-[12px] font-bold tracking-[0.8em] uppercase opacity-90">Innovations</p>
          </div>
          <div className="mt-16 w-64 h-[3px] bg-white/20 rounded-full overflow-hidden relative">
            <div className="absolute h-full bg-gradient-to-r from-transparent via-white to-transparent w-full animate-[shimmer_1.5s_infinite]"></div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes float { from { transform: translate(0,0); } to { transform: translate(5%, 10%); } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        `}} />
      </div>
    );
  }

  // --- 2. LOGIN FORM (Handles Error Messaging) ---
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={commonBackgroundStyle}>
      <div className="max-w-md w-full space-y-5 p-10 bg-white rounded-3xl shadow-2xl">
        <div className="text-center">
          <img src={logo} alt="Logo" className="h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">DVein Innovations</h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">HRM Portal</p>
        </div>

        {/* Server Errors shown here only */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[11px] text-center font-bold border border-red-100">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-bold text-gray-400 ml-1 mb-1 block uppercase">Username</label>
            <input 
              name="username" 
              type="text" 
              required 
              className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
              placeholder="Enter username" 
              value={formData.username} 
              onChange={handleChange} 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 ml-1 mb-1 block uppercase">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange} 
            />
          </div>

          <div className="flex justify-end pr-1">
            <button 
              type="button" 
              onClick={() => navigate("/forgot-password")} 
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              FORGOT PASSWORD?
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-4 rounded-xl text-white font-bold text-sm transition-all shadow-lg active:scale-95 ${loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700 shadow-blue-400/30"}`}
          >
            {loading ? "AUTHENTICATING..." : "LOG IN"}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600 font-medium">
            New User? 
            <button 
              type="button" 
              onClick={() => navigate("/register")} 
              className="text-blue-600 font-black hover:underline ml-1"
            >
              Register Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
export default HRMLogin;