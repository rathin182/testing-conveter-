'use client';

import { FileText, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns/format';

const ClientOverview = ({ data }: { data: any }) => {
  if (!data) return (
    <div className="p-6 text-center text-red-500 dark:text-red-400">No project data available</div>
  );

  const projectName = data.name || 'N/A';
  const projectBudget = data.budget || 0;
  const projectDescription = data.description || 'No description available';
  const currency = '₹';

  const startDate = data.startDate ? format(new Date(data.startDate), 'dd MMM.yyyy') : 'N/A';
  const deadline = data.deadline ? format(new Date(data.deadline), 'dd MMM.yyyy') : 'N/A';
  const daysRemaining = data.daysRemaining ?? 0;

  const projectManager = data.projectManager || 'Unassigned';
  const overallProgress = data.overallProgress ?? 0;
  const circumference = +(2 * Math.PI * 80).toFixed(1);

  return (
    <div className="dark:bg-gray-900">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            {/* Top Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-600/60 to-blue-900 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-end">
                <div className="absolute top-4 right-4 w-10 h-10 bg-gray-100/40 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-1 truncate">{projectName}</h2>
                  <p className="text-blue-100 text-sm">Project Name</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600/50 to-purple-900 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-end">
                <div className="absolute top-4 right-4 w-10 h-10 bg-gray-100/40 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-1">{currency} {projectBudget.toLocaleString()}</h2>
                  <p className="text-purple-100 text-sm">Project Budget</p>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-5">{projectDescription}</p>
              </div>

              <div className="flex flex-col gap-4 col-span-1">
                <div className="flex gap-4 w-full">
                  <div className="bg-gray-100 dark:bg-gray-800 w-full rounded-2xl p-5 shadow-sm border border-gray-400/50 dark:border-gray-700">
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">Start Date</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{startDate}</p>
                    </div>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-800 w-full rounded-2xl p-5 shadow-sm border border-gray-400/50 dark:border-gray-700">
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">Deadline</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{deadline}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 w-full">
                  <div className="bg-gray-100 dark:bg-gray-800 w-full rounded-2xl p-5 shadow-sm border border-gray-400/50 dark:border-gray-700">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Project Engineer</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-white truncate w-full">{projectManager}</p>
                    </div>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-400/50 dark:border-gray-700">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Days Left</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {daysRemaining > 0 ? daysRemaining : 'Completed'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Progress Circle */}
          <div className="lg:col-span-4">
            <div className="bg-gray-100 dark:bg-gray-800 h-full rounded-2xl p-6 shadow-sm border dark:border-gray-700 flex flex-col items-center justify-center">
              <h3 className="font-bold text-gray-900 dark:text-white mb-8">Overall Progress</h3>
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" className="dark:stroke-gray-600" strokeWidth="20" />
                  <circle
                    cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="20"
                    strokeDasharray={`${(overallProgress / 100) * circumference} ${circumference}`}
                    strokeLinecap="round" className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">{overallProgress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOverview;