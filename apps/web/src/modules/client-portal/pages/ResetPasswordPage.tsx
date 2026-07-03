import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Shield, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { PortalApiClient } from "../api/portal.api";
import { toast } from "sonner";

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing password reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters long.");
    }

    setLoading(true);
    try {
      await PortalApiClient.resetPassword({ token, password });
      setSubmitted(true);
      toast.success("Password updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md space-y-8 bg-surface-900 border border-white/[0.06] p-8 rounded-3xl shadow-xl shadow-surface-950">
        
        {/* Branding header */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Set New Password</h1>
            <p className="text-sm text-surface-400 mt-1.5">Create a strong, new password to access your client portal account.</p>
          </div>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto h-14 w-14 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="text-sm text-surface-300 leading-relaxed">
              Your password has been reset successfully. You can now log in with your new credentials.
            </p>
            <Link
              to="/portal/login"
              className="inline-flex items-center gap-2 text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl transition-all"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-surface-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-surface-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/10 transition-all cursor-pointer flex justify-center items-center disabled:opacity-50 mt-2"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default ResetPasswordPage;
