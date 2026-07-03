import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Mail, Lock, AlertCircle } from "lucide-react";
import { PortalApiClient } from "../api/portal.api";
import { toast } from "sonner";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await PortalApiClient.login({ email, password });
      if (res.success && res.accessToken) {
        localStorage.setItem("portalAccessToken", res.accessToken);
        localStorage.setItem("portalRefreshToken", res.refreshToken);
        localStorage.setItem("portalUser", JSON.stringify(res.user));
        toast.success("Successfully logged in to Client Portal!");
        navigate("/portal");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
      toast.error(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md space-y-8 bg-surface-900 border border-white/[0.06] p-8 rounded-3xl shadow-xl shadow-surface-950">
        
        {/* Header branding */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Client Portal Access</h1>
            <p className="text-sm text-surface-400 mt-1.5">Log in to view legal matters, download documents, and check outstanding invoices.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-surface-400">Password</label>
              <Link to="/portal/forgot-password" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-surface-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-950 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/10 transition-all cursor-pointer flex justify-center items-center disabled:opacity-50 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default LoginPage;
