"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Loader2,
  Check,
  AlertCircle,
  ChevronDown,
  Trophy as TrophyIcon,
  User as UserIcon,
  Upload,
  Image as ImageIcon,
  Lock,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const STATUSES = ["active", "inactive", "archived"];

const emptyForm = {
  candidate_id: "",
  title: "",
  description: "",
  image_url: "",
  status: "active",
};

export default function TrophiesManagement() {
  const supabase = createClient();

  const [trophies, setTrophies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [candidateFilter, setCandidateFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete flow
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [passcodeStep, setPasscodeStep] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Image upload
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewError, setPreviewError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const [trophiesRes, candidatesRes] = await Promise.all([
      supabase
        .from("trophies")
        .select(
          `
          id,
          candidate_id,
          title,
          description,
          image_url,
          status,
          created_at,
          candidate:candidates (
            id,
            full_name,
            username,
            country,
            photo
          )
        `
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("candidates")
        .select("id, full_name, username, country, photo, status")
        .order("full_name", { ascending: true }),
    ]);

    if (trophiesRes.error) setError(trophiesRes.error.message);
    else setTrophies(trophiesRes.data ?? []);

    if (!candidatesRes.error) setCandidates(candidatesRes.data ?? []);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setUploadError("");
    setPreviewError(false);
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      candidate_id: t.candidate_id ?? "",
      title: t.title ?? "",
      description: t.description ?? "",
      image_url: t.image_url ?? "",
      status: t.status ?? "active",
    });
    setFormError("");
    setUploadError("");
    setPreviewError(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving || uploading) return;
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setUploadError("");
    setPreviewError(false);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset so picking the same file again still fires onChange
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image is larger than 8 MB.");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `trophies/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("cms")
        .upload(path, file, {
          upsert: false,
          contentType: file.type,
        });

      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage
        .from("cms")
        .getPublicUrl(path);

      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error("Could not get public URL.");

      handleChange("image_url", publicUrl);
      setPreviewError(false);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError(err.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setFormError("");

    if (!form.candidate_id) return setFormError("Please choose a candidate.");
    if (!form.title.trim()) return setFormError("Title is required.");

    const payload = {
      candidate_id: form.candidate_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      status: form.status,
    };

    setSaving(true);
    try {
      if (editing) {
        const { error: upErr } = await supabase
          .from("trophies")
          .update(payload)
          .eq("id", editing.id);
        if (upErr) throw upErr;
      } else {
        const { error: insErr } = await supabase
          .from("trophies")
          .insert([payload]);
        if (insErr) throw insErr;
      }

      await load();
      closeModal();
    } catch (err) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // ---- Two-step delete flow ----

  const askDelete = (trophy) => {
    setConfirmDelete(trophy);
    setPasscodeStep(false);
    setPasscode("");
    setPasscodeError("");
  };

  const goToPasscodeStep = () => {
    setPasscodeStep(true);
    setPasscode("");
    setPasscodeError("");
  };

  const verifyAndDelete = async () => {
    if (!passcode.trim()) {
      setPasscodeError("Please enter the admin passcode.");
      return;
    }

    setDeleting(true);
    setPasscodeError("");

    try {
      let query = supabase
        .from("classicqueen")
        .select("passcode")
        .eq("passcode", passcode.trim())
        .single();

      const { data, error: pwErr } = await query;

      let verified = false;

      if (pwErr && pwErr.code === "PGRST103") {
        const { data: altData, error: altErr } = await supabase
          .from("admin_passcodes")
          .select("passcode")
          .eq("passcode", passcode.trim())
          .single();

        if (altErr && altErr.code === "PGRST116") {
          setPasscodeError("Incorrect passcode. Please try again.");
          setDeleting(false);
          return;
        }
        if (altErr) throw altErr;
        verified = altData?.passcode === passcode.trim();
      } else if (pwErr) {
        if (pwErr.code === "PGRST116") {
          setPasscodeError("Incorrect passcode. Please try again.");
          setDeleting(false);
          return;
        }
        throw pwErr;
      } else {
        verified = data?.passcode === passcode.trim();
      }

      if (!verified) {
        setPasscodeError("Incorrect passcode. Please try again.");
        setDeleting(false);
        return;
      }

      const target = confirmDelete;
      const { error: delErr } = await supabase
        .from("trophies")
        .delete()
        .eq("id", target.id);

      if (delErr) throw delErr;

      setTrophies((prev) => prev.filter((t) => t.id !== target.id));
      setConfirmDelete(null);
      setPasscodeStep(false);
      setPasscode("");
      setPasscodeError("");
    } catch (err) {
      console.error("Delete failed:", err);
      setPasscodeError(err.message || "Something went wrong.");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
    setPasscodeStep(false);
    setPasscode("");
    setPasscodeError("");
    setDeleting(false);
  };

  const filtered = trophies.filter((t) => {
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    if (candidateFilter !== "All" && t.candidate_id !== candidateFilter)
      return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.candidate?.full_name?.toLowerCase().includes(q)
    );
  });

  const statusBadge = (status) => {
    const map = {
      active: { bg: "#d1fae5", color: "#065f46" },
      inactive: { bg: "#fef3c7", color: "#92400e" },
      archived: { bg: "#e5e7eb", color: "#374151" },
    };
    return map[status] || map.inactive;
  };

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
            placeholder="Search by title, description, candidate…"
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423]"
          />
        </div>

        <div className="relative">
          <select
            value={candidateFilter}
            onChange={(e) => setCandidateFilter(e.target.value)}
            className="appearance-none pl-3 pr-9 py-2.5 bg-white border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] cursor-pointer max-w-[220px] truncate"
          >
            <option value="All">All candidates</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b4423] pointer-events-none"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-9 py-2.5 bg-white border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] cursor-pointer capitalize"
          >
            <option value="All">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b4423] pointer-events-none"
          />
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
          }}
        >
          <Plus size={16} />
          Add Trophy
        </button>
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
            Loading trophies…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-[#6b4423]/70 text-sm">
            {trophies.length === 0
              ? "No trophies yet. Add the first one."
              : "No trophies match your filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#faf6ee] border-b border-[#9A7B4F]/20">
                <tr className="text-left text-[#6b4423]">
                  <th className="px-4 py-3 font-semibold">Trophy</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">
                    Candidate
                  </th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">
                    Awarded
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-[#9A7B4F]/10 last:border-0 hover:bg-[#faf6ee]/50 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative rounded-lg overflow-hidden bg-[#faf6ee] flex-shrink-0 flex items-center justify-center"
                          style={{ width: "44px", height: "44px" }}
                        >
                          {t.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={t.image_url}
                              alt={t.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <TrophyIcon size={20} color="#9A7B4F" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#2E1503] truncate">
                            {t.title}
                          </p>
                          {t.description && (
                            <p className="text-xs text-[#6b4423]/70 truncate max-w-[280px]">
                              {t.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {t.candidate ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="rounded-full overflow-hidden bg-[#faf6ee] flex-shrink-0"
                            style={{ width: "28px", height: "28px" }}
                          >
                            {t.candidate.photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={t.candidate.photo}
                                alt={t.candidate.full_name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <UserIcon size={12} color="#9A7B4F" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[#2E1503] truncate">
                              {t.candidate.full_name}
                            </p>
                            <p className="text-[10px] text-[#9A7B4F] truncate">
                              @{t.candidate.username}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#6b4423]/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                        style={statusBadge(t.status)}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[#6b4423]">
                      {t.created_at
                        ? new Date(t.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-2 rounded-lg text-[#6b4423] hover:bg-[#faf6ee] transition"
                          aria-label="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => askDelete(t)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-[3px] my-auto"
            style={{
              background:
                "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl bg-white overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#9A7B4F]/20 flex-shrink-0">
                <h2 className="text-base font-bold text-[#2E1503]">
                  {editing ? "Edit Trophy" : "Add Trophy"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 rounded-full hover:bg-[#faf6ee] text-[#6b4423]"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto p-5 space-y-4">
                {/* Candidate picker */}
                <div>
                  <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
                    Candidate *
                  </label>
                  <div className="relative">
                    <select
                      value={form.candidate_id}
                      onChange={(e) =>
                        handleChange("candidate_id", e.target.value)
                      }
                      className="w-full appearance-none pl-3.5 pr-9 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] cursor-pointer"
                    >
                      <option value="">— Choose a candidate —</option>
                      {candidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_name} · {c.country}
                          {c.status ? ` (${c.status})` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b4423] pointer-events-none"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Best Fashion Queen 2026"
                    className="w-full px-3.5 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] placeholder:text-[#6b4423]/40"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={4}
                    placeholder="Awarded for outstanding runway presence…"
                    className="w-full px-3.5 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] resize-none placeholder:text-[#6b4423]/40"
                  />
                </div>

                {/* Image — URL + Upload button */}
                <div>
                  <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
                    Trophy Image
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.image_url}
                      onChange={(e) => {
                        handleChange("image_url", e.target.value);
                        setPreviewError(false);
                      }}
                      placeholder="https://… or upload a file"
                      className="flex-1 px-3.5 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] placeholder:text-[#6b4423]/40"
                    />
                    <button
                      type="button"
                      onClick={handlePickFile}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 px-3.5 rounded-xl text-white text-xs font-semibold transition hover:brightness-110 disabled:opacity-60 flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
                      }}
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          Upload
                        </>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {uploadError && (
                    <p className="text-[11px] text-red-600 mt-1 ml-1">
                      {uploadError}
                    </p>
                  )}

                  {form.image_url && !previewError && (
                    <div className="mt-2 relative">
                      <div
                        className="rounded-lg overflow-hidden border border-[#9A7B4F]/20 bg-[#faf6ee] flex items-center justify-center"
                        style={{ height: "140px" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.image_url}
                          alt="Preview"
                          onError={() => setPreviewError(true)}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>

                      {/* Remove image button */}
                      <button
                        type="button"
                        onClick={() => {
                          handleChange("image_url", "");
                          setPreviewError(false);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white transition"
                        title="Remove image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  {previewError && form.image_url && (
                    <p className="text-[11px] text-amber-600 mt-1 ml-1 flex items-center gap-1">
                      <ImageIcon size={11} /> Preview unavailable — the URL may
                      be broken.
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
                    Status
                  </label>
                  <div className="flex gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleChange("status", s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border capitalize ${
                          form.status === s
                            ? "bg-[#6b4423] text-white border-[#6b4423]"
                            : "border-[#9A7B4F]/40 text-[#6b4423] hover:border-[#6b4423]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
                    {formError}
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-5 py-4 border-t border-[#9A7B4F]/20 flex-shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || uploading}
                  className="flex-1 py-2.5 rounded-xl border border-[#9A7B4F]/40 text-[#6b4423] text-sm font-semibold hover:bg-[#faf6ee] transition disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || uploading}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition hover:brightness-110 disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      {editing ? "Save Changes" : "Create Trophy"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete flow modal — two steps */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={cancelDelete}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {!passcodeStep ? (
              <>
                <div className="flex items-center justify-center mb-3">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 size={24} className="text-red-600" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#2E1503] text-center mb-1">
                  Delete this trophy?
                </h3>
                <p className="text-sm text-[#6b4423] text-center mb-5">
                  <strong>{confirmDelete.title}</strong> will be permanently
                  removed from this candidate&apos;s profile.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 py-2.5 rounded-xl border border-[#9A7B4F]/40 text-[#6b4423] text-sm font-semibold hover:bg-[#faf6ee] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={goToPasscodeStep}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
                  >
                    Yes, continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mb-3">
                  <div className="w-14 h-14 rounded-full bg-[#faf6ee] border border-[#9A7B4F]/30 flex items-center justify-center">
                    <Lock size={24} className="text-[#6b4423]" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#2E1503] text-center mb-1">
                  Enter admin passcode
                </h3>
                <p className="text-sm text-[#6b4423] text-center mb-4">
                  Type the admin passcode to confirm deletion of{" "}
                  <strong>{confirmDelete.title}</strong>.
                </p>

                <div className="relative mb-2">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7B4F] pointer-events-none"
                  />
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (passcodeError) setPasscodeError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") verifyAndDelete();
                    }}
                    autoFocus
                    disabled={deleting}
                    placeholder="Enter passcode"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] placeholder:text-[#6b4423]/40"
                  />
                </div>

                {passcodeError && (
                  <div className="flex items-start gap-2 mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle
                      size={14}
                      className="text-red-500 flex-shrink-0 mt-0.5"
                    />
                    <span className="text-[11px] text-red-700">
                      {passcodeError}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={cancelDelete}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl border border-[#9A7B4F]/40 text-[#6b4423] text-sm font-semibold hover:bg-[#faf6ee] transition disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyAndDelete}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Deleting…
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}