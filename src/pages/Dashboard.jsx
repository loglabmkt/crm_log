import React, { useState } from "react";
import PeriodFilter, { getPeriodRange } from "@/components/dashboard/PeriodFilter";
import KpiCards from "@/components/dashboard/KpiCards";
import SalesFunnelChart from "@/components/dashboard/SalesFunnelChart";
import MonthlyRevenueChart from "@/components/dashboard/MonthlyRevenueChart";
import RecentActivities from "@/components/dashboard/RecentActivities";
import UpcomingFollowups from "@/components/dashboard/UpcomingFollowups";

export default function Dashboard() {
  const [filter, setFilter] = useState({ period: "month", customRange: {} });
  const periodRange = getPeriodRange(filter.period, filter.customRange);

  return (
    <div className="space-y-6">
      {/* Period filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm font-medium" style={{ color: "#999999" }}>Visão geral do período</p>
        <PeriodFilter value={filter} onChange={setFilter} />
      </div>

      {/* KPIs */}
      <KpiCards periodRange={periodRange} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesFunnelChart periodRange={periodRange} />
        <MonthlyRevenueChart />
      </div>

      {/* Activity + Followups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentActivities />
        </div>
        <UpcomingFollowups />
      </div>
    </div>
  );
}