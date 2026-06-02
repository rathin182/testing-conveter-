// 'use client';

// import { Check } from 'lucide-react';
// import { format } from 'date-fns';

// const Milestones = ({ milestones = [] }: { milestones: any[] }) => {
//   return (
//     <div className="space-y-4 relative">
//       <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Milestones</h2>

//       {milestones.length === 0 ? (
//         <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">No milestones yet.</p>
//       ) : (
//         <div className="relative max-h-72 overflow-y-auto pr-2 no-scrollbar pb-10">
//           {milestones.map((m) => (
//             <div key={m.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-600 mb-4">
//               <div className="flex items-center justify-between">
//                 <h3 className="font-semibold text-gray-900 dark:text-white">{m.title}</h3>
//                 <div className="flex items-center gap-2">
//                   <span className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium">
//                     {format(new Date(m.createdAt), 'dd/MM/yyyy')}
//                   </span>
//                   {m.completed && <Check className="w-4 h-4 text-green-500" />}
//                 </div>
//               </div>
//               {m.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{m.description}</p>}
//             </div>
//           ))}
//           <div className="pointer-events-none absolute inset-x-0 right-2 bottom-6 rounded-xl h-12 bg-gradient-to-t from-gray-100 dark:from-gray-800/60 to-transparent" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default Milestones;

'use client';

import { Check } from 'lucide-react';

const milestones = [
  {
    id: 1,
    title: 'UI Design Completed',
    description:
      'Completed the full dashboard UI design system with responsive layouts and component architecture.',
    createdAt: '18 Jan. 2026',
    completed: true,
  },
  {
    id: 2,
    title: 'Backend API Integration',
    description:
      'Integrated authentication APIs, analytics endpoints, and database connectivity successfully.',
    createdAt: '20 Jan. 2026',
    completed: true,
  },
  {
    id: 3,
    title: 'Production Deployment',
    description:
      'Application deployed to VPS production environment with SSL and monitoring setup.',
    createdAt: '24 Jan. 2026',
    completed: false,
  },
];

const Milestones = ({ milestones = [] }: { milestones: any[] }) => {
  return (
    <div className="relative w-full h-[320px] rounded-[24px] border-2 border-[#d6d6d6] bg-[#f5f5f5] p-6 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-[42px] leading-none font-black text-black font-id">
          Milestones
        </h2>

        <span className="text-[18px] text-[#8a8a8a] font-semibold">
          Project Timeline
        </span>

      </div>

      {/* Milestones */}
      <div className="space-y-4 overflow-y-auto h-[320px] pr-2 no-scrollbar">

        {milestones.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-[18px] p-5 border border-[#e6e6e6] shadow-[0_4px_18px_rgba(0,0,0,0.05)]"
          >

            {/* Top */}
            <div className="flex items-start justify-between gap-4">

              <div>
                <h3 className="text-[22px] font-bold text-black font-id">
                  {m.title}
                </h3>

                <p className="text-[15px] leading-[1.5] text-[#666666] mt-2 font-medium font-id">
                  {m.description}
                </p>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">

                <span className="bg-[#e9fff0] text-[#14b84a] border border-[#b8efca] px-3 py-1 rounded-full text-[12px] font-semibold">
                  {m.createdAt}
                </span>

                {m.completed ? (
                  <div className="w-8 h-8 rounded-full bg-[#14b84a] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-[#cfcfcf]" />
                )}

              </div>

            </div>

          </div>
        ))}

      </div>

      {/* Bottom Fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f5f5f5] to-transparent" />

    </div>
  );
};

export default Milestones;