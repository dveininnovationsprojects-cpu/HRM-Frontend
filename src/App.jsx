import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages Imports
import Login from "./pages/Login.jsx"; 
import Register from "./pages/Register.jsx"; 
import Dashboard from "./pages/Admin/Dashboard.jsx"; 
import EmployeeDirectory from "./pages/Employee/EmployeeDirectory.jsx"; 
import LeaveManagement from "./pages/Admin/LeaveManagement.jsx"; 
import EmployeeLeave from "./pages/Employee/EmployeeLeave.jsx"; 
// REMOVED: LoginApproval import
import Recruitment from "./pages/Admin/Recruitment.jsx"; 
import ProjectPerformance from "./pages/Admin/ProjectPerformance.jsx"; 
import Setting from "./pages/Admin/Setting.jsx"; 
import AdminAttendance from "./pages/Admin/Attedance.jsx"; 
import EmployeeAttendance from "./pages/Employee/EmployeeAttedance.jsx"; 

// --- UPDATED IMPORTS ---
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard.jsx"; 
import EmployeeSidebar from "./components/EmployeeSidebar.jsx"; 
import Payroll from "./pages/Admin/Payroll.jsx"; 
import Projects from "./pages/Employee/Projects.jsx";
import EmployeeSetting from "./pages/Employee/EmployeeSetting.jsx";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem("userRole");
  if (!userRole) return <Navigate to="/login" replace />;
  
  if (!allowedRoles.includes(userRole)) {
    return (userRole === "Employee" || userRole === "TL") 
      ? <Navigate to="/employee-dashboard" replace /> 
      : <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Layout for Employees (includes Sidebar)
const EmployeeLayout = ({ children }) => (
  <div className="flex">
    <EmployeeSidebar /> 
    <div className="flex-1 ml-64 bg-slate-50 min-h-screen">
      {children}
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/register" element={<Register />} />
        
        {/* --- ADMIN / MANAGER / HR ROUTES --- */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={["Admin", "Manager", "HR"]}>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/payroll" element={
          <ProtectedRoute allowedRoles={["Admin", "Manager", "HR"]}>
            <Payroll />
          </ProtectedRoute>
        } />

        <Route path="/project-performance" element={
          <ProtectedRoute allowedRoles={["Admin", "Manager", "HR"]}>
            <ProjectPerformance />
          </ProtectedRoute>
        } />

        <Route path="/attendance" element={
          <ProtectedRoute allowedRoles={["Admin", "Manager", "HR"]}>
            <AdminAttendance />
          </ProtectedRoute>
        } />

        {/* REMOVED: /login-approval route */}

        <Route path="/recruitment" element={
          <ProtectedRoute allowedRoles={["Admin", "Manager", "HR"]}>
            <Recruitment />
          </ProtectedRoute>
        } />

        <Route path="/employees" element={
          <ProtectedRoute allowedRoles={["Admin", "Manager", "HR"]}>
            <EmployeeDirectory />
          </ProtectedRoute>
        } />

        <Route path="/admin/leaves" element={
          <ProtectedRoute allowedRoles={["Admin", "Manager", "HR"]}>
            <LeaveManagement />
          </ProtectedRoute>
        } />

        <Route path="/setting" element={
          <ProtectedRoute allowedRoles={["Admin", "Manager", "HR"]}>
            <Setting />
          </ProtectedRoute>
        } />

        {/* --- EMPLOYEE / TL ROUTES --- */}
        <Route path="/employee-dashboard" element={
          <ProtectedRoute allowedRoles={["Employee", "TL", "Admin"]}>
            <EmployeeLayout>
              <EmployeeDashboard />
            </EmployeeLayout>
          </ProtectedRoute>
        } />

        <Route path="/employee/attendance" element={
          <ProtectedRoute allowedRoles={["Employee", "TL", "Admin"]}>
            <EmployeeLayout>
              <EmployeeAttendance />
            </EmployeeLayout>
          </ProtectedRoute>
        } />

        <Route path="/employee/projects" element={
          <ProtectedRoute allowedRoles={["Employee", "TL"]}>
            <EmployeeLayout>
              <Projects />
            </EmployeeLayout>
          </ProtectedRoute>
        } />

        <Route path="/employee/leave" element={
          <ProtectedRoute allowedRoles={["Employee", "TL", "Admin"]}>
            <EmployeeLayout>
              <EmployeeLeave />
            </EmployeeLayout>
          </ProtectedRoute>
        } />

        <Route path="/employee-setting" element={
          <ProtectedRoute allowedRoles={["Employee", "TL"]}>
            <EmployeeLayout>
              <EmployeeSetting />
            </EmployeeLayout>
          </ProtectedRoute>
        } />

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;