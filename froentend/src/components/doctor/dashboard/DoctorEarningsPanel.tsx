interface DoctorEarningsPanelProps {
  summary: {
    totalBookings: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    totalRevenue: number;
  };
}

const DoctorEarningsPanel = ({ summary }: DoctorEarningsPanelProps) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Earnings Overview</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Bookings" value={summary.totalBookings} />
      <StatCard title="Confirmed" value={summary.confirmed} />
      <StatCard title="Pending" value={summary.pending} />
      <StatCard title="Cancelled" value={summary.cancelled} />
    </div>
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold">Estimated Revenue</h3>
      <p className="text-2xl font-bold mt-2">
        ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Revenue is calculated from appointment amounts that include payment information.
      </p>
    </div>
  </div>
);

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <div className="glass-card rounded-xl p-5">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);

export default DoctorEarningsPanel;

