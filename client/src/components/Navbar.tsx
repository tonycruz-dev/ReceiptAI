import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition ${
      isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          Receipts powered by AI
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink to="/" className={navLinkClass}>
            Receipts
          </NavLink>
          <NavLink to="/upload" className={navLinkClass}>
            Upload
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
