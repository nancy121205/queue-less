import { getToken } from "../utils/auth";
import AppShell from "../components/ui/AppShell";
import Card from "../components/ui/Card";
import PublicHeader from "../components/ui/PublicHeader";

const FAQS = [
  {
    title: "How do I book an appointment?",
    body: "Sign in as a patient, open Find care, search by specialization, and choose Book appointment on a doctor. Pick an open slot on their profile to join that day’s queue.",
  },
  {
    title: "How do I upload reports?",
    body: "On the patient dashboard, choose a PDF or image of your lab report and select Upload report. QueueLess extracts the text and generates a short AI summary, including flagged values.",
  },
  {
    title: "How do I check queue status?",
    body: "Patients can open Appointments to see queue position, estimated wait, and expected start time. Doctors open Schedule, then View queue on a slot to call patients and mark them seen.",
  },
];

function Help() {
  const content = (
    <div className="space-y-4">
      {FAQS.map((item) => (
        <Card key={item.title} title={item.title}>
          <p className="text-sm leading-6 text-slate-600">{item.body}</p>
        </Card>
      ))}
    </div>
  );

  if (getToken()) {
    return (
      <AppShell title="Help" description="Common questions about booking, reports, and the live queue.">
        {content}
      </AppShell>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Help</h1>
          <p className="mt-1 text-sm text-slate-600">
            Common questions about booking, reports, and the live queue.
          </p>
        </header>
        {content}
      </main>
    </div>
  );
}

export default Help;
