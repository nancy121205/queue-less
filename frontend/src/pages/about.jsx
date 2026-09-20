import { getToken } from "../utils/auth";
import AppShell from "../components/ui/AppShell";
import Card from "../components/ui/Card";
import PublicHeader from "../components/ui/PublicHeader";

function About() {
  const content = (
    <Card title="Our mission">
      <div className="space-y-4 text-sm leading-6 text-slate-600">
        <p>
          QueueLess is a hospital queue management system built to make clinic
          visits more predictable. Patients should know when they will be seen.
          Doctors should see who is next without paper lists at the front desk.
        </p>
        <p>
          The portal combines appointment booking, live queue tracking, AI wait
          estimates, and report summaries in one place — designed like a
          trusted clinic system, not a consumer app.
        </p>
      </div>
    </Card>
  );

  if (getToken()) {
    return (
      <AppShell title="About QueueLess" description="A calmer waiting room, for patients and clinicians.">
        {content}
      </AppShell>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">About QueueLess</h1>
          <p className="mt-1 text-sm text-slate-600">
            A calmer waiting room, for patients and clinicians.
          </p>
        </header>
        {content}
      </main>
    </div>
  );
}

export default About;
