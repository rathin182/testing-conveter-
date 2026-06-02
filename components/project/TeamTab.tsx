"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Crown, Edit, Trash2, Plus, LucideLoader } from "lucide-react";

export default function TeamTab({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [newRole, setNewRole] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientModel, setClientModel] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [isClientAvailable, setIsClientAvailable] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setEmployee] = useState(false);

  const checkUserRole = async () => {
    try {
      const response = localStorage.getItem("user");
      const data = response ? JSON.parse(response) : null;
      if (data && data.role.name === "EMPLOYEE") setEmployee(true);
      if (data && data.role.name === "ADMIN") setIsAdmin(true);
    } catch (error) {
      console.error("Failed to check user role:", error);
    }
  };

  useEffect(() => {
    checkUserRole();
    if (projectId) fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/project/member?projectId=${projectId}`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.members);
        setIsClientAvailable(data.members.some((m: any) => m.user.role.name === "CLIENT"));
      }
    } catch (err) {
      console.error("Team Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, role: string, isLeader: boolean) => {
    try {
      await fetch(`/api/project/member`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, userId, role, isLeader }),
      });
      fetchMembers();
    } catch (err) {
      console.error("Update Failed:", err);
    }
  };

  const removeMember = async (userId: string) => {
    if (!confirm("Remove this member from the project?")) return;
    try {
      await fetch(`/api/project/member`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, userId }),
      });
      fetchMembers();
    } catch (err) {
      console.error("Remove Failed:", err);
    }
  };

  const saveRole = async () => {
    if (!editingMember || !newRole.trim()) return;
    await updateRole(editingMember.userId, newRole, editingMember.isLeader);
    setEditingMember(null);
    setNewRole("");
  };

  const fetchAvailableUsers = async (Type: string) => {
    setUsersLoading(true);
    try {
      const res = await fetch(`/api/admin/getRoleWise?role=${Type}`);
      const data = await res.json();
      if (data.users) {
        const currentMemberIds = members.map((m) => m.userId);
        setAvailableUsers(data.users.filter((u: any) => !currentMemberIds.includes(u.id)));
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const addMember = async (isClient: boolean) => {
    if (!selectedUser) return;
    try {
      await fetch("/api/project/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          userId: selectedUser,
          role: isClient ? "CLIENT" : memberRole || "Member",
          isLeader: false,
        }),
      });
      setShowAddModal(false);
      setSelectedUser("");
      setMemberRole("");
      setClientModel(false);
      fetchMembers();
    } catch (err) {
      console.error("Add member failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex justify-center items-center">
        <LucideLoader className="animate-spin" style={{ color: "var(--primary)" }} size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold " style={{ color: "var(--text-primary)" }}>Project Team</h2>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={isClientAvailable ? () => {} : () => { fetchAvailableUsers("CLIENT"); setShowAddModal(true); setClientModel(true); }}
              className={`px-4 py-2 border border-[var(--border)] rounded-lg flex items-center gap-2 transition-colors  text-sm ${isClientAvailable ? "opacity-40 cursor-not-allowed" : "hover:bg-[var(--primary-light)]"}`}
              style={{ color: "var(--text-secondary)" }}
            >
              <Plus size={16} /> Add Client
            </button>
            <button
              onClick={() => { fetchAvailableUsers("EMPLOYEE"); setShowAddModal(true); }}
              className="px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors  text-sm"
              style={{ background: "var(--primary)" }}
            >
              <Plus size={16} /> Add Member
            </button>
          </div>
        )}
      </div>

      {members.length === 0 && (
        <p className="text-sm " style={{ color: "var(--text-muted)" }}>No team members added yet.</p>
      )}

      <div className="space-y-3">
        {members.map((m: any) => {
          if (isEmployee && m.role.name === "CLIENT") return null;
          return (
            <div key={m.id} className="p-5 bg-white border border-[var(--border)] rounded-xl">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-semibold " style={{ color: "var(--text-primary)" }}>{m.user.name}</p>
                  {editingMember?.id === m.id ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--bg)] "
                        style={{ color: "var(--text-primary)" }}
                        placeholder="Enter role"
                      />
                      <button onClick={saveRole} className="px-2 py-1 text-white text-xs rounded " style={{ background: "var(--primary)" }}>Save</button>
                      <button onClick={() => setEditingMember(null)} className="px-2 py-1 bg-gray-100 text-xs rounded " style={{ color: "var(--text-secondary)" }}>Cancel</button>
                    </div>
                  ) : (
                    <p className="text-sm " style={{ color: "var(--text-muted)" }}>{m.role?.name || "Not assigned"}</p>
                  )}
                  {m.isLeader && (
                    <p className="flex items-center gap-1 mt-1 text-sm " style={{ color: "var(--primary)" }}>
                      <Crown size={14} /> Team Leader
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    {m.user.role.name !== "CLIENT" && (
                      <button
                        onClick={() => updateRole(m.userId, m.role.name || "Member", !m.isLeader)}
                        className="flex items-center gap-1 px-3 py-1 rounded text-xs  border border-[var(--border)]"
                        style={m.isLeader ? { background: "var(--primary)", color: "#fff", borderColor: "var(--primary)" } : { color: "var(--text-secondary)" }}
                      >
                        <ShieldCheck size={12} />
                        {m.isLeader ? "Remove Leader" : "Make Leader"}
                      </button>
                    )}
                    {m.role.name !== "CLIENT" && (
                      <button onClick={() => { setEditingMember(m); setNewRole(m.role.name || ""); }} className="p-1 hover:text-[var(--primary)] transition-colors" style={{ color: "var(--text-muted)" }}>
                        <Edit size={14} />
                      </button>
                    )}
                    <button onClick={() => removeMember(m.userId)} className="p-1 hover:text-red-500 transition-colors" style={{ color: "var(--text-muted)" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(showAddModal || clientModel) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl border border-[var(--border)] shadow-lg">
            <h2 className="text-lg font-semibold  mb-4" style={{ color: "var(--text-primary)" }}>
              Add {clientModel ? "Client" : "Team Member"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium  mb-1.5" style={{ color: "var(--text-secondary)" }}>Select User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  disabled={usersLoading}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)]  text-sm bg-white focus:outline-none"
                  style={{ color: "var(--text-primary)" }}
                >
                  {usersLoading ? (
                    <option value="">Loading users...</option>
                  ) : (
                    <>
                      <option value="">Choose a user...</option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium  mb-1.5" style={{ color: "var(--text-secondary)" }}>Role</label>
                <input
                  type="text"
                  value={clientModel ? "CLIENT" : memberRole}
                  disabled={clientModel}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[var(--border)]  text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: "var(--text-primary)" }}
                  placeholder="Enter role (e.g., Developer, Designer)"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); setSelectedUser(""); setMemberRole(""); setClientModel(false); }}
                className="px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg  text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => addMember(clientModel)}
                disabled={!selectedUser}
                className="px-4 py-2 text-white rounded-lg  text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--primary)" }}
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
