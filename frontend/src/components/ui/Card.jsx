function Card({ title, description, className = "", children, footer }) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-surface-card shadow-card ${className}`}
    >
      {(title || description) && (
        <header className="border-b border-slate-100 px-5 py-4">
          {title && (
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
      {footer && (
        <footer className="border-t border-slate-100 px-5 py-3">{footer}</footer>
      )}
    </section>
  );
}

export default Card;
