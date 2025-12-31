import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, X, Users, Home, Edit, Trash2, Briefcase, Check, UserMinus, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeeDirectory = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]); 
  const [showForm, setShowForm] = useState(false);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false); 
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", dob: "", phone: "", address: "",
    position: "", department: "", experience: "", pastCompany: "",
    ctc: "", doj: "", salary: "", status: "active", role: "Employee",
    shift: "", username: "", email: "" 
  });

  const positions = ["Manager", "HR", "TL", "Software Developer", "Digital Marketer", "Data Analyst", "Data Engineer", "Project Manager", "Accountant", "others"];
  const departments = ["Finance & Accounts", "Marketing", "IT", "Non-IT", "Operation", "others"];
  const shifts = ["Day Shift (9AM - 6PM)", "Night Shift (9PM - 6AM)", "Rotational Shift"];

  useEffect(() => {
    fetchEmployees();
    fetchRequests(); 
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5006/employees");
      const activeEmps = response.data.filter(emp => emp.status === "active");
      setEmployees(activeEmps);
    } catch (err) { console.error("Error fetching data", err); }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5006/employees?status=pending");
      setRequests(response.data);
    } catch (err) { console.error("Error fetching requests", err); }
  };

  const handleAcceptRequest = (req) => {
    setFormData({
      ...formData,
      username: req.username || "",
      firstName: req.username || "", 
      email: req.email || "",
      role: req.role || "Employee",
      status: "active",
      shift: req.shift || "" 
    });
    setCurrentId(req.id); 
    setIsEditing(true); 
    setShowForm(true);
  };

  const handleRejectRequest = async (id) => {
    if (window.confirm("Are you sure you want to REJECT this registration?")) {
      try {
        await axios.delete(`http://localhost:5006/employees/${id}`);
        fetchRequests();
      } catch (err) { alert("Error rejecting request"); }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing || currentId) {
        await axios.put(`http://localhost:5006/employees/${currentId}`, {
            ...formData,
            status: "active"
        });
        alert("Employee Approved & Registration Completed!");
      } else {
        const prefix = ["HR", "Manager", "Admin"].includes(formData.position) ? "ADM" : "EMP";
        const newId = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
        await axios.post("http://localhost:5006/employees", { ...formData, id: newId, status: "active" });
        alert("Employee Created Successfully!");
      }
      setShowForm(false);
      setIsEditing(false);
      setCurrentId(null);
      fetchEmployees();
      fetchRequests();
      resetForm();
    } catch (err) { alert("Error saving employee details"); }
  };

  const handleEdit = (emp) => {
    setFormData(emp);
    setCurrentId(emp.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await axios.delete(`http://localhost:5006/employees/${id}`);
      fetchEmployees();
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "", lastName: "", dob: "", phone: "", address: "",
      position: "", department: "", experience: "", pastCompany: "",
      ctc: "", doj: "", salary: "", status: "active", role: "Employee", shift: "", username: "", email: ""
    });
    setCurrentId(null);
  };

  const hideDepartment = ["HR", "Manager", "Project Manager"].includes(formData.position);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all shadow-sm group">
            <Home size={22} className="text-gray-600 group-hover:text-blue-600" />
          </button>
          <div className="h-8 w-[1px] bg-gray-300"></div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">HR Management Portal</h1>
        </div>

        <div className="flex gap-4">
          {/* UPDATED: Registration Alerts with Name Display */}
          <button 
            onClick={() => setShowRequestsPanel(!showRequestsPanel)}
            className={`relative flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all shadow-sm ${requests.length > 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-white text-gray-400 border border-gray-200'}`}
          >
            <Bell size={20} className={requests.length > 0 ? "animate-bounce" : ""} />
            {requests.length === 0 ? "No New Alerts" : 
             requests.length === 1 ? `Registration: ${requests[0].username}` : 
             `${requests.length} New Registrations`}
            
            {requests.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white font-black">
                {requests.length}
              </span>
            )}
          </button>

          <button onClick={() => { resetForm(); setIsEditing(false); setShowForm(true); }} className="bg-blue-600 text-white px-7 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100">
            <Plus size={20} /> Add Employee
          </button>
        </div>
      </div>

      {/* Registration Alerts Panel */}
      {showRequestsPanel && (
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-bold text-amber-600 mb-4 flex items-center gap-2">
                <Users size={20}/> Registration Alerts ({requests.length})
            </h2>
            {requests.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center text-gray-400 font-medium">
                No pending registration alerts.
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-amber-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-amber-50 text-amber-800">
                          <tr>
                              <th className="p-5 font-bold text-xs uppercase tracking-widest">Candidate Name</th>
                              <th className="p-5 font-bold text-xs uppercase tracking-widest">Email</th>
                              <th className="p-5 font-bold text-xs uppercase tracking-widest text-center">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-50">
                          {requests.map((req) => (
                              <tr key={req.id} className="hover:bg-amber-50/30 transition-all">
                                  <td className="p-5 font-bold text-gray-700">{req.username}</td>
                                  <td className="p-5 text-sm font-semibold text-gray-500">{req.email}</td>
                                  <td className="p-5">
                                      <div className="flex justify-center gap-3">
                                          <button onClick={() => handleAcceptRequest(req)} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700">
                                              <Check size={14}/> Approve & Onboard
                                          </button>
                                          <button onClick={() => handleRejectRequest(req.id)} className="flex items-center gap-1 bg-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-200">
                                              <UserMinus size={14}/> Dismiss
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            )}
        </div>
      )}

      {/* Employee List Table */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-700">Employee Directory</h2>
        <p className="text-gray-500 text-sm italic">Managing {employees.length} active staff members</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1e293b] text-white">
            <tr>
              <th className="p-6 font-bold text-xs uppercase tracking-[0.1em]">Name & ID</th>
              <th className="p-6 font-bold text-xs uppercase tracking-[0.1em]">Dept & Position</th>
              <th className="p-6 font-bold text-xs uppercase tracking-[0.1em]">Work Shift</th>
              <th className="p-6 font-bold text-xs uppercase tracking-[0.1em]">Salary</th>
              <th className="p-6 font-bold text-xs uppercase tracking-[0.1em] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-blue-50/40 transition-all group">
                <td className="p-6">
                  <p className="font-bold text-gray-800">{emp.firstName} {emp.lastName}</p>
                  <p className="text-[10px] font-black text-blue-500 uppercase">{emp.id}</p>
                </td>
                <td className="p-6 text-sm font-semibold text-gray-600">
                  {emp.position} <br/>
                  <span className="text-[10px] font-normal text-gray-400 uppercase tracking-tighter">{emp.department || "Admin Office"}</span>
                </td>
                <td className="p-6">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold">
                    {emp.shift || "Not Assigned"}
                  </span>
                </td>
                <td className="p-6 font-bold text-gray-700 text-sm">₹{emp.salary || emp.ctc}</td>
                <td className="p-6 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleEdit(emp)} className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(emp.id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-7 border-b flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800">{isEditing ? "Finalize Registration" : "New Employee Registration"}</h2>
              <button onClick={() => {setShowForm(false); setIsEditing(false);}} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 overflow-y-auto">
              {/* Section 1: Personal Information */}
              <div className="space-y-6">
                <h3 className="text-blue-600 font-bold uppercase text-[11px] tracking-widest flex items-center gap-2">
                  <Users size={16}/> Section 1: Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-[10px] ml-2 text-gray-400 font-bold mb-1 tracking-widest uppercase">Username (Login Access)</label>
                    <input name="username" value={formData.username} placeholder="Username" required onChange={handleChange} className="w-full border-2 border-blue-50 bg-blue-50/30 p-4 rounded-2xl focus:border-blue-500 outline-none font-bold" />
                  </div>
                  <input name="firstName" value={formData.firstName} placeholder="First Name" required onChange={handleChange} className="border-2 border-gray-100 p-4 rounded-2xl focus:border-blue-500 outline-none" />
                  <input name="lastName" value={formData.lastName} placeholder="Last Name" required onChange={handleChange} className="border-2 border-gray-100 p-4 rounded-2xl focus:border-blue-500 outline-none" />
                  <input name="email" value={formData.email} placeholder="Email" required onChange={handleChange} className="border-2 border-gray-100 p-4 rounded-2xl focus:border-blue-500 outline-none" />
                  <input name="phone" value={formData.phone} placeholder="Contact Number" required onChange={handleChange} className="border-2 border-gray-100 p-4 rounded-2xl outline-none" />
                  <div className="flex flex-col"><label className="text-[10px] ml-2 text-gray-400 font-bold mb-1">DATE OF BIRTH</label>
                  <input name="dob" value={formData.dob} type="date" required onChange={handleChange} className="border-2 border-gray-100 p-4 rounded-2xl outline-none" /></div>
                  <textarea name="address" value={formData.address} placeholder="Residential Address" required onChange={handleChange} className="border-2 border-gray-100 p-4 rounded-2xl md:col-span-2 outline-none min-h-[90px]" />
                </div>
              </div>

              {/* Section 2: Employment Details */}
              <div className="mt-12 space-y-6 border-t pt-10">
                <h3 className="text-blue-600 font-bold uppercase text-[11px] tracking-widest flex items-center gap-2">
                  <Briefcase size={16}/> Section 2: Employment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] ml-2 text-blue-600 font-bold mb-1 uppercase">Assigned Shift (Admin Control)</label>
                    <select name="shift" value={formData.shift} required onChange={handleChange} className="border-2 border-blue-100 bg-blue-50/30 p-4 rounded-2xl outline-none font-bold">
                      <option value="">Choose Shift Timing</option>
                      {shifts.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] ml-2 text-gray-400 font-bold mb-1 uppercase">Position</label>
                    <select name="position" value={formData.position} required onChange={handleChange} className="border-2 border-gray-100 p-4 rounded-2xl outline-none">
                      <option value="">Select Position</option>
                      {positions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  {!hideDepartment && (
                    <select name="department" value={formData.department} required onChange={handleChange} className="border-2 border-blue-50 bg-blue-50/20 p-4 rounded-2xl outline-none">
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  )}

                  <div className="flex flex-col"><label className="text-[10px] ml-2 text-gray-400 font-bold mb-1 uppercase">Joining Date</label>
                  <input name="doj" value={formData.doj} type="date" required onChange={handleChange} className="border-2 border-gray-100 p-4 rounded-2xl outline-none" /></div>
                  
                  <input name="salary" value={formData.salary} placeholder="Monthly Salary (₹)" required onChange={handleChange} className="border-2 border-gray-100 p-4 rounded-2xl outline-none" />
                </div>
              </div>

              <div className="mt-12 flex justify-end gap-5">
                <button type="button" onClick={() => {setShowForm(false); setIsEditing(false);}} className="px-8 py-4 font-bold text-gray-400 hover:text-gray-600 transition-all">Discard</button>
                <button type="submit" className="px-14 py-4 bg-blue-600 text-white font-bold rounded-[1.5rem] shadow-2xl hover:bg-blue-800 transition-all">
                  {isEditing ? "Approve & Finish" : "Create Employee"}
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