import axios from 'axios';

// Java Backend URL (Change if port is different)
const API_BASE_URL = 'http://localhost:8080/api/v1'; 

export const payrollService = {
  getPayrollSummary: async () => {
    // Backend ready illana test panna mock data (Uncomment if needed)
    /*
    return [
      { id: 1, employeeId: "EMP01", name: "Dharshan", basic: 50000, allowance: 5000, tax: 2000, net: 53000, status: "Paid" },
      { id: 2, employeeId: "EMP02", name: "Jayasri", basic: 45000, allowance: 4000, tax: 1500, net: 47500, status: "Pending" }
    ];
    */
    const response = await axios.get(`${API_BASE_URL}/payroll/summary`);
    return response.data;
  },

  runPayroll: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/payroll/run`, data);
    return response.data;
  }
};