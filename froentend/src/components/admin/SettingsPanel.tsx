import { FC, useState } from 'react';
import { Bell, ShieldCheck, UserCog } from 'lucide-react';

const SettingsPanel: FC = () => {
  const [notificationEmail, setNotificationEmail] = useState('admin@medibook.com');
  const [digestFrequency, setDigestFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [autoApproveDoctors, setAutoApproveDoctors] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-2">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure administrative preferences and review key safeguards.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Notification email</span>
            <input
              type="email"
              value={notificationEmail}
              onChange={event => setNotificationEmail(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Digest frequency</span>
            <select
              value={digestFrequency}
              onChange={event =>
                setDigestFrequency(event.target.value as typeof digestFrequency)
              }
              className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
            <div>
              <span className="font-medium">Auto-approve trusted doctors</span>
              <p className="text-muted-foreground">
                Automatically approve doctors invited by top partners.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoApproveDoctors}
              onChange={event => setAutoApproveDoctors(event.target.checked)}
              className="h-5 w-5 accent-primary"
            />
          </label>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          <label className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
            <div>
              <span className="font-medium">Two-factor authentication</span>
              <p className="text-muted-foreground">Require a second factor for admin sign-ins.</p>
            </div>
            <input
              type="checkbox"
              checked={twoFactorAuth}
              onChange={event => setTwoFactorAuth(event.target.checked)}
              className="h-5 w-5 accent-primary"
            />
          </label>
          <div className="rounded-lg bg-primary/5 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Recent security checks</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>All admin accounts meet password complexity requirements.</li>
              <li>Last penetration test completed 32 days ago with no critical findings.</li>
              <li>Audit logging is active and synced to the analytics warehouse.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserCog className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Team Roles</h2>
            <p className="text-sm text-muted-foreground">
              Control who can manage appointments, users, and billing.
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium mb-1">Owner</p>
            <p className="text-muted-foreground">
              Full access to settings, billing, and security-sensitive actions.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium mb-1">Manager</p>
            <p className="text-muted-foreground">
              Can approve doctors, manage users, and review reports.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium mb-1">Support</p>
            <p className="text-muted-foreground">
              Limited to viewing appointments and updating patient information.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsPanel;

