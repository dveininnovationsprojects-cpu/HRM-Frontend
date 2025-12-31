import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bg.jpg"; 

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "" 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) return alert("Please select a role!");

    setLoading(true);

    try {
      // UPDATED: Post to Spring Boot (8080) with Credentials for Cookie Support
      const response = await axios.post("http://localhost:8080/api/auth/register", formData, {
        withCredentials: true
      });

      // Backend status code validation
      if (response.status === 200 || response.status === 201) {
        alert("Registration Successful! Redirecting to login...");
        navigate("/login");
      }
    } catch (err) {
      console.error("API Error:", err);
      const errorMsg = err.response?.data?.message || "Registration failed. Check server connection.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(20, 13, 33, 0.84)), url(${bgImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }}>
      
      <div className="max-w-sm w-full p-8 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
            DVein Innovations
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
            Create HRM Account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <input 
            name="username" type="text" placeholder="Username" 
            value={formData.username} onChange={handleChange} required 
            className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-gray-50/50" 
          />
          
          <input 
            name="email" type="email" placeholder="Email Address" 
            value={formData.email} onChange={handleChange} required 
            className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-gray-50/50" 
          />

          <input 
            name="password" type="password" placeholder="Password" 
            value={formData.password} onChange={handleChange} required 
            autoComplete="new-password"
            className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-gray-50/50" 
          />

          <select 
            name="role" value={formData.role} onChange={handleChange} required 
            className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-gray-50/50 text-gray-600 cursor-pointer"
          >
            <option value="">-- Select Role --</option>
            <option value="Admin">Admin</option>
            <option value="HR">HR</option>
            <option value="Manager">Manager</option>
            <option value="TL">Team Lead (TL)</option>
            <option value="Employee">Employee</option>
          </select>

          <button 
            type="submit" disabled={loading}
            className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 mt-2 ${
              loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
            }`}
          >
            {loading ? "Registering..." : "REGISTER NOW"}
          </button>
        </form>

        <div className="pt-6 mt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600 font-medium">
            Already have an account? 
            <button 
              type="button" 
              onClick={() => navigate("/login")} 
              className="text-blue-600 font-bold hover:underline ml-1"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;