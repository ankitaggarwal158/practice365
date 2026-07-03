import { Briefcase, Calendar, DollarSign, Clock } from "lucide-react";
import { DashboardSummary } from "../types/dashboard.types";

interface KpiCardsProps {
  summary: DashboardSummary | null;
}

export function KpiCards({ summary }: KpiCardsProps) {
  if (!summary) return null;

  const { matters, calendar, billing, timeTracking } = summary;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const cards = [
    {
      id: "matters",
      title: "Open Matters",
      value: matters ? `${matters.openCount}` : null,
      subtext: matters ? `${matters.onHoldCount} on hold` : "",
      icon: Briefcase,
      color: "text-brand-400 bg-brand-500/10 border-brand-500/20",
    },
    {
      id: "deadlines",
      title: "Upcoming Deadlines",
      value: calendar ? `${calendar.upcomingDeadlinesCount}` : null,
      subtext: calendar ? `${calendar.upcomingEventsCount} events scheduled` : "",
      icon: Calendar,
      color: "text-danger bg-danger/10 border-danger/20",
    },
    {
      id: "billing",
      title: "Outstanding Invoices",
      value: billing ? formatCurrency(billing.outstandingTotal) : null,
      subtext: billing ? `${billing.overdueCount} overdue (${formatCurrency(billing.overdueTotal)})` : "",
      icon: DollarSign,
      color: "text-success bg-success/10 border-success/20",
    },
    {
      id: "hours",
      title: "Hours Logged Today",
      value: timeTracking ? `${timeTracking.todayHours} hrs` : null,
      subtext: timeTracking ? `This Week: ${timeTracking.weekHours} hrs` : "",
      icon: Clock,
      color: "text-warning bg-warning/10 border-warning/20",
    },
  ];

  // Only render cards for which data is available (based on user permission check)
  const visibleCards = cards.filter((card) => card.value !== null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {visibleCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="relative overflow-hidden bg-surface-900 border border-white/[0.06] hover:border-white/[0.12] hover:-translate-y-1 rounded-2xl p-6 transition-all duration-300 shadow-xl"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-surface-200/50">{card.title}</p>
                <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">
                  {card.value}
                </h3>
                {card.subtext && (
                  <p className="text-xs text-surface-200/40 mt-1.5 font-medium">
                    {card.subtext}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl border ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            {/* Subtle glow background */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/[0.01] rounded-full blur-xl pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}
export default KpiCards;
