import { Menu } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { Logo } from "../components/Logo";

export function PublicLayout() {
  return (
    <>
      <div className="bg-[#ff5d49] px-4 py-2 text-center text-sm font-bold text-white">
        See your business clearly. Know what to fix first.
      </div>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95">
        <div className="page-wrap flex h-[84px] items-center justify-between gap-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#142b67] lg:flex">
            <a href="/#how">How It Works</a>
            <a href="/#measure">What We Measure</a>
            <Link to="/reports">Example Report</Link>
            <a href="/#about">About</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="px-3 py-2 font-bold !text-[#142b67]">
              Log In
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-[#0a1d54] px-5 py-3 font-bold !text-white"
            >
              Start Diagnosis
            </Link>
          </div>
          <Link
            to="/login"
            className="rounded-lg border p-2 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </Link>
        </div>
      </header>
      <Outlet />
    </>
  );
}
