import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { PortalApiClient } from "../api/portal.api";
import { toast } from "sonner";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await PortalApiClient.forgotPassword(email);
      setSubmitted(true);
      toast.success("Password reset request logged!");
    } catch (err: any) {
      toast.error(err.message || "Failed to process request.");
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
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Reset Portal Password</h1>
            <p className="text-sm text-surface-400 mt-1.5">Enter your email address and we'll generate a reset link in the server logs.</p>
          </div>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto h-14 w-14 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="text-sm text-surface-300 leading-relaxed">
              If an account matches **{email}**, a password reset link has been logged in the server console output.
            </p>
            <Link
              to="/portal/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-400 hover:text-brand-300"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-surface-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/10 transition-all cursor-pointer flex justify-center items-center disabled:opacity-50 mt-2"
            >
              {loading ? "Processing..." : "Generate Reset Link"}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/portal/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-surface-400 hover:text-white"
              >
                <ArrowLeft className="h-3 w-3" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
