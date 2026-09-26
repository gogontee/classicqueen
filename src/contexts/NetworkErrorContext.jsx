"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOff, X } from "lucide-react";

const NetworkErrorContext = createContext({
  reportNetworkError: () => {},
  clearNetworkError: () => {},
});

export function useNetworkError() {
  return useContext(NetworkErrorContext);
}

/* Shared helper — usable from anywhere, no context required */
export function isNetworkError(err) {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();

  if (err.name === "TypeError" && msg.includes("fetch")) return true;
  if (err.name === "AbortError") return true;
  if (err.name === "NetworkError") return true;

  const patterns = [
    "failed to fetch",
    "networkerror",
    "network request failed",
    "network error",
    "load failed",
    "err_name_not_resolved",
    "err_internet_disconnected",
    "err_connection_refused",
    "err_connection_timed_out",
    "err_network_changed",
    "offline",
    "timeout",
    "timed out",
    "econnrefused",
    "enotfound",
  ];

  return patterns.some((p) => msg.includes(p));
}

export function NetworkErrorProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const reportNetworkError = useCallback(() => {
    setOpen(true);
  }, []);

  const clearNetworkError = useCallback(() => {
    setOpen(false);
  }, []);

  // Auto-open on browser offline, auto-close on reconnect
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOpen(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setOpen(true);
    };

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Global safety net: any unhandled rejection that looks like a
  // network failure also triggers the popup.
  useEffect(() => {
    const onUnhandled = (event) => {
      const reason = event?.reason;
      if (isNetworkError(reason)) {
        setOpen(true);
      }
    };
    window.addEventListener("unhandledrejection", onUnhandled);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandled);
    };
  }, []);

  return (
    <NetworkErrorContext.Provider value={{ reportNetworkError, clearNetworkError }}>
      {children}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{
              background: "rgba(20, 10, 2, 0.7)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "320px",
                borderRadius: "16px",
                padding: "3px",
                background:
                  "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  borderRadius: "13px",
                  background: "rgba(255, 255, 255, 0.98)",
                  padding: "22px 20px 18px",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    width: "26px",
                    height: "26px",
                    borderRadius: "9999px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6b4423",
                  }}
                >
                  <X size={14} />
                </button>

                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    margin: "0 auto 14px",
                    borderRadius: "9999px",
                    padding: "2px",
                    background:
                      "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "9999px",
                      background: "#1a0d02",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <WifiOff size={26} style={{ color: "#f5d76e" }} />
                  </div>
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #7a5c14, #c9a227, #f5d76e, #8a6a1a)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  No Network Connection
                </h3>

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "12px",
                    color: "#6b4423",
                    lineHeight: 1.5,
                  }}
                >
                  We couldn&apos;t reach the server. Please check your internet
                  connection and try again.
                </p>

                <div
                  style={{
                    marginTop: "14px",
                    padding: "6px 12px",
                    borderRadius: "9999px",
                    background: isOnline ? "#dcfce7" : "#fef3c7",
                    color: isOnline ? "#065f46" : "#92400e",
                    fontSize: "10px",
                    fontWeight: 600,
                    display: "inline-block",
                  }}
                >
                  {isOnline ? "You are back online" : "You are offline"}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.onLine) setOpen(false);
                  }}
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    padding: "11px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "white",
                    cursor: "pointer",
                    background:
                      "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
                    boxShadow: "0 6px 14px rgba(107,68,35,0.35)",
                  }}
                >
                  {isOnline ? "Try Again" : "Waiting for Connection…"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </NetworkErrorContext.Provider>
  );
}