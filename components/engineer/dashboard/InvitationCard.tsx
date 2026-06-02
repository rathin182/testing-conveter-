"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface InvitationProject {
    title: string;
}

interface Invitation {
    id: string;
    status: string;
    createdAt: string;
    project: InvitationProject;
}

interface InvitationCardProps {
    invitationsData: {
        invitations: Invitation[];
        total: number;
    };

    onAccept?: (id: string) => void;
    onReject?: (id: string) => void;
}

export default function InvitationCard({ invitationsData, onAccept, onReject, }: InvitationCardProps) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const handleUpdate = async (invitationId: string, status: string) => {
        try {
            setLoadingId(invitationId);
            const res = await fetch("/api/admin/invitations",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: invitationId,
                        status,
                    }),
                });

            const data = await res.json();
            if (data.success) {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="h-full w-full rounded-[32px] p-6">

            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[34px] font-semibold tracking-[-1px] text-[#111111]">
                    Invitations
                </h3>

                <span className="flex h-11 min-w-11 items-center justify-center rounded-full bg-[#F5F5F5] px-4 text-[15px] font-semibold text-[#666666]">
                    {invitationsData?.total || 0}
                </span>
            </div>

            {/* Scroll Area */}
            <div className="max-h-[650px] space-y-5 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#D9D9D9] hover:[&::-webkit-scrollbar-thumb]:bg-[#C5C5C5]">

                {invitationsData?.invitations?.length > 0 ? (
                    invitationsData.invitations.map(
                        (invitation: Invitation) => (
                            <div
                                key={invitation.id}
                                className="rounded-[30px] bg-[#f5f2f2] p-5 transition-all duration-200 hover:bg-[#F6F6F6]"
                            >

                                {/* Top */}
                                <div className="flex items-start justify-between gap-4">

                                    {/* Left */}
                                    <div className="flex min-w-0 items-center gap-4">

                                        {/* Icon */}
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3E8]">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE4CC] text-[15px] font-bold text-[#F59E0B]">
                                                P
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0">
                                            <h4 className="truncate text-[22px] font-semibold text-[#18181B]">
                                                {invitation.project.title}
                                            </h4>

                                            <p className="mt-2 text-[15px] text-[#71717A]">
                                                {new Date(
                                                    invitation.createdAt
                                                ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "2-digit",
                                                        month: "long",
                                                    }
                                                )}
                                                ,{" "}
                                                {new Date(
                                                    invitation.createdAt
                                                ).toLocaleTimeString(
                                                    "en-IN",
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div
                                        className={`shrink-0 rounded-full px-5 py-2.5 text-[14px] font-semibold
                      ${invitation.status === "SENT"
                                                ? "bg-[#EAE7FF] text-[#5B4FD8]"
                                                : invitation.status ===
                                                    "ACCEPTED"
                                                    ? "bg-[#EAFBF0] text-[#22C55E]"
                                                    : invitation.status ===
                                                        "REJECTED"
                                                        ? "bg-[#FFF1F1] text-[#EF4444]"
                                                        : "bg-[#F4F4F5] text-[#52525B]"
                                            }
                    `}
                                    >
                                        {invitation.status
                                            .replaceAll("_", " ")
                                            .toLowerCase()
                                            .replace(
                                                /\b\w/g,
                                                (c: string) =>
                                                    c.toUpperCase()
                                            )}
                                    </div>
                                </div>

                                {/* Buttons */}
                                {invitation.status === "SENT" && (
                                    <div className="mt-5 flex items-center gap-3">

                                        {/* Accept */}
                                        <button
                                            disabled={loadingId === invitation.id}
                                            onClick={() =>
                                                handleUpdate(invitation.id, "ACCEPTED")
                                            }
                                            className="flex-1 cursor-pointer rounded-2xl bg-[#D7F266] px-5 py-3 text-[15px] font-semibold text-[#111111] transition-all hover:bg-[#CBEF4E] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {loadingId === invitation.id
                                                ? "Loading..."
                                                : "Accept"}
                                        </button>

                                        {/* Reject */}
                                        <button
                                            disabled={loadingId === invitation.id}
                                            onClick={() =>
                                                handleUpdate(invitation.id, "REJECTED")
                                            }
                                            className="flex-1 cursor-pointer rounded-2xl bg-[#F3F3F3] px-5 py-3 text-[15px] font-semibold text-[#555555] transition-all hover:bg-[#EBEBEB] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {loadingId === invitation.id
                                                ? "Loading..."
                                                : "Reject"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    )
                ) : (
                    <div className="flex h-[220px] flex-col items-center justify-center rounded-[28px] bg-[#FAFAFA]">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                            <span className="text-[24px]">
                                📂
                            </span>
                        </div>

                        <h4 className="mt-5 text-[18px] font-semibold text-[#222222]">
                            No Invitations
                        </h4>

                        <p className="mt-1 text-[14px] text-[#8A8A8A]">
                            No project invitations available
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}