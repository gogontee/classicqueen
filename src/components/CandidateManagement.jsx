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
  User as UserIcon,
  Upload,
  Image as ImageIcon,
  Lock,
  Film,
  GripVertical,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const STATUSES = ["Pending", "Approved", "Rejected"];

const emptyForm = {
  candidate_code: "",
  full_name: "",
  username: "",
  country: "",
  email: "",
  phone: "",
  whatsapp: "",
  occupation: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  about: "",
  contest_experience: "",
  previous_experience_details: "",
  photo: "",
  mobile_hero: "",
  desktop_hero: "",
  video: "",
  gallery: [],
  status: "Pending",
  vote_count: 0,
};

export default function CandidateManagement() {
  const supabase = createClient();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
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

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: qErr } = await supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false });

    if (qErr) setError(qErr.message);
    else setCandidates(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (candidate) => {
    setEditing(candidate);

    // Normalize video value — DB may hold a string or { url } object
    let videoUrl = "";
    if (candidate.video) {
      if (typeof candidate.video === "string") videoUrl = candidate.video;
      else if (candidate.video.url) videoUrl = candidate.video.url;
    }

    // Normalize gallery — ensure each item has a stable order value
    const gallery = Array.isArray(candidate.gallery)
      ? [...candidate.gallery].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [];

    setForm({
      candidate_code: candidate.candidate_code ?? "",
      full_name: candidate.full_name ?? "",
      username: candidate.username ?? "",
      country: candidate.country ?? "",
      email: candidate.email ?? "",
      phone: candidate.phone ?? "",
      whatsapp: candidate.whatsapp ?? "",
      occupation: candidate.occupation ?? "",
      instagram: candidate.instagram ?? "",
      facebook: candidate.facebook ?? "",
      tiktok: candidate.tiktok ?? "",
      about: candidate.about ?? "",
      contest_experience: candidate.contest_experience ?? "",
      previous_experience_details: candidate.previous_experience_details ?? "",
      photo: candidate.photo ?? "",
      mobile_hero: candidate.mobile_hero ?? "",
      desktop_hero: candidate.desktop_hero ?? "",
      video: videoUrl,
      gallery,
      status: candidate.status ?? "Pending",
      vote_count: candidate.vote_count ?? 0,
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setFormError("");

    if (!form.full_name.trim()) return setFormError("Full name is required.");
    if (!form.country.trim()) return setFormError("Country is required.");
    if (!form.email.trim()) return setFormError("Email is required.");
    if (!form.username.trim()) return setFormError("Username is required.");

    // Pack video back into { url } format for consistency with how the
    // detail page's pickVideo() helper expects it
    const videoPayload = form.video.trim()
      ? { url: form.video.trim() }
      : null;

    // Normalize gallery — clean empty entries, re-sort order
    const cleanGallery = (form.gallery || [])
      .filter((g) => g && g.url && g.url.trim())
      .map((g, i) => ({
        ...g,
        url: g.url.trim(),
        order: i,
      }));

    const payload = {
      candidate_code: form.candidate_code.trim() || null,
      full_name: form.full_name.trim(),
      username: form.username.trim().toLowerCase().replace(/\s+/g, "-"),
      country: form.country.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      occupation: form.occupation.trim() || null,
      instagram: form.instagram.trim() || null,
      facebook: form.facebook.trim() || null,
      tiktok: form.tiktok.trim() || null,
      about: form.about.trim() || null,
      contest_experience: form.contest_experience.trim() || null,
      previous_experience_details:
        form.previous_experience_details.trim() || null,
      photo: form.photo.trim() || null,
      mobile_hero: form.mobile_hero.trim() || null,
      desktop_hero: form.desktop_hero.trim() || null,
      video: videoPayload,
      gallery: cleanGallery.length > 0 ? cleanGallery : null,
      status: form.status,
      vote_count: parseInt(form.vote_count, 10) || 0,
    };

    setSaving(true);
    try {
      if (editing) {
        const { error: upErr } = await supabase
          .from("candidates")
          .update(payload)
          .eq("id", editing.id);
        if (upErr) throw upErr;
      } else {
        const { error: insErr } = await supabase
          .from("candidates")
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
  const askDelete = (candidate) => {
    setConfirmDelete(candidate);
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
        .from("candidates")
        .delete()
        .eq("id", target.id);

      if (delErr) throw delErr;

      setCandidates((prev) => prev.filter((c) => c.id !== target.id));
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

  const filtered = candidates.filter((c) => {
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.username?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.country?.toLowerCase().includes(q) ||
      c.candidate_code?.toLowerCase().includes(q)
    );
  });

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
            placeholder="Search by name, username, email, country…"
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423]"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-9 py-2.5 bg-white border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] cursor-pointer"
          >
            <option value="All">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
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
          Add Candidate
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
            Loading candidates…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-[#6b4423]/70 text-sm">
            {candidates.length === 0
              ? "No candidates yet. Add the first one."
              : "No candidates match your filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#faf6ee] border-b border-[#9A7B4F]/20">
                <tr className="text-left text-[#6b4423]">
                  <th className="px-4 py-3 font-semibold">Candidate</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">
                    Country
                  </th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">
                    Email
                  </th>
                  <th className="px-4 py-3 font-semibold">Votes</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[#9A7B4F]/10 last:border-0 hover:bg-[#faf6ee]/50 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative rounded-full overflow-hidden bg-[#faf6ee] flex-shrink-0"
                          style={{ width: "40px", height: "40px" }}
                        >
                          {c.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.photo}
                              alt={c.full_name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserIcon size={18} color="#9A7B4F" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#2E1503] truncate">
                            {c.full_name}
                          </p>
                          <p className="text-xs text-[#9A7B4F] truncate">
                            @{c.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-[#6b4423]">
                      {c.country}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[#6b4423]">
                      <span className="truncate block max-w-[200px]">
                        {c.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#2E1503] tabular-nums">
                        {c.vote_count ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                        style={{
                          background:
                            c.status === "Approved"
                              ? "#d1fae5"
                              : c.status === "Rejected"
                              ? "#fee2e2"
                              : "#fef3c7",
                          color:
                            c.status === "Approved"
                              ? "#065f46"
                              : c.status === "Rejected"
                              ? "#991b1b"
                              : "#92400e",
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-2 rounded-lg text-[#6b4423] hover:bg-[#faf6ee] transition"
                          aria-label="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => askDelete(c)}
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

      {/* Edit / Create Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
          style={{
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl rounded-2xl p-[3px] my-auto"
            style={{
              background:
                "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl bg-white overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#9A7B4F]/20 flex-shrink-0">
                <h2 className="text-base font-bold text-[#2E1503]">
                  {editing ? "Edit Candidate" : "Add Candidate"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 rounded-full hover:bg-[#faf6ee] text-[#6b4423]"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Full Name *"
                    value={form.full_name}
                    onChange={(v) => handleChange("full_name", v)}
                    placeholder="Melisa Agida"
                  />
                  <Field
                    label="Username * (URL slug)"
                    value={form.username}
                    onChange={(v) => handleChange("username", v)}
                    placeholder="nigeria"
                  />
                  <Field
                    label="Country *"
                    value={form.country}
                    onChange={(v) => handleChange("country", v)}
                    placeholder="Nigeria"
                  />
                  <Field
                    label="Email *"
                    type="email"
                    value={form.email}
                    onChange={(v) => handleChange("email", v)}
                    placeholder="melisa@example.com"
                  />
                  <Field
                    label="Phone"
                    value={form.phone}
                    onChange={(v) => handleChange("phone", v)}
                    placeholder="+234..."
                  />
                  <Field
                    label="WhatsApp"
                    value={form.whatsapp}
                    onChange={(v) => handleChange("whatsapp", v)}
                    placeholder="+234..."
                  />
                  <Field
                    label="Occupation"
                    value={form.occupation}
                    onChange={(v) => handleChange("occupation", v)}
                  />
                  <Field
                    label="Candidate Code"
                    value={form.candidate_code}
                    onChange={(v) => handleChange("candidate_code", v)}
                    placeholder="CAND_..."
                  />
                  <Field
                    label="Instagram"
                    value={form.instagram}
                    onChange={(v) => handleChange("instagram", v)}
                    placeholder="@handle"
                  />
                  <Field
                    label="Facebook"
                    value={form.facebook}
                    onChange={(v) => handleChange("facebook", v)}
                  />
                  <Field
                    label="TikTok"
                    value={form.tiktok}
                    onChange={(v) => handleChange("tiktok", v)}
                  />
                  <Field
                    label="Vote Count"
                    type="number"
                    value={form.vote_count}
                    onChange={(v) => handleChange("vote_count", v)}
                  />

                  {/* Profile photo */}
                  <div className="sm:col-span-2">
                    <ImageUpload
                      label="Profile Photo"
                      value={form.photo}
                      onChange={(url) => handleChange("photo", url)}
                      folder="candidates/photos"
                      supabase={supabase}
                      allowDelete
                    />
                  </div>

                  {/* Mobile hero */}
                  <div className="sm:col-span-2">
                    <ImageUpload
                      label="Mobile Hero"
                      value={form.mobile_hero}
                      onChange={(url) => handleChange("mobile_hero", url)}
                      folder="candidates/heroes"
                      supabase={supabase}
                      allowDelete
                    />
                  </div>

                  {/* Desktop hero */}
                  <div className="sm:col-span-2">
                    <ImageUpload
                      label="Desktop Hero"
                      value={form.desktop_hero}
                      onChange={(url) => handleChange("desktop_hero", url)}
                      folder="candidates/heroes"
                      supabase={supabase}
                      allowDelete
                    />
                  </div>

                  {/* Video URL */}
                  <div className="sm:col-span-2">
                    <VideoUrlField
                      label="Video URL (YouTube or direct .mp4)"
                      value={form.video}
                      onChange={(v) => handleChange("video", v)}
                    />
                  </div>

                  {/* Gallery manager */}
                  <div className="sm:col-span-2">
                    <GalleryManager
                      gallery={form.gallery}
                      onChange={(gallery) => handleChange("gallery", gallery)}
                      supabase={supabase}
                      candidateName={form.full_name || form.username}
                    />
                  </div>

                  {/* Status */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
                      Status
                    </label>
                    <div className="flex gap-2">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleChange("status", s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
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

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
                      About
                    </label>
                    <textarea
                      value={form.about}
                      onChange={(e) => handleChange("about", e.target.value)}
                      rows={4}
                      className="w-full px-3.5 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
                      Contest Experience
                    </label>
                    <textarea
                      value={form.contest_experience}
                      onChange={(e) =>
                        handleChange("contest_experience", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] resize-none"
                    />
                  </div>
                </div>

                {formError && (
                  <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
                    {formError}
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-5 py-4 border-t border-[#9A7B4F]/20 flex-shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl border border-[#9A7B4F]/40 text-[#6b4423] text-sm font-semibold hover:bg-[#faf6ee] transition disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
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
                      {editing ? "Save Changes" : "Create Candidate"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete flow modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
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
                  Are you sure you want to delete this candidate?
                </h3>
                <p className="text-sm text-[#6b4423] text-center mb-5">
                  You are about to permanently remove{" "}
                  <strong>{confirmDelete.full_name}</strong> and all their
                  votes. This cannot be undone.
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
                  <strong>{confirmDelete.full_name}</strong>.
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

/* ---------------- Field ---------------- */

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] placeholder:text-[#6b4423]/40"
      />
    </div>
  );
}

/* ---------------- Video URL Field ---------------- */

function VideoUrlField({ label, value, onChange }) {
  // Detect YouTube
  const youtubeId = (() => {
    if (!value) return null;
    const patterns = [
      /youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{6,})/,
      /youtu\.be\/([A-Za-z0-9_-]{6,})/,
      /youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{6,})/,
      /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
    ];
    for (const p of patterns) {
      const m = value.match(p);
      if (m) return m[1];
    }
    return null;
  })();

  return (
    <div>
      <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
        {label}
      </label>
      <div className="relative">
        <Film
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7B4F] pointer-events-none"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://youtube.com/watch?v=… or https://…/video.mp4"
          className="w-full pl-9 pr-9 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] placeholder:text-[#6b4423]/40"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-[#9A7B4F]/15 text-[#6b4423] transition"
            title="Clear video"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {youtubeId && (
        <p className="text-[11px] text-[#6b4423]/70 mt-1 ml-1 flex items-center gap-1">
          <Film size={11} /> YouTube video detected · ID: {youtubeId}
        </p>
      )}

      {value && !youtubeId && (
        <p className="text-[11px] text-[#6b4423]/70 mt-1 ml-1 flex items-center gap-1">
          <Film size={11} /> Direct video file
        </p>
      )}
    </div>
  );
}

/* ---------------- Image Upload ---------------- */

function ImageUpload({
  label,
  value,
  onChange,
  folder = "misc",
  supabase,
  allowDelete = false,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    setPreviewError(false);
  }, [value]);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      const path = `${folder}/${Date.now()}-${Math.random()
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

      onChange(publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError(err.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
        {label}
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or upload a file"
          className="flex-1 px-3.5 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] placeholder:text-[#6b4423]/40"
        />
        <button
          type="button"
          onClick={handlePickFile}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-3.5 rounded-xl text-white text-xs font-semibold transition hover:brightness-110 disabled:opacity-60 flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
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
        <p className="text-[11px] text-red-600 mt-1 ml-1">{uploadError}</p>
      )}

      {value && !previewError && (
        <div className="mt-2 relative">
          <div
            className="rounded-lg overflow-hidden border border-[#9A7B4F]/20 bg-[#faf6ee] flex items-center justify-center"
            style={{ height: "140px" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              onError={() => setPreviewError(true)}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {allowDelete && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white transition"
              title="Remove image"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      {previewError && value && (
        <p className="text-[11px] text-amber-600 mt-1 ml-1 flex items-center gap-1">
          <ImageIcon size={11} /> Preview unavailable — the URL may be broken.
        </p>
      )}
    </div>
  );
}

/* ---------------- Gallery Manager ---------------- */

function GalleryManager({ gallery, onChange, supabase, candidateName }) {
  const items = Array.isArray(gallery) ? gallery : [];
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [urlInput, setUrlInput] = useState("");

  const addItem = (url, extra = {}) => {
    const next = [
      ...items,
      {
        url,
        order: items.length,
        ...extra,
      },
    ];
    onChange(next);
  };

  const removeAt = (index) => {
    const next = items
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, order: i }));
    onChange(next);
  };

  const moveUp = (index) => {
    if (index <= 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next.map((item, i) => ({ ...item, order: i })));
  };

  const moveDown = (index) => {
    if (index >= items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next.map((item, i) => ({ ...item, order: i })));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      const path = `candidates/gallery/${Date.now()}-${Math.random()
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

      addItem(publicUrl, { name: file.name });
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError(err.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    addItem(url);
    setUrlInput("");
  };

  return (
    <div>
      <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
        Gallery ({items.length} {items.length === 1 ? "image" : "images"})
      </label>

      {/* Toolbar: upload + paste URL */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-semibold transition hover:brightness-110 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
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
              Upload image
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

        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="…or paste an image URL"
            className="flex-1 px-3.5 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423] placeholder:text-[#6b4423]/40"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
            className="px-3 py-2.5 rounded-xl border border-[#9A7B4F]/40 text-[#6b4423] text-xs font-semibold hover:bg-[#faf6ee] transition disabled:opacity-50 flex-shrink-0"
          >
            Add
          </button>
        </div>
      </div>

      {uploadError && (
        <p className="text-[11px] text-red-600 mb-2 ml-1">{uploadError}</p>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#9A7B4F]/30 bg-[#faf6ee]/50 p-6 text-center text-xs text-[#6b4423]/60">
          No gallery images. Upload or paste a URL above.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item, index) => (
            <GalleryTile
              key={`${item.url}-${index}`}
              item={item}
              index={index}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              onRemove={() => removeAt(index)}
              onMoveUp={() => moveUp(index)}
              onMoveDown={() => moveDown(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryTile({ item, index, isFirst, isLast, onRemove, onMoveUp, onMoveDown }) {
  const [previewError, setPreviewError] = useState(false);

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#9A7B4F]/30 bg-[#faf6ee] group">
      <div className="relative w-full aspect-square bg-black">
        {!previewError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={`Gallery ${index + 1}`}
            onError={() => setPreviewError(true)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-white/50 p-2 text-center">
            Preview unavailable
          </div>
        )}
      </div>

      {/* Order badge */}
      <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        {index + 1}
      </div>

      {/* Move up/down */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {!isFirst && (
          <button
            type="button"
            onClick={onMoveUp}
            className="w-7 h-7 rounded-full bg-black/70 hover:bg-[#6b4423] text-white flex items-center justify-center text-[11px] transition"
            title="Move up"
          >
            ↑
          </button>
        )}
        {!isLast && (
          <button
            type="button"
            onClick={onMoveDown}
            className="w-7 h-7 rounded-full bg-black/70 hover:bg-[#6b4423] text-white flex items-center justify-center text-[11px] transition"
            title="Move down"
          >
            ↓
          </button>
        )}
      </div>

      {/* Remove button — always visible on hover, always visible on mobile */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        title="Remove image"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}