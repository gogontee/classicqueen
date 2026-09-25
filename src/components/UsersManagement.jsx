"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  User as UserIcon,
  ShieldCheck,
  Shield,
  Check,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const ROLES = ["user", "candidate", "admin"];

export default function UsersManagement({ currentUserId }) {
  const supabase = createClient();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: qErr } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (qErr) setError(qErr.message);
    else setUsers(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRoleChange = async (user, newRole) => {
    if (user.role === newRole) return;
    setUpdatingId(user.id);
    const prev = users;
    setUsers((u) => u.map((x) => (x.id === user.id ? { ...x, role: newRole } : x)));

    const { error: upErr } = await supabase
      .from("users")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (upErr) {
      setError(upErr.message);
      setUsers(prev);
    }
    setUpdatingId(null);
  };

  const handleToggleActive = async (user) => {
    const newValue = !user.is_active;
    setUpdatingId(user.id);
    const prev = users;
    setUsers((u) =>
      u.map((x) => (x.id === user.id ? { ...x, is_active: newValue } : x))
    );

    const { error: upErr } = await supabase
      .from("users")
      .update({ is_active: newValue, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (upErr) {
      setError(upErr.message);
      setUsers(prev);
    }
    setUpdatingId(null);
  };

  const handleDelete = async (user) => {
    setConfirmDelete(null);
    const prev = users;
    setUsers((u) => u.filter((x) => x.id !== user.id));

    // Delete from the users table. The FK to auth.users has on delete cascade,
    // but that cascade goes the other way — deleting auth.users removes users.
    // Here we delete from public.users only. To remove the auth record too,
    // you'd need a server route with the service role key.
    const { error: delErr } = await supabase
      .from("users")
      .delete()
      .eq("id", user.id);

    if (delErr) {
      setError(delErr.message);
      setUsers(prev);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== "All" && u.role !== roleFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q)
    );
  });

  const roleBadge = (role) => {
    const map = {
      admin: { bg: "#6b4423", text: "#fff" },
      candidate: { bg: "#9A7B4F", text: "#fff" },
      user: { bg: "#faf6ee", text: "#6b4423" },
    };
    const c = map[role] || map.user;
    return { background: c.bg, color: c.text };
  };

  const initials = (u) =>
    u.first_name && u.last_name
      ? `${u.first_name[0]}${u.last_name[0]}`.toUpperCase()
      : u.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7B4F]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423]"
          />
        </div>

        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none pl-3 pr-9 py-2.5 bg-white border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] cursor-pointer capitalize"
          >
            <option value="All">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r} className="capitalize">
                {r}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b4423] pointer-events-none"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#9A7B4F]/20 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[#6b4423] text-sm flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-[#6b4423]/70 text-sm">
            {users.length === 0
              ? "No users yet."
              : "No users match your filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#faf6ee] border-b border-[#9A7B4F]/20">
                <tr className="text-left text-[#6b4423]">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">
                    Email
                  </th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">
                    Active
                  </th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">
                    Joined
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[#9A7B4F]/10 last:border-0 hover:bg-[#faf6ee]/50 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-full overflow-hidden bg-[#faf6ee] flex-shrink-0"
                          style={{ width: "40px", height: "40px" }}
                        >
                          {u.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatar_url}
                              alt={`${u.first_name} ${u.last_name}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center font-bold text-xs"
                              style={{ color: "#9A7B4F" }}
                            >
                              {initials(u)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#2E1503] truncate">
                            {u.first_name} {u.last_name}
                          </p>
                          <p className="text-xs text-[#9A7B4F] truncate lg:hidden">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[#6b4423]">
                      <span className="truncate block max-w-[240px]">
                        {u.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-flex items-center">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          disabled={updatingId === u.id || u.id === currentUserId}
                          className="appearance-none pl-2.5 pr-8 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide cursor-pointer border-0 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                          style={roleBadge(u.role)}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r} style={{ color: "#2E1503", background: "#fff" }}>
                              {r}
                            </option>
                          ))}
                        </select>
                        {updatingId === u.id ? (
                          <Loader2
                            size={11}
                            className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin pointer-events-none"
                            style={{ color: roleBadge(u.role).color }}
                          />
                        ) : (
                          <ChevronDown
                            size={11}
                            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: roleBadge(u.role).color }}
                          />
                        )}
                      </div>
                      {u.id === currentUserId && (
                        <span className="text-[10px] text-[#9A7B4F] ml-2">(you)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={updatingId === u.id || u.id === currentUserId}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition disabled:opacity-60 disabled:cursor-not-allowed ${
                          u.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {u.is_active ? (
                          <>
                            <Check size={10} /> Active
                          </>
                        ) : (
                          <>
                            <X size={10} /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-[#6b4423]">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setConfirmDelete(u)}
                        disabled={u.id === currentUserId}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Delete user"
                        title={
                          u.id === currentUserId
                            ? "You can't delete your own account"
                            : "Delete user"
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={24} className="text-red-600" />
              </div>
            </div>
            <h3 className="text-base font-bold text-[#2E1503] text-center mb-1">
              Delete user?
            </h3>
            <p className="text-sm text-[#6b4423] text-center mb-5">
              This removes{" "}
              <strong>
                {confirmDelete.first_name} {confirmDelete.last_name}
              </strong>{" "}
              from the users table. Their votes and favorites go too.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#9A7B4F]/40 text-[#6b4423] text-sm font-semibold hover:bg-[#faf6ee] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}