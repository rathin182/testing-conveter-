// 'use client';

// import { useState } from 'react';
// import { ArrowRight } from 'lucide-react';

// const DesignOverview = ({ data }: { data: any }) => {
//   const [currentSlide, setCurrentSlide] = useState(0);

//   if (!data) return (
//     <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-500 mt-4">
//       No Design System uploaded yet.
//     </div>
//   );

//   const val = (v: any) => Array.isArray(v) ? v.join(', ') : (typeof v === 'object' && v ? Object.keys(v).join(', ') : v) || 'Not set';

//   const slides = [
//     [{ label: 'Brand Name', value: val(data.brandName) }, { label: 'Design Type', value: val(data.designType) }, { label: 'Brand Feel', value: val(data.brandFeel) }],
//     [{ label: 'Content Tone', value: val(data.contentTone) }, { label: 'Theme', value: val(data.theme) }, { label: 'Key Pages', value: val(data.keyPages) }],
//     [{ label: 'Fonts', value: val(data.fonts) }, { label: 'Layout Style', value: val(data.layoutStyle) }, { label: 'Visual Guidelines', value: val(data.visualGuidelines) }],
//     [{ label: 'Uniqueness', value: val(data.uniqueness) }],
//   ];

//   return (
//     <div className="dark:bg-gray-900 mt-6">
//       <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 relative">
//         <div className="absolute -top-3 left-6">
//           <span className="bg-blue-500 text-white px-4 py-1 rounded-sm text-sm font-medium">Design System</span>
//         </div>

//         <div className="mt-4 space-y-6">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Colors</h3>
//             <div className="flex gap-2">
//               {(data.colors ?? []).map((color: string, i: number) => (
//                 <div
//                   key={i}
//                   className="group flex items-center h-8 w-8 hover:w-24 px-2 rounded-full border-2 border-gray-200 dark:border-gray-600 transition-all duration-300 ease-out cursor-pointer overflow-hidden"
//                   style={{ backgroundColor: color }}
//                 >
//                   <span className="ml-2 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 translate-x-[-6px] group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
//                     {color.toUpperCase()}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="overflow-hidden relative h-32">
//             <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
//               {slides.map((slide, i) => (
//                 <div key={i} className="min-w-full space-y-4 pr-4">
//                   {slide.map((item, j) => (
//                     <div key={j} className="flex items-center justify-between">
//                       <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
//                       <span className="text-sm font-medium text-gray-900 dark:text-white max-w-sm truncate" title={item.value}>{item.value}</span>
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="flex justify-end">
//             <button
//               onClick={() => setCurrentSlide(p => (p + 1) % slides.length)}
//               className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 py-1 px-4 rounded-full flex items-center gap-2 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
//             >
//               <span className="font-medium">Next Attributes</span>
//               <ArrowRight className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DesignOverview;

'use client';

import { useState } from "react";
import { ArrowRight } from "lucide-react";

const staticDesignData = {
  brandName: "Tech Engi",
  designType: "Modern SaaS Platform",
  brandFeel: "Premium, Futuristic, Clean",

  contentTone: "Professional & Technical",
  theme: "Dark Minimal",
  keyPages: ["Home", "Projects", "Dashboard", "Analytics"],

  fonts: ["Inter", "ID Grotesk", "DM Serif"],
  layoutStyle: "Grid Based",
  visualGuidelines: "Soft shadows, rounded cards, clean spacing",

  uniqueness: "Engineering focused collaboration platform",

  colors: [
    "#2563EB",
    "#0F172A",
    "#F59E0B",
    "#14B8A6",
    "#FFFFFF",
  ],
};

const DesignOverview = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const val = (v: any) =>
    Array.isArray(v)
      ? v.join(", ")
      : typeof v === "object" && v
        ? Object.keys(v).join(", ")
        : v || "Not set";

  const slides = [
    [
      { label: "Brand Name", value: val(staticDesignData.brandName) },
      { label: "Design Type", value: val(staticDesignData.designType) },
      { label: "Brand Feel", value: val(staticDesignData.brandFeel) },
    ],

    [
      { label: "Content Tone", value: val(staticDesignData.contentTone) },
      { label: "Theme", value: val(staticDesignData.theme) },
      { label: "Key Pages", value: val(staticDesignData.keyPages) },
    ],

    [
      { label: "Fonts", value: val(staticDesignData.fonts) },
      { label: "Layout Style", value: val(staticDesignData.layoutStyle) },
      {
        label: "Visual Guidelines",
        value: val(staticDesignData.visualGuidelines),
      },
    ],

    [
      { label: "Uniqueness", value: val(staticDesignData.uniqueness) },
    ],
  ];

  return (
    <div className="dark:bg-gray-900 mt-10 flex gap-6 items-stretch">
      <div className="w-[35%] h-[380px] bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 relative">

        <div className="absolute top-0 left-6 -translate-y-1/2 z-20">
          <span className="bg-blue-500 text-white px-5 py-2 leading-none rounded-md text-sm font-medium whitespace-nowrap">
            Design System
          </span>
        </div>

        <div className="mt-4 space-y-6">

          {/* Colors */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Colors
            </h3>

            <div className="flex gap-2">
              {staticDesignData.colors.map((color: string, i: number) => (
                <div
                  key={i}
                  className="group flex items-center h-8 w-8 hover:w-24 px-2 rounded-full border-2 border-gray-200 dark:border-gray-600 transition-all duration-300 ease-out cursor-pointer overflow-hidden"
                  style={{ backgroundColor: color }}
                >
                  <span className="ml-2 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 translate-x-[-6px] group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
                    {color.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Slides */}
          <div className="overflow-hidden relative h-32">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {slides.map((slide, i) => (
                <div key={i} className="min-w-full space-y-4 pr-4">
                  {slide.map((item, j) => (
                    <div
                      key={j}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.label}
                      </span>

                      <span
                        className="text-sm font-medium text-gray-900 dark:text-white max-w-sm truncate"
                        title={item.value}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-end">
            <button
              onClick={() =>
                setCurrentSlide((p) => (p + 1) % slides.length)
              }
              className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 py-1 px-4 rounded-full flex items-center gap-2 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              <span className="font-medium">Next Attributes</span>

              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      <div className="w-[65%] h-[370px] rounded-[24px] border border-[#d6d6d6] bg-[#f5f5f5] overflow-hidden">

  <div className="grid grid-cols-3 h-full">

    {/* LEFT SECTION */}
    <div className="p-5 border-r border-[#d6d6d6] flex flex-col gap-30">

      {/* Status */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#18d10f] bg-[#dfffdc]">
          <div className="w-2 h-2 rounded-full bg-[#18d10f]" />

          <span className="text-[#18d10f] text-[14px] font-semibold font-id">
            On Time
          </span>
        </div>
      </div>

      {/* Days */}
      <div>
        <h2 className="text-[42px] leading-none font-black text-black font-id">
          28 Days
        </h2>

        <div className="w-full h-[4px] bg-[#8A16D8] mt-4" />

        <p className="text-right text-[14px] text-[#7d7d7d] mt-2 font-id">
          Days Remaining
        </p>
      </div>

    </div>

    {/* CENTER SECTION */}
    <div className="p-5 border-r border-[#d6d6d6]">

      <h3 className="text-[20px] font-medium text-[#7d7d7d] font-id">
        Current Phase
      </h3>

      <div className="w-full h-[2px] bg-[#d6d6d6] mt-2 mb-5" />

      <div className="space-y-4">

        {/* Active */}
        <div className="bg-gradient-to-r from-[#B14FFF] to-[#A34CF3] rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-white text-[18px]">✎</span>

          <span className="text-white text-[20px] font-semibold font-id">
            Design
          </span>
        </div>

        {/* Others */}
        <div className="flex items-center gap-3 text-[#7d7d7d]">
          <span className="text-[18px]">&lt;/&gt;</span>

          <span className="text-[20px] font-medium font-id">
            Code
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#7d7d7d]">
          <span className="text-[18px]">☼</span>

          <span className="text-[20px] font-medium font-id">
            Testing
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#7d7d7d]">
          <span className="text-[18px]">▤</span>

          <span className="text-[20px] font-medium font-id">
            Deployment
          </span>
        </div>

      </div>
    </div>

    {/* RIGHT SECTION */}
    <div className="p-5">

      <h3 className="text-[20px] font-medium text-[#7d7d7d] font-id">
        Technology Used
      </h3>

      <div className="w-full h-[2px] bg-[#d6d6d6] mt-2 mb-5" />

      <div className="space-y-4">

        {[
          ["Design", "Figma"],
          ["Frontend", "Next.js"],
          ["Backend", "Next.js"],
          ["Database", "Postgres"],
          ["Server", "KVM2 - VPS"],
          ["Database Hosted ON", "Local"],
        ].map(([label, value], i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3"
          >
            <span className="text-[15px] text-[#8a8a8a] font-id">
              {label}
            </span>

            <span className="text-[15px] text-black font-semibold font-id text-right">
              {value}
            </span>
          </div>
        ))}

      </div>
    </div>

  </div>
</div>
    </div>
  );
};

export default DesignOverview;