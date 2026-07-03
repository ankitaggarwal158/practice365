import DashboardLayout from "../components/DashboardLayout";
import KpiCards from "../components/KpiCards";
import QuickActions from "../components/QuickActions";
import MyMatters from "../components/MyMatters";
import UpcomingEvents from "../components/UpcomingEvents";
import UpcomingDeadlines from "../components/UpcomingDeadlines";
import RecentDocuments from "../components/RecentDocuments";
import TimeSummary from "../components/TimeSummary";
import BillingSummary from "../components/BillingSummary";
import RecentActivity from "../components/RecentActivity";
import useDashboard from "../hooks/useDashboard";
import useDashboardWidgets from "../hooks/useDashboardWidgets";

export function DashboardPage() {
  const { summary, isLoading: isSummaryLoading, error: summaryError } = useDashboard();
  const { widgetsData, isLoading: isWidgetsLoading } = useDashboardWidgets();

  return (
    <DashboardLayout>
      {/* Welcome header */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-surface-200/50">
            Welcome back. Here is your overview for today.
          </p>
        </div>
      </div>

      {summaryError && (
        <div className="bg-danger/10 border border-danger/20 rounded-2xl p-4 text-sm text-danger">
          Error loading dashboard overview: {summaryError}
        </div>
      )}

      {/* KPI Cards section */}
      <KpiCards summary={summary} />

      {/* Quick Actions row */}
      <QuickActions />

      {/* Main Grid for lists and details widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="flex flex-col gap-6">
          <MyMatters matters={widgetsData?.myMatters ?? null} isLoading={isWidgetsLoading} />
          <TimeSummary timeSummary={widgetsData?.timeSummary ?? null} isLoading={isWidgetsLoading} />
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-6">
          <UpcomingDeadlines deadlines={widgetsData?.upcomingDeadlines ?? null} isLoading={isWidgetsLoading} />
          <UpcomingEvents events={widgetsData?.upcomingEvents ?? null} isLoading={isWidgetsLoading} />
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-6">
          <BillingSummary billingSummary={widgetsData?.billingSummary ?? null} isLoading={isWidgetsLoading} />
          <RecentDocuments documents={widgetsData?.recentDocuments ?? null} isLoading={isWidgetsLoading} />
          <RecentActivity activity={summary?.activity || []} isLoading={isSummaryLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
export default DashboardPage;
