"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  CheckCheck,
  KeyRound,
  ExternalLink,
  Plus,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Credential {
  id: string;
  title: string;
  type: string;
  content: string;
  isLocked: boolean;
  createdAt: string;
  addedBy: {
    name: string;
    image?: string;
  };
}

interface UnlockStatus {
  progress: number;
  isEngineerFinished: boolean;
  isFinalPaymentMade: boolean;
  isReviewApproved: boolean;
}

interface CredentialsTabProps {
  projectId: string;
}

function LockScreen({ status }: { status: UnlockStatus }) {

  return (
    <div className="relative min-h-[480px] flex items-center justify-center p-8 overflow-hidden bg-gray-50 rounded-2xl">
      <div className="relative z-10 bg-gray-100 rounded-[20px] px-9 py-10 max-w-[420px] w-full flex flex-col items-center gap-4 shadow-[0_0_0_1px_#ffffff06,0_32px_64px_#00000080]">
        <div className="relative w-[72px] h-[72px] flex items-center justify-center mb-1">
          <Lock className="text-[var(--primary)] w-20 h-20 relative z-10" strokeWidth={1.5} />
            </div>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-black">
          <span>Credentials are end-to-end encrypted and auto-unlock on completion</span>
        </div>
      </div>
    </div>
  );
}

function CredentialCard({ cred }: { cred: Credential }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(cred.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast.success("Copied!");
  };

  return (
    <div className="bg-white text-black border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-[var(--primary)]" />
            <span className="font-semibold text-lg">{cred.title}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Added by {cred.addedBy.name}</p>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setVisible(!visible)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            onClick={copy}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {copied ? <CheckCheck size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
          {cred.content.startsWith("http") && (
            <a href={cred.content} target="_blank" rel="noreferrer" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>

      <div className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg p-4 break-all min-h-[60px]">
  {visible
    ? cred.content
    : `${cred.content.slice(0, 12)}***************${cred.content.slice(-8)}`}
</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
const CredentialsTab = ({ projectId }: CredentialsTabProps) => {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const isPrivileged = userRole === "ADMIN" || userRole === "ENGINEER"; // Both can upload & view

  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [status, setStatus] = useState<UnlockStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCredentials = async () => {
    try {
      const res = await fetch(`/api/resources?projectId=${projectId}&tab=credentials`);
      const data = await res.json();

      if (data.success) {
        setCredentials(data.resources);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load credentials");
    }
  };

  const fetchUnlockStatus = async () => {
    try {
      const res = await fetch(`/api/project/${projectId}`);
      const data = await res.json();

      if (data.success && data.project) {
        setStatus({
          progress: data.project.progress || 0,
          isEngineerFinished: data.project.isEngineerFinished || false,
          isFinalPaymentMade: data.project.isFinalPaymentMade || false,
          isReviewApproved: data.project.isReviewApproved || false,
        });
      }
    } catch (err) {
      console.error("Status fetch failed", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchUnlockStatus(), fetchCredentials()]);
      setLoading(false);
    };

    loadAll();
  }, [projectId]);

  const isUnlocked = status && (
    status.progress === 100 &&
    status.isEngineerFinished &&
    status.isReviewApproved &&
    status.isFinalPaymentMade
  );

  // Show lock screen only to CLIENT when not unlocked
  if (!isPrivileged && status && !isUnlocked) {
    return <LockScreen status={status} />;
  }

  const handleAddCredential = async () => {
    if (!newTitle || !newContent) {
      toast.error("Title and content are required");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("title", newTitle);
    formData.append("type", "CREDENTIALS");
    formData.append("content", newContent);

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Credential added successfully");
        setShowAddModal(false);
        setNewTitle("");
        setNewContent("");
        await fetchCredentials();
      } else {
        toast.error(data.message || "Failed to add credential");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex justify-center items-center">
        <Loader2 className="animate-spin" style={{ color: "var(--primary)" }} size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[var(--primary)]" />
          <div>
            <h2 className="text-2xl font-bold text-black">Project Credentials</h2>
            <p className="text-sm text-slate-500">
              {isPrivileged ? "Full access • You can add credentials" : "Unlocked after final milestone"}
            </p>
          </div>
        </div>

        {isPrivileged && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
          >
            <Plus size={18} />
            Add Credential
          </button>
        )}
      </div>

      {credentials.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl py-20 text-center">
          <KeyRound size={52} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600">No credentials added yet</p>
          {isPrivileged && <p className="text-sm text-gray-500 mt-1">Click "Add Credential" to get started</p>}
        </div>
      ) : (
        <div className="grid gap-4">
          {credentials.map((cred) => (
            <CredentialCard key={cred.id} cred={cred} />
          ))}
        </div>
      )}

      {/* Add Credential Modal */}
      {showAddModal && (
        <div className="fixed inset-0 text-black bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Add New Credential</h3>

            <input
              type="text"
              placeholder="Title (e.g., Hosting Login, Database, etc.)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <textarea
              placeholder="Enter credentials here...&#10;Username: ...&#10;Password: ...&#10;URL: ..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border rounded-xl font-mono text-sm resize-y min-h-[140px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCredential}
                disabled={submitting}
                className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="animate-spin" size={18} />}
                Add Credential
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialsTab;