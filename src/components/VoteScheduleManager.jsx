"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Check,
  AlertCircle,
  Calendar,
  Clock,
  Lock,
  Unlock,
  Ban,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

/* Convert an ISO string into a value the <input type="datetime-local"> accepts.
   Format: YYYY-MM-DDTHH:mm */
function toLocalInputValue(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* Convert a datetime-local value ("YYYY-MM-DDTHH:mm") into a full ISO string.
   Returns null for empty input. */
function fromLocalInputValue(value) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

/* Work out the current status based on vote_start / vote_end. */
function getStatus(voteStart, voteEnd) {
  const now = Date.now();
  const start = voteStart ? new Date(voteStart).getTime() : null;
  const end = voteEnd ? new Date(voteEnd).getTime() : null;

  if (!start && !end) return "no-window";
  if (start && now < start) return "not-started";
  if (end && now >= end) return "closed";
  return "open";
}

export default function VoteScheduleManager() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [rowId, setRowId] = useState(null);
  const [voteStart, setVoteStart] = useState("");
  const [voteEnd, setVoteEnd] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: qErr } = await supabase
      .from("classicqueen")
      .select("id, vote_start, vote_end")
      .limit(1)
      .maybeSingle();

    if (qErr) {
      setError(qErr.message);
      setLoading(false);
      return;
    }

    setRowId(data?.id ?? null);
    setVoteStart(toLocalInputValue(data?.vote_start));
    setVoteEnd(toLocalInputValue(data?.vote_end));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setError("");
    setSuccess(false);
    setSaving(true);

    const payload = {
      vote_start: fromLocalInputValue(voteStart),
      vote_end: fromLocalInputValue(voteEnd),
    };

    // Basic sanity check: if both set, start must be before end
    if (payload.vote_start && payload.vote_end) {
      if (
        new Date(payload.vote_start).getTime() >=
        new Date(payload.vote_end).getTime()
      ) {
        setError("Start date must be before end date.");
        setSaving(false);
        return;
      }
    }

    try {
      let result;
      if (rowId != null) {
        result = await supabase
          .from("classicqueen")
          .update(payload)
          .eq("id", rowId);
      } else {
        // No row exists yet — insert one
        result = await supabase.from("classicqueen").insert([payload]);
      }

      if (result.error) throw result.error;

      setSuccess(true);
      await load();
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error("Save failed:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setError("");
    setSuccess(false);
    setVoteStart("");
    setVoteEnd("");
    // Don't auto-save; the admin clicks Save to persist the cleared values
  };

  /* Quick-fill helpers */
  const fillNow = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    setVoteStart(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )}T${pad(now.getHours())}:${pad(now.getMinutes())}`
    );
  };

  const fillInOneHour = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    setVoteStart(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  };

  const fillEnd30Days = () => {
    const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    setVoteEnd(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  };

  /* Current status (based on what's currently saved, not the form fields) */
  const savedStatus = getStatus(
    fromLocalInputValue(voteStart),
    fromLocalInputValue(voteEnd)
  );

  const statusInfo = {
    open: {
      label: "Voting is open",
      color: "#16a34a",
      bg: "#dcfce7",
      icon: Unlock,
    },
    closed: {
      label: "Voting closed",
      color: "#dc2626",
      bg: "#fee2e2",
      icon: Lock,
    },
    "not-started": {
      label: "Voting hasn't started",
      color: "#d97706",
      bg: "#fef3c7",
      icon: Clock,
    },
    "no-window": {
      label: "No window set — voting is treated as closed",
      color: "#6b7280",
      bg: "#f3f4f6",
      icon: Ban,
    },
  }[savedStatus];

  const StatusIcon = statusInfo.icon;

  if (loading) {
    return (
      <div className="p-10 text-center text-[#6b4423] text-sm flex items-center justify-center gap-2">
        <Loader2 size={16} className="animate-spin" />
        Loading vote schedule…
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Status card */}
      <div
        className="rounded-2xl border p-4 mb-6 flex items-center gap-3"
        style={{ background: statusInfo.bg, borderColor: statusInfo.color + "40" }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: statusInfo.color + "20" }}
        >
          <StatusIcon size={20} style={{ color: statusInfo.color }} />
        </div>
        <div>
          <p
            className="text-sm font-bold"
            style={{ color: statusInfo.color, margin: 0 }}
          >
            {statusInfo.label}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: statusInfo.color + "cc", margin: 0 }}
          >
            This is what visitors see right now.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-[#9A7B4F]/20 p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-[#2E1503]">
            Voting Schedule
          </h2>
          <p className="text-xs text-[#6b4423]/70 mt-1">
            Controls when visitors can cast votes. Leave either field blank for
            an open-ended schedule.
          </p>
        </div>

        {/* Vote Start */}
        <div>
          <label className="block text-xs font-medium text-[#6b4423] mb-1.5 ml-1">
            Vote opens on
          </label>
          <div className="relative">
            <Calendar
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7B4F] pointer-events-none"
            />
            <input
              type="datetime-local"
              value={voteStart}
              onChange={(e) => setVoteStart(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423]"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={fillNow}
              className="text-[11px] px-2.5 py-1 rounded-md border border-[#9A7B4F]/40 text-[#6b4423] hover:bg-[#faf6ee] transition"
            >
              Now
            </button>
            <button
              type="button"
              onClick={fillInOneHour}
              className="text-[11px] px-2.5 py-1 rounded-md border border-[#9A7B4F]/40 text-[#6b4423] hover:bg-[#faf6ee] transition"
            >
              In 1 hour
            </button>
            <button
              type="button"
              onClick={() => setVoteStart("")}
              className="text-[11px] px-2.5 py-1 rounded-md border border-[#9A7B4F]/40 text-[#6b4423] hover:bg-[#faf6ee] transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Vote End */}
        <div>
          <label className="block text-xs font-medium text-[#6b4423] mb-1.5 ml-1">
            Vote closes on
          </label>
          <div className="relative">
            <Clock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7B4F] pointer-events-none"
            />
            <input
              type="datetime-local"
              value={voteEnd}
              onChange={(e) => setVoteEnd(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-[#faf6ee] border border-[#9A7B4F]/30 rounded-xl text-sm text-[#2E1503] outline-none focus:border-[#6b4423]"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={fillEnd30Days}
              className="text-[11px] px-2.5 py-1 rounded-md border border-[#9A7B4F]/40 text-[#6b4423] hover:bg-[#faf6ee] transition"
            >
              + 30 days
            </button>
            <button
              type="button"
              onClick={() => setVoteEnd("")}
              className="text-[11px] px-2.5 py-1 rounded-md border border-[#9A7B4F]/40 text-[#6b4423] hover:bg-[#faf6ee] transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-[#9A7B4F]/15">
          <button
            type="button"
            onClick={handleClear}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-[#9A7B4F]/40 text-[#6b4423] text-sm font-semibold hover:bg-[#faf6ee] transition disabled:opacity-60"
          >
            Reset fields
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition hover:brightness-110 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
            }}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : success ? (
              <>
                <Check size={14} />
                Saved
              </>
            ) : (
              "Save Schedule"
            )}
          </button>
        </div>

        {/* Helper text */}
        <p className="text-[11px] text-[#6b4423]/60 leading-relaxed">
          <strong>How it works:</strong> If both fields are empty, the vote
          modal shows &quot;Voting Line Closed&quot;. If a start date is in the
          future, it shows &quot;Voting Starts Soon&quot;. Once the start date
          passes, voting is open until the end date. After the end date, the
          modal shows &quot;Voting Line Closed&quot; again.
        </p>
      </div>
    </div>
  );
}