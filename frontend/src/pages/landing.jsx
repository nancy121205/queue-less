import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import PublicHeader from "../components/ui/PublicHeader";
import { getToken, getUserRole } from "../utils/auth";

const FEATURES = [
  {
    icon: "01",
    title: "Live Queue Tracking",
    body: "See your real-time position and know what is happening before you arrive.",
  },
  {
    icon: "02",
    title: "AI Wait Time Prediction",
    body: "Get a data-driven estimate of your wait, based on the queue as it changes.",
  },
  {
    icon: "03",
    title: "Smart Report Summaries",
    body: "Upload a report and get an instant plain-English summary ready for your doctor.",
  },
  {
    icon: "04",
    title: "Instant Notifications",
    body: "Receive an email alert when your appointment is getting close.",
  },
];

const STEPS = [
  ["01", "Book", "Choose a doctor and appointment time."],
  ["02", "Track", "Follow your place in the live queue."],
  ["03", "Get notified", "We will let you know when it is your turn."],
];

function Landing() {
  const token = getToken();
  const role = getUserRole();
  const patientDestination = token && role === "patient" ? "/dashboard" : "/login";
  const doctorDestination = token && role === "doctor" ? "/doctor-dashboard" : "/login";

  return (
    <div className="min-h-screen overflow-hidden bg-surface-page">
      <PublicHeader />
      <main>
        <section className="relative border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-24">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-700">
                <span className="h-2 w-2 rounded-full bg-status-success" />
                Smarter care starts here
              </p>
              <h1 className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl">
                Spend less time waiting, and more time in care.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
                QueueLess makes healthcare easier to navigate with appointment booking, live queue updates, and AI-powered wait predictions.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link to={patientDestination}>
                  <Button size="lg" className="px-6">Book an Appointment <span aria-hidden="true">-&gt;</span></Button>
                </Link>
                <Link to={doctorDestination}>
                  <Button size="lg" variant="secondary">For Doctors</Button>
                </Link>
              </div>
              <p className="mt-5 text-sm text-slate-500">Less uncertainty for patients. More context for care teams.</p>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-5 rounded-[2rem] bg-primary-50" />
              <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Today, 10:30 AM</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">Dr. Maya Patel</h2>
                  </div>
                  <span className="rounded-full bg-status-success-muted px-3 py-1 text-xs font-semibold text-status-success-text">On time</span>
                </div>
                <div className="py-7 text-center">
                  <p className="text-sm font-medium text-slate-500">Your queue position</p>
                  <p className="mt-2 text-6xl font-semibold tracking-tight text-primary-700">#04</p>
                  <p className="mt-2 text-sm text-slate-500">Estimated wait <span className="font-semibold text-slate-700">18 minutes</span></p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500"><span>Queue progress</span><span>8 of 12 patients</span></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-2/3 rounded-full bg-primary-600" /></div>
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-status-success-border bg-status-success-muted p-3 text-sm text-status-success-text">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white font-bold">+</span>
                  We will email you when you are next.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-700">The waiting room, rethought</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Care should not begin with uncertainty.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">Patients routinely wait for hours with zero visibility into their queue position or expected wait time. Doctors have no easy way to communicate estimated wait times or see the key findings from a patient's reports before they walk in.</p>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-700">One calmer visit</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Everything you need before your turn.</h2></div>
              <p className="max-w-xs text-sm leading-6 text-slate-500">A clearer view of the journey, from booking to consultation.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <article key={feature.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-700">{feature.icon}</span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="text-center"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-700">How it works</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Three steps to a better visit.</h2></div>
          <div className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-12">
            <div className="absolute left-[17%] right-[17%] top-5 hidden border-t border-dashed border-primary-200 md:block" />
            {STEPS.map(([number, title, body]) => (
              <div key={number} className="relative text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white ring-8 ring-surface-page">{number}</span>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:pb-24">
          <div className="flex flex-col items-start justify-between gap-7 rounded-2xl bg-primary-700 px-6 py-10 text-white sm:px-10 lg:flex-row lg:items-center">
            <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-200">For doctors</p><h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">Walk in with the queue and the context already in view.</h2><p className="mt-3 max-w-xl leading-7 text-primary-100">Manage your queue, share more accurate wait times, and review AI-summarized patient reports before they walk in.</p></div>
            <Link to={doctorDestination} className="shrink-0"><Button size="lg" className="text-primary-700 hover:bg-secondary-100">Doctor Portal <span aria-hidden="true">-&gt;</span></Button></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div><Link to="/" className="font-semibold text-slate-900">QueueLess</Link><p className="mt-1 text-sm text-slate-500">Built for less waiting and better care.</p></div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600"><Link to="/help" className="hover:text-primary-700">Help</Link><Link to="/about" className="hover:text-primary-700">About</Link><a href="https://github.com/nancy121205/queue-less" target="_blank" rel="noreferrer" className="hover:text-primary-700">GitHub</a></nav>
          <p className="text-sm text-slate-400">Copyright 2026 QueueLess</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
