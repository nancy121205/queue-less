import { Link, NavLink, useNavigate } from "react-router-dom";
import { getUserRole, logout } from "../../utils/auth";
import Button from "./Button";

const PATIENT_LINKS = [
  { to: "/dashboard", label: "Find care" },
  { to: "/appointments", label: "Appointments" },
  { to: "/patient-profile", label: "Profile" },
  { to: "/help", label: "Help" },
  { to: "/about", label: "About" },
];

const DOCTOR_LINKS = [
  { to: "/doctor-dashboard", label: "Schedule" },
  { to: "/doctor-profile-edit", label: "Profile" },
  { to: "/help", label: "Help" },
  { to: "/about", label: "About" },
];

function Navbar() {
  const navigate = useNavigate();
  const role = getUserRole();
  const links = role === "doctor" ? DOCTOR_LINKS : PATIENT_LINKS;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link to={role === "doctor" ? "/doctor-dashboard" : "/dashboard"} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-semibold text-white">
            Q
          </span>
          <span className="text-base font-semibold tracking-tight text-slate-900">
            QueueLess
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Button variant="secondary" size="sm" onClick={handleLogout} className="ml-2">
            Log out
          </Button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
