import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Zap, Briefcase, Award, Loader2 } from "lucide-react";

const API_BASE_URL = "http://localhost:8080/api";

const EmployeeDashboard = () => {
  // State for data
  const [stats, setStats] = useState([]);
  const [performers, setPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetching Stats and Performers concurrently
        const [statsRes, performersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/dashboard/stats`, { headers }),
          axios.get(`${API_BASE_URL}/users/top-performers`, { headers })
        ]);

        setStats(statsRes.data);
        setPerformers(performersRes.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Organization Dashboard</h1>
        <p className="text-slate-500 font-medium">Real-time performance and organizational health</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start transition-transform hover:scale-[1.02]">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              <p className={`text-xs font-bold mt-2 ${stat.changeColor || 'text-indigo-600'}`}>{stat.change}</p>
            </div>
            <div className={`p-3 rounded-xl bg-slate-50 text-indigo-600`}>
              {/* Note: Icon logic might need mapping if coming from backend */}
              <Zap size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Top Performers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <Award className="text-yellow-500" size={24} />
          <h2 className="text-xl font-bold text-slate-900">Top Performers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {performers.length > 0 ? performers.map((emp, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{emp.username}</td>
                  <td className="px-6 py-4 text-slate-600">{emp.department}</td>
                  <td className="px-6 py-4 font-black text-indigo-600">{emp.performanceScore}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      emp.performanceScore >= 90 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {emp.performanceScore >= 90 ? 'Exceeding' : 'Meeting'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-400 font-medium">No performer data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;