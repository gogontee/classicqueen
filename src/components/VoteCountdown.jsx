"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useNetworkError, isNetworkError } from "@/contexts/NetworkErrorContext";

/**
 * VoteCountdown
 *
 * Fetches the current voting window from `classicqueen` and displays a live
 * countdown to the next event:
 *  - Before vote_start → "Opens in …"
 *  - Between start & end → "Closes in …"
 *  - After vote_end → "Voting has closed"
 *  - No window set → renders nothing (unless `showDebug` is true)
 *
 * @param variant    "inline" (default) | "pill" | "dark"
 *                   - "dark": gold-gradient text, tuned for dark backgrounds
 * @param showDebug  boolean — if true, renders diagnostic states instead of null
 */

/**
 * Gold gradient applied as text fill. Requires:
 *  - background-image (not just background)
 *  - -webkit-background-clip: text
 *  - background-clip: text
 *  - color: transparent
 *  - display: inline-block on the element (so the clip box is the text, not the line)
 */
const GOLD_GRADIENT = {
  backgroundImage:
    "linear-gradient(135deg, #f5d76e 0%, #e6b84a 30%, #c9a227 60%, #fff4c2 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  color: "transparent",
  display: "inline-block",
};

export default function VoteCountdown({
  variant = "inline",
  showDebug = false,
}) {
  const supabase = createClient();
  const { reportNetworkError } = useNetworkError();

  const [windowStatus, setWindowStatus] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch the voting window once
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("classicqueen")
          .select("vote_start, vote_end")
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          if (isNetworkError(error)) {
            reportNetworkError();
            setFetchError("network");
          } else {
            console.error("[countdown] fetch error:", error);
            setFetchError(error.message || "fetch_failed");
          }
          return;
        }

        setWindowStatus(computeVotingWindow(data?.vote_start, data?.vote_end));
      } catch (err) {
        if (!cancelled) {
          console.error("[countdown] catch:", err);
          if (isNetworkError(err)) reportNetworkError();
          setFetchError(err?.message || "exception");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, reportNetworkError]);

  // Tick every second while a countdown is active
  useEffect(() => {
    if (!windowStatus) return;
    const state = windowStatus.state;
    if (state !== "not-started" && state !== "open") return;

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [windowStatus]);

  const isDark = variant === "dark";

  const baseClass =
    variant === "pill"
      ? "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c9a227]/50 bg-[#c9a227]/10"
      : "inline-flex items-center gap-2";

  // Label text style — gold gradient on dark, dark brown otherwise
  const labelStyle = isDark
    ? GOLD_GRADIENT
    : { color: "#6b4423", display: "inline-block" };

  // Digit text style — same idea
  const digitStyle = isDark
    ? { ...GOLD_GRADIENT, fontWeight: 700 }
    : { color: "#2E1503", fontWeight: 700, display: "inline-block" };

  // ---- Debug states ----

  if (showDebug && loading) {
    return (
      <div className={baseClass}>
        <Clock size={13} className="text-[#c9a227] animate-spin" />
        <span className="text-xs" style={labelStyle}>
          Loading…
        </span>
      </div>
    );
  }

  if (showDebug && fetchError) {
    return (
      <div className={baseClass}>
        <Lock size={13} className="text-red-500" />
        <span className="text-xs text-red-500">
          Fetch failed: {String(fetchError).slice(0, 30)}
        </span>
      </div>
    );
  }

  if (showDebug && !windowStatus) {
    return (
      <div className={baseClass}>
        <Lock size={13} className="text-red-500" />
        <span className="text-xs text-red-500">No status</span>
      </div>
    );
  }

  // ---- Silent null returns in production ----
  if (loading || !windowStatus) return null;
  if (windowStatus.state === "no-window") {
    if (showDebug) {
      return (
        <div className={baseClass}>
          <Lock
            size={13}
            className={isDark ? "text-[#c9a227]" : "text-[#6b4423]"}
          />
          <span className="text-xs" style={labelStyle}>
            No window set
          </span>
        </div>
      );
    }
    return null;
  }

  // ---- Closed ----
  if (windowStatus.state === "closed") {
    return (
      <div className={baseClass}>
        <Lock
          size={13}
          className={isDark ? "text-[#c9a227]" : "text-[#6b4423]"}
        />
        <span className="text-xs font-semibold" style={labelStyle}>
          Voting has closed
        </span>
      </div>
    );
  }

  // ---- Not started ----
  if (windowStatus.state === "not-started") {
    const remaining = Math.max(
      0,
      new Date(windowStatus.start).getTime() - now
    );
    const parts = splitDuration(remaining);

    return (
      <div className={baseClass}>
        <Calendar size={13} className="text-[#c9a227]" />
        <span className="text-xs" style={labelStyle}>
          Opens in
        </span>
        <CountdownDigits parts={parts} style={digitStyle} />
      </div>
    );
  }

  // ---- Open ----
  const remaining = Math.max(
    0,
    new Date(windowStatus.end).getTime() - now
  );
  const parts = splitDuration(remaining);

  return (
    <div className={baseClass}>
      <Clock size={13} className="text-green-400 animate-pulse" />
      <span className="text-xs" style={labelStyle}>
        Closes in
      </span>
      <CountdownDigits parts={parts} style={digitStyle} />
    </div>
  );
}

/* ---------------- helpers ---------------- */

function computeVotingWindow(voteStart, voteEnd) {
  const now = Date.now();
  const start = voteStart ? new Date(voteStart).getTime() : null;
  const end = voteEnd ? new Date(voteEnd).getTime() : null;

  if (!start && !end) return { state: "no-window" };
  if (start && now < start)
    return { state: "not-started", start: new Date(start) };
  if (end && now >= end) return { state: "closed", end: new Date(end) };
  return { state: "open", end: end ? new Date(end) : null };
}

function splitDuration(ms) {
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, expired: false };
}

function CountdownDigits({ parts, style }) {
  if (parts.expired) {
    return (
      <span className="text-xs" style={style}>
        now
      </span>
    );
  }

  if (parts.days > 0) {
    return (
      <span className="text-xs tabular-nums" style={style}>
        {parts.days}d {pad(parts.hours)}h {pad(parts.minutes)}m{" "}
        {pad(parts.seconds)}s
      </span>
    );
  }

  return (
    <span className="text-xs tabular-nums" style={style}>
      {pad(parts.hours)}h {pad(parts.minutes)}m {pad(parts.seconds)}s
    </span>
  );
}

function pad(n) {
  return String(n).padStart(2, "0");
}