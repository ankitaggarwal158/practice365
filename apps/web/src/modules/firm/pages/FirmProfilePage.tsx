import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFirm } from "../hooks/useFirm";
import { useUpdateFirm } from "../hooks/useUpdateFirm";
import { useCurrentUserPermissions } from "@/modules/roles";

export function FirmProfilePage() {
  const { firm, isLoading: isFirmLoading, error: firmError, refetch } = useFirm();
  const { updateFirm, isLoading: isUpdating, error: updateError } = useUpdateFirm();
  const { hasPermission, isLoading: isAuthLoading } = useCurrentUserPermissions();

  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (firm) {
      setName(firm.name || "");
      setLegalName(firm.legalName || "");
      setDisplayName(firm.displayName || "");
      setWebsite(firm.website || "");
      setEmail(firm.email || "");
      setPhone(firm.phone || "");
      setAddressLine1(firm.addressLine1 || "");
      setAddressLine2(firm.addressLine2 || "");
      setCity(firm.city || "");
      setState(firm.state || "");
      setPostalCode(firm.postalCode || "");
      setCountry(firm.country || "United States");
    }
  }, [firm]);

  const canUpdate = hasPermission("FIRM_UPDATE");
  const isLoading = isFirmLoading || isAuthLoading;
  const isDisabled = !canUpdate || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setValidationError("Firm Name is required.");
      return;
    }
    if (!legalName.trim()) {
      setValidationError("Registered Legal Name is required.");
      return;
    }
    if (!displayName.trim()) {
      setValidationError("Display Name is required.");
      return;
    }

    try {
      await updateFirm({
        name,
        legalName,
        displayName,
        website,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
      });
      setSuccessMessage("Firm profile updated successfully.");
      refetch();
    } catch (err: any) {
      setValidationError(err.message || "Failed to update firm details.");
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Firm Profile</h1>
          <p className="text-sm text-surface-200/50">
            Manage your firm's contact info, address details, and public profile settings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/firm/settings"
            className="rounded-xl border border-white/[0.08] bg-surface-900/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.03] transition-all duration-200"
          >
            Regional Settings
          </Link>
          <Link
            to="/firm/branding"
            className="rounded-xl border border-white/[0.08] bg-surface-900/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.03] transition-all duration-200"
          >
            Firm Branding
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
        </div>
      ) : (
        <div className="max-w-4xl rounded-2xl border border-white/[0.06] bg-surface-900/20 backdrop-blur-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!canUpdate && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-300">
                You are in read-only mode. Requires the FIRM_UPDATE permission to modify profile parameters.
              </div>
            )}

            {(validationError || updateError || firmError) && (
              <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
                {validationError || updateError || firmError}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-success/20 bg-success/5 p-4 text-sm text-success">
                {successMessage}
              </div>
            )}

            {/* General Info Grid */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-300">General Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-white">
                    Firm Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="legalName" className="block text-sm font-semibold text-white">
                    Registered Legal Name *
                  </label>
                  <input
                    type="text"
                    id="legalName"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="displayName" className="block text-sm font-semibold text-white">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="website" className="block text-sm font-semibold text-white">
                    Website URL
                  </label>
                  <input
                    type="text"
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-white">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-semibold text-white">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <hr className="border-white/[0.06]" />

            {/* Address Grid */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-300">Office Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="addressLine1" className="block text-sm font-semibold text-white">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="addressLine2" className="block text-sm font-semibold text-white">
                    Unit, Suite, or Building Info
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="city" className="block text-sm font-semibold text-white">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="state" className="block text-sm font-semibold text-white">
                    State / Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="postalCode" className="block text-sm font-semibold text-white">
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="country" className="block text-sm font-semibold text-white">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={isDisabled}
                    className="block w-full rounded-xl border border-white/[0.08] bg-surface-900/40 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-200/30 focus:border-brand-400/50 focus:outline-none focus:ring-4 focus:ring-brand-400/10 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {canUpdate && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-brand-500/20 flex items-center justify-center min-w-[120px]"
                >
                  {isUpdating ? (
                    <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default FirmProfilePage;
