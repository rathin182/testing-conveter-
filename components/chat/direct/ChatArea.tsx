import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Loader2, User as UserIcon, X, CheckSquare, Trash2 } from "lucide-react";
import Image from "next/image";
import { globalSocket } from "@/components/SocketAnnouncer";
import MessageItem from "./MessageItem";

export default function ChatArea({ currentUser, selectedContact, isOnline, mutateContacts }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Initial History when contact changes
  useEffect(() => {
    if (!selectedContact || !currentUser) return;
    
    const fetchInitialHistory = async () => {
      const res = await fetch(`/api/chat/direct/history/${selectedContact.id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
        scrollToBottom();

        data.messages.forEach((msg: any) => {
          if (msg.senderId !== currentUser.id && !msg.isRead) {
            globalSocket.emit("mark_dm_read", { messageId: msg.id, readerId: currentUser.id });
          }
        });
      }
    };
    fetchInitialHistory();
    globalSocket.emit("join_dm", { currentUserId: currentUser?.id, targetUserId: selectedContact.id });
    
    setIsSelectMode(false);
    setSelectedMessageIds([]);
    setError(null);
  }, [selectedContact, currentUser]);

  // Load More History (Pagination)
  const handleScroll = async () => {
    if (!scrollContainerRef.current || !hasMore || isLoadingMore) return;
    
    if (scrollContainerRef.current.scrollTop === 0) {
      setIsLoadingMore(true);
      const prevHeight = scrollContainerRef.current.scrollHeight;
      
      const res = await fetch(`/api/chat/direct/history/${selectedContact.id}?cursor=${cursor}`);
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...data.messages, ...prev]);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
        
        // Emit read receipts for older unread messages too
        data.messages.forEach((msg: any) => {
          if (msg.senderId !== currentUser?.id && !msg.isRead) {
            globalSocket.emit("mark_dm_read", { messageId: msg.id, readerId: currentUser?.id });
          }
        });

        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight - prevHeight;
          }
        }, 0);
      }
      setIsLoadingMore(false);
    }
  };

  // Socket Listeners for Real-Time Updates
  useEffect(() => {
    if (!currentUser) return;

    const handleReceiveMessage = (newMessage: any) => {
      if (selectedContact && (newMessage.senderId === selectedContact.id || newMessage.senderId === currentUser?.id)) {
        setMessages(prev => {
          if (newMessage.senderId === currentUser.id) {
            const pendingIdx = prev.findIndex(m => m.isPending);
            if (pendingIdx !== -1) {
              const newArr = [...prev];
              newArr[pendingIdx] = newMessage;
              return newArr;
            }
          }
          return [...prev, newMessage];
        });
        scrollToBottom();

        // Emit read receipt instantly if we receive a message from the contact while chat is open
        if (newMessage.senderId !== currentUser.id) {
          globalSocket.emit("mark_dm_read", { messageId: newMessage.id, readerId: currentUser.id });
        }
      }
      mutateContacts();
    };

    const handleMessageEdited = (updatedMessage: any) => {
      setMessages(prev => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m));
    };

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: "" } : m));
      setSelectedMessageIds(prev => prev.filter(id => id !== messageId));
    };

    const handleMassDeleted = ({ messageIds }: { messageIds: string[] }) => {
      setMessages(prev => prev.map(m => messageIds.includes(m.id) ? { ...m, isDeleted: true, content: "" } : m));
      setSelectedMessageIds(prev => prev.filter(id => !messageIds.includes(id)));
    };

    // Handle Read Receipts to turn ticks blue
    const handleReadReceipt = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m)));
    };

    // Handle Errors
    const handleDmError = ({ message }: { message: string }) => {
      setError(message);
      setTimeout(() => setError(null), 4000); // Auto-hide after 4s
    };

    globalSocket.on("receive_dm", handleReceiveMessage);
    globalSocket.on("dm_edited", handleMessageEdited);
    globalSocket.on("dm_deleted", handleMessageDeleted);
    globalSocket.on("mass_dm_deleted", handleMassDeleted);
    globalSocket.on("dm_read_receipt", handleReadReceipt);
    globalSocket.on("dm_error", handleDmError);

    return () => {
      globalSocket.off("receive_dm", handleReceiveMessage);
      globalSocket.off("dm_edited", handleMessageEdited);
      globalSocket.off("dm_deleted", handleMessageDeleted);
      globalSocket.off("mass_dm_deleted", handleMassDeleted);
      globalSocket.off("dm_read_receipt", handleReadReceipt);
      globalSocket.off("dm_error", handleDmError);
    };
  }, [selectedContact, currentUser, mutateContacts]);

  const scrollToBottom = () => {
    setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, 100);
  };

  const toggleSelectMessage = (id: string) => {
    setSelectedMessageIds(prev => prev.includes(id) ? prev.filter(msgId => msgId !== id) : [...prev, id]);
  };

  const handleMassDelete = () => {
    if (selectedMessageIds.length === 0 || !currentUser) return;
    
    setMessages(prev => prev.map(m => selectedMessageIds.includes(m.id) ? { ...m, isDeleted: true, content: "" } : m));
    
    globalSocket.emit("mass_delete_dm", { 
      messageIds: selectedMessageIds, 
      senderId: currentUser.id,
      receiverId: selectedContact.id
    });
    
    setIsSelectMode(false);
    setSelectedMessageIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedContact || !currentUser) return;
    setError(null);

    if (editingMessage) {
      globalSocket.emit("edit_dm", { messageId: editingMessage.id, senderId: currentUser.id, content: inputMessage.trim() });
      setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, content: inputMessage.trim(), isEdited: true } : m));
      setEditingMessage(null);
    } else {
      const tempMessage = {
        id: `temp_${Date.now()}`,
        senderId: currentUser.id,
        content: inputMessage.trim(),
        createdAt: new Date().toISOString(),
        isPending: true
      };
      
      setMessages(prev => [...prev, tempMessage]);
      globalSocket.emit("send_dm", { senderId: currentUser.id, receiverId: selectedContact.id, content: inputMessage.trim() });
      scrollToBottom();
    }
    
    setInputMessage("");
  };

  if (!selectedContact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#f0f2f5]">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <MessageSquare size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-bold  text-[var(--text-primary)] mb-2">Your Messages</h3>
        <p className=" text-sm">Select a contact to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f0f2f5] relative">
      {/* Header with Live Status & Select Actions */}
      <div className="h-16 shrink-0 bg-white border-b border-[var(--border)] flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
            {selectedContact.image ? (
              <Image src={selectedContact.image} alt={selectedContact.name} width={40} height={40} className="object-cover" />
            ) : (
              <UserIcon size={20} className="text-gray-500" />
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="font-bold text-[var(--text-primary)] ">{selectedContact.name}</h3>
              {selectedContact.projectNames && (
                <span className="text-[10px] text-[var(--primary)] font-semibold uppercase tracking-wider truncate max-w-[200px]">
                  • {selectedContact.projectNames}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-medium ${isOnline ? "text-green-500" : "text-gray-400"}`}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          {isSelectMode ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setIsSelectMode(false); setSelectedMessageIds([]); }} 
                className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleMassDelete} 
                disabled={selectedMessageIds.length === 0} 
                className="text-sm font-semibold bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Trash2 size={14} /> Delete {selectedMessageIds.length > 0 ? `(${selectedMessageIds.length})` : ""}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsSelectMode(true)} 
              className="text-sm font-medium text-gray-500 hover:text-[var(--primary)] flex items-center gap-1 transition-colors"
            >
              <CheckSquare size={16} /> Select
            </button>
          )}
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
        {isLoadingMore && <div className="flex justify-center py-2"><Loader2 className="animate-spin text-gray-400" size={20} /></div>}
        
        {messages.map((msg: any) => {
          const isMine = msg.senderId === currentUser?.id;
          return (
            <MessageItem 
              key={msg.id} 
              msg={msg} 
              isMine={msg.senderId === currentUser?.id}
              isAdmin={currentUser?.role === 'ADMIN'}
              showDetails={false}
              onEdit={(m: any) => { setEditingMessage(m); setInputMessage(m.content); }}
              onDelete={(id: string) => globalSocket.emit("delete_dm", { messageId: id, senderId: currentUser.id })}
              isSelectMode={isSelectMode && isMine} 
              isSelected={selectedMessageIds.includes(msg.id)}
              onToggleSelect={toggleSelectMessage}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="mx-6 mb-2 mt-2 px-3 py-2 bg-red-50 border border-red-200 flex items-center justify-between rounded-md">
          <p className="text-xs  text-red-600 font-medium">{error}</p>
          <button onClick={() => setError(null)}><X size={13} className="text-red-400 hover:text-red-600" /></button>
        </div>
      )}

      {/* Input Area */}
      <div className={`p-4 bg-white border-t border-[var(--border)] transition-opacity ${isSelectMode ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {editingMessage && (
          <div className="flex items-center justify-between bg-orange-50 px-4 py-2 rounded-t-lg border-b border-orange-100 text-sm text-orange-800 mb-2">
            <span>Editing message...</span>
            <button onClick={() => { setEditingMessage(null); setInputMessage(""); }}><X size={16} /></button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-1 focus-within:ring-[#FFAE58]">
          
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Message........"
            className="flex-1 bg-transparent border-none px-2 py-1 text-sm focus:outline-none placeholder:text-gray-400 text-gray-800"
          />
          <button 
            type="submit" 
            disabled={!inputMessage.trim()} 
            className="w-9 h-9 shrink-0 bg-[#FFAE58] text-white rounded-full flex items-center justify-center hover:bg-[#e89b45] disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}