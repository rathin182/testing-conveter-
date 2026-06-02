"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  ArrowLeft,
  FolderSearch,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL_USERS");
  const [engineers, setEngineers] = useState<any[]>([]);
  const [sendingLoader, setSendingLoader] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>([]);
  const [aiLoading, setAiLoading] = useState(true);
  const [dots, setDots] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const hasRunAi = useRef(false);
  const [filters, setFilters] = useState({
    experiences: [] as string[],
    skills: [] as string[],
    qualifications: [] as string[],
    aiOnly: false,
  });
  const [draggedItem, setDraggedItem] =
    useState<any | null>(null);

  const columns = [
    {
      id: "ALL_USERS",
      title: "All Users",
      icon: Users,
      color: "blue",
    },
    {
      id: "WAITING",
      title: "Waiting",
      icon: Clock3,
      color: "yellow",
    },
    {
      id: "REJECTED",
      title: "Rejected",
      icon: XCircle,
      color: "red",
    },
    {
      id: "APPROVED",
      title: "Approved",
      icon: CheckCircle2,
      color: "green",
    },


  ];

  const getInvitationsByStatus = (status: string) => {
    if (status === "ALL_USERS") {
      return invitations;
    }

    if (status === "APPROVED") {
      return invitations.filter(
        (inv) => inv.status === "ACCEPTED"
      );
    }

    if (status === "REJECTED") {
      return invitations.filter(
        (inv) =>
          inv.status === "REJECTED" ||
          inv.status === "ADMIN_REJECTED"
      );
    }

    if (status === "WAITING") {
      return invitations.filter(
        (inv) =>
          inv.status === "PENDING_ADMIN" ||
          inv.status === "SENT"
      );
    }

    return [];
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/project/${projectId}/invitations`);
      const json = await res.json();

      setProject(json.project);

      setInvitations(json.invitations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngineers = async () => {
    try {
      const res = await fetch("/api/users");

      const json = await res.json();

      setEngineers(json.engineers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (
    type: "ENGINEER" | "INVITATION",
    data: any,
    fromColumn: string
  ) => {
    setDraggedItem({
      type,
      data,
      fromColumn,
    });
  };

  const handleDragOver = (
    e: React.DragEvent
  ) => {
    e.preventDefault();
  };

  const handleSendInvitation = async (engineerId: string) => {
    try {
      setSendingLoader(engineerId);
      await fetch("/api/admin/invitations", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          projectId,
          engineerId,
        }),
      }
      );

      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setSendingLoader(null);
    }
  };

  const handleAction = async (
    invitationId: string,
    action: "APPROVE" | "REJECT"
  ) => {
    try {
      await fetch(`/api/admin/invitations/${invitationId}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });

      fetchData(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  // const handleDrop = async (
  //   newColumn: string
  // ) => {
  //   if (!draggedItem) return;

  //   const {
  //     type,
  //     data,
  //     fromColumn,
  //   } = draggedItem;
  //   console.log(fromColumn);
  //   console.log(newColumn);
  //   try {

  //     /*
  //     =====================================
  //     ENGINEER
  //     =====================================
  //     */

  //     if (type === "ENGINEER") {

  //       // ALL_USERS -> WAITING
  //       // ALL_USERS -> APPROVED
  //       // ALL_USERS -> REJECTED

  //       if (
  //         newColumn === "ALL_USERS"
  //       ) {
  //         return;
  //       }

  //       let status = "SENT";

  //       if (
  //         newColumn === "APPROVED"
  //       ) {
  //         status = "ACCEPTED";
  //       }

  //       if (
  //         newColumn === "REJECTED"
  //       ) {
  //         status = "REJECTED";
  //       }

  //       await fetch(
  //         "/api/admin/invitations",
  //         {
  //           method: "POST",

  //           headers: {
  //             "Content-Type":
  //               "application/json",
  //           },

  //           body: JSON.stringify({
  //             projectId,

  //             engineerId:
  //               data.engineerProfile.id,

  //             status,
  //           }),
  //         }
  //       );

  //       fetchData();
  //     }

  //     /*
  //     =====================================
  //     INVITATION
  //     =====================================
  //     */

  //     if (
  //       type === "INVITATION"
  //     ) {

  //       // WAITING -> ANYWHERE DISABLED
  //       if (
  //         fromColumn === "WAITING"
  //       ) {
  //         return;
  //       }

  //       // APPROVED -> ANYWHERE DISABLED
  //       if (
  //         fromColumn === "APPROVED"
  //       ) {
  //         return;
  //       }

  //       // REJECTED RULES
  //       if (
  //         fromColumn === "REJECTED"
  //       ) {

  //         // ONLY REJECTED -> WAITING
  //         if (
  //           newColumn !== "WAITING"
  //         ) {
  //           return;
  //         }
  //         console.log(data.id, "called from patch");

  //         const res = await fetch(
  //           `/api/admin/invitations/`,
  //           {
  //             method: "PATCH",

  //             headers: {
  //               "Content-Type":
  //                 "application/json",
  //             },

  //             body: JSON.stringify({
  //               status: "SENT",
  //               id: data.id
  //             }),
  //           }
  //         );
  //         console.log(res, "response in patch");

  //         fetchData();

  //         return;
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }

  //   setDraggedItem(null);
  // };

  const handleDrop = async (newColumn: string) => {

    if (!draggedItem) return;

    const {
      type,
      data,
      fromColumn,
    } = draggedItem;

    // console.log(fromColumn);
    // console.log(newColumn);

    try {

      /*
      =====================================
      ENGINEER
      =====================================
      */

      if (type === "ENGINEER") {

        // ALL_USERS -> WAITING
        // ALL_USERS -> APPROVED
        // ALL_USERS -> REJECTED
        // APPROVED already has someone
        // console.log(getInvitationsByStatus, "getInvitationsByStatus", getInvitationsByStatus("APPROVED"), "approved invitations");
        if (newColumn === "APPROVED" && getInvitationsByStatus("APPROVED").length > 0) {
          setDraggedItem(null);
          return;
        }

        if (
          newColumn === "ALL_USERS"
        ) {
          return;
        }

        let status = "SENT";

        if (
          newColumn === "APPROVED"
        ) {
          status = "ACCEPTED";
        }

        if (
          newColumn === "REJECTED"
        ) {
          status = "REJECTED";
        }

        await fetch(
          "/api/admin/invitations",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              projectId,

              engineerId:
                data.engineerProfile.id,

              status,
            }),
          }
        );

        fetchData();
      }

      /*
      =====================================
      INVITATION
      =====================================
      */

      if (
        type === "INVITATION"
      ) {

        /*
        =====================================
        MOVE BACK TO ALL USERS
        =====================================
        */

        if (
          newColumn === "ALL_USERS"
        ) {

          await fetch(
            `/api/admin/invitations`,
            {
              method: "DELETE",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                id: data.id,
              }),
            }
          );
          fetchData();

          return;
        }

        /*
        =====================================
        WAITING RULES
        =====================================
        */

        if (
          fromColumn === "WAITING"
        ) {
          return;
        }

        /*
        =====================================
        APPROVED RULES
        =====================================
        */

        if (
          fromColumn === "APPROVED"
        ) {
          return;
        }

        /*
        =====================================
        REJECTED RULES
        =====================================
        */

        if (
          fromColumn === "REJECTED"
        ) {

          // ONLY REJECTED -> WAITING

          if (
            newColumn !== "WAITING"
          ) {
            return;
          }

          // console.log(
          //   data.id,
          //   "called from patch"
          // );

          const res = await fetch(
            `/api/admin/invitations/`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                status: "SENT",
                id: data.id,
              }),
            }
          );

          // console.log(
          //   res,
          //   "response in patch"
          // );

          fetchData();

          return;
        }
      }

    } catch (error) {

      console.error(error);

    }

    setDraggedItem(null);
  };

  const filteredEngineers = engineers.filter((engineer) => engineer.engineerProfile !== null);
  // console.log(filteredEngineers, "filtered engineers");

  const automation = async () => {
    try {
      setAiLoading(true);
      const filteredEngineers = engineers.filter((engineer) => engineer.engineerProfile !== null);
      if (filteredEngineers.length < 0) {
        return;
      }
      const res = await fetch(`/api/admin/project-matcher`, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          projectId,
          engineers: filteredEngineers,
        }),
      });
      const json = await res.json();

      const lead = setAiSuggestions(json.aiSuggestions || []);
    } catch (error) {
      console.error(error);
    } finally {

      setAiLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    fetchEngineers();
  }, []);

  useEffect(() => {
    if (!projectId) return;

    if (engineers.length === 0) return;

    if (hasRunAi.current) return;

    hasRunAi.current = true;

    automation();
  }, [projectId, engineers]);

  useEffect(() => {
    if (!aiLoading) return;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [aiLoading]);

  const aiSuggestionIds = new Set(
    aiSuggestions.map(
      (engineer: any) => engineer.id
    )
  );

  const remainingEngineers =
    engineers.filter(
      (engineer) =>
        !aiSuggestionIds.has(
          engineer.id
        )
    );

  const allUsers = [
    ...aiSuggestions,
    ...remainingEngineers,
  ];

  // const filteredUsers = allUsers.filter((engineer) => {
  //   const query = search.toLowerCase().trim();

  //   if (!query) return true;

  //   const skills =
  //     engineer?.engineerProfile?.skills ||
  //     engineer?.skills ||
  //     [];

  //   const experience =
  //     engineer?.engineerProfile?.yearsOfExperienceNumber ||
  //     engineer?.yearsOfExperience ||
  //     0;

  //   const qualification =
  //     engineer?.engineerProfile?.qualification ||
  //     engineer?.qualification ||
  //     "";

  //   return (
  //     engineer?.name
  //       ?.toLowerCase()
  //       .includes(query) ||

  //     engineer?.email
  //       ?.toLowerCase()
  //       .includes(query) ||

  //     qualification
  //       ?.toLowerCase()
  //       .includes(query) ||

  //     String(experience).includes(query) ||

  //     skills.some((skill: string) =>
  //       skill.toLowerCase().includes(query)
  //     )
  //   );
  // });

  const availableSkills = [
    ...new Set(
      engineers.flatMap(
        (e) => e?.engineerProfile?.skills || []
      )
    ),
  ];

  const filteredUsers = allUsers.filter((engineer) => {
    const profile = engineer?.engineerProfile;

    if (!profile) return false;

    const query = search.toLowerCase().trim();

    const skills = profile?.skills || [];
    const experience =
      profile?.yearsOfExperienceNumber ??
      engineer?.yearsOfExperience ??
      0;

    const qualification =
      profile?.qualification ||
      engineer?.qualification ||
      "";

    /*
    ==========================
    SEARCH FILTER
    ==========================
    */

    const matchesSearch =
      !query ||
      engineer?.name
        ?.toLowerCase()
        .includes(query) ||

      engineer?.email
        ?.toLowerCase()
        .includes(query) ||

      qualification
        ?.toLowerCase()
        .includes(query) ||

      String(experience).includes(query) ||

      skills.some((skill: string) =>
        skill.toLowerCase().includes(query)
      );

    if (!matchesSearch) return false;

    /*
    ==========================
    AI FILTER
    ==========================
    */

    if (
      filters.aiOnly &&
      !aiSuggestionIds.has(engineer.id)
    ) {
      return false;
    }

    /*
    ==========================
    EXPERIENCE FILTER
    ==========================
    */

    if (filters.experiences.length > 0) {
      const matchesExperience =
        filters.experiences.some((range) => {
          switch (range) {
            case "0-2":
              return experience >= 0 && experience <= 2;

            case "2-5":
              return experience > 2 && experience <= 5;

            case "5-10":
              return experience > 5 && experience <= 10;

            case "10+":
              return experience > 10;

            default:
              return false;
          }
        });

      if (!matchesExperience) {
        return false;
      }
    }

    /*
    ==========================
    SKILLS FILTER
    ==========================
    */

    if (filters.skills.length > 0) {
      const matchesSkill =
        filters.skills.some((selectedSkill) =>
          skills.some(
            (skill: string) =>
              skill.toLowerCase() ===
              selectedSkill.toLowerCase()
          )
        );

      if (!matchesSkill) {
        return false;
      }
    }

    /*
    ==========================
    QUALIFICATION FILTER
    ==========================
    */

    if (filters.qualifications.length > 0) {
      const matchesQualification =
        filters.qualifications.some(
          (q) =>
            q.toLowerCase() ===
            qualification.toLowerCase()
        );

      if (!matchesQualification) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setFilters({
      experiences: [],
      skills: [],
      qualifications: [],
      aiOnly: false,
    });

    setSearch("");
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[var(--bg)] p-6">

        {/* TOP NAV SKELETON */}
        <div className="flex items-center justify-between mb-6 bg-white border border-[var(--border)] rounded-2xl p-4 animate-pulse">

          <div className="h-11 w-28 rounded-xl bg-gray-200" />

          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-48 rounded-lg bg-gray-200" />
            <div className="h-4 w-36 rounded-lg bg-gray-100" />
          </div>

          <div className="w-28" />
        </div>

        {/* BOARD */}
        <div className="grid grid-cols-4 gap-6 h-[calc(100vh-140px)]">

          {[1, 2, 3, 4].map((col) => (
            <div
              key={col}
              className="
              rounded-3xl
              border
              border-[var(--border)]
              bg-white
              p-4
              flex
              flex-col
              animate-pulse
            "
            >

              {/* COLUMN HEADER */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-200" />
                  <div className="h-5 w-24 rounded-lg bg-gray-200" />
                </div>

                <div className="h-5 w-6 rounded bg-gray-200" />
              </div>

              {/* CARDS */}
              <div className="space-y-4">

                {[1, 2, 3, 4].map((card) => (
                  <div
                    key={card}
                    className="
                    rounded-2xl
                    border
                    border-gray-100
                    p-4
                    bg-[#fafafa]
                  "
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-12 h-12 rounded-full bg-gray-200" />

                      <div className="flex-1">
                        <div className="h-5 w-32 rounded bg-gray-200 mb-2" />
                        <div className="h-4 w-20 rounded bg-gray-100" />
                      </div>

                    </div>

                    <div className="flex gap-2 mt-4">
                      <div className="h-7 w-24 rounded-full bg-gray-100" />
                      <div className="h-7 w-20 rounded-full bg-gray-100" />
                    </div>

                  </div>
                ))}

              </div>
            </div>
          ))}

        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--bg)] p-6">

        <div
          className="w-full max-w-md bg-white border border-[var(--border)] rounded-3xl shadow-sm p-8 text-center">

          {/* ICON */}
          <div
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center bg-red-50 border border-red-100 mb-6">
            <FolderSearch className="w-10 h-10 text-red-500" />
          </div>

          {/* TITLE */}
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Project Not Found
          </h1>

          {/* DESCRIPTION */}
          <p
            className="text-sm leading-6 mt-3"
            style={{
              color: "var(--text-muted)",
            }}
          >
            The project you are trying to access
            does not exist or may have been removed.
          </p>

          {/* ACTIONS */}
          <div className="flex items-center justify-center gap-3 mt-8">

            <button
              onClick={() => router.back()}
              className="h-11 px-5 rounded-xl border border-[var(--border)] bg-white hover:bg-gray-50 transition-all text-sm font-medium"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Go Back
            </button>

            <button
              onClick={() => router.push('/admin/projects')}
              className="h-11 px-5 rounded-xl bg-black hover:opacity-90 transition-all text-sm font-medium text-white">
              View Projects
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    // <DashboardShell>
    //   <div className="p-6 space-y-6">

    //     {/* PROJECT */}
    //     <Card>
    //       <CardHeader>
    //         <CardTitle>Project</CardTitle>
    //       </CardHeader>
    //       <CardContent>
    //         <h2 className="text-xl font-bold">{project.title}</h2>
    //         <p className="text-muted-foreground">{project.description}</p>

    //         <div className="flex gap-3 mt-3">
    //           <Badge>{project.status}</Badge>
    //           <Badge variant="outline">₹{project.budget}</Badge>
    //         </div>
    //       </CardContent>
    //     </Card>

    //     {/* INVITATIONS */}
    //     <Card>
    //       <CardHeader>
    //         <CardTitle>Invited Engineers</CardTitle>
    //       </CardHeader>

    //       <CardContent className="space-y-3">
    //         {invitations.length === 0 ? (
    //           <p className="text-sm text-muted-foreground">
    //             No invitations yet
    //           </p>
    //         ) : (
    //           invitations.map((inv) => (
    //             <div
    //               key={inv.id}
    //               className="flex justify-between items-center border p-3 rounded-lg"
    //             >
    //               <div>
    //                 <p className="font-medium">
    //                   {inv.engineer.user.name}
    //                 </p>
    //                 <p className="text-sm text-muted-foreground">
    //                   {inv.engineer.user.email}
    //                 </p>
    //               </div>

    //               <div className="flex items-center gap-3">
    //                 <Badge>{inv.status}</Badge>

    //                 {inv.status === "PENDING_ADMIN" && (
    //                   <>
    //                     <Button
    //                       size="sm"
    //                       onClick={() =>
    //                         handleAction(inv.id, "APPROVE")
    //                       }
    //                     >
    //                       Approve
    //                     </Button>

    //                     <Button
    //                       size="sm"
    //                       variant="destructive"
    //                       onClick={() =>
    //                         handleAction(inv.id, "REJECT")
    //                       }
    //                     >
    //                       Reject
    //                     </Button>
    //                   </>
    //                 )}
    //               </div>
    //             </div>
    //           ))
    //         )}
    //       </CardContent>
    //     </Card>

    //   </div>
    // </DashboardShell>

    <div className="p-6 h-full overflow-hidden">
      <div className=" relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#f7f5f5] rounded-2xl p-4 md:p-5">

        {/* PAGE TITLE */}
        <div className="flex flex-col min-w-0">

          <h1
            className="text-xl sm:text-2xl font-semibold tracking-tight break-words"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Project Members
          </h1>

          <p
            className="text-sm mt-1 leading-relaxed"
            style={{
              color: "var(--text-muted)",
            }}
          >
            Manage engineers and invitations
          </p>

        </div>

        {/* BACK BUTTON */}
        <div className="flex gap-5 items-center">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-full max-w-md">

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by name, skill, experience..."
                className=" w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />

            </div>

            <div className="flex gap-3">

              <button
                onClick={() => setShowFilters(true)}
                className=" h-11 px-4 rounded-xl border bg-white flex items-center gap-2">
                <SlidersHorizontal size={16} />
                Filters

                {(filters.skills.length +
                  filters.experiences.length +
                  filters.qualifications.length) > 0 && (
                    <span className=" h-5 min-w-5 px-1 rounded-full bg-cyan-500 text-white text-[10px] flex items-center justify-center">
                      {filters.skills.length +
                        filters.experiences.length +
                        filters.qualifications.length}
                    </span>
                  )}
              </button>

            </div>
          </div>
          <div
            className="flex sm:block w-full sm:w-auto"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center cursor-pointer gap-2 w-full sm:w-auto px-4 h-11 rounded-xl border border-[var(--border)] bg-white hover:bg-gray-50 transition-all shadow-sm text-sm font-medium"
              style={{
                color: "var(--text-primary)",
              }}
            >

              <span>
                Back
              </span>

              <ArrowRight className="w-4 h-4 shrink-0" />

            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6 h-screen mt-2 p-4 bg-[#f8f6f6] rounded-2xl">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl mb-4 p-3 bg-white border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div
                  className={`
                p-2
                rounded-lg
                ${column.color === "blue"
                      ? "bg-blue-50 text-blue-600"
                      : column.color === "green"
                        ? "bg-green-50 text-green-600"
                        : column.color === "red"
                          ? "bg-red-50 text-red-600"
                          : "bg-yellow-50 text-yellow-600"
                    }
              `}
                >
                  <column.icon className="w-5 h-5" />
                </div>

                <h2
                  className="font-semibold text-base"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  {column.title}
                </h2>
              </div>

              <span
                className="text-sm font-medium mr-2"
                style={{
                  color: "var(--text-muted)",
                }}
              >
                {column.id === "ALL_USERS"
                  ? engineers
                    .filter(
                      (engineer) => engineer.engineerProfile
                    )
                    .filter((engineer) => {
                      const alreadyInvited =
                        invitations.some(
                          (invitation) =>
                            invitation.engineerId ===
                            engineer.engineerProfile.id
                        );

                      return !alreadyInvited;
                    }).length
                  : getInvitationsByStatus(column.id).length}
              </span>
            </div>

            <div
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
              className={`flex-1 h-full min-h-0 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--bg)] p-2 transition-colors overflow-y-auto
                ${draggedItem
                  ? "bg-white"
                  : ""
                }
            `}
            >
              {column.id === "ALL_USERS" && (
                <>
                  {aiLoading && (
                    <div className="mb-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-cyan-500 animate-pulse" />
                        <h3 className="font-semibold text-cyan-700">
                          AI is finding the best engineers{dots}
                        </h3>
                      </div>
                    </div>
                  )}

                  {filteredUsers
                    .filter((engineer) => {
                      const alreadyInvited = invitations.some(
                        (invitation) =>
                          invitation.engineerId ===
                          engineer?.engineerProfile?.id
                      );

                      return !alreadyInvited;
                    }).filter(
                      (engineer) => engineer?.engineerProfile
                    )
                    .map((engineer) => {
                      const isAiRecommended =
                        aiSuggestionIds.has(engineer.id);

                      return (
                        <div
                          key={engineer.id}
                          draggable
                          onDragStart={() =>
                            handleDragStart(
                              "ENGINEER",
                              engineer,
                              "ALL_USERS"
                            )
                          }
                          className="bg-white border border-[var(--border)] rounded-2xl p-4 mb-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-sm"
                        >
                          <div className="flex items-center gap-3">

                            {engineer.image ? (
                              <img
                                src={engineer.image}
                                alt={engineer.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                style={{
                                  background: "var(--primary)",
                                }}
                              >
                                {engineer.name?.charAt(0)}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-center justify-between">

                                <div className="flex items-center gap-2">

                                  <h3
                                    className="font-semibold text-[18px] truncate leading-tight tracking-[-0.02em]"
                                    style={{
                                      color:
                                        "var(--text-primary)",
                                    }}
                                  >
                                    {engineer.name}
                                  </h3>

                                  {isAiRecommended && (
                                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-700 border border-cyan-200">
                                      AI PICK
                                    </span>
                                  )}

                                </div>

                                <button
                                  disabled={
                                    sendingLoader ===
                                    engineer?.engineerProfile?.id
                                  }
                                  onClick={() =>
                                    handleSendInvitation(
                                      engineer?.engineerProfile?.id
                                    )
                                  }
                                  className={`cursor-pointer shrink-0 h-8 sm:h-9 px-3 sm:px-4 rounded-xl text-white text-[11px] sm:text-[12px] font-semibold shadow-sm ${sendingLoader ===
                                    engineer?.engineerProfile?.id
                                    ? "bg-[#FFC98F] cursor-not-allowed opacity-70"
                                    : "bg-[#FFAE58]"
                                    }`}
                                >
                                  {sendingLoader ===
                                    engineer?.engineerProfile?.id
                                    ? "Inviting..."
                                    : "Invite"}
                                </button>
                              </div>

                              {(engineer?.engineerProfile?.skills || engineer?.skills)?.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mb-3 mt-1">

                                  {(engineer?.engineerProfile?.skills || engineer?.skills).slice(0, 3).map(
                                    (skill: string, index: number) => (
                                      <span
                                        key={index}
                                        className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-medium bg-[#FFF7ED] border border-[#FED7AA] whitespace-nowrap"
                                        style={{
                                          color: "#C2410C",
                                        }}
                                      >
                                        {skill}
                                      </span>
                                    )
                                  )}

                                </div>
                              )}

                              <span
                                className="px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0]"
                                style={{
                                  color: "#475569",
                                }}
                              >
                                {
                                  engineer
                                    ?.engineerProfile
                                    ?.yearsOfExperienceNumber ||
                                  0
                                }{" "}
                                years
                              </span>

                            </div>
                          </div>
                        </div>
                      );
                    })}
                </>
              )}

              {column.id !== "ALL_USERS" &&
                getInvitationsByStatus(
                  column.id
                ).map((invitation) => (
                  <div
                    key={invitation.id}

                    draggable={
                      column.id === "REJECTED" || column.id === "WAITING" || column.id === "APPROVED"
                    }

                    onDragStart={() =>
                      handleDragStart(
                        "INVITATION",
                        invitation,
                        column.id
                      )
                    }

                    className="bg-white border border-[var(--border)] rounded-2xl p-4 mb-3 transition-all">

                    <div className="flex items-center gap-3">

                      {/* IMAGE */}
                      {invitation.engineer.user
                        .image ? (
                        <img
                          src={
                            invitation.engineer
                              .user.image
                          }
                          alt={
                            invitation.engineer
                              .user.name
                          }
                          className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                          style={{
                            background:
                              "var(--primary)",
                          }}
                        >
                          {invitation.engineer.user.name?.charAt(
                            0
                          )}
                        </div>
                      )}

                      {/* INFO */}
                      <div className="min-w-0 flex-1">

                        <h3
                          className="font-semibold text-[15px] truncate mb-1"
                          style={{
                            color:
                              "var(--text-primary)",
                          }}
                        >
                          {
                            invitation.engineer?.user?.name
                          }
                        </h3>

                        {/* <p
                          className="text-[11px] font-medium"
                          style={{
                            color:
                              "var(--text-muted)",
                          }}
                        >
                          {
                            invitation.engineer?.qualification
                          }
                        </p> */}

                        <div>
                          <div className="mb-3">
                            {invitation.engineer?.skills
                              ?.slice(0, 3)
                              .map((skill: string, index: number) => (

                                <span
                                  key={index}
                                  className="px-2.5 mr-2 py-1 rounded-full text-[9px] sm:text-[10px] font-medium bg-[#FFF7ED] border border-[#FED7AA] whitespace-nowrap"
                                  style={{
                                    color: "#C2410C",
                                  }}
                                >
                                  {skill}
                                </span>

                              ))}
                          </div>

                          <span
                            className="px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0]"
                            style={{
                              color: "#475569",
                            }}
                          >
                            {invitation.engineer?.yearsOfExperienceNumber || 0} years
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {showFilters && (
        <div
          className=" fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div
            className=" w-[500px] max-w-[95vw] bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                Filters
              </h2>

              <button
                onClick={() => setShowFilters(false)}
              >
                ✕
              </button>
            </div>

            {/* EXPERIENCE */}
            <div className="mb-5">
              <h3 className="font-medium mb-3">
                Experience
              </h3>

              <div className="flex flex-wrap gap-2">
                {["0-2", "2-5", "5-10", "10+"].map(
                  (exp) => (
                    <button
                      key={exp}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          experiences:
                            prev.experiences.includes(exp)
                              ? prev.experiences.filter(
                                (e) => e !== exp
                              )
                              : [
                                ...prev.experiences,
                                exp,
                              ],
                        }))
                      }
                      className={`
                  px-3 py-2 rounded-lg border
                  ${filters.experiences.includes(exp)
                          ? "bg-cyan-500 text-white"
                          : "bg-white"
                        }
                `}
                    >
                      {exp} Years
                    </button>
                  )
                )}
              </div>
            </div>

            {/* AI PICK */}
            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.aiOnly}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      aiOnly: e.target.checked,
                    }))
                  }
                />

                AI Recommended Only
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={clearFilters}
                className=" px-4 py-2 border rounded-lg">
                Clear
              </button>

              <button
                onClick={() => { setShowFilters(false); }}
                className=" px-4 py-2 bg-cyan-500 text-white rounded-lg">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}