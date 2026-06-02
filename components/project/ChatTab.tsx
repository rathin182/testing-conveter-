"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Send, X, CheckSquare, Trash2, Loader2, ChevronUp } from "lucide-react";
import { globalSocket } from "@/components/SocketAnnouncer";
import MessageItem from "../chat/direct/MessageItem";

export default function ChatTab({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN"; 

  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async (cursor?: string) => {
    try {
      const url = `/api/chat/${projectId}${cursor ? `?cursor=${cursor}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        if (cursor) {
          setMessages((prev) => [...data.messages, ...prev]);
        } else {
          setMessages(data.messages);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
        setNextCursor(data.nextCursor);

        // Mark unread messages as read
        if (user) {
          data.messages.forEach((msg: any) => {
            if (msg.senderId !== user.id && !msg.isRead) {
              globalSocket.emit("mark_project_message_read", { messageId: msg.id, readerId: user.id, projectId });
            }
          });
        }
      }
    } catch (err) {
      console.error("Failed to load project chat", err);
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  }, [projectId, user]);

  useEffect(() => {
    if (user && projectId) loadMessages();
  }, [user, projectId, loadMessages]);

  useEffect(() => {
    if (!user || !projectId) return;

    globalSocket.emit("join_project_chat", { projectId });

    const handleReceiveMessage = (msg: any) => {
      setMessages((prev) => {
        if (msg.senderId === user.id) {
          const pendingIdx = prev.findIndex(m => m.isPending);
          if (pendingIdx !== -1) {
            const newArr = [...prev];
            newArr[pendingIdx] = msg;
            return newArr;
          }
        }
        return [...prev, msg];
      });
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

      if (msg.senderId !== user.id) {
        globalSocket.emit("mark_project_message_read", { messageId: msg.id, readerId: user.id, projectId });
      }
    };

    const handleMessageEdited = (updated: any) => setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    const handleMessageDeleted = ({ messageId }: { messageId: string }) => setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isDeleted: true, content: "" } : m)));
    const handleMassDeleted = ({ messageIds }: { messageIds: string[] }) => {
      setMessages(prev => prev.map(m => messageIds.includes(m.id) ? { ...m, isDeleted: true, content: "" } : m));
      setSelectedMessageIds(prev => prev.filter(id => !messageIds.includes(id)));
    };
    const handleReadReceipt = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m)));
    };
    const handleError = ({ message }: { message: string }) => {
      setError(message);
      setTimeout(() => setError(null), 4000);
    };

    globalSocket.on("receive_project_message", handleReceiveMessage);
    globalSocket.on("project_message_edited", handleMessageEdited);
    globalSocket.on("project_message_deleted", handleMessageDeleted);
    globalSocket.on("mass_project_deleted", handleMassDeleted);
    globalSocket.on("project_read_receipt", handleReadReceipt);
    globalSocket.on("project_error", handleError);

    return () => {
      globalSocket.off("receive_project_message", handleReceiveMessage);
      globalSocket.off("project_message_edited", handleMessageEdited);
      globalSocket.off("project_message_deleted", handleMessageDeleted);
      globalSocket.off("mass_project_deleted", handleMassDeleted);
      globalSocket.off("project_read_receipt", handleReadReceipt);
      globalSocket.off("project_error", handleError);
    };
  }, [projectId, user]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !user) return;
    setError(null);

    if (editingMessage) {
      globalSocket.emit("edit_project_message", { messageId: editingMessage.id, senderId: user.id, content: inputMessage.trim(), projectId });
      setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, content: inputMessage.trim(), isEdited: true } : m));
      setEditingMessage(null);
    } else {
      const tempMessage = { id: `temp_${Date.now()}`, senderId: user.id, content: inputMessage.trim(), createdAt: new Date().toISOString(), isPending: true };
      setMessages(prev => [...prev, tempMessage]);
      
      globalSocket.emit("send_project_message", { 
        senderId: user.id, 
        projectId: projectId,
        content: inputMessage.trim() 
      });
    }
    setInputMessage("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleMassDelete = () => {
    if (selectedMessageIds.length === 0 || !user) return;
    setError(null);
    setMessages(prev => prev.map(m => selectedMessageIds.includes(m.id) ? { ...m, isDeleted: true, content: "" } : m));
    
    globalSocket.emit("mass_delete_project_message", { messageIds: selectedMessageIds, senderId: user.id, projectId });
    setIsSelectMode(false);
    setSelectedMessageIds([]);
  };

  const toggleSelectMessage = (id: string) => setSelectedMessageIds(prev => prev.includes(id) ? prev.filter(msgId => msgId !== id) : [...prev, id]);

  if (loadingInitial) {
    return <div className="flex items-center justify-center h-[500px] bg-white border border-[var(--border)]"><Loader2 className="animate-spin text-[var(--primary)]" /></div>;
  }

  return (
    <div className="flex flex-col bg-white border border-[var(--border)] relative" style={{ height: "calc(100vh - 220px)" }}>
      {!isAdmin && (
        <div className="absolute top-4 right-6 z-10">
          {isSelectMode ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
              <button onClick={() => { setIsSelectMode(false); setSelectedMessageIds([]); }} className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1">Cancel</button>
              <button onClick={handleMassDelete} disabled={selectedMessageIds.length === 0} className="text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded disabled:opacity-50 flex items-center gap-1 transition-colors">
                <Trash2 size={12} /> Delete {selectedMessageIds.length > 0 && `(${selectedMessageIds.length})`}
              </button>
            </div>
          ) : (
             <button onClick={() => setIsSelectMode(true)} className="text-xs font-medium text-gray-400 hover:text-[var(--primary)] flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-gray-100 transition-colors">
              <CheckSquare size={14} /> Select
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-6 bg-[#f0f2f5] space-y-2">
        {nextCursor && (
          <div className="flex justify-center mb-4">
            <button onClick={() => { setLoadingMore(true); loadMessages(nextCursor); }} disabled={loadingMore} className="flex items-center gap-1 text-xs text-[var(--text-muted)] bg-white px-3 py-1.5 rounded-full shadow-sm hover:text-[var(--primary)] transition-colors">
              {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <><ChevronUp size={14} /> Load older messages</>}
            </button>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full"><p className="text-sm text-[var(--text-muted)]">No messages yet.</p></div>
        )}

        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <MessageItem 
              key={msg.id} 
              msg={msg} 
              isMine={isMine}
              isAdmin={isAdmin}
              showDetails={true} 
              onEdit={(m: any) => { setEditingMessage(m); setInputMessage(m.content); }}
              onDelete={(id: string) => globalSocket.emit("delete_project_message", { messageId: id, senderId: user?.id, projectId })}
              isSelectMode={isSelectMode && (isMine || isAdmin)} 
              isSelected={selectedMessageIds.includes(msg.id)}
              onToggleSelect={toggleSelectMessage}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mx-5 mb-2 mt-2 px-3 py-2 bg-red-50 border border-red-200 flex items-center justify-between rounded-md">
          <p className="text-xs text-red-600 font-medium">{error}</p>
          <button onClick={() => setError(null)}><X size={13} className="text-red-400 hover:text-red-600" /></button>
        </div>
      )}

      <div className={`p-4 bg-white border-t border-[var(--border)] transition-opacity ${isSelectMode ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {editingMessage && (
          <div className="flex items-center justify-between bg-orange-50 px-4 py-2 rounded-t-lg border-b border-orange-100 text-sm text-orange-800">
            <span>Editing message...</span>
            <button onClick={() => { setEditingMessage(null); setInputMessage(""); }}><X size={16} /></button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-gray-900"
          />
          <button type="submit" disabled={!inputMessage.trim()} className="w-11 h-11 shrink-0 bg-[#FFAE58] text-white rounded-full flex items-center justify-center hover:bg-[#e89b45] disabled:opacity-50">
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}