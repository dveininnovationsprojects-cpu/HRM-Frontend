import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, X, Users, Home, Edit, Trash2, Briefcase, Check, UserMinus, Bell, Fingerprint } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Backend base URL
const API_BASE_URL = "http://localhost:8080/api";

const EmployeeDirectory = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]); // Pending approvals
  const [showForm, setShowForm] = useState(false);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Aligned with your Backend EmployeeDTO and Entity
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    designationStatus: "PERMANENT", // PERMANENT, TRAINEE, TRAINER
    biometricId: "", // Critical for your attendance backend
    salary: "",
    joiningDate: "",
    status: "ACTIVE",
    role: "EMPLOYEE"
  });

  const departments = ["Finance & Accounts", "Marketing", "IT", "HR", "Operation"];
  const designations = ["TRAINEE", "TRAINER", "PERMANENT"];

  useEffect(() => {
    fetchEmployees();
    fetchRequests();
  }, []);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  // Fetching all active employees from your EmployeeController
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/employees`, { headers: getHeaders() });
      setEmployees(res.data);
    } catch (err) { console.error("Error fetching employees", err); }
  };

  // Logic for 'Pending' users (Users who registered but aren't employees yet)
  const fetchRequests = async () => {
    try {
      // Assuming you have a filter for non-onboarded users
      const res = await axios.get(`${API_BASE_URL}/admin/pending-approvals`, { headers: getHeaders() });
      setRequests(res.data);
    } catch (err) { console.error("Error fetching requests", err); }
  };

  const handleAcceptRequest = (req) => {
    setFormData({
      ...formData,
      fullName: req.fullName || "",
      email: req.email || "",
      role: req.role || "EMPLOYEE",
      status: "ACTIVE"
    });
    setCurrentId(req.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Aligned with ManagerController.java update-designation or EmployeeController update
        await axios.put(`${API_BASE_URL}/employees/${currentId}`, formData, { headers: getHeaders() });
        alert("Employee Profile Updated!");
      } else {
        // Create new employee
        await axios.post(`${API_BASE_URL}/employees`, formData, { headers: getHeaders() });
        alert("Employee Created Successfully!");
      }
      setShowForm(false);
      fetchEmployees();
      resetForm();
    } catch (err) { alert("Action failed: " + (err.response?.data?.message || "Server Error")); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This will remove the employee from the system.")) {
      try {
        await axios.delete(`${API_BASE_URL}/employees/${id}`, { headers: getHeaders() });
        fetchEmployees();
      } catch (err) { alert("Error deleting employee"); }
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "", email: "", phone: "", address: "",
      department: "", designationStatus: "PERMANENT",
      biometricId: "", salary: "", joiningDate: "", status: "ACTIVE", role: "EMPLOYEE"
    });
    setCurrentId(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">CoreSync Directory</h1>
          <p className="text-slate-500 font-medium italic">Backend-Synchronized Staff Records</p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setShowRequestsPanel(!showRequestsPanel)}
            className="relative p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Bell size={24} />
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {requests.length}
              </span>
            )}
          </button>
          
          <button onClick={() => { resetForm(); setIsEditing(false); setShowForm(true); }} 
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
            <Plus size={20} /> Add Staff Member
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Employees</p>
          <h3 className="text-3xl font-black text-slate-900">{employees.length}</h3>
        </div>
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-sm">
          <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Active Trainees</p>
          <h3 className="text-3xl font-black text-indigo-700">
            {employees.filter(e => e.designationStatus === "TRAINEE").length}
          </h3>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="p-6 font-bold text-[10px] uppercase tracking-widest">Employee & ID</th>
              <th className="p-6 font-bold text-[10px] uppercase tracking-widest">Department</th>
              <th className="p-6 font-bold text-[10px] uppercase tracking-widest">Status</th>
              <th className="p-6 font-bold text-[10px] uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black">
                      {emp.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{emp.fullName}</p>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">BIO: {emp.biometricId || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <p className="text-sm font-bold text-slate-600">{emp.department}</p>
                  <p className="text-[10px] text-slate-400 uppercase">{emp.role}</p>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${
                    emp.designationStatus === 'TRAINEE' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {emp.designationStatus}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => { setFormData(emp); setCurrentId(emp.id); setIsEditing(true); setShowForm(true); }} 
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(emp.id)} 
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-8 border-b flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800">
                {isEditing ? `Update ${formData.fullName}` : "Onboard New Staff"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-all"><X size={28}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
              {/* Section: System Identity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Biometric / Payroll ID</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-4 text-slate-400" size={18} />
                    <input name="biometricId" value={formData.biometricId} onChange={handleChange} required 
                      className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl focus:border-indigo-500 outline-none font-bold" 
                      placeholder="e.g. BIO-9902" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Designation Status</label>
                  <select name="designationStatus" value={formData.designationStatus} onChange={handleChange} required 
                    className="w-full bg-indigo-50 border-2 border-indigo-100 p-4 rounded-2xl outline-none font-bold text-indigo-700">
                    {designations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Section: Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input name="fullName" value={formData.fullName} onChange={handleChange} required className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none" placeholder="Full Name" />
                <input name="email" value={formData.email} onChange={handleChange} required className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none" placeholder="Corporate Email" />
                <select name="department" value={formData.department} onChange={handleChange} required className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none">
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input name="salary" value={formData.salary} onChange={handleChange} required className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none" placeholder="Salary (Monthly)" />
              </div>

              <div className="pt-6 border-t flex justify-end gap-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
                <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-100">
                  {isEditing ? "Save Changes" : "Confirm Onboarding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;