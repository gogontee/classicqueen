"use client";

import { useState, useRef } from "react";
import { X, Camera, Loader2, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function EditProfileModal({ isOpen, onClose, profile, onUpdated }) {
  const supabase = createClient();
  const fileInputRef = useRef(null);

  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const initials =
    (firstName?.[0] ?? "").toUpperCase() +
    (lastName?.[0] ?? "").toUpperCase();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError("");
    setSuccess(false);

    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required.");
      return;
    }

    setLoading(true);
    try {
      let avatar_url = profile?.avatar_url ?? null;

      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const path = `${profile.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, photoFile, {
            upsert: true,
            contentType: photoFile.type,
          });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);
        avatar_url = urlData?.publicUrl ?? avatar_url;
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setSuccess(true);
      if (onUpdated) await onUpdated();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const previewSrc = photoPreview || profile?.avatar_url || null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-[3px]"
        style={{
          background:
            "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#9A7B4F]/20">
            <h2 className="text-base font-bold text-[#2E1503]">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-[#faf6ee] text-[#6b4423]"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {/* Avatar */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#9A7B4F] group"
              >
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#faf6ee] flex items-center justify-center text-[#9A7B4F] font-bold text-xl">
                    {initials || "?"}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Camera size={22} color="white" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/35 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/35 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423]"
                />
              </div>
            </div>

            {/* Email readonly */}
            <div>
              <label className="block text-xs font-medium text-[#6b4423] mb-1 ml-1">
                Email (cannot be changed)
              </label>
              <input
                type="email"
                value={profile?.email ?? ""}
                readOnly
                className="w-full px-3.5 py-2.5 bg-[#faf6ee]/60 border border-[#9A7B4F]/20 rounded-xl text-sm text-[#6b4423]/60 outline-none cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#9A7B4F]/40 text-[#6b4423] text-sm font-semibold hover:bg-[#faf6ee] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  loading ? "opacity-70 cursor-not-allowed" : "hover:brightness-110"
                }`}
                style={{
                  background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving…
                  </>
                ) : success ? (
                  <>
                    <Check size={14} /> Saved
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}