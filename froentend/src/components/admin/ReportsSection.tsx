import { FC } from 'react';
import { DownloadCloud, FileBarChart, TrendingUp } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  description: string;
  period: string;
  trend: 'up' | 'down' | 'flat';
  change: string;
}

const sampleReports: Report[] = [
  {
    id: 'rpt-1',
    title: 'Monthly Activity Overview',
    description: 'Summary of new users, bookings, and doctor approvals for the past month.',
    period: 'Last 30 days',
    trend: 'up',
    change: '+18%',
  },
  {
    id: 'rpt-2',
    title: 'Doctor Utilization',
    description: 'Breakdown of appointment volume across all active doctors.',
    period: 'Current quarter',
    trend: 'flat',
    change: '+2%',
  },
  {
    id: 'rpt-3',
    title: 'Cancellation Insights',
    description: 'Analysis of appointment cancellations by reason and department.',
    period: 'Year to date',
    trend: 'down',
    change: '-6%',
  },
];

const trendColors: Record<Report['trend'], string> = {
  up: 'text-green-600',
  down: 'text-red-600',
  flat: 'text-blue-600',
};

const ReportsSection: FC = () => {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-2">Reports &amp; Insights</h1>
        <p className="text-muted-foreground">
          Explore ready-made summaries to understand how the platform is performing.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {sampleReports.map(report => (
          <article key={report.id} className="glass-card rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{report.title}</h2>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </div>
              <FileBarChart className="w-8 h-8 text-primary/80" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{report.period}</span>
              <span className={`font-medium ${trendColors[report.trend]}`}>{report.change}</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button className="btn-outline py-1 px-3 text-sm">View Details</button>
              <button className="btn-primary py-1 px-3 text-sm flex items-center gap-2">
                <DownloadCloud className="w-4 h-4" />
                Export
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold">Key Highlights</h2>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-6">
          <li>Patient sign-ups continue to trend upward with strong week-over-week retention.</li>
          <li>Average time to approve new doctors is under 24 hours, meeting SLA targets.</li>
          <li>Telehealth appointments represent 35% of total visits and are growing steadily.</li>
        </ul>
      </div>
    </section>
  );
};

export default ReportsSection;

