import React, { useEffect, useRef } from "react";
import { Search, User as UserIcon, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ChatSidebar({ 
  currentUser, contacts, selectedContact, setSelectedContact, liveUsers,
  activeTab, setActiveTab, search, setSearch,
  isLoading, isValidating, isReachingEnd, loadMore 
}: any) {

  const observerTarget = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isReachingEnd && !isValidating) {
        loadMore();
      }
    }, { threshold: 1.0 });
    
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [isReachingEnd, isValidating, loadMore]);

  useEffect(() => {
    if (!selectedContact && contacts.length > 0) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact, setSelectedContact]);

  const getTabs = () => {
    if (currentUser?.role === "ADMIN") return ["ALL", "CLIENT", "ENGINEER"];
    if (currentUser?.role === "CLIENT") return ["ALL", "ADMIN", "ENGINEER"];
    if (currentUser?.role === "ENGINEER") return ["ALL", "ADMIN", "CLIENT"];
    return ["ALL"];
  };

  return (
    <div className="w-[320px] shrink-0 border-r border-gray-200 flex flex-col bg-white h-full overflow-hidden">
      
      <div className="p-4 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFAE58]"
          />
        </div>
      </div>

      <div className="px-5">
        <h2 className="font-bold text-xl text-gray-900">Messages</h2>
      </div>

      <div className="px-4 mb-4">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          {getTabs().map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                activeTab === tab 
                  ? "bg-[#FFAE58] text-white shadow-lg" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "ALL" ? "All" : tab === "ENGINEER" ? "Engineers" : tab === "CLIENT" ? "Clients" : "Admins"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {isLoading ? (
          <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-[#FFAE58]" size={24} /></div>
        ) : contacts.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">No contacts found.</div>
        ) : (
          contacts.map((contact: any) => {
            if (!contact || !contact.id) return null;

            const isOnline = liveUsers[contact.id] || false;
            const isSelected = selectedContact?.id === contact.id;

            return (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 border ${
                  isSelected 
                    ? "bg-white border-[#FFAE58] shadow-sm ring-1 ring-[#FFAE58]/20" 
                    : "bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm"
                }`}
              >
                {/* Avatar */}
                <div className="relative w-12 h-12 shrink-0">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-200">
                    {contact.image ? (
                      <Image src={contact.image} alt={contact.name} width={48} height={48} className="object-cover" />
                    ) : (
                      <UserIcon size={24} className="text-gray-400" />
                    )}
                  </div>
                  {isOnline && <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className={`font-bold text-sm truncate mb-0.5 ${isSelected ? "text-[#FFAE58]" : "text-gray-900"}`}>
                    {contact.name}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{contact.lastMessage || "Start a conversation..."}</p>
                </div>
              </button>
            );
          })
        )}
        
        <div ref={observerTarget} className="h-4 w-full flex justify-center mt-2">
          {isValidating && !isLoading && <Loader2 className="animate-spin text-gray-400" size={16} />}
        </div>
      </div>
    </div>
  );
}