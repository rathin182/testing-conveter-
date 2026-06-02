"use client";

import React from "react";
import { FileText, ExternalLink } from "lucide-react";

interface DocumentViewerProps {
  url: string;
  altText?: string;
  className?: string;
  fileType?: string;
}

export default function DocumentViewer({ url, altText = "Document", className = "", fileType }: DocumentViewerProps) {
  if (!url) return null;

  const isPdf = fileType === "application/pdf" || url.toLowerCase().includes(".pdf");
  const isImage = fileType?.startsWith("image/") || url.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp|svg|bmp|tiff|avif|heic|jxl|jp2|jxr|jpm|jpc|j2k|j2c|j2w|j2r|j2p|j2o|j2e|j2d)$/) != null;

  if (isImage) {
    return (
      <div className={`overflow-hidden rounded-lg border border-[var(--border)] bg-gray-50 flex items-center justify-center relative group ${className}`}>
        <img src={url} alt={altText} className="w-full h-full object-contain" />
        <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 text-sm font-semibold backdrop-blur-sm">
          <ExternalLink size={16} /> Open Full
        </a>
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className={`overflow-hidden rounded-lg border border-[var(--border)] relative group ${className}`}>
        <iframe src={`${url}#toolbar=0&navpanes=0`} className="w-full h-full border-none" title={altText} />
        <a href={url} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 bg-black/70 hover:bg-black p-2 rounded-lg text-white transition-colors backdrop-blur-sm">
          <ExternalLink size={16} />
        </a>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col items-center justify-center bg-gray-50 border border-[var(--border)] rounded-lg p-6 ${className}`}>
      <FileText size={32} className="text-gray-400 mb-2" />
      <p className="text-sm font-semibold text-[var(--text-secondary)] mb-3">{altText}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white border border-[var(--border)] rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
        <ExternalLink size={14} /> View Document
      </a>
    </div>
  );
}