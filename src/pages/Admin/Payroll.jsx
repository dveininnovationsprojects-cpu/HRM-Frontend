import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Users, Upload, LayoutDashboard, FileSpreadsheet, 
  Home, FileText, Banknote, Search, Trash2, TrendingUp, DollarSign,
  Printer, ChevronRight, Percent, Award, ArrowLeft, ShieldCheck, Download
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];

export default function PayrollSystem() {
  // State for Data
  const [activePage, setActivePage] = useState('Dashboard');
  const [payrollData, setPayrollData] = useState([]);
  const [stats, setStats] = useState({ deptData: [], salaryData: [], totalCTC: 0, avgSalary: 0 });
  
  // State for UI/Filters
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(2025);
  const [incrementValue, setIncrementValue] = useState(0);

  // Axios Config (Assuming JWT is stored in localStorage)
  const api = axios.create({
    baseURL: 'http://localhost:8080/api/payroll',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  // --- API CALLS ---

  const fetchPayrollData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [viewRes, statsRes] = await Promise.all([
        api.get(`/view?month=${month}&year=${year}`),
        api.get(`/analytics?month=${month}&year=${year}`)
      ]);
      setPayrollData(viewRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

  const handleBankUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', month);
    formData.append('year', year);

    try {
      setIsLoading(true);
      await api.post('/upload-bank', formData);
      alert("Bank status updated!");
      fetchPayrollData();
    } catch (err) {
      alert("Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async (id) => {
    try {
      const response = await api.get(`/download/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("PDF generation failed");
    }
  };

  const applyIncrement = async (empId) => {
    try {
      await api.post(`/increment?empId=${empId}&percent=${incrementValue}`);
      alert("Increment Applied!");
      fetchPayrollData();
    } catch (err) {
      alert("Failed to apply increment");
    }
  };

  // --- RENDER HELPERS ---

  const filteredEmployees = payrollData.filter(emp => 
    emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId?.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-700">
      {/* Sidebar / Nav */}
      <nav className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-50 no-print">
        <div className="flex items-center gap-6">
          <h2 className="font-black text-xl tracking-tighter text-blue-600">HRM.PAYROLL</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['Dashboard', 'Employees', 'Payslips'].map(page => (
              <button 
                key={page}
                onClick={() => setActivePage(page)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activePage === page ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="text-xs font-bold border rounded-lg p-2">
              {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Month {i+1}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="text-xs font-bold border rounded-lg p-2">
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <label className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-700 flex items-center gap-2">
            <Upload size={14}/> {isLoading ? '...' : 'Upload Bank Excel'}
            <input type="file" className="hidden" onChange={handleBankUpload} />
          </label>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        
        {/* DASHBOARD VIEW */}
        {activePage === 'Dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard icon={<Users/>} label="Total Staff" value={payrollData.length} color="blue" />
              <StatCard icon={<DollarSign/>} label="Monthly Outflow" value={`₹${stats.totalCTC?.toLocaleString()}`} color="emerald" />
              <StatCard icon={<TrendingUp/>} label="Avg Salary" value={`₹${stats.avgSalary?.toLocaleString()}`} color="violet" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest mb-6">Department Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.deptData} innerRadius={60} outerRadius={80} dataKey="value">
                        {stats.deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest mb-6">Salary by Role</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.salaryData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Tooltip />
                      <Bar dataKey="avg" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMPLOYEES LIST VIEW */}
        {activePage === 'Employees' && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <div className="relative w-72">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search employees..." 
                  className="pl-10 pr-4 py-2 w-full bg-slate-50 border rounded-xl text-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Base CTC</th>
                  <th className="px-6 py-4">Net Paid</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-blue-600">{emp.employeeId}</td>
                    <td className="px-6 py-4 font-bold">{emp.employeeName}</td>
                    <td className="px-6 py-4">₹{emp.baseSalary}</td>
                    <td className="px-6 py-4 font-black">₹{emp.netSalary}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${emp.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedEmployee(emp); setActivePage('Payslips'); }}
                        className="text-blue-600 hover:underline font-bold text-xs"
                      >
                        View Payslip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAYSLIP DETAIL VIEW */}
        {activePage === 'Payslips' && selectedEmployee && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center no-print">
              <button onClick={() => setSelectedEmployee(null)} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <ArrowLeft size={14}/> Back
              </button>
              <div className="flex gap-2">
                <button onClick={() => downloadPDF(selectedEmployee.id)} className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg text-xs font-bold">
                  <Download size={14}/> Official PDF
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold">
                  <Printer size={14}/> Print
                </button>
              </div>
            </div>

            <div className="bg-white p-12 rounded-3xl border shadow-xl print:shadow-none print:border-2">
              <div className="flex justify-between border-b-2 border-slate-900 pb-8 mb-8">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter uppercase">Payslip</h1>
                  <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest mt-1">Confidential Payroll Document</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-black">Period: {month}/{year}</p>
                  <p className="text-slate-400 text-xs">Generated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Employee</p>
                  <p className="text-lg font-black uppercase">{selectedEmployee.employeeName}</p>
                  <p className="text-sm text-slate-500 font-bold">{selectedEmployee.designation}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Bank Details</p>
                  <p className="text-sm font-bold">{selectedEmployee.bankName}</p>
                  <p className="text-sm font-mono">{selectedEmployee.accountNumber}</p>
                </div>
              </div>

              <div className="border-2 border-slate-900 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-white text-[10px] uppercase">
                    <tr>
                      <th className="px-6 py-3">Earnings Description</th>
                      <th className="px-6 py-3 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-bold text-sm">
                    <tr>
                      <td className="px-6 py-4">Basic Salary / Monthly CTC</td>
                      <td className="px-6 py-4 text-right">₹{selectedEmployee.baseSalary?.toLocaleString()}</td>
                    </tr>
                    {selectedEmployee.bonus > 0 && (
                      <tr className="text-emerald-600 bg-emerald-50/50">
                        <td className="px-6 py-4">Performance Bonus / Incentives</td>
                        <td className="px-6 py-4 text-right">+ ₹{selectedEmployee.bonus?.toLocaleString()}</td>
                      </tr>
                    )}
                    {selectedEmployee.deduction > 0 && (
                      <tr className="text-red-600 bg-red-50/50">
                        <td className="px-6 py-4">Tax / Standard Deductions</td>
                        <td className="px-6 py-4 text-right">- ₹{selectedEmployee.deduction?.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white font-black text-lg">
                    <tr>
                      <td className="px-6 py-5">Net Payable Amount</td>
                      <td className="px-6 py-5 text-right">₹{selectedEmployee.netSalary?.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="mt-12 flex justify-between items-end">
                <div className="flex items-center gap-2 opacity-30 text-[9px] font-black uppercase">
                  <ShieldCheck size={16}/> Secure System Generated
                </div>
                <div className="text-center w-40 border-t border-slate-300 pt-2">
                  <p className="text-[9px] font-black uppercase text-slate-400">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Utility Component for Stats
function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600'
  };
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}