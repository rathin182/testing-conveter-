// 'use client';

// const LatestUpdates = ({ updates = [] }: { updates: any[] }) => {
//   return (
//     <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-300 dark:border-gray-700 p-6 shadow-md relative h-full">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Latest Updates</h2>
//         <span className="text-lg font-medium text-gray-500 dark:text-gray-400">{updates.length} updates</span>
//       </div>

//       {updates.length === 0 ? (
//         <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No updates yet.</p>
//       ) : (
//         <div className="relative">
//           <div className="space-y-6 max-h-[430px] overflow-y-auto pr-2 no-scrollbar pb-10">
//             {updates.map((item) => (
//               <div key={item.id} className="relative">
//                 <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-600">
//                   <span className="absolute top-3 right-4 text-sm text-purple-600 dark:text-purple-400 font-medium">
//                     {new Date(item.createdAt).toLocaleDateString()}
//                   </span>
//                   <p className="text-sm leading-relaxed text-gray-800 pt-3 dark:text-gray-200">{item.title}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       <div className="pointer-events-none rounded-xl absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-300/60 dark:from-gray-800/60 to-transparent" />
//     </div>
//   );
// };

// export default LatestUpdates;

'use client';

const updates = [
  {
    id: 1,
    date: "18 Jan. 2026",
    text: "Lorem ipsum dolor sit amet consectetur. Elementum nunc quisque molestie ornare urna. Mattis iaculis molestie vel blandit tincidunt quis. Tortor tincidunt donec duis cras.",
  },
  {
    id: 2,
    date: "18 Jan. 2026",
    text: "Lorem ipsum dolor sit amet consectetur. Elementum nunc quisque molestie ornare urna. Mattis iaculis molestie vel blandit tincidunt quis. Tortor tincidunt donec duis cras.",
  },
  {
    id: 3,
    date: "18 Jan. 2026",
    text: "Lorem ipsum dolor sit amet consectetur. Elementum nunc quisque molestie ornare urna.",
  },
  {
    id: 4,
    date: "18 Jan. 2026",
    text: "Lorem ipsum dolor sit amet consectetur. Elementum nunc quisque molestie ornare urna.",
  },
  {
    id: 5,
    date: "18 Jan. 2026",
    text: "Lorem ipsum dolor sit amet consectetur. Elementum nunc quisque molestie ornare urna.",
  },
];

const LatestUpdates = () => {
  return (
    <div className="relative w-full h-[620px] rounded-[24px] border-2 border-[#cfcfcf] bg-[#f5f5f5] p-6 overflow-hidden">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">

        <h2 className="text-[46px] leading-none font-black text-black font-id">
          Latest Updates
        </h2>

        <span className="text-[24px] text-[#7d7d7d] font-semibold font-id mt-1">
          18 Jan. 2026
        </span>

      </div>

      {/* Updates */}
      {/* <div className="space-y-5 overflow-y-auto h-[410px] pr-2 no-scrollbar"> */}
      <div className="space-y-5 h-[520px] overflow-hidden relative">

        {updates.map((item) => (
          <div
            key={item.id}
            className="bg-[#fafafa] rounded-[18px] px-5 py-5 shadow-[0_4px_18px_rgba(0,0,0,0.06)] relative"
          >

            {/* Date */}
            <span className="absolute top-4 right-5 text-[18px] font-semibold text-[#7B3FFF] font-id">
              {item.date}
            </span>

            {/* Text */}
            <p className="text-[22px] leading-[1.4] text-[#474747] font-medium font-id pr-24">
              {item.text}
            </p>

          </div>
        ))}

      </div>

      {/* Bottom Fade */}
      {/* <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#f5f5f5] to-transparent" /> */}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f5f5f5] via-[#f5f5f5]/90 to-transparent z-20" />

    </div>
  );
};

export default LatestUpdates;