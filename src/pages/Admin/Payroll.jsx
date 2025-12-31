import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  Users, Upload, LayoutDashboard, FileSpreadsheet, 
  Home, FileText, Banknote, Search, Trash2, TrendingUp, DollarSign, Briefcase,
  Printer, ChevronRight, Percent, Award, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function PayrollSystem() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('Employees');
  const [payrollData, setPayrollData] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payslipDetails, setPayslipDetails] = useState({ increment: 0, referral: 0 });

  // --- PRINT CSS OVERRIDE ---
  const printStyles = `
    @media print {
      nav, .no-print, button, label { display: none !important; }
      body { background: white !important; padding: 0 !important; }
      .print-container { 
        border: none !important; 
        box-shadow: none !important; 
        padding: 0 !important; 
        margin: 0 !important;
        width: 100% !important;
      }
      .payslip-card {
        border: 2px solid #e2e8f0 !important;
        border-radius: 0px !important;
        padding: 40px !important;
      }
    }
  `;

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Employees', icon: <Users size={18} /> },
    { name: 'Reports', icon: <FileText size={18} /> },
    { name: 'Payslips', icon: <Banknote size={18} /> },
  ];

  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];

  const findValue = (row, patterns) => {
    const keys = Object.keys(row);
    const foundKey = keys.find(k => 
      patterns.some(p => k.toLowerCase().replace(/\s/g, '').includes(p.toLowerCase()))
    );
    return foundKey ? row[foundKey] : "";
  };

  const stats = useMemo(() => {
    if (payrollData.length === 0) return null;
    const deptMap = {};
    const salaryMap = {};
    let totalCTC = 0;
    payrollData.forEach(emp => {
      const dept = findValue(emp, ['dept', 'department']) || 'Other';
      const salary = parseFloat(String(findValue(emp, ['ctc'])).replace(/[^0-9.-]+/g, "")) || 0;
      const pos = findValue(emp, ['position', 'role']) || 'Staff';
      totalCTC += salary;
      deptMap[dept] = (deptMap[dept] || 0) + 1;
      if (!salaryMap[pos]) salaryMap[pos] = { name: pos, total: 0, count: 0 };
      salaryMap[pos].total += salary;
      salaryMap[pos].count += 1;
    });
    const deptData = Object.keys(deptMap).map(name => ({ name, value: deptMap[name] }));
    const salaryData = Object.keys(salaryMap).map(key => ({
      name: key,
      avg: Math.round(salaryMap[key].total / salaryMap[key].count)
    })).slice(0, 6); 
    return { deptData, salaryData, totalCTC, avgSalary: Math.round(totalCTC / payrollData.length) };
  }, [payrollData]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        if (data.length > 0) setPayrollData(prev => [...prev, ...data]);
      } catch (err) { alert("Failed to read file."); }
      finally { setIsLoading(false); e.target.value = null; }
    };
    reader.readAsBinaryString(file);
  };

  const clearDatabase = () => {
    if(window.confirm("Are you sure?")) setPayrollData([]);
  };

  const filteredEmployees = payrollData.filter(emp => 
    Object.values(emp).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-700">
      <style>{printStyles}</style>
      
      <nav className="bg-slate-100 px-6 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate("/")} className="bg-white p-2 rounded-lg shadow-sm hover:bg-slate-100 transition-colors">
            <Home size={20} className="text-slate-700" />
          </button>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <button 
                key={item.name} 
                onClick={() => {
                    setActivePage(item.name);
                    if(item.name !== 'Payslips') setSelectedEmployee(null);
                }} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activePage === item.name ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {item.icon} {item.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <div className={`w-2 h-2 rounded-full ${payrollData.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
          {payrollData.length} Staff Records
        </div>
      </nav>

      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6 border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-600 tracking-tight uppercase">
                {activePage === 'Dashboard' ? 'Analytics Overview' : activePage === 'Payslips' ? 'Payroll Statements' : 'Employee Database'}
            </h1>
            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">Direct HR Import System</p>
          </div>
          
          <div className="flex gap-3 no-print">
            {payrollData.length > 0 && (
              <button onClick={clearDatabase} className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl border border-red-100 hover:bg-red-100 font-bold text-xs shadow-sm uppercase transition-all">
                <Trash2 size={14}/> Clear Database
              </button>
            )}
            <label className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl cursor-pointer hover:bg-blue-700 font-bold text-xs shadow-lg uppercase transition-all">
              {isLoading ? 'Processing...' : <><Upload size={14}/> Import Excel</>}
              <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        {activePage === 'Dashboard' && (
          /* Dashboard code remains exactly as you provided */
          <div className="space-y-8 animate-in fade-in duration-500">
            {payrollData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24}/></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Employees</p>
                        <p className="text-2xl font-black text-slate-700">{payrollData.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={24}/></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Payroll</p>
                        <p className="text-2xl font-black text-slate-700">₹{stats?.totalCTC.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-violet-50 text-violet-600 rounded-xl"><TrendingUp size={24}/></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg CTC</p>
                        <p className="text-2xl font-black text-slate-700">₹{stats?.avgSalary.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Staff by Department</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.deptData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {stats.deptData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Avg Salary by Role</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.salaryData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                          <Tooltip cursor={{fill: '#f8fafc'}} />
                          <Bar dataKey="avg" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            ) : (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                        <LayoutDashboard size={64} className="text-slate-300 mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">No Analytics Available</p>
                        <p className="text-xs font-bold text-slate-300 mt-1">Upload an Excel file to generate visual reports.</p>
                    </div>
                </div>
            )}
          </div>
        )}

        {activePage === 'Employees' && (
          /* Employees code remains exactly as you provided */
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search user-provided data..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["EMP_ID", "Name", "Position", "Department", "Transac_ID", "Bank", "Account No", "Date", "CTC", "Actual Salary", "Status"].map((h) => (
                        <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((emp, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-blue-600">{findValue(emp, ['id', 'emp_id'])}</td>
                          <td className="px-6 py-4 text-xs font-black text-slate-700 uppercase">{findValue(emp, ['name', 'employee'])}</td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-500">{findValue(emp, ['position', 'role', 'designation'])}</td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-500">
                             <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">{findValue(emp, ['dept', 'department'])}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">{findValue(emp, ['transac', 'id'])}</td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-600">{findValue(emp, ['bank'])}</td>
                          <td className="px-6 py-4 text-xs text-slate-500">{findValue(emp, ['account', 'acc'])}</td>
                          <td className="px-6 py-4 text-xs text-slate-500">{findValue(emp, ['date'])}</td>
                          <td className="px-6 py-4 text-xs font-black text-slate-700">{findValue(emp, ['ctc'])}</td>
                          <td className="px-6 py-4 text-xs font-black text-emerald-600">{findValue(emp, ['actual salary', 'current', 'salary'])}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-green-100 text-green-600 border border-green-200">
                              {findValue(emp, ['status']) || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="px-6 py-24 text-center">
                          <div className="flex flex-col items-center opacity-40">
                            <FileSpreadsheet size={48} className="text-slate-300 mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest text-slate-400">Database Empty</p>
                            <p className="text-xs font-bold text-slate-300 mt-1">Please upload your organization Excel file to begin.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activePage === 'Payslips' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {!selectedEmployee ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Select Staff for Payslip</h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {payrollData.length > 0 ? (
                    payrollData.map((emp, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                            setSelectedEmployee(emp);
                            setPayslipDetails({ increment: 0, referral: 0 });
                        }}
                        className="flex items-center justify-between p-4 hover:bg-blue-50 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 font-black text-xs">
                            {String(findValue(emp, ['name'])).charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-700 uppercase">{findValue(emp, ['name', 'employee'])}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{findValue(emp, ['position', 'role'])}</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">
                      Import data to view payslips
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest transition-colors mb-2 no-print"
                >
                  <ArrowLeft size={14}/> Back to Selection
                </button>

                {/* Admin Inputs - Hidden on Print */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-blue-100 shadow-sm no-print">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest">
                      <Percent size={12} className="text-blue-500"/> Increment (%)
                    </label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
                      value={payslipDetails.increment}
                      onChange={(e) => setPayslipDetails({...payslipDetails, increment: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest">
                      <Award size={12} className="text-emerald-500"/> Referral Points
                    </label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
                      value={payslipDetails.referral}
                      onChange={(e) => setPayslipDetails({...payslipDetails, referral: e.target.value})}
                    />
                  </div>
                </div>

                {/* PRINTABLE AREA */}
                <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-200 print-container payslip-card">
                  <div className="flex justify-between border-b-2 border-slate-900 pb-8 mb-8">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Payslip</h2>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mt-2">Private & Confidential Statement</p>
                    </div>
                    <div className="text-right">
                      <div className="mb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Statement Date</p>
                        <p className="text-sm font-black text-slate-900">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-12 mb-12">
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employee Name</p>
                            <p className="text-lg font-black text-slate-900 uppercase">{findValue(selectedEmployee, ['name', 'employee'])}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Designation</p>
                            <p className="text-md font-bold text-slate-700 uppercase">{findValue(selectedEmployee, ['position', 'role'])}</p>
                        </div>
                    </div>
                    <div className="text-right space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employee ID</p>
                            <p className="text-md font-black text-slate-900 uppercase">{findValue(selectedEmployee, ['id', 'emp_id'])}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Account</p>
                            <p className="text-md font-bold text-slate-700">{findValue(selectedEmployee, ['account', 'acc'])}</p>
                        </div>
                    </div>
                  </div>

                  <div className="border-2 border-slate-900 rounded-xl overflow-hidden mb-10">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-white">
                        <tr>
                          <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Description</th>
                          <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-right">Earnings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="px-6 py-5 text-sm font-bold text-slate-700">Monthly Base CTC</td>
                          <td className="px-6 py-5 text-sm font-black text-slate-900 text-right">₹{findValue(selectedEmployee, ['ctc'])}</td>
                        </tr>
                        {parseFloat(payslipDetails.increment) > 0 && (
                          <tr className="bg-slate-50">
                            <td className="px-6 py-5 text-sm font-bold text-blue-600">Performance Increment ({payslipDetails.increment}%)</td>
                            <td className="px-6 py-5 text-sm font-black text-blue-600 text-right">
                              + ₹{(parseFloat(String(findValue(selectedEmployee, ['ctc'])).replace(/[^0-9.]/g, '')) * (parseFloat(payslipDetails.increment) / 100) || 0).toLocaleString()}
                            </td>
                          </tr>
                        )}
                        {parseFloat(payslipDetails.referral) > 0 && (
                          <tr>
                            <td className="px-6 py-5 text-sm font-bold text-emerald-600">Referral Bonus / Points</td>
                            <td className="px-6 py-5 text-sm font-black text-emerald-600 text-right">
                              + ₹{parseFloat(payslipDetails.referral).toLocaleString()}
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-slate-900 text-white">
                        <tr>
                          <td className="px-6 py-6 text-sm font-black uppercase tracking-[0.2em]">Net Payable Amount</td>
                          <td className="px-6 py-6 text-2xl font-black text-right">
                            ₹{(
                              parseFloat(String(findValue(selectedEmployee, ['ctc'])).replace(/[^0-9.]/g, '')) + 
                              (parseFloat(String(findValue(selectedEmployee, ['ctc'])).replace(/[^0-9.]/g, '')) * (parseFloat(payslipDetails.increment) / 100) || 0) +
                              (parseFloat(payslipDetails.referral) || 0)
                            ).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="flex justify-between items-end mt-16">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 opacity-50">
                          <ShieldCheck size={20}/>
                          <span className="text-[9px] font-black uppercase tracking-widest">System Generated Secure Statement</span>
                      </div>
                    </div>
                    <div className="text-center no-print">
                      <button 
                        onClick={() => window.print()} 
                        className="flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-xs uppercase hover:bg-black transition-all shadow-xl"
                      >
                        <Printer size={16}/> Print / Export PDF
                      </button>
                    </div>
                    <div className="hidden print:block text-center border-t border-slate-300 pt-2 w-48">
                      <p className="text-[10px] font-black uppercase text-slate-400">Authorized Signatory</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}