"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff, Upload, Check, X, Sparkles, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function SignUp() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    photo: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
    minLength: false,
  });

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      score: password.length > 0 ? Math.min(4, Math.floor(password.length / 2)) : 0,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      minLength: password.length >= 6,
    });
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setForm({ ...form, password });
    checkPasswordStrength(password);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setForm({ ...form, photo: null });
    setPhotoPreview(null);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.firstName || !form.lastName || !form.email) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!acceptedTerms) {
      setError("You must accept the Terms of Participation to continue.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { hasLower, hasUpper, hasNumber, minLength } = passwordStrength;
    if (!minLength || !hasLower || !hasUpper || !hasNumber) {
      setError("Password must be at least 6 characters and contain uppercase, lowercase, and number.");
      return;
    }

    setLoading(true);

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!authData?.user?.id) {
      setError("Could not get user after sign up.");
      setLoading(false);
      return;
    }

    const userId = authData.user.id;
    let avatar_url = null;

    if (form.photo) {
      const fileExt = form.photo.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, form.photo, {
          upsert: true,
          contentType: form.photo.type,
        });

      if (uploadError) {
        console.error("Photo upload error:", uploadError.message);
        setError("Failed to upload profile photo.");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      avatar_url = urlData?.publicUrl;
    }

    const { error: insertError } = await supabase.from("users").insert([
      {
        id: userId,
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        avatar_url,
        role: "user",
        is_active: true,
        is_verified: false,
      },
    ]);

    if (insertError) {
      setError("Account setup failed: " + insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setShowSuccess(true);
  };

  const handleSuccessContinue = () => {
    router.push("/auth/dashboard");
    router.refresh();
  };

  const getStrengthColor = () => {
    const { hasLower, hasUpper, hasNumber, minLength } = passwordStrength;
    const checks = [hasLower, hasUpper, hasNumber, minLength].filter(Boolean).length;
    if (checks <= 2) return "#7a5c14";
    if (checks <= 3) return "#9A7B4F";
    return "#c9a227";
  };

  const getStrengthText = () => {
    const { hasLower, hasUpper, hasNumber, minLength } = passwordStrength;
    const checks = [hasLower, hasUpper, hasNumber, minLength].filter(Boolean).length;
    if (checks <= 2) return "Weak";
    if (checks <= 3) return "Medium";
    return "Strong";
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
              padding: "8px 0",
            }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ position: "relative" }}
            >
              <div style={{ position: "relative", width: "140px", height: "140px" }}>
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
                Create Account
              </h2>
              <p style={{ fontSize: "12px", color: "#6b4423", marginTop: "4px" }}>
                Join Classic Queen International 2026
              </p>
            </motion.div>

            <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* First Name */}
              <div>
                <label style={labelStyle}>
                  First Name <span style={{ color: "#9A7B4F" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your first name"
                  style={inputStyle}
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label style={labelStyle}>
                  Last Name <span style={{ color: "#9A7B4F" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your last name"
                  style={inputStyle}
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>

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
                  required
                />
              </div>

              {/* Profile Picture */}
              <div>
                <label style={labelStyle}>Profile Picture</label>
                {!photoPreview ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: "none" }}
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "10px 14px",
                        background: "linear-gradient(90deg, rgba(154,123,79,0.1) 0%, rgba(201,162,39,0.1) 100%)",
                        border: "2px dashed rgba(154,123,79,0.5)",
                        borderRadius: "12px",
                        color: "#6b4423",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 500,
                        boxSizing: "border-box",
                      }}
                    >
                      <Upload size={16} />
                      <span>Upload Photo</span>
                    </label>
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px",
                      background: "#faf6ee",
                      borderRadius: "12px",
                      border: "1px solid rgba(154,123,79,0.35)",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid #9A7B4F",
                        flexShrink: 0,
                      }}
                    >
                      <Image src={photoPreview} alt="Preview" fill style={{ objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "12px", color: "#2E1503", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {form.photo?.name}
                      </p>
                      <p style={{ fontSize: "10px", color: "#6b4423", margin: 0 }}>
                        {(form.photo?.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removePhoto}
                      style={{
                        padding: "6px",
                        background: "transparent",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                        color: "#6b4423",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>
                  Password <span style={{ color: "#9A7B4F" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    style={{ ...inputStyle, paddingRight: "40px" }}
                    value={form.password}
                    onChange={handlePasswordChange}
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

                {form.password && (
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          flex: 1,
                          height: "4px",
                          background: "rgba(154,123,79,0.2)",
                          borderRadius: "999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${(passwordStrength.score / 4) * 100}%`,
                            height: "100%",
                            background: getStrengthColor(),
                            transition: "width 0.3s",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "10px", color: "#6b4423", fontWeight: 500 }}>
                        {getStrengthText()}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "4px",
                        marginTop: "6px",
                        fontSize: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {passwordStrength.minLength ? (
                          <Check size={10} style={{ color: "#16a34a" }} />
                        ) : (
                          <div style={{ width: "10px", height: "10px", borderRadius: "50%", border: "1px solid rgba(154,123,79,0.5)" }} />
                        )}
                        <span style={{ color: "#6b4423" }}>6+ chars</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {passwordStrength.hasLower ? (
                          <Check size={10} style={{ color: "#16a34a" }} />
                        ) : (
                          <div style={{ width: "10px", height: "10px", borderRadius: "50%", border: "1px solid rgba(154,123,79,0.5)" }} />
                        )}
                        <span style={{ color: "#6b4423" }}>Lowercase</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {passwordStrength.hasUpper ? (
                          <Check size={10} style={{ color: "#16a34a" }} />
                        ) : (
                          <div style={{ width: "10px", height: "10px", borderRadius: "50%", border: "1px solid rgba(154,123,79,0.5)" }} />
                        )}
                        <span style={{ color: "#6b4423" }}>Uppercase</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {passwordStrength.hasNumber ? (
                          <Check size={10} style={{ color: "#16a34a" }} />
                        ) : (
                          <div style={{ width: "10px", height: "10px", borderRadius: "50%", border: "1px solid rgba(154,123,79,0.5)" }} />
                        )}
                        <span style={{ color: "#6b4423" }}>Number</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={labelStyle}>
                  Confirm Password <span style={{ color: "#9A7B4F" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    style={{ ...inputStyle, paddingRight: "40px" }}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirmPassword && (
                  <p
                    style={{
                      fontSize: "10px",
                      marginTop: "4px",
                      marginLeft: "4px",
                      color: form.password === form.confirmPassword ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {form.password === form.confirmPassword
                      ? "✓ Passwords match"
                      : "Passwords do not match"}
                  </p>
                )}
              </div>

              {/* Terms */}
              <label
                htmlFor="terms"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ position: "absolute", opacity: 0, width: "16px", height: "16px" }}
                />
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    flexShrink: 0,
                    marginTop: "2px",
                    border: "2px solid",
                    borderColor: acceptedTerms ? "#6b4423" : "rgba(154,123,79,0.5)",
                    background: acceptedTerms ? "#6b4423" : "transparent",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  {acceptedTerms && <Check size={10} style={{ color: "white" }} />}
                </div>
                <span style={{ fontSize: "11px", color: "#6b4423", lineHeight: 1.3 }}>
                  I agree to the{" "}
                  <Link
                    href="/termsofparticipation"
                    style={{ color: "#6b4423", fontWeight: 600, textDecoration: "underline" }}
                    target="_blank"
                  >
                    Terms of Participation
                  </Link>
                  <span style={{ color: "#9A7B4F" }}> *</span>
                </span>
              </label>

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
                disabled={loading || !acceptedTerms}
                whileHover={{ scale: loading || !acceptedTerms ? 1 : 1.02 }}
                whileTap={{ scale: loading || !acceptedTerms ? 1 : 0.98 }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  fontWeight: 600,
                  color: "white",
                  fontSize: "14px",
                  cursor: loading || !acceptedTerms ? "not-allowed" : "pointer",
                  background:
                    loading || !acceptedTerms
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
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </motion.button>

              <p style={{ fontSize: "11px", color: "#6b4423", textAlign: "center", margin: 0 }}>
                Already have an account?{" "}
                <Link href="/auth/login" style={{ color: "#6b4423", fontWeight: 600 }}>
                  Sign In
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
                <span style={{ fontSize: "8px" }}>Secure · Encrypted</span>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>

      {/* ============ SUCCESS POPUP ============ */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(20, 10, 2, 0.75)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              style={{
                width: "100%",
                maxWidth: "380px",
                borderRadius: "24px",
                padding: "3px",
                background:
                  "conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)",
                boxShadow: "0 30px 60px -12px rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  borderRadius: "21px",
                  background: "rgba(255, 255, 255, 0.98)",
                  padding: "28px 24px",
                  textAlign: "center",
                }}
              >
                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 260 }}
                  style={{
                    width: "72px",
                    height: "72px",
                    margin: "0 auto 16px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
                    boxShadow: "0 10px 25px rgba(107, 68, 35, 0.4)",
                  }}
                >
                  <Check size={36} color="white" strokeWidth={3} />
                </motion.div>

                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    margin: 0,
                    background: "linear-gradient(135deg, #7a5c14, #c9a227, #f5d76e, #8a6a1a)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Account Created!
                </h3>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#6b4423",
                    marginTop: "10px",
                    marginBottom: "22px",
                    lineHeight: 1.5,
                  }}
                >
                  Your account has been successfully created on{" "}
                  <strong style={{ color: "#2E1503" }}>Classic Queen International</strong>.
                  Welcome to the royal court.
                </p>

                <button
                  type="button"
                  onClick={handleSuccessContinue}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  Continue to Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}