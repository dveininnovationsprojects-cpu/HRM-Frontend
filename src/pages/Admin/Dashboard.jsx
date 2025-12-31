import React, { useState } from 'react';

const ManagerDashboard = () => {
  const [projectStats] = useState({
    projectName: "AI System Development",
    totalModules: 27,
    completedModules: 18,
  });

  // Calculate Percentage
  const completionPercentage = ((projectStats.completedModules / projectStats.totalModules) * 100).toFixed(1);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Manager Dashboard</h1>
      
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Upload Project Modules</h2>
        <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      </div>

      {/* Progress Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">Project Completion Status</h2>
        <p className="text-gray-600 mb-4">{projectStats.projectName}</p>
        
        <div className="w-full bg-gray-200 rounded-full h-6">
          <div 
            className="bg-green-500 h-6 rounded-full text-center text-white text-sm leading-6 transition-all duration-500" 
            style={{ width: `${completionPercentage}%` }}
          >
            {completionPercentage}%
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-500">Total Modules</p>
            <p className="text-2xl font-bold">{projectStats.totalModules}</p>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold">{projectStats.completedModules}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;