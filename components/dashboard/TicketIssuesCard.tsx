"use client";

import {
    AlertTriangle,
    Bug,
    ShieldAlert,
    Clock3,
    ArrowUpRight,
} from "lucide-react";

interface Ticket {
    id: string;
    issueType: string;
    description: string;
    status: string;
    createdAt: string;

    raisedBy: {
        name: string;
    };
}

interface Project {
    id: string;
    title: string;
    tickets: Ticket[];
}

interface TicketIssuesCardProps {
    projects: Project[];
}

const ISSUE_STYLES: Record<
    string,
    {
        icon: React.ReactNode;
        bg: string;
        text: string;
        border: string;
    }
> = {
    BUG: {
        icon: <Bug size={14} />,
        bg: "bg-[#FFF2F0]",
        text: "text-[#E5484D]",
        border: "border-[#FFD6D3]",
    },

    SECURITY: {
        icon: <ShieldAlert size={14} />,
        bg: "bg-[#FFF7E8]",
        text: "text-[#D97706]",
        border: "border-[#FFE2A8]",
    },

    PAYMENT: {
        icon: <AlertTriangle size={14} />,
        bg: "bg-[#EEF9F1]",
        text: "text-[#238B57]",
        border: "border-[#D7F0DD]",
    },

    DEFAULT: {
        icon: <AlertTriangle size={14} />,
        bg: "bg-[#F4F4F5]",
        text: "text-[#52525B]",
        border: "border-[#E4E4E7]",
    },
};

function formatTimeAgo(date: string) {
    const now = new Date().getTime();
    const created = new Date(date).getTime();

    const diff = Math.floor((now - created) / 1000 / 60);

    if (diff < 60) return `${diff}m ago`;

    if (diff < 1440)
        return `${Math.floor(diff / 60)}h ago`;

    return `${Math.floor(diff / 1440)}d ago`;
}

export default function TicketIssuesCard({
    projects,
}: TicketIssuesCardProps) {
    const allTickets = projects.flatMap((project) =>
        project.tickets.map((ticket) => ({
            ...ticket,
            projectTitle: project.title,
        }))
    );

    return (
        <div className="bg-white w-full  self-start rounded-[28px] border border-[#ECECEC] p-5 h-screen overflow-hidden flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-[1.4rem] font-semibold text-[#111]">
                        Recent issue reported
                    </h2>

                    <p className="text-[13px] text-[#8B8B8B] mt-1">
                    active tickets {allTickets.length}
                    </p>
                </div>

                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] flex items-center justify-center">
                    <ArrowUpRight size={18} />
                </div>
            </div>

            {/* COUNT */}
            {/* <div className="mb-5">
        <div className="flex items-end gap-2">
          <h1 className="text-[52px] leading-none font-semibold tracking-tight text-[#111]">
            {allTickets.length}
          </h1>

          <p className="text-[#8B8B8B] text-sm mb-1">
            Open Tickets
          </p>
        </div>
      </div> */}

            {/* TICKETS */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scroll">
                {allTickets.map((ticket) => {
                    const style =
                        ISSUE_STYLES[ticket.issueType] ||
                        ISSUE_STYLES.DEFAULT;

                    return (
                        <div
                            key={ticket.id}
                            style={{
                                position: "relative",
                                overflow: "hidden",

                                borderRadius: "24px",

                                border: "1px solid rgba(255,255,255,0.10)",

                                padding: "16px",

                                transition: "all 0.3s ease",

                                background: `
                                    radial-gradient(
                                            circle at top right,
                                            rgba(255,255,255,0.18),
                                            transparent 30%
                                        ),
                                    linear-gradient(
                                            135deg,
                                            #5E1014 0%,
                                            #7F1D1D 35%,
                                            #991B1B 65%,
                                            #DC2626 100%
                                        )
                                `,       
                            }}
                        >
                            {/* TOP */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    marginBottom: "16px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",

                                        padding: "6px 12px",

                                        borderRadius: "999px",

                                        background: "rgba(255,255,255,0.12)",

                                        backdropFilter: "blur(10px)",

                                        border: "1px solid rgba(255,255,255,0.10)",

                                        color: "#ffffff",

                                        fontSize: "11px",
                                        fontWeight: 500,
                                    }}
                                >
                                    {style.icon}

                                    <span>{ticket.issueType}</span>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",

                                        color: "rgba(255,255,255,0.70)",

                                        fontSize: "11px",
                                    }}
                                >
                                    <Clock3 size={11} />

                                    <span>
                                        {formatTimeAgo(ticket.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* PROJECT */}
                            <h3
                                style={{
                                    fontSize: "18px",
                                    fontWeight: 600,

                                    color: "#ffffff",

                                    lineHeight: 1.3,

                                    marginBottom: "8px",
                                }}
                            >
                                {ticket.projectTitle}
                            </h3>

                            {/* DESCRIPTION */}
                            <p
                                style={{
                                    fontSize: "13px",

                                    lineHeight: 1.6,

                                    color: "rgba(255,255,255,0.75)",

                                    marginBottom: "20px",
                                }}
                            >
                                {ticket.description}
                            </p>

                            {/* FOOTER */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-end",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div>
                                    <p
                                        style={{
                                            fontSize: "11px",

                                            color: "rgba(255,255,255,0.50)",

                                            marginBottom: "4px",
                                        }}
                                    >
                                        Raised by
                                    </p>

                                    <p
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 500,

                                            color: "#ffffff",
                                        }}
                                    >
                                        {ticket.raisedBy.name}
                                    </p>
                                </div>

                                <div
                                    style={{
                                        padding: "6px 12px",

                                        borderRadius: "999px",

                                        background: "#ffffff",

                                        color: "#991B1B",

                                        fontSize: "11px",
                                        fontWeight: 600,

                                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    {ticket.status}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 999px;
        }

        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
        </div>
    );
}