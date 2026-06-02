// 'use client';

// import { AlertTriangle } from 'lucide-react';

// const STATUS_COLOR: Record<string, string> = {
//   OPEN:        'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
//   IN_PROGRESS: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
//   RESOLVED:    'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
//   CLOSED:      'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600',
// };

// const RiskBlockage = ({ tickets = [] }: { tickets: any[] }) => {
//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-red-400 shadow-sm relative">
//       <div className="flex justify-end absolute top-1 right-10 -mt-6 mb-4">
//         <span className="bg-red-400 text-white px-4 py-1 rounded-sm text-sm font-medium">
//           Risk & Blockage
//         </span>
//       </div>

//       {tickets.length === 0 ? (
//         <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No risks or blockages reported.</p>
//       ) : (
//         <div className="space-y-3 max-h-60 overflow-y-auto pr-1 no-scrollbar mt-4">
//           {tickets.map((ticket) => (
//             <div key={ticket.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
//               <div className="flex items-center justify-between mb-1">
//                 <div className="flex items-center gap-2">
//                   <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
//                   <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{ticket.issueType}</span>
//                 </div>
//                 <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[ticket.status] ?? STATUS_COLOR.CLOSED}`}>
//                   {ticket.status}
//                 </span>
//               </div>
//               <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{ticket.description}</p>
//               <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default RiskBlockage;

'use client';

import { AlertTriangle } from 'lucide-react';

const tickets = [
  {
    id: 1,
    issueType: 'Database Issue',
    status: 'OPEN',
    description:
      'Database replication delay causing inconsistent analytics data across dashboard views.',
    createdAt: '18 Jan. 2026',
  },
  {
    id: 2,
    issueType: 'Frontend Bug',
    status: 'IN_PROGRESS',
    description:
      'UI alignment issue detected in responsive mobile navigation components.',
    createdAt: '18 Jan. 2026',
  },
  {
    id: 3,
    issueType: 'Deployment',
    status: 'RESOLVED',
    description:
      'Production deployment timeout issue resolved successfully.',
    createdAt: '18 Jan. 2026',
  },
];

const STATUS_COLOR: Record<string, string> = {
  OPEN: 'bg-red-50 text-red-700 border-red-200',
  IN_PROGRESS: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  RESOLVED: 'bg-green-50 text-green-700 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-600 border-gray-200',
};


const RiskBlockage = ({ tickets = [] }: { tickets: any[] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-red-400 shadow-sm relative">

      {/* Badge */}
      <div className="absolute -top-4 right-8 z-20">
        <span className="bg-[#ff5b5b] text-white px-5 py-2 rounded-md text-sm font-semibold whitespace-nowrap">
          Risk & Blockage
        </span>
      </div>

      {/* Tickets */}
      <div className="space-y-2 mt-0 overflow-y-auto h-50 pr-1 no-scrollbar">

        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-[18px] p-5 border border-[#ececec] shadow-[0_4px_18px_rgba(0,0,0,0.05)]"
          >

            {/* Top */}
            <div className="flex items-center justify-between mb-3">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-full bg-[#fff4d6] flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-[#f5a300]" />
                </div>

                <span className="text-[20px] font-semibold text-black font-id">
                  {ticket.issueType}
                </span>

              </div>

            </div>

          </div>
        ))}

      </div>

      {/* Bottom Fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fff7f7] to-transparent" />

    </div>
  );
};

export default RiskBlockage;