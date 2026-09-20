const TONE_MAP = {
  completed: "success",
  complete: "success",
  done: "success",
  confirmed: "success",
  normal: "success",
  active: "success",
  available: "success",
  success: "success",
  waiting: "waiting",
  pending: "waiting",
  scheduled: "waiting",
  queued: "waiting",
  booked: "waiting",
  upcoming: "waiting",
  called: "waiting",
  in_progress: "waiting",
  seen: "success",
  abnormal: "danger",
  cancelled: "danger",
  canceled: "danger",
  rejected: "danger",
  missed: "danger",
  critical: "danger",
  high: "danger",
  error: "danger",
  danger: "danger",
};

const TONES = {
  success: "bg-status-success-muted text-status-success-text border-status-success-border",
  waiting: "bg-status-waiting-muted text-status-waiting-text border-status-waiting-border",
  danger: "bg-status-danger-muted text-status-danger-text border-status-danger-border",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
};

function normalizeStatus(status) {
  return String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function Badge({ status, children, className = "" }) {
  const key = normalizeStatus(status);
  const tone = TONE_MAP[key] ?? "neutral";
  const label = children ?? String(status ?? "");

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${TONES[tone]} ${className}`}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}

export default Badge;
