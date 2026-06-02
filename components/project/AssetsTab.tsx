"use client";

import { useEffect, useState } from "react";
import {
  FileArchive, FileText, Plus, Loader2, Download, Eye, Trash2,
  Image as ImageIcon, Link as LinkIcon, ExternalLink, Copy, CopyCheck,
  Paperclip,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface Resource {
  id: string;
  title: string;
  type: "FILE" | "CREDENTIALS" | "IMAGE" | "LINK" | "TEXT";
  content: string;
  createdAt: string;
  addedBy: {
    name: string;
    image?: string;
  };
  isLocked?: boolean;
}

function AssetsCard({ resource, onDelete, isAdmin }: {
  resource: Resource;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const isFileType = resource.type === "FILE" || resource.type === "IMAGE";
  const isLink = resource.type === "LINK";

  const displayUrl = resource.content;
  const previewImage = resource.type === "IMAGE"
    ? resource.content
    : resource.type === "LINK"
      ? "/globe.svg"
      : "/placeholder-file.jpg";

  const handleDownload = async () => {
    if (!isFileType) return;

    try {
      const response = await fetch(resource.content);
      if (!response.ok) throw new Error("Failed");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = resource.title.replace(/\s+/g, "_") +
        (resource.type === "IMAGE" ? ".jpg" : ".zip");

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Downloaded successfully");
    } catch {
      toast.error("Download failed");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(resource.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const getIcon = () => {
    switch (resource.type) {
      case "IMAGE": return <ImageIcon size={14} style={{ color: "var(--text-muted)" }} />;
      case "FILE": return <FileArchive size={14} style={{ color: "var(--text-muted)" }} />;
      case "LINK": return <LinkIcon size={14} style={{ color: "var(--text-muted)" }} />;
      default: return <FileText size={14} style={{ color: "var(--text-muted)" }} />;
    }
  };

  const handleAction = () => {
    if (isLink) {
      try {
        let url = resource.content.trim();
        if (url && !url.startsWith("http")) url = "https://" + url;
        window.open(url, "_blank");
      } catch {
        window.open(resource.content, "_blank");
      }
    } else {
      handleDownload();
    }
  };

  return (
    <div className="relative w-full rounded-2xl border border-[var(--border)] overflow-hidden bg-white" style={{ height: "320px" }}>
      <Image
        src={previewImage}
        alt={resource.title}
        className="w-full h-full object-cover"
        width={320}
        height={320}
      />

      <div className="absolute bottom-0 w-full"
        style={{ background: "linear-gradient(to top, rgba(5,10,48,0.95) 60%, transparent)" }}>
        <div className="px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs  mb-1" style={{ color: "var(--text-muted)" }}>
            {getIcon()} {resource.type}
          </p>

          <p className="text-white font-semibold  text-base line-clamp-2">
            {resource.title}
          </p>

          <p className="text-xs  mt-0.5" style={{ color: "var(--text-muted)" }}>
            Uploaded: {new Date(resource.createdAt).toLocaleDateString()}
          </p>

          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden border"
                style={{ background: "var(--primary-light)", borderColor: "#ffd9a8" }}>
                {resource.addedBy.image ? (
                  <Image
                    src={resource.addedBy.image}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-full"
                    width={24}
                    height={24}
                  />
                ) : (
                  <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>
                    {resource.addedBy.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <p className="text-xs  text-white">{resource.addedBy.name}</p>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => onDelete(resource.id)}
                  className="w-7 h-7 text-white hover:text-red-400 flex items-center justify-center transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <button
                onClick={resource.type === "LINK" ? copyToClipboard : () => window.open(displayUrl, "_blank")}
                className="w-7 h-7 text-white hover:text-[var(--primary)] flex items-center justify-center transition-colors"
              >
                {resource.type === "LINK" ?
                  (isCopied ? <CopyCheck size={16} /> : <Copy size={16} />) :
                  <Eye size={16} />
                }
              </button>

              <button
                onClick={handleAction}
                className="w-7 h-7 bg-white hover:scale-90 hover:bg-[var(--primary)] transition-all flex items-center justify-center rounded-full"
                style={{ color: "var(--text-primary)" }}
              >
                {isLink ? <ExternalLink size={12} /> : <Download size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssetsTab({ projectId }: { projectId: string }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"FILE" | "IMAGE" | "LINK" | "TEXT" | "CREDENTIALS">("IMAGE");
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    resourceId: string | null;
  }>({
    open: false,
    resourceId: null,
  });

  const { data: session } = useSession();
  const role = session?.user?.role?.toUpperCase()?.trim() || "";
  const isAdmin = role === "ADMIN";
  const isEngineer = role === "ENGINEER";

  // Only Admin & Engineer can upload resources
  const canUpload = isAdmin || isEngineer;

  const fetchResources = async () => {
    try {
      const res = await fetch(`/api/resources?projectId=${projectId}&tab=assets`);
      const data = await res.json();

      if (data.success) {
        setResources(data.resources);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [projectId]);

  const uploadResource = async () => {
    if (!title) return toast.error("Title is required");

    if ((type === "FILE" || type === "IMAGE") && !file) {
      return toast.error("File is required");
    }

    if ((type === "LINK" || type === "TEXT" || type === "CREDENTIALS") && !content) {
      return toast.error("Content is required");
    }

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("title", title);
    formData.append("type", type);

    if (type === "FILE" || type === "IMAGE") {
      formData.append("file", file!);
    } else {
      formData.append("content", content);
    }

    try {
      setUploading(true);
      const res = await fetch("/api/resources", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setOpen(false);
        setTitle(""); setFile(null); setContent("");
        await fetchResources();
        toast.success("Resource uploaded successfully!");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  const openDeleteModal = (resourceId: string) => {
    setDeleteModal({
      open: true,
      resourceId,
    });
  };

  // const deleteResource = async (resourceId: string) => {
  //   if (!confirm("Delete this resource?")) return;

  //   try {
  //     const res = await fetch(`/api/resources/${resourceId}`, { method: "DELETE" });
  //     const data = await res.json();

  //     if (data.success) {
  //       await fetchResources();
  //       toast.success("Resource deleted");
  //     } else {
  //       toast.error(data.message || "Delete failed");
  //     }
  //   } catch {
  //     toast.error("Failed to delete");
  //   }
  // };

  const deleteResource = async (resourceId: string) => {
    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        await fetchResources();
        toast.success("Resource deleted");
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.resourceId) return;

    try {
      setDeleting(true);

      await deleteResource(deleteModal.resourceId);

      setDeleteModal({
        open: false,
        resourceId: null,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-lg bg-white border border-[var(--border)]  text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";
  const labelCls = "block text-sm font-medium  mb-1.5";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold " style={{ color: "var(--text-primary)" }}>Resources</h2>

        {canUpload && (
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 text-white rounded-lg flex items-center gap-2  text-sm"
            style={{ background: "var(--primary)" }}
          >
            <Plus size={16} /> Upload Resource
          </button>
        )}
      </div>

      {loading ? (
        <div className="w-full h-[50vh] flex justify-center items-center">
          <Loader2 className="animate-spin" style={{ color: "var(--primary)" }} size={40} />
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12  text-sm" style={{ color: "var(--text-muted)" }}>
          No resources uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {resources.map((res) => (
            <AssetsCard
              key={res.id}
              resource={res}
              onDelete={openDeleteModal}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Upload Modal - Only show CREDENTIALS option to Admin & Engineer */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 text-black">
          <div className="bg-white p-6 rounded-xl max-w-md w-full border border-[var(--border)] shadow-lg">
            <h2 className="text-lg font-semibold  mb-4">Upload Resource</h2>

            <input
              type="text"
              placeholder="Resource Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${inputCls} mb-4`}
            />

            <label className={labelCls}>Type</label>
            <select
              className={`${inputCls} mb-4`}
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="IMAGE">Image</option>
              <option value="FILE">File (ZIP, PDF, etc.)</option>
              <option value="LINK">Link</option>
              <option value="TEXT">Text Note</option>
              {/* Hide Credentials option from Clients (though they shouldn't reach here) */}
              {(isAdmin || isEngineer) && (
                <option value="CREDENTIALS">Credentials</option>
              )}
            </select>

            {(type === "FILE" || type === "IMAGE") ? (
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  setDragActive(false);

                  const droppedFile = e.dataTransfer.files?.[0];

                  if (droppedFile) {
                    setFile(droppedFile);
                  }
                }}
                className={`relative mb-4 rounded-xl border-2 border-dashed p-6 transition-all duration-200 ${dragActive
                  ? "border-[var(--primary)] bg-orange-50"
                  : "border-gray-300 bg-gray-50"
                  }`}
              >
                {/* HIDDEN INPUT */}
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <Paperclip
                    size={28}
                    className="text-[var(--primary)]"
                  />

                  <div>
                    <p className="text-sm font-medium text-black">
                      Drag & drop file here
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      or click to browse
                    </p>
                  </div>

                  {/* FILE PREVIEW */}
                  {file && (
                    <div className="relative mt-4 w-full rounded-xl border bg-white p-3">

                      {/* REMOVE BUTTON */}
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="absolute top-2 right-2 rounded-full bg-gray-100 p-1 hover:bg-red-100 transition"
                      >
                        <X
                          size={14}
                          className="text-gray-600 hover:text-red-600"
                        />
                      </button>

                      {file.type.startsWith("image/") ? (
                        <div className="space-y-3">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            className="max-h-52 w-full object-cover rounded-lg border"
                          />

                          <div className="text-xs text-gray-600 break-all">
                            {file.name}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Paperclip
                              size={18}
                              className="text-gray-600"
                            />
                          </div>

                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-black truncate">
                              {file.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <textarea
                placeholder={
                  type === "LINK" ? "Paste URL..." :
                    type === "CREDENTIALS" ? "Username / Password / Notes..." :
                      "Enter content..."
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`${inputCls} mb-4 min-h-[100px] resize-y`}
              />
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg  text-sm"
              >
                Cancel
              </button>
              <button
                disabled={uploading}
                onClick={uploadResource}
                className="px-4 py-2 text-white rounded-lg flex items-center gap-2  text-sm disabled:opacity-40"
                style={{ background: "var(--primary)" }}
              >
                {uploading && <Loader2 className="animate-spin" size={14} />}
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">

            {/* HEADER */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-black">
                  Delete Resource
                </h2>

                <p className="mt-2 text-sm text-gray-500 leading-6">
                  Are you sure you want to delete this resource?
                  This action cannot be undone.
                </p>
              </div>

              <button
                onClick={() =>
                  setDeleteModal({
                    open: false,
                    resourceId: null,
                  })
                }
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() =>
                  setDeleteModal({
                    open: false,
                    resourceId: null,
                  })
                }
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                disabled={deleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}