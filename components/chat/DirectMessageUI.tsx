"use client";

import React, { useState, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "@/lib/fetcher";
import { useAuth } from "@/hooks/useAuth";
import { globalSocket } from "@/components/SocketAnnouncer";
import ChatSidebar from "./direct/ChatSidebar";
import ChatArea from "./direct/ChatArea";
import { Loader2 } from "lucide-react";

export default function DirectMessageUI() {
  const { user: currentUser } = useAuth();
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [liveUsers, setLiveUsers] = useState<Record<string, boolean>>({});
  // Sidebar filtering states
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // SWR Infinite Pagination
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.hasMore) return null;
    return `/api/chat/direct/contacts?search=${encodeURIComponent(debouncedSearch)}&role=${activeTab}&page=${pageIndex + 1}&limit=20`;
  };

  const { data, size, setSize, isValidating, mutate } = useSWRInfinite(getKey, fetcher, { keepPreviousData: true });

  const contacts = data ? data.flatMap(page => page.contacts || []) : [];
  const isLoadingInitialData = !data && isValidating;
  const isReachingEnd = data && data[data.length - 1]?.hasMore === false;

  useEffect(() => {
    if (contacts.length === 0) return;
    const userIds = contacts.map((c: any) => c.id).filter(Boolean); 
    
    if (userIds.length > 0) {
      globalSocket.emit("check_multiple_users_status", userIds);
    }

    const handleBulkStatus = (statuses: Record<string, boolean>) => {
      setLiveUsers(prev => ({ ...prev, ...statuses }));
    };

    const handleStatusChange = ({ userId, isOnline }: { userId: string, isOnline: boolean }) => {
      setLiveUsers(prev => ({ ...prev, [userId]: isOnline }));
    };

    globalSocket.on("multiple_users_status_result", handleBulkStatus);
    globalSocket.on("user_status_change", handleStatusChange);

    return () => {
      globalSocket.off("multiple_users_status_result", handleBulkStatus);
      globalSocket.off("user_status_change", handleStatusChange);
    };
  }, [contacts]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-[var(--primary)]" size={36} />
      </div>
    );
  }

  return (
    <div className="flex h-[91vh] w-full bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
      <ChatSidebar 
        currentUser={currentUser} 
        contacts={contacts} 
        selectedContact={selectedContact} 
        setSelectedContact={setSelectedContact}
        liveUsers={liveUsers}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        search={search}
        setSearch={setSearch}
        isLoading={isLoadingInitialData}
        isValidating={isValidating}
        isReachingEnd={isReachingEnd}
        loadMore={() => setSize(size + 1)}
      />
      <ChatArea 
        currentUser={currentUser} 
        selectedContact={selectedContact} 
        isOnline={selectedContact ? liveUsers[selectedContact.id] : false}
        mutateContacts={mutate}
      />
    </div>
  );
}