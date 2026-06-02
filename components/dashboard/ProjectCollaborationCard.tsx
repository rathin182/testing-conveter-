// "use client";

// import {
//   ArrowUpRight,
//   CalendarDays,
//   Layers3,
// } from "lucide-react";

// interface Project {
//   id: string;
//   title: string;
//   status: string;
//   priority: "LOW" | "MEDIUM" | "HIGH";
//   currentPhase: string;
//   progress: number;
//   startDate: string;
//   endDate: string;
//   createdAt: string;
//   engineerId: string | null;
// }

// interface ProjectCollaborationCardProps {
//   projects: Project[];
// }

// const STATUS_STYLES = {
//   SEARCHING: {
//     bg: "bg-[#FFF7E8]",
//     text: "text-[#D97706]",
//     border: "border-[#FFE2A8]",
//   },

//   ACTIVE: {
//     bg: "bg-[#EEF9F1]",
//     text: "text-[#238B57]",
//     border: "border-[#D7F0DD]",
//   },

//   COMPLETED: {
//     bg: "bg-[#EEF4FF]",
//     text: "text-[#2563EB]",
//     border: "border-[#D6E4FF]",
//   },
// };

// const PRIORITY_STYLES = {
//   LOW: "text-[#238B57]",
//   MEDIUM: "text-[#D97706]",
//   HIGH: "text-[#E5484D]",
// };

// export default function ProjectCollaborationCard({
//   projects,
// }: ProjectCollaborationCardProps) {

//   // SORT BY LATEST CREATED PROJECTS
//   // TAKE ONLY TOP 10

//   const latestProjects = [...projects]
//     .sort(
//       (a, b) =>
//         new Date(b.createdAt).getTime() -
//         new Date(a.createdAt).getTime()
//     )
//     .slice(0, 10);

//   return (
//     <div
//       className="
//         bg-white
//         rounded-[30px]
//         border border-[#ECECEC]
//         p-6
//         w-full
//         h-full
//       "
//     >
//       {/* HEADER */}

//       <div className="flex items-center justify-between mb-7">
//         <div>
//           <h2 className="text-[1.45rem] font-semibold text-[#111]">
//             Latest Projects
//           </h2>

//           <p className="text-[13px] text-[#8A8A8A] mt-1">
//             Top 10 recently created projects
//           </p>
//         </div>

//         <div
//           className="
//             px-4 py-2
//             rounded-full
//             bg-[#F7F7F7]
//             text-[13px]
//             font-medium
//             text-[#111]
//           "
//         >
//           {latestProjects.length} Projects
//         </div>
//       </div>

//       {/* EMPTY STATE */}

//       {latestProjects.length === 0 && (
//         <div
//           className="
//             flex
//             items-center
//             justify-center
//             py-24
//             text-center
//           "
//         >
//           <div>
//             <h3 className="text-[17px] font-semibold text-[#111]">
//               No Projects Found
//             </h3>

//             <p className="text-[13px] text-[#8A8A8A] mt-2">
//               Create a project to start collaboration
//             </p>
//           </div>
//         </div>
//       )}

//       {/* PROJECT LIST */}

//       <div className="flex flex-col gap-4">
//         {latestProjects.map((project) => {

//           const statusStyle =
//             STATUS_STYLES[
//               project.status as keyof typeof STATUS_STYLES
//             ] || STATUS_STYLES.SEARCHING;

//           return (
//             <div
//               key={project.id}
//               className="
//                 group
//                 border border-[#EFEFEF]
//                 rounded-[24px]
//                 p-5
//                 transition-all
//                 hover:shadow-md
//                 hover:border-[#E3E3E3]
//               "
//             >

//               {/* TOP */}

//               <div className="flex items-start justify-between gap-4">

//                 {/* LEFT */}

//                 <div className="flex-1 min-w-0">

//                   {/* TITLE + STATUS */}

//                   <div className="flex items-center gap-3 flex-wrap">

//                     <h3
//                       className="
//                         text-[17px]
//                         font-semibold
//                         text-[#111]
//                         truncate
//                       "
//                     >
//                       {project.title}
//                     </h3>

//                     <div
//                       className={`
//                         px-3 py-1
//                         rounded-full
//                         border
//                         text-[11px]
//                         font-medium
//                         ${statusStyle.bg}
//                         ${statusStyle.text}
//                         ${statusStyle.border}
//                       `}
//                     >
//                       {project.status}
//                     </div>

//                   </div>

//                   {/* META */}

//                   <div
//                     className="
//                       flex
//                       items-center
//                       gap-5
//                       mt-4
//                       flex-wrap
//                     "
//                   >

//                     {/* PHASE */}

//                     <div className="flex items-center gap-2">

//                       <Layers3
//                         size={15}
//                         className="text-[#8B8B8B]"
//                       />

//                       <p className="text-[13px] text-[#666]">
//                         Phase:

//                         <span className="ml-1 font-medium text-[#111]">
//                           {project.currentPhase}
//                         </span>
//                       </p>

//                     </div>

//                     {/* END DATE */}

//                     <div className="flex items-center gap-2">

//                       <CalendarDays
//                         size={15}
//                         className="text-[#8B8B8B]"
//                       />

//                       <p className="text-[13px] text-[#666]">
//                         Due:

//                         <span className="ml-1 font-medium text-[#111]">
//                           {new Date(
//                             project.endDate
//                           ).toLocaleDateString()}
//                         </span>

//                       </p>

//                     </div>

//                     {/* PRIORITY */}

//                     <div
//                       className={`
//                         text-[13px]
//                         font-semibold
//                         ${
//                           PRIORITY_STYLES[
//                             project.priority
//                           ]
//                         }
//                       `}
//                     >
//                       {project.priority} Priority
//                     </div>

//                   </div>

//                 </div>

//                 {/* ARROW */}

//                 <button
//                   className="
//                     w-10 h-10
//                     shrink-0
//                     rounded-full
//                     border border-[#ECECEC]
//                     flex items-center justify-center
//                     opacity-0
//                     group-hover:opacity-100
//                     transition-all
//                   "
//                 >
//                   <ArrowUpRight size={17} />
//                 </button>

//               </div>

//               {/* PROGRESS */}

//               <div className="mt-5">

//                 <div className="flex items-center justify-between mb-2">

//                   <p className="text-[13px] text-[#666]">
//                     Progress
//                   </p>

//                   <p className="text-[13px] font-semibold text-[#111]">
//                     {project.progress}%
//                   </p>

//                 </div>

//                 <div
//                   className="
//                     w-full
//                     h-2.5
//                     rounded-full
//                     bg-[#F1F1F1]
//                     overflow-hidden
//                   "
//                 >

//                   <div
//                     className="
//                       h-full
//                       rounded-full
//                       bg-[#111]
//                       transition-all
//                     "
//                     style={{
//                       width: `${project.progress}%`,
//                     }}
//                   />

//                 </div>

//               </div>

//               {/* FOOTER */}

//               <div className="mt-5 flex items-center justify-between">

//                 <p className="text-[12px] text-[#8A8A8A]">
//                   {project.engineerId
//                     ? "Engineer Assigned"
//                     : "Searching Engineer"}
//                 </p>

//                 <p className="text-[12px] text-[#8A8A8A]">
//                   Created{" "}

//                   {new Date(
//                     project.createdAt
//                   ).toLocaleDateString()}
//                 </p>

//               </div>

//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

"use client";

import {
  ArrowUpRight,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  progress: number;
  createdAt: string;
}

interface ProjectCollaborationCardProps {
  projects: Project[];
}

const STATUS_STYLES = {
  SEARCHING: {
    bg: "bg-[#FFF7E8]",
    text: "text-[#D97706]",
  },

  ACTIVE: {
    bg: "bg-[#EEF9F1]",
    text: "text-[#238B57]",
  },

  COMPLETED: {
    bg: "bg-[#EEF4FF]",
    text: "text-[#2563EB]",
  },
};

const PRIORITY_COLORS = {
  LOW: "bg-[#238B57]",
  MEDIUM: "bg-[#D97706]",
  HIGH: "bg-[#E5484D]",
};

export default function ProjectCollaborationCard({
  projects,
}: ProjectCollaborationCardProps) {

  // ONLY LATEST 5 PROJECTS

  const latestProjects = [...projects]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  return (
    <div
      className="
        bg-white
        w-full
        h-full
        rounded-[28px]
        border border-[#ECECEC]
        p-5
        overflow-hidden
      "
    >

      {/* HEADER */}

      <div className="flex items-center justify-between mb-5">

        <div>
          <h2 className="text-[1.1rem] font-semibold text-[#111]">
            Latest Projects
          </h2>

          <p className="text-[12px] text-[#8A8A8A] mt-1">
            Recently created
          </p>
        </div>

        <div
          className="
            px-3 py-1.5
            rounded-full
            bg-[#F7F7F7]
            text-[12px]
            font-medium
            text-[#111]
          "
        >
          {latestProjects.length}
        </div>

      </div>

      {/* LIST */}

      <div className="flex flex-col gap-3">

        {latestProjects.map((project) => {

          const statusStyle =
            STATUS_STYLES[
              project.status as keyof typeof STATUS_STYLES
            ] || STATUS_STYLES.SEARCHING;

          return (
            <div
              key={project.id}
              className="
                group
                border border-[#F1F1F1]
                rounded-[18px]
                p-4
                transition-all
                hover:border-[#E4E4E4]
                hover:shadow-sm
              "
            >

              {/* TOP */}

              <div className="flex items-start justify-between gap-3">

                <div className="min-w-0 flex-1">

                  {/* TITLE */}

                  <div className="flex items-center gap-2">

                    <div
                      className={`
                        w-2 h-2
                        rounded-full
                        ${
                          PRIORITY_COLORS[
                            project.priority
                          ]
                        }
                      `}
                    />

                    <h3
                      className="
                        text-[14px]
                        font-semibold
                        text-[#111]
                        truncate
                      "
                    >
                      {project.title}
                    </h3>

                  </div>

                  {/* META */}

                  <div className="flex items-center gap-2 mt-3">

                    {/* STATUS */}

                    <div
                      className={`
                        px-2 py-1
                        rounded-full
                        text-[10px]
                        font-medium
                        ${statusStyle.bg}
                        ${statusStyle.text}
                      `}
                    >
                      {project.status}
                    </div>

                    {/* PROGRESS */}

                    <p className="text-[11px] text-[#777]">
                      {project.progress}%
                    </p>

                  </div>

                </div>

                {/* BUTTON */}

                <button
                  className="
                    w-8 h-8
                    rounded-full
                    border border-[#ECECEC]
                    flex items-center justify-center
                    opacity-0
                    group-hover:opacity-100
                    transition-all
                    shrink-0
                  "
                >
                  <ArrowUpRight size={14} />
                </button>

              </div>

              {/* PROGRESS BAR */}

              <div className="mt-4">

                <div
                  className="
                    w-full
                    h-1.5
                    rounded-full
                    bg-[#F1F1F1]
                    overflow-hidden
                  "
                >

                  <div
                    className={`
                      h-full
                      rounded-full
                      ${
                        PRIORITY_COLORS[
                          project.priority
                        ]
                      }
                    `}
                    style={{
                      width: `${project.progress}%`,
                    }}
                  />

                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}