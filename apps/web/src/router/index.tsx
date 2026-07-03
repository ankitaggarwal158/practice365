import { createBrowserRouter } from "react-router-dom";
import {
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "@/modules/auth";
import {
  DashboardLayout,
  UserListPage,
  UserDetailsPage,
  UserProfilePage,
  AcceptInvitationPage,
} from "@/modules/users";
import {
  RoleListPage,
  RoleDetailsPage,
  CreateRolePage,
  EditRolePage,
  PermissionMatrixPage,
} from "@/modules/roles";
import {
  FirmProfilePage,
  FirmSettingsPage,
  FirmBrandingPage,
} from "@/modules/firm";
import {
  IntakeListPage,
  CreateIntakePage,
  IntakeDetailsPage,
  EditIntakePage,
} from "@/modules/intake";
import {
  LeadListPage,
  CreateLeadPage,
  LeadDetailsPage,
  EditLeadPage,
} from "@/modules/leads";
import {
  ConflictCheckPage,
  ConflictDetailsPage,
  ManualConflictSearchPage,
} from "@/modules/conflict-check";
import {
  ClientListPage,
  CreateClientPage,
  ClientDetailsPage,
  EditClientPage,
} from "@/modules/clients";
import {
  MatterListPage,
  CreateMatterPage,
  MatterDetailsPage,
  EditMatterPage,
} from "@/modules/matters";
import {
  PracticeAreaListPage,
  CreatePracticeAreaPage,
  EditPracticeAreaPage,
} from "@/modules/practice-areas";
import {
  OpposingPartyListPage,
  OpposingPartyDetailsPage,
  CreateOpposingPartyPage,
  EditOpposingPartyPage,
} from "@/modules/opposing-parties";
import {
  MatterContactListPage,
  MatterContactDetailsPage,
  CreateMatterContactPage,
  EditMatterContactPage,
} from "@/modules/matter-contacts";
import {
  NotesListPage,
  NoteDetailsPage,
  CreateNotePage,
  EditNotePage,
} from "@/modules/notes";
import {
  CalendarPage,
  CreateEventPage,
  EditEventPage,
  EventDetailsPage,
} from "@/modules/calendar";
import {
  DocumentListPage,
  DocumentDetailsPage,
  UploadDocumentPage,
  EditDocumentPage,
  FolderManagementPage,
} from "@/modules/documents";
import {
  TimeTrackingPage,
  CreateTimeEntryPage,
  EditTimeEntryPage,
  TimeEntryDetailsPage,
} from "@/modules/time-tracking";
import {
  InvoiceListPage,
  InvoiceDetailsPage,
  CreateInvoicePage,
  DraftInvoicePage,
  PaymentHistoryPage,
} from "@/modules/billing";
import {
  LoginPage as PortalLoginPage,
  ForgotPasswordPage as PortalForgotPasswordPage,
  ResetPasswordPage as PortalResetPasswordPage,
  DashboardPage as PortalDashboardPage,
  ProfilePage as PortalProfilePage,
  MatterListPage as PortalMatterListPage,
  MatterDetailsPage as PortalMatterDetailsPage,
  DocumentListPage as PortalDocumentListPage,
  InvoiceListPage as PortalInvoiceListPage,
  PortalLayout,
  PortalProtectedRoute,
} from "@/modules/client-portal";
import { ProtectedRoute } from "./ProtectedRoute";
import { GuestRoute } from "./GuestRoute";
import { ErrorFallback } from "@/components/ErrorFallback";

/**
 * Placeholder dashboard shown after login.
 * Will be replaced when the Dashboard module is implemented.
 */
function DashboardPlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold text-white">
        Practice<span className="text-brand-400">365</span>
      </h1>
      <p className="text-surface-200/60 text-sm">
        Dashboard coming soon. You are authenticated.
      </p>
    </div>
  );
}

export const router = createBrowserRouter([
  // ─── Guest Routes (redirect if authenticated) ──────
  {
    path: "/login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <GuestRoute>
        <ForgotPasswordPage />
      </GuestRoute>
    ),
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "/accept-invitation",
    element: (
      <GuestRoute>
        <AcceptInvitationPage />
      </GuestRoute>
    ),
  },

  // ─── Protected Routes ──────────────────────────────
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorFallback />,
    children: [
      {
        path: "",
        element: <DashboardPlaceholder />,
      },
      {
        path: "users",
        element: <UserListPage />,
      },
      {
        path: "users/:id",
        element: <UserDetailsPage />,
      },
      {
        path: "roles",
        element: <RoleListPage />,
      },
      {
        path: "roles/new",
        element: <CreateRolePage />,
      },
      {
        path: "roles/permissions",
        element: <PermissionMatrixPage />,
      },
      {
        path: "roles/:id",
        element: <RoleDetailsPage />,
      },
      {
        path: "roles/:id/edit",
        element: <EditRolePage />,
      },
      {
        path: "profile",
        element: <UserProfilePage />,
      },
      {
        path: "firm",
        element: <FirmProfilePage />,
      },
      {
        path: "firm/settings",
        element: <FirmSettingsPage />,
      },
      {
        path: "firm/branding",
        element: <FirmBrandingPage />,
      },
      {
        path: "practice-areas",
        element: <PracticeAreaListPage />,
      },
      {
        path: "practice-areas/new",
        element: <CreatePracticeAreaPage />,
      },
      {
        path: "practice-areas/:id/edit",
        element: <EditPracticeAreaPage />,
      },
      {
        path: "opposing-parties",
        element: <OpposingPartyListPage />,
      },
      {
        path: "opposing-parties/new",
        element: <CreateOpposingPartyPage />,
      },
      {
        path: "opposing-parties/:id",
        element: <OpposingPartyDetailsPage />,
      },
      {
        path: "opposing-parties/:id/edit",
        element: <EditOpposingPartyPage />,
      },
      {
        path: "matter-contacts",
        element: <MatterContactListPage />,
      },
      {
        path: "matter-contacts/new",
        element: <CreateMatterContactPage />,
      },
      {
        path: "matter-contacts/:id",
        element: <MatterContactDetailsPage />,
      },
      {
        path: "matter-contacts/:id/edit",
        element: <EditMatterContactPage />,
      },
      {
        path: "notes",
        element: <NotesListPage />,
      },
      {
        path: "notes/new",
        element: <CreateNotePage />,
      },
      {
        path: "notes/:id",
        element: <NoteDetailsPage />,
      },
      {
        path: "notes/:id/edit",
        element: <EditNotePage />,
      },
      {
        path: "calendar",
        element: <CalendarPage />,
      },
      {
        path: "calendar/new",
        element: <CreateEventPage />,
      },
      {
        path: "calendar/:id",
        element: <EventDetailsPage />,
      },
      {
        path: "calendar/:id/edit",
        element: <EditEventPage />,
      },
      {
        path: "documents",
        element: <DocumentListPage />,
      },
      {
        path: "documents/upload",
        element: <UploadDocumentPage />,
      },
      {
        path: "documents/folders",
        element: <FolderManagementPage />,
      },
      {
        path: "documents/:id",
        element: <DocumentDetailsPage />,
      },
      {
        path: "documents/:id/edit",
        element: <EditDocumentPage />,
      },
      {
        path: "time-tracking",
        element: <TimeTrackingPage />,
      },
      {
        path: "time-tracking/create",
        element: <CreateTimeEntryPage />,
      },
      {
        path: "time-tracking/:id",
        element: <TimeEntryDetailsPage />,
      },
      {
        path: "time-tracking/:id/edit",
        element: <EditTimeEntryPage />,
      },
      {
        path: "billing",
        element: <InvoiceListPage />,
      },
      {
        path: "billing/create",
        element: <CreateInvoicePage />,
      },
      {
        path: "billing/:id",
        element: <InvoiceDetailsPage />,
      },
      {
        path: "billing/:id/edit",
        element: <DraftInvoicePage />,
      },
      {
        path: "billing/:id/payments",
        element: <PaymentHistoryPage />,
      },
      
      // Settings catch-all
      {
        path: "settings",
        element: <FirmSettingsPage />,
      },
      {
        path: "firm/branding",
        element: <FirmBrandingPage />,
      },
      {
        path: "intakes",
        element: <IntakeListPage />,
      },
      {
        path: "intakes/new",
        element: <CreateIntakePage />,
      },
      {
        path: "intakes/:id",
        element: <IntakeDetailsPage />,
      },
      {
        path: "intakes/:id/edit",
        element: <EditIntakePage />,
      },
      {
        path: "leads",
        element: <LeadListPage />,
      },
      {
        path: "leads/new",
        element: <CreateLeadPage />,
      },
      {
        path: "leads/:id",
        element: <LeadDetailsPage />,
      },
      {
        path: "leads/:id/edit",
        element: <EditLeadPage />,
      },
      {
        path: "clients",
        element: <ClientListPage />,
      },
      {
        path: "clients/new",
        element: <CreateClientPage />,
      },
      {
        path: "clients/:id",
        element: <ClientDetailsPage />,
      },
      {
        path: "clients/:id/edit",
        element: <EditClientPage />,
      },
      {
        path: "matters",
        element: <MatterListPage />,
      },
      {
        path: "matters/new",
        element: <CreateMatterPage />,
      },
      {
        path: "matters/:id",
        element: <MatterDetailsPage />,
      },
      {
        path: "matters/:id/edit",
        element: <EditMatterPage />,
      },
      {
        path: "conflict-checks",
        element: <ConflictCheckPage />,
      },
      {
        path: "conflict-checks/manual",
        element: <ManualConflictSearchPage />,
      },
      {
        path: "conflict-checks/:id",
        element: <ConflictDetailsPage />,
      },
    ],
  },
  {
    path: "/portal/login",
    element: <PortalLoginPage />,
  },
  {
    path: "/portal/forgot-password",
    element: <PortalForgotPasswordPage />,
  },
  {
    path: "/portal/reset-password",
    element: <PortalResetPasswordPage />,
  },
  {
    path: "/portal",
    element: (
      <PortalProtectedRoute>
        <PortalLayout />
      </PortalProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <PortalDashboardPage />,
      },
      {
        path: "matters",
        element: <PortalMatterListPage />,
      },
      {
        path: "matters/:id",
        element: <PortalMatterDetailsPage />,
      },
      {
        path: "documents",
        element: <PortalDocumentListPage />,
      },
      {
        path: "invoices",
        element: <PortalInvoiceListPage />,
      },
      {
        path: "profile",
        element: <PortalProfilePage />,
      },
    ],
  },
]);
