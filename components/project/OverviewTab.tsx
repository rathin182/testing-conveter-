"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp, CheckCheck, LucideCheckCheck, LucideCopy, LucideEdit3, Send, CreditCard } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { usePayment } from "@/hooks/usePayment";
import { T, getApiBase, ProgressGauge, PriorityBadge, StatusBadge, TeamMemberCard } from "./OverviewUI";
import { EditModal, SubmitReviewModal, ProgressModal } from "./OverviewModals";

export default function OverviewTab({ project }: { project: any }) {
  const { user } = useAuth();
  const { processPayment, loading: isPaying } = usePayment();
  
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(project?.progress || 0);
  const [editModel, setEditModel] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Roles
  const isAdmin = user?.role === "ADMIN";
  const isClient = user?.role === "CLIENT";
  const isEngineer = user?.role === "ENGINEER";
  const canEditDetails = isAdmin || isClient;

  const totalMilestones = project?.milestones?.length || 0;
  const completedMilestones = project?.milestones?.filter((m: any) => m.completed).length || 0;

  useEffect(() => {
    if (project?.progress) setCurrentProgress(project.progress);
  }, [project]);

  const copyTextToClipboard = async (link: string) => {
    try { await navigator.clipboard.writeText(link); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); } catch { }
  };

  const handleProgressUpdate = async (newProgress: number) => {
    setUpdating(true);
    try {
      const apiBase = getApiBase(user?.role as string);
      const r = await fetch(`${apiBase}/${project.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ progress: newProgress }),
      });
      const d = await r.json();
      if (d.success) {
        toast.success("Progress updated");
        setShowProgressModal(false);
        setCurrentProgress(newProgress);
      } else { toast.error(d.message || "Failed"); }
    } catch { toast.error("Failed to update progress"); }
    finally { setUpdating(false); }
  };

  const triggerPayment = (isFromCompleteFlow = false) => {
    processPayment({
      projectId: project.id,
      redirectPath: `/client/project/${project.id}`,
      user: { name: user?.name, email: user?.email },
      description: `Project Payment - ${project.title}`,
      onSuccess: () => {
        window.location.reload();
      },
      onError: () => {
        if (isFromCompleteFlow) {
          setTimeout(() => window.location.reload(), 1500); 
        }
      },
      onDismiss: () => {
        if (isFromCompleteFlow) {
          window.location.reload();
        }
      }
    });
  };

  const handleClientComplete = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/client/projects/${project.id}/complete`, { method: "POST" });
      const data = await res.json();
      
      if (data.success) { 
        toast.success("Project Approved! Initiating final payment..."); 
        triggerPayment(true); 
      } 
      else { 
        toast.error(data.message || "Failed to complete"); 
      }
    } catch { 
      toast.error("Error occurred"); 
    } finally {
      setUpdating(false); 
    }
  };

  if (!project) return null;

  const cardStyle: React.CSSProperties = { background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "1.5rem" };
  const teamSectionLabel = isClient ? "Your Engineer" : isEngineer ? "Your Client" : "Team Members";

  // Prevent multiple clicks if EITHER the local update OR the razorpay hook is loading
  const isActionDisabled = updating || isPaying;

  return (
    <>
      <Toaster position="top-right" />
      {editModel && <EditModal showModel={setEditModel} projectData={project} userRole={user?.role as string} />}
      {showSubmitModal && <SubmitReviewModal showModel={setShowSubmitModal} projectData={project} />}
      {showProgressModal && <ProgressModal current={currentProgress} onClose={() => setShowProgressModal(false)} onSave={handleProgressUpdate} saving={updating} />}

      <div className="bg-gray-50" style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <ProgressGauge progress={currentProgress} />
              <p style={{ margin: "12px 0 0", fontWeight: 600, fontSize: 14, color: T.text }}>Overall Progress</p>
              {isEngineer && (
                <button onClick={() => setShowProgressModal(true)} style={{ marginTop: 10, padding: "5px 16px", background: T.primaryLight, border: `1px solid ${T.primary}`, borderRadius: 20, color: T.primary, cursor: "pointer", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                  <ArrowUp size={13} /> Update
                </button>
              )}
            </div>
            
            <div style={{ background: T.primary, borderRadius: 16, padding: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 48, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                  {completedMilestones}<span style={{ fontSize: 28, fontWeight: 400 }}>/{totalMilestones}</span>
                </p>
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "rgba(255,255,255,0.85)" }}>Completed Milestones</p>
              </div>
            </div>
          </div>

          {project?.repository && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 8px" }}>Repository</h2>
              <div style={{ background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: T.textMuted }}>{project.repository?.split("/")[4]?.split(".git")[0]}</p>
                <div style={{ background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: 8, padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <code style={{ fontSize: 12, color: T.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.repository}</code>
                  <button onClick={() => copyTextToClipboard(project.repository!)} style={{ width: 28, height: 28, borderRadius: 6, background: T.primary, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8 }}>
                    {isCopied ? <LucideCheckCheck size={13} color="#fff" /> : <LucideCopy size={13} color="#fff" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 4px" }}>{teamSectionLabel}</h2>
            {isClient && (project.engineer?.user ? <TeamMemberCard user={project.engineer.user} label="Engineer" /> : <p style={{ fontSize: 13, color: T.textMuted, marginTop: 8 }}>No engineer assigned yet</p>)}
            {isEngineer && (project.client?.user ? <TeamMemberCard user={project.client.user} label="Client" /> : <p style={{ fontSize: 13, color: T.textMuted, marginTop: 8 }}>No client found</p>)}
            {isAdmin && (
              <>
                {project.client?.user && <TeamMemberCard user={project.client.user} label="Client" />}
                {project.engineer?.user ? <TeamMemberCard user={project.engineer.user} label="Engineer" /> : <p style={{ fontSize: 13, color: T.textMuted, marginTop: 8 }}>No engineer assigned yet</p>}
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: 0 }}>Project Information</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {canEditDetails && (
                  <button onClick={() => setEditModel(true)} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, padding: 4 }}>
                    <LucideEdit3 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ marginBottom: "1rem", display: "flex", gap: 10 }}>
              {isEngineer && project.status === "IN_PROGRESS" && (
                 <button onClick={() => setShowSubmitModal(true)} style={{ padding: "8px 16px", background: T.primary, border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                   <Send size={15} /> Submit for Review
                 </button>
              )}
              {/* MARK AS COMPLETED BUTTON */}
              {isClient && project.status === "IN_REVIEW" && (
                 <button onClick={handleClientComplete} disabled={isActionDisabled} style={{ padding: "8px 16px", background: T.success, border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: isActionDisabled ? 0.7 : 1 }}>
                   <CheckCheck size={16} /> {isActionDisabled ? "Processing..." : "Mark as Completed"}
                 </button>
              )}
              {/* FINAL PAYMENT BUTTON */}
              {isClient && project.status === "AWAITING_FINAL_PAYMENT" && (
                 <button onClick={() => triggerPayment(false)} disabled={isActionDisabled} style={{ padding: "8px 16px", background: T.primary, border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: isActionDisabled ? 0.7 : 1 }}>
                   <CreditCard size={16} /> {isPaying ? "Processing..." : "Pay Final Payment"}
                 </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <StatusBadge status={project.status} />
                {project.priority && <PriorityBadge priority={project.priority} />}
              </div>

              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: T.text }}>{project.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>{project.description}</p>
              </div>

              {(isAdmin || isEngineer) && (project.budget != null || project.earnings != null) && (
                <div style={{ background: T.bg, borderRadius: 10, padding: "10px 14px", border: `1px solid ${T.border}` }}>
                  <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {isEngineer ? "Earnings" : "Budget"}
                  </p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.text }}>
                    ₹{isEngineer ? project.earnings?.toLocaleString() : project.budget?.toLocaleString()}
                  </p>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {project.startDate && (
                  <div style={{ background: T.bg, borderRadius: 10, padding: "10px 14px", border: `1px solid ${T.border}` }}>
                    <p style={{ margin: "0 0 2px", fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Start Date</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.text }}>{new Date(project.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                  </div>
                )}
                {project.endDate && (
                  <div style={{ background: T.bg, borderRadius: 10, padding: "10px 14px", border: `1px solid ${T.border}` }}>
                    <p style={{ margin: "0 0 2px", fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Deadline</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.text }}>{new Date(project.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                  </div>
                )}
              </div>

              {(isAdmin || isClient) && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: project.advancePaid ? "#dcfce7" : "#fee2e2", color: project.advancePaid ? "#16a34a" : "#ef4444" }}>Advance {project.advancePaid ? "Paid" : "Pending"}</span>
                  <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: project.isFinalPaymentMade ? "#dcfce7" : "#fee2e2", color: project.isFinalPaymentMade ? "#16a34a" : "#ef4444" }}>Final Payment {project.isFinalPaymentMade ? "Done" : "Pending"}</span>
                </div>
              )}

              {project.finalProjectLink && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.05em" }}>Final Delivery</p>
                  <a href={project.finalProjectLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#16a34a", textDecoration: "underline", wordBreak: "break-all" }}>{project.finalProjectLink}</a>
                </div>
              )}

              {project.instruments && project.instruments.length > 0 && (
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Requirements</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {project.instruments.map((inst: string, i: number) => (
                      <span key={i} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: T.primaryLight, color: T.primary, fontWeight: 500, border: `1px solid ${T.primary}33` }}>{inst}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 1rem" }}>Work Done History</h2>
            {project.kanbanTasks && project.kanbanTasks.length > 0 ? (
               <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                 {project.kanbanTasks.map((task: any) => (
                    <div key={task.id} style={{ padding: "12px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.bg }}>
                       <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: T.text }}>{task.title}</p>
                       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                         <p style={{ margin: 0, fontSize: 12, color: T.textSec, fontWeight: 500 }}>
                           Status: <span style={{ color: T.primary }}>{task.status.replace("_", " ")}</span>
                         </p>
                         <p style={{ margin: 0, fontSize: 11, color: T.textMuted }}>
                           {new Date(task.updatedAt).toLocaleDateString()}
                         </p>
                       </div>
                    </div>
                 ))}
               </div>
            ) : (
               <p style={{ fontSize: 13, color: T.textMuted }}>No recent tasks found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}