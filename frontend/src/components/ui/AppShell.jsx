import Navbar from "./Navbar";

function AppShell({ title, description, children }) {
  return (
    <div className="min-h-screen bg-surface-page">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {(title || description) && (
          <header className="mb-8">
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </main>
    </div>
  );
}

export default AppShell;
