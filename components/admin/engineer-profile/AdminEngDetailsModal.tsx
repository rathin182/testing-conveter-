"use client";

import React, { useState, useEffect } from "react";
import EngineerModal from "@/components/engineer/profile/modals/EngineerModal";
import { Upload, X, Plus, FileText } from "lucide-react";
import toast from "react-hot-toast";
import DocumentViewer from "@/components/ui/DocumentViewer";

interface CertData {
  name: string;
  fileUrl?: string; 
  file?: File;
}

const EXP_LEVELS = [
  { value: "FRESHER", label: "Fresher" },
  { value: "ONE_TO_TWO_YEARS", label: "1-2 Years" },
  { value: "THREE_TO_FIVE_YEARS", label: "3-5 Years" },
  { value: "FIVE_TO_EIGHT_YEARS", label: "5-8 Years" },
  { value: "EIGHT_PLUS_YEARS", label: "8+ Years" },
];

export default function AdminEngineerDetailsModal({ 
  isOpen, onClose, user, profile, onUpdate 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  user: any, 
  profile: any, 
  onUpdate: () => void 
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [qualification, setQualification] = useState("UG");
  const [idType, setIdType] = useState("AADHAAR");
  const [idNumber, setIdNumber] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  
  const [certs, setCerts] = useState<CertData[]>([]);
  const [certInput, setCertInput] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState("");

  useEffect(() => {
    if (isOpen && profile) {
      setQualification(profile.qualification || "UG");
      setIdType(profile.idType || "AADHAAR");
      setIdNumber(profile.idNumber || "");
      setSkills(profile.skills || []);
      setCerts(profile.certifications || []);
      setIdPreview(profile.idFile || "");
      setFile(null);
      setYearsOfExperience(profile.yearsOfExperience || "");
      setSkillInput("");
      setCertInput("");
      setCertFile(null);
    }
  }, [profile, isOpen]);

  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIdPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = skillInput.trim();
      if (value && !skills.includes(value)) setSkills([...skills, value]);
      setSkillInput("");
    }
  };

  const handleAddCert = () => {
    if (!certInput.trim()) return toast.error("Enter certificate name");
    if (!certFile) return toast.error("Upload proof");
    setCerts([...certs, { name: certInput.trim(), file: certFile }]);
    setCertInput("");
    setCertFile(null);
  };

  const removeCert = (idx: number) => setCerts(certs.filter((_, i) => i !== idx));
  const removeSkill = (idx: number) => setSkills(skills.filter((_, i) => i !== idx));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skills.length === 0) return toast.error("Add at least one skill");

    setIsSaving(true);
    const formData = new FormData();
    formData.append("qualification", qualification);
    formData.append("yearsOfExperience", yearsOfExperience);
    formData.append("idType", idType);
    formData.append("idNumber", idNumber);
    formData.append("skills", JSON.stringify(skills));
    
    const mappedCerts = certs.map((cert, index) => {
      if (cert.file) {
        formData.append(`certFile_${index}`, cert.file);
        return { name: cert.name, fileIndex: index };
      }
      return { name: cert.name, fileUrl: cert.fileUrl };
    });
    
    formData.append("certifications", JSON.stringify(mappedCerts));
    if (file) formData.append("idFile", file);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "PUT", body: formData });
      const data = await res.json();
      if (data.success) { 
        toast.success("Updated successfully"); 
        onUpdate(); 
        onClose(); 
      } else toast.error(data.message);
    } catch { toast.error("Error saving"); }
    finally { setIsSaving(false); }
  };

  return (
    <EngineerModal isOpen={isOpen} onClose={onClose} className="max-w-[750px]">
      <div className="p-8">
        <h4 className="text-2xl font-bold font-inter text-[var(--text-primary)] mb-2">Edit Professional Details</h4>
        <p className="text-sm text-[var(--text-muted)] font-inter mb-6">Manage professional profile for {user?.name}.</p>
        
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-6">
          
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">Qualification</label>
              <select value={qualification} onChange={e => setQualification(e.target.value)} className="w-full border border-[var(--border)] rounded-lg p-3 outline-none focus:border-[var(--primary)] bg-gray-50/50">
                <option value="UG">Undergraduate (UG)</option><option value="EMPLOYED">Employed</option><option value="UNEMPLOYED">Unemployed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">Years of Experience</label>
              <select value={yearsOfExperience} onChange={e => setYearsOfExperience(e.target.value)} className="w-full border border-[var(--border)] rounded-lg p-3 outline-none focus:border-[var(--primary)] bg-gray-50/50">
                <option value="">Select experience</option>
                {EXP_LEVELS.map(exp => <option key={exp.value} value={exp.value}>{exp.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">ID Number</label>
              <input required value={idNumber} onChange={e => setIdNumber(e.target.value.toUpperCase())} className="w-full border border-[var(--border)] rounded-lg p-3 outline-none focus:border-[var(--primary)] bg-gray-50/50 uppercase" />
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">ID Document</label>
            <label className="flex items-center gap-2 border border-dashed border-[var(--border)] rounded-lg p-3 bg-gray-50/50 hover:border-[var(--primary)] cursor-pointer text-sm w-full truncate transition-colors mb-2">
              <Upload size={16} className="shrink-0 text-[var(--primary)]"/>
              <span className="truncate">{file ? file.name : "Upload New File"}</span>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleIdFileChange} />
            </label>
            
            {idPreview && (
              <div className="h-[150px] w-full border rounded-lg overflow-hidden bg-gray-100">
                <DocumentViewer url={idPreview} fileType={file?.type} className="h-full border-none"/>
              </div>
            )}
          </div>
          
          <div className="col-span-2 border-t border-[var(--border)] pt-4">
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">Skills</label>
            <div className="flex flex-wrap items-center gap-2 w-full border border-[var(--border)] rounded-lg p-2 focus-within:border-[var(--primary)] bg-gray-50/50 min-h-[50px]">
              {skills.map((skill, index) => (
                <span key={index} className="flex items-center gap-1.5 px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium rounded-md">
                  {skill}
                  <button type="button" onClick={() => removeSkill(index)} className="hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input 
                value={skillInput} 
                onChange={e => setSkillInput(e.target.value)} 
                onKeyDown={handleSkillKeyDown}
                placeholder={skills.length === 0 ? "Type a skill and press Enter" : ""}
                className="flex-1 bg-transparent outline-none min-w-[150px] p-1 text-sm text-[var(--text-primary)]" 
              />
            </div>
          </div>
          
          <div className="col-span-2 pt-4">
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">Certifications</label>
            <div className="flex gap-2 mb-4">
              <input value={certInput} onChange={e => setCertInput(e.target.value)} placeholder="Cert Name" className="flex-1 px-4 rounded-xl border border-[var(--border)] bg-gray-50/50 focus:bg-white focus:border-[var(--primary)] outline-none text-sm" />
              <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-gray-50/50 hover:border-[var(--primary)] cursor-pointer px-4 truncate">
                <FileText size={16} className="shrink-0" />
                <span className="text-sm text-gray-500 truncate">{certFile ? certFile.name : "Upload Proof"}</span>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setCertFile(e.target.files?.[0] || null)} />
              </label>
              <button type="button" onClick={handleAddCert} className="h-[46px] w-[46px] shrink-0 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"><Plus size={20} /></button>
            </div>

            {certs.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {certs.map((cert, index) => {
                  const previewUrl = cert.file ? URL.createObjectURL(cert.file) : cert.fileUrl;
                  return (
                    <div key={index} className="flex flex-col bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-sm relative group">
                      <div className="p-2 border-b border-[var(--border)] bg-gray-50 flex items-center justify-between">
                        <span className="font-semibold text-xs text-[var(--text-primary)] truncate pr-2" title={cert.name}>{cert.name}</span>
                        <button type="button" onClick={() => removeCert(index)} className="text-gray-400 hover:text-red-500 bg-white rounded-md p-1 shadow-sm border border-gray-100">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="h-28 bg-gray-100">
                        {previewUrl && <DocumentViewer url={previewUrl} altText={cert.name} className="w-full h-full border-none rounded-none" fileType={cert.file ? cert.file.type : undefined} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="col-span-2 flex justify-end gap-3 pt-6 border-t border-[var(--border)] mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[var(--border)] font-semibold hover:bg-gray-50 transition-colors text-[var(--text-primary)]">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold disabled:opacity-50 transition-opacity">
              {isSaving ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </div>
    </EngineerModal>
  );
}