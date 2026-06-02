"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface EngineerModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function EngineerModal({ isOpen, onClose, children, className = "max-w-md" }: EngineerModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-3xl w-full relative max-h-[90vh] overflow-y-auto shadow-2xl ${className}`}>
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors z-10"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}