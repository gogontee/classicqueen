"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff, Check, Sparkles, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

      if (signInError) throw signInError;
      if (!authData.user) throw new Error("No user returned from sign in.");

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("role, is_active")
        .eq("id", authData.user.id)
        .single();

      if (userError) {
        await supabase.auth.signOut();
        throw new Error("Account profile not found. Please contact support.");
      }

      if (userRow && userRow.is_active === false) {
        await supabase.auth.signOut();
        throw new Error("Your account has been deactivated. Contact support.");
      }

      router.push("/auth/dashboard");
      router.refresh();
    } catch (err) {
      const msg = err?.message || "Something went wrong.";
      if (msg.toLowerCase().includes("invalid login credentials")) {
        setError("Incorrect email or password.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const floatingCrowns = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: (i * 13) % 90 + 5,
    y: (i * 17) % 90 + 5,
    size: (i % 3) * 8 + 12,
    duration: (i % 5) * 2 + 12,
    delay: (i % 4) * 0.4,
  }));

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(250, 246, 238, 0.7)",
    border: "1px solid rgba(154, 123, 79, 0.35)",
    borderRadius: "12px",
    fontSize: "14px",
    color: "#2E1503",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 500,
    color: "#6b4423",
    marginBottom: "4px",
    marginLeft: "4px",
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2E1503 0%, #faf6ee 50%, #362511 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {floatingCrowns.map((crown) => (
        <motion.div
          key={crown.id}
          style={{
            position: "absolute",
            pointerEvents: "none",
            color: "rgba(201, 162, 39, 0.25)",
          }}
          initial={{
            x: `${crown.x}vw`,
            y: `${crown.y}vh`,
            scale: 0,
            opacity: 0.3,
          }}
          animate={{
            y: [`${crown.y}vh`, `${crown.y - 20}vh`, `${crown.y}vh`],
            x: [`${crown.x}vw`, `${crown.x + 10}vw`, `${crown.x}vw`],
            rotate: [0, 180, 360],
            scale: [0, 1, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: crown.duration,
            delay: crown.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Sparkles size={crown.size} fill="currentColor" />
        </motion.div>
      ))}

      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
        animate={{
          background: [
            "radial-gradient(circle at 30% 50%, rgba(201,162,39,0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 50%, rgba(201,162,39,0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 50%, rgba(201,162,39,0.08) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: "400px", position: "relative", zIndex: 1 }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          style={{
            position: "relative",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
            overflow: "hidden",
            border: "1px solid rgba(154, 123, 79, 0.35)",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              borderRadius: "24px",
            }}
            animate={{
              boxShadow: [
                "0 0 20px rgba(154, 123, 79, 0.3), inset 0 0 20px rgba(154, 123, 79, 0.1)",
                "0 0 40px rgba(201, 162, 39, 0.5), inset 0 0 30px rgba(201, 162, 39, 0.2)",
                "0 0 20px rgba(154, 123, 79, 0.3), inset 0 0 20px rgba(154, 123, 79, 0.1)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <div
            style={{
              position: "relative",
              background: "linear-gradient(90deg, #2E1503 0%, #362511 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 0",
            }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ position: "relative" }}
            >
              <div style={{ position: "relative", width: "100px", height: "100px" }}>
                <Image
                  src="/cqi.png"
                  alt="Classic Queen International"
                  fill
                  style={{ objectFit: "contain", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.4))" }}
                  priority
                />
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: "absolute",
                  bottom: "-16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "#c9a227",
                }}
              >
                <Sparkles size={20} />
              </motion.div>
            </motion.div>
          </div>

          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ textAlign: "center" }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #7a5c14, #c9a227, #f5d76e, #8a6a1a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  margin: 0,
                }}
              >
                Welcome Back
              </h2>
              <p style={{ fontSize: "12px", color: "#6b4423", marginTop: "4px" }}>
                Sign in to your Classic Queen account
              </p>
            </motion.div>

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Email */}
              <div>
                <label style={labelStyle}>
                  Email Address <span style={{ color: "#9A7B4F" }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  style={inputStyle}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>
                  Password <span style={{ color: "#9A7B4F" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    style={{ ...inputStyle, paddingRight: "40px" }}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      right: "12px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#6b4423",
                      display: "flex",
                      alignItems: "center",
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <label
                  htmlFor="remember"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ position: "absolute", opacity: 0, width: "16px", height: "16px" }}
                  />
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      flexShrink: 0,
                      border: "2px solid",
                      borderColor: rememberMe ? "#6b4423" : "rgba(154,123,79,0.5)",
                      background: rememberMe ? "#6b4423" : "transparent",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    {rememberMe && <Check size={10} style={{ color: "white" }} />}
                  </div>
                  <span style={{ fontSize: "11px", color: "#6b4423" }}>Remember me</span>
                </label>

                <Link
                  href="/auth/forgot-password"
                  style={{ fontSize: "11px", color: "#6b4423", fontWeight: 600 }}
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div
                  style={{
                    padding: "10px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "12px",
                    color: "#dc2626",
                    fontSize: "11px",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  fontWeight: 600,
                  color: "white",
                  fontSize: "14px",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: loading
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid white",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                      }}
                    />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </motion.button>

              <p style={{ fontSize: "11px", color: "#6b4423", textAlign: "center", margin: 0 }}>
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" style={{ color: "#6b4423", fontWeight: 600 }}>
                  Create Account
                </Link>
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  color: "#9A7B4F",
                }}
              >
                <Shield size={12} />
                <span style={{ fontSize: "8px" }}>Secure • Encrypted</span>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}