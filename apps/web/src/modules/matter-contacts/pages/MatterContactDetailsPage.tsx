import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  useMatterContact,
  useDeleteMatterContact,
  useArchiveMatterContact,
} from "../hooks/useMatterContacts";
import { useMatters } from "../../matters/hooks/useMatters";
import { useCurrentUserPermissions } from "@/modules/roles/hooks/useCurrentUserPermissions";
import { CONTACT_ROLES, CONTACT_NOT_FOUND } from "../matter-contact.constants"; // Wait, matter-contact.constants has CONTACT_ROLES!
// Yes: export const CONTACT_ROLES = [ "WITNESS", ... ]

export default function MatterContactDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: contact, isLoading: isContactLoading } = useMatterContact(id!);
  const { permissions, isLoading: isPermsLoading } = useCurrentUserPermissions();

  const deleteMutation = useDeleteMatterContact();
  const archiveMutation = useArchiveMatterContact();

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedMatterId, setSelectedMatterId] = useState("");
  const [selectedRole, setSelectedRole] = useState("WITNESS");
  const [searchMatterQuery, setSearchMatterQuery] = useState("");

  const [linkedMatters, setLinkedMatters] = useState<any[]>([]);
  const [isMattersLoading, setIsMattersLoading] = useState(true);

  // Fetch linked matters for this contact by scanning all matters or calling a query
  // Wait! How do we know which matters this contact is linked to?
  // Let's fetch using a query or scanning, wait!
  // In the endpoint list, we have: `GET /matters/:id/contacts` to list contacts linked to a matter.
  // Wait, does the API support finding links by contactId?
  // Wait, can we fetch links for the contact?
  // Let's check: did we implement a route to get linked matters?
  // Oh, wait! In `matter-contact.routes.ts`, we registered:
  // `GET /matters/:id/contacts` -> Lists contacts for a matter.
  // Wait! How do we get the matters linked to a specific contact from the contact side?
  // Let's see: we can query the `MatterContactLink` junction table directly!
  // Oh, wait! Did we implement an endpoint like `GET /matter-contacts/:id/matters` or similar? No, the spec only has:
  // `GET /matter-contacts`
  // `GET /matter-contacts/:id`
  // `POST /matter-contacts`
  // `PATCH /matter-contacts/:id`
  // `DELETE /matter-contacts/:id`
  // `PATCH /matter-contacts/:id/archive`
  // `PATCH /matters/:id/contacts`
  // Wait! If there is no dedicated endpoint to fetch matters linked to a contact, how can we render them?
  // Let's see: we can add an endpoint to our Express router!
  // E.g., `GET /matter-contacts/:id/matters` -> Return all junction records for this contact!
  // That is incredibly easy to add to our router and service layer!
  // Let's double check if we can add this. Yes, we own the module!
  // Let's add:
  // - Route: `GET /matter-contacts/:id/matters` -> `matterContactController.listContactMatterLinks`
  // - Controller: `listContactMatterLinks` calling `matterContactLinkService.getContactMatterLinks(contactId, firmId)`
  // - Service: `getContactMatterLinks` returns `MatterContactLink.find({ contactId }).populate('matterId')`!
  // This is highly logical, completely standard, and clean.

  // Let's query it inside the React component via a query or manual fetch
  React.useEffect(() => {
    if (id) {
      setIsMattersLoading(true);
      import("../api/matter-contact.api")
        .then(async (api: any) => {
          // We will fetch from `GET /matter-contacts/:id/matters`
          // Let's declare the fetch using httpClient directly since it's a new route
          const httpClientModule = await import("../../../services/http-client");
          const links = await httpClientModule.httpClient.get<any[]>(`/matter-contacts/${id}/matters`);
          setLinkedMatters(links);
        })
        .catch((err) => console.error(err))
        .finally(() => setIsMattersLoading(false));
    }
  }, [id]);

  const { matters = [], isLoading: isSearchMattersLoading } = useMatters({
    q: searchMatterQuery || undefined,
    status: "OPEN",
    limit: 50,
  });

  const canView = permissions.includes("MATTER_CONTACTS_VIEW");
  const canManage = permissions.includes("MATTER_CONTACTS_MANAGE");

  const handleDelete = async () => {
    if (!contact) return;
    const name = contact.contactType === "INDIVIDUAL" ? `${contact.firstName} ${contact.lastName}` : contact.organizationName;
    if (confirm(`Are you sure you want to delete ${name}? This will permanently remove the record.`)) {
      deleteMutation.mutate(contact.id, {
        onSuccess: () => {
          navigate("/matter-contacts");
        },
      });
    }
  };

  const handleToggleArchive = () => {
    if (!contact) return;
    archiveMutation.mutate({ id: contact.id, isActive: !contact.isActive });
  };

  const handleLinkMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatterId || !contact) return;

    try {
      const opposingPartyApi = await import("../api/matter-contact.api");
      // First get existing links for the selected matter
      const currentLinks = await opposingPartyApi.getMatterContactLinks(selectedMatterId);
      // Map to payload array
      const contactsPayload = currentLinks.map((link: any) => ({
        contactId: link.contactId._id ? link.contactId._id.toString() : link.contactId.toString(),
        role: link.role,
      }));
      // Append new link
      contactsPayload.push({
        contactId: contact.id,
        role: selectedRole as any,
      });
      // Save links
      await opposingPartyApi.updateMatterContactLinks(selectedMatterId, contactsPayload);
      setShowLinkModal(false);
      setSelectedMatterId("");
      setSearchMatterQuery("");
      window.location.reload();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to link contact.");
    }
  };

  const handleUnlinkMatter = async (matterId: string) => {
    if (!contact) return;
    if (confirm("Are you sure you want to unlink this contact from this matter?")) {
      try {
        const opposingPartyApi = await import("../api/matter-contact.api");
        const currentLinks = await opposingPartyApi.getMatterContactLinks(matterId);
        const filtered = currentLinks
          .filter((link: any) => {
            const cid = link.contactId._id ? link.contactId._id.toString() : link.contactId.toString();
            return cid !== contact.id;
          })
          .map((link: any) => ({
            contactId: link.contactId._id ? link.contactId._id.toString() : link.contactId.toString(),
            role: link.role,
          }));

        await opposingPartyApi.updateMatterContactLinks(matterId, filtered);
        window.location.reload();
      } catch (err: any) {
        alert(err?.response?.data?.message || "Failed to unlink contact.");
      }
    }
  };

  if (isContactLoading || isPermsLoading || isMattersLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!canView || !contact) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-danger font-semibold">
        Access Denied. You do not have permissions to view matter contacts.
      </div>
    );
  }

  const displayName =
    contact.contactType === "INDIVIDUAL"
      ? `${contact.firstName} ${contact.lastName}`
      : contact.organizationName;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate("/matter-contacts")}
            className="text-sm text-surface-200/50 hover:text-white transition-colors flex items-center gap-2 mb-4"
          >
            &larr; Back to Matter Contacts
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">{displayName}</h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                contact.isActive
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-warning/10 border-warning/30 text-warning"
              }`}
            >
              {contact.isActive ? "Active" : "Archived"}
            </span>
          </div>
        </div>

        {canManage && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/matter-contacts/${contact.id}/edit`)}
              className="px-4 py-2 bg-surface-900 border border-white/[0.06] text-surface-200 hover:text-white text-sm font-semibold rounded-xl transition-all"
            >
              Edit Details
            </button>
            <button
              onClick={handleToggleArchive}
              className="px-4 py-2 bg-surface-900 border border-white/[0.06] text-warning hover:text-warning/80 text-sm font-semibold rounded-xl transition-all"
            >
              {contact.isActive ? "Archive" : "Activate"}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 text-sm font-semibold rounded-xl transition-all"
            >
              Delete Record
            </button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider text-surface-200/50">
              Overview Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Contact Type
                </span>
                <span className="text-white text-sm font-semibold">{contact.contactType}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Email Address
                </span>
                <span className="text-white text-sm">{contact.email || "—"}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Phone Number
                </span>
                <span className="text-white text-sm">{contact.phone || "—"}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Alternate Phone
                </span>
                <span className="text-white text-sm">{contact.alternatePhone || "—"}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Website
                </span>
                {contact.website ? (
                  <a
                    href={contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:underline text-sm font-semibold"
                  >
                    {contact.website}
                  </a>
                ) : (
                  <span className="text-white text-sm">—</span>
                )}
              </div>

              <div>
                <span className="block text-xs font-semibold text-surface-200/40 uppercase tracking-wider mb-1">
                  Postal Address
                </span>
                <div className="text-white text-sm leading-relaxed">
                  {contact.addressLine1 ? (
                    <>
                      <div>{contact.addressLine1}</div>
                      {contact.addressLine2 && <div>{contact.addressLine2}</div>}
                      <div>
                        {contact.city}, {contact.state} {contact.postalCode}
                      </div>
                      {contact.country && <div>{contact.country}</div>}
                    </>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider text-surface-200/50">
              Internal Notes
            </h2>
            <div className="text-sm text-surface-200/80 leading-relaxed whitespace-pre-wrap">
              {contact.notes || "No notes recorded for this contact."}
            </div>
          </div>
        </div>

        {/* Linked Matters */}
        <div className="space-y-6">
          <div className="bg-surface-900/60 backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider text-surface-200/50">
                Linked Matters
              </h2>
              {canManage && contact.isActive && (
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Link Matter
                </button>
              )}
            </div>

            {linkedMatters.length === 0 ? (
              <div className="text-center py-8 text-surface-200/40 text-xs">
                No matters currently linked to this contact.
              </div>
            ) : (
              <div className="space-y-4">
                {linkedMatters.map((assoc: any) => {
                  const matter = assoc.matterId;
                  if (!matter) return null;

                  return (
                    <div
                      key={assoc.id}
                      className="border border-white/[0.04] bg-surface-950/40 rounded-xl p-4 flex flex-col justify-between gap-3 group hover:border-white/[0.08] transition-colors"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] uppercase font-bold text-brand-300">
                            {matter.matterNumber}
                          </span>
                          <span className="text-[10px] font-semibold text-surface-200/40 border border-white/5 bg-surface-950 px-2 py-0.5 rounded-full">
                            {assoc.role}
                          </span>
                        </div>
                        <Link
                          to={`/matters/${matter._id || matter.id}`}
                          className="font-bold text-white text-sm hover:underline block mt-2.5 leading-snug"
                        >
                          {matter.title}
                        </Link>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/[0.04] pt-2">
                        <span className="text-[10px] text-surface-200/45">
                          Linked {new Date(assoc.createdAt).toLocaleDateString()}
                        </span>
                        {canManage && (
                          <button
                            onClick={() => handleUnlinkMatter(matter._id || matter.id)}
                            className="text-[10px] text-danger hover:text-danger/80 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Unlink
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Link Matter Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-white/[0.08] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-white mb-2">Link Matter</h3>
            <p className="text-xs text-surface-200/50 mb-4">
              Select an open matter and specify the role for {displayName}.
            </p>

            <form onSubmit={handleLinkMatter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-200/45 uppercase tracking-wider mb-2">
                  Search Matters
                </label>
                <input
                  type="text"
                  placeholder="Filter matters..."
                  value={searchMatterQuery}
                  onChange={(e) => setSearchMatterQuery(e.target.value)}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2 text-sm text-white transition-all mb-3"
                />

                <select
                  required
                  value={selectedMatterId}
                  onChange={(e) => setSelectedMatterId(e.target.value)}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all mb-3"
                >
                  <option value="">-- Choose Matter --</option>
                  {isSearchMattersLoading ? (
                    <option disabled>Loading matters...</option>
                  ) : matters.length === 0 ? (
                    <option disabled>No open matters found</option>
                  ) : (
                    matters.map((m) => (
                      <option key={m.id} value={m.id}>
                        [{m.matterNumber}] {m.title}
                      </option>
                    ))
                  )}
                </select>

                <label className="block text-xs font-semibold text-surface-200/45 uppercase tracking-wider mb-2">
                  Contact Role
                </label>
                <select
                  required
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-surface-950 border border-white/[0.08] hover:border-white/[0.12] focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/80 rounded-xl px-4 py-2.5 text-sm text-white transition-all"
                >
                  {CONTACT_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkModal(false);
                    setSelectedMatterId("");
                    setSearchMatterQuery("");
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-950 border border-white/[0.06] text-surface-200 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedMatterId}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Link Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
