"use client";

import React from "react";
import DocumentViewer from "./DocumentViewer";
import { Award } from "lucide-react";

interface Certificate {
  name: string;
  fileUrl: string;
}

interface CertificateSliderProps {
  certificates: Certificate[];
}

export default function CertificateSlider({ certificates }: CertificateSliderProps) {
  if (!certificates || certificates.length === 0) {
    return <span className="text-sm text-gray-400 italic">No certifications added.</span>;
  }

  return (
    <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar">
      {certificates.map((cert, index) => (
        <div key={index} className="min-w-[280px] max-w-[280px] flex-shrink-0 snap-start flex flex-col bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
          <div className="p-3 border-b border-[var(--border)] bg-gray-50 flex items-center gap-2">
            <Award size={16} className="text-[var(--primary)] shrink-0" />
            <h5 className="font-semibold text-sm text-[var(--text-primary)] truncate" title={cert.name}>
              {cert.name}
            </h5>
          </div>
          <div className="p-2 bg-gray-100 h-[200px]">
            <DocumentViewer url={cert.fileUrl} altText={cert.name} className="w-full h-full" />
          </div>
        </div>
      ))}
    </div>
  );
}