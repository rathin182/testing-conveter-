"use client";

import React, { useState } from "react";
import { Check, CheckCheck, Clock, ChevronDown, Edit2, Trash2, User as UserIcon } from "lucide-react";
import Image from "next/image";

export default function MessageItem({ 
  msg, isMine, onEdit, onDelete, isSelectMode = false, isSelected = false, onToggleSelect, isAdmin, showDetails = false 
}: any) {
  const [showMenu, setShowMenu] = useState(false);
  const canModify = isMine || isAdmin;
  const showLabel = showDetails && !isMine;

  return (
    <div 
      onClick={() => {
        if (isSelectMode && !msg.isDeleted) onToggleSelect(msg.id);
      }}
      className={`flex w-full mb-4 gap-2 group ${isSelectMode && !msg.isDeleted ? "cursor-pointer" : ""} ${isMine ? "justify-end" : "justify-start"}`}
    >
      {isSelectMode && !msg.isDeleted && (
        <div className="flex flex-col justify-center">
          <input type="checkbox" checked={isSelected} readOnly className="w-5 h-5 accent-[#FFAE58] shrink-0" />
        </div>
      )}

      {!isMine && !isSelectMode && (
        <div className="flex flex-col justify-end pb-5">
          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 overflow-hidden border border-gray-100">
            {msg.sender?.image ? (
              <Image src={msg.sender.image} alt={msg.sender.name || "User"} width={32} height={32} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <UserIcon size={16} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Content Column */}
      <div className={`flex flex-col max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
        
        {/* Name Label */}
        {showLabel && (
          <span className="text-[11px] font-bold text-gray-400 mb-1 px-2 block">
            {msg.sender?.name || "User"}
            {msg.sender?.role && msg.sender.role !== "USER" && 
              ` (${msg.sender.role.charAt(0) + msg.sender.role.slice(1).toLowerCase()})`
            }
          </span>
        )}

        {/* Bubble & Action Button Row */}
        <div className={`flex items-center gap-2.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
          <div className={`rounded-3xl px-5 py-2.5 text-[15px] shadow-sm transition-all ${
            isMine 
              ? "bg-[#FFAE58] text-white" 
              : "bg-white text-[var(--text-primary)] border border-gray-100"
          } ${msg.isPending ? "opacity-70" : "opacity-100"}`}>
            
            <div className="break-words leading-relaxed">
              {msg.isDeleted ? <span className="italic text-sm opacity-80">🚫 This message was deleted</span> : msg.content}
            </div>
          </div>

          {/* Action Button */}
          {canModify && !msg.isPending && !msg.isDeleted && !isSelectMode && (
            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} 
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors shadow-sm border border-gray-200"
              >
                <ChevronDown size={14} />
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <div className={`absolute top-full mt-2 ${isMine ? "right-0" : "left-0"} bg-white shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100 rounded-2xl py-2 w-32 z-50 flex flex-col overflow-hidden`}>
                  {isMine && (
                    <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(msg); }} className="flex items-center gap-3 px-4 py-2 text-[14px] hover:bg-gray-50 text-[#334155] transition-colors font-medium">
                      <Edit2 size={15} className="text-[#64748b]" /> Edit
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(msg.id); }} className="flex items-center gap-3 px-4 py-2 text-[14px] hover:bg-red-50 text-[#dc2626] transition-colors font-medium">
                    <Trash2 size={15} className="text-[#dc2626]" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timestamps & Ticks */}
        <div className={`text-[11px] mt-1.5 flex items-center gap-1.5 px-2 font-medium ${isMine ? "justify-end text-gray-500" : "justify-start text-gray-500"}`}>
          {msg.isEdited && <span className="italic mr-1 opacity-70">edited</span>}
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isMine && !msg.isDeleted && (
            <span className="ml-0.5">
              {msg.isPending ? <Clock size={12} /> : msg.isRead ? <CheckCheck size={15} className="text-[#3b82f6]" /> : <Check size={15} />}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}