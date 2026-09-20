import { Link } from "react-router-dom";
import Button from "./Button";

function PublicHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-semibold text-white">
            Q
          </span>
          <span className="text-base font-semibold tracking-tight text-slate-900">
            QueueLess
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            to="/about"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            About
          </Link>
          <Link
            to="/help"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Help
          </Link>
          <Link
            to="/login"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Sign in
          </Link>
          <Link to="/register">
            <Button size="sm">Create account</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default PublicHeader;
