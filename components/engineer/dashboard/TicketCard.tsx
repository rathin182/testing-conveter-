"use client";

import { AlertCircle, Clock3, MessageSquareWarning, } from "lucide-react";

import { useState } from "react";

interface Ticket {
    id: string;
    issueType: string;
    status: string;
    description: string;
    createdAt: string;
}

interface TicketCardProps {
  ticket: Ticket;
  onStatusUpdated: () => Promise<any>;
}

const actionConfig = {
    OPEN: {
        label: "Start Work",
        nextStatus: "IN_PROGRESS",
        className:
            "text-blue-600 hover:text-blue-700",
    },
    IN_PROGRESS: {
        label: "Resolve Issue",
        nextStatus: "RESOLVED",
        className:
            "text-green-600 hover:text-green-700",
    },
};

export default function TicketCard({ ticket, onStatusUpdated, }: TicketCardProps) {
    const [loading, setLoading] = useState(false);
    const formattedDate = new Date(ticket.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const formattedTime = new Date(ticket.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const statusStyles = {
        OPEN: "bg-[#FFF2E8] text-[#F97316]",
        CLOSED: "bg-[#EAFBF0] text-[#22C55E]",
        PENDING: "bg-[#EEF2FF] text-[#6366F1]",
    };

    const updateTicketStatus = async ({ ticketId, status }: { ticketId: string; status: string; }) => {
        try {
            setLoading(true);
            const response = await fetch("/api/tickets", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ticketId, status }),
            });

            if (!response.ok) {
                throw new Error("Failed to update ticket status");
            }
            await onStatusUpdated();
        } catch (error) {
            console.error("Error updating ticket status:", error);
        } finally {
            setLoading(false);
        }
    };

    const action = actionConfig[ticket.status as keyof typeof actionConfig];

    return (
        <div className="flex items-center justify-between rounded-[26px] border border-[#F1F1F1] bg-white px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)]">

            {/* Left */}
            <div className="flex items-center gap-4">

                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF3E8]">
                    <MessageSquareWarning
                        className="text-[#F59E0B]"
                        size={24}
                    />
                </div>

                {/* Content */}
                <div>
                    <div className="flex gap-4 items-center">
                        <h3 className="max-w-[220px] truncate text-[17px] font-semibold text-[#18181B]">
                            {ticket.issueType.replaceAll("_", " ")}
                        </h3>
                        <div
                            className={`rounded-full px-4 py-2 text-[12px] font-semibold
      ${statusStyles[
                                ticket.status as keyof typeof statusStyles
                                ] || "bg-[#F4F4F5] text-[#52525B]"
                                }
    `}
                        >
                            {ticket.status}
                        </div>

                    </div>

                    <p className="mt-1 max-w-[320px] truncate text-[13px] text-[#71717A]">
                        {ticket.description}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-[12px] text-[#A1A1AA]">
                        <Clock3 size={13} />

                        <span>
                            {formattedDate}, {formattedTime}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">

                {/* Resolve Button */}
                {/* <button className="rounded-full cursor-pointer bg-[#D7F266] px-5 py-2 text-[12px] font-semibold text-[#111111] transition-all hover:scale-[1.03] hover:bg-[#CBEF4E]">
                    Resolve
                </button> */}

                {action && (
                    <button
                        disabled={loading}
                        onClick={() =>
                            updateTicketStatus({
                                ticketId: ticket.id,
                                status: action.nextStatus,
                            })
                        }
                        className={` rounded-full px-5 py-2 text-[12px] font-semibold transition-all duration-200 shadow-sm ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:scale-[1.03] active:scale-[0.98]"} ${action.className}`}>
                        {loading ? "Updating..." : action.label}
                    </button>
                )}
            </div>
        </div>
    );
}