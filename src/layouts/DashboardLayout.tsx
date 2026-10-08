import {
  BarChart3,
  CheckSquare,
  ClipboardList,
  Compass,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LoaderCircle,
  MoreHorizontal,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Logo } from "../components/Logo";
import { LogoutButton } from "../components/LogoutButton";
import { NotificationMenu } from "../components/NotificationMenu";
import { useBusinessProfile } from "../hooks/useBusinessProfile";

const primaryLinks = [
  {
    to: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    to: "/assessments",
    label: "Assessments",
    icon: ClipboardList,
  },
  {
    to: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    to: "/recommendations",
    label: "Recommendations",
    icon: FileText,
  },
  {
    to: "/actions",
    label: "Action Plan",
    icon: CheckSquare,
  },
  {
    to: "/advisor",
    label: "Growth Advisor",
    icon: Compass,
  },
  {
    to: "/profile",
    label: "Business Profile",
    icon: UserRound,
  },
];

const mobileMainLinks = [
  {
    to: "/dashboard",
    label: "Home",
    icon: LayoutDashboard,
  },
  {
    to: "/assessments",
    label: "Assessments",
    icon: ClipboardList,
  },
  {
    to: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
];

function getInitials(businessName?: string | null) {
  if (!businessName) {
    return "GL";
  }

  return businessName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function DesktopNavItems() {
  return (
    <>
      {primaryLinks.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex min-h-[50px] items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              isActive
                ? "bg-[#fff4f1] text-[#ff5d49] shadow-[0_8px_22px_rgba(0,0,0,.12)]"
                : "text-white/85 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          <Icon size={20} strokeWidth={2.2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </>
  );
}

function MobileMenuItems({
  close,
}: {
  close: () => void;
}) {
  return (
    <>
      {primaryLinks.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={close}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              isActive
                ? "bg-[#fff0ed] text-[#e84632]"
                : "text-[#536183] hover:bg-[#f4f7fb] hover:text-[#07143f]"
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}

      <div className="my-3 border-t border-[#e7ebf2]" />

      <NavLink
        to="/settings"
        onClick={close}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
            isActive
              ? "bg-[#fff0ed] text-[#e84632]"
              : "text-[#536183] hover:bg-[#f4f7fb]"
          }`
        }
      >
        <Settings size={20} />
        Settings
      </NavLink>

      <NavLink
        to="/help"
        onClick={close}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
            isActive
              ? "bg-[#fff0ed] text-[#e84632]"
              : "text-[#536183] hover:bg-[#f4f7fb]"
          }`
        }
      >
        <HelpCircle size={20} />
        Help & Support
      </NavLink>
    </>
  );
}

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const { profile, isLoading } = useBusinessProfile();

  const businessName =
    profile?.business_name ?? "Your business";

  const initials = getInitials(profile?.business_name);

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      {/* Desktop sidebar */}
     <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] overflow-y-auto bg-[linear-gradient(180deg,#092a54_0%,#061f42_100%)] px-5 py-7 text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex lg:flex-col">
        <div className="mb-10 px-2 [&_img]:h-[64px] [&_img]:max-w-[215px]">
          <Logo inverse />
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          <DesktopNavItems />

          <div className="mt-auto pt-8">
            <div className="mb-4 border-t border-white/15" />

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-[#fff4f1] text-[#ff5d49]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Settings size={20} />
              Settings
            </NavLink>

            <NavLink
              to="/help"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-[#fff4f1] text-[#ff5d49]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <HelpCircle size={20} />
              Help & Support
            </NavLink>

            <div className="mt-1 text-white/80">
              <LogoutButton />
            </div>

            <p className="mt-8 px-4 text-[10px] font-semibold uppercase leading-5 tracking-[0.28em] text-white/55">
              Smaller businesses.
              <br />
              Brighter tomorrows.
            </p>
          </div>
        </nav>
      </aside>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#07143f]/55 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="flex h-full w-[86%] max-w-[330px] flex-col overflow-y-auto bg-white px-5 py-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-7 flex items-center justify-between gap-4">
              <div className="[&_img]:h-12 [&_img]:max-w-[210px]">
                <Logo />
              </div>

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f5fb] text-[#07143f]"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={21} />
              </button>
            </div>

            <nav className="grid gap-1">
              <MobileMenuItems
                close={() => setMobileMenuOpen(false)}
              />
            </nav>

            <div className="mt-auto border-t border-[#e7ebf2] pt-4">
              <LogoutButton />
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-[260px]">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-[#e5ebf4] bg-white/95 backdrop-blur">
          <div className="flex h-[78px] items-center justify-between gap-3 px-4 sm:px-7 lg:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <div className="shrink-0 lg:hidden [&_img]:h-10 [&_img]:max-w-[175px] sm:[&_img]:h-11 sm:[&_img]:max-w-[205px]">
                <Logo compact />
              </div>

              <div className="hidden min-w-0 lg:block">
                <div className="truncate text-sm font-extrabold text-[#07143f]">
                  {isLoading ? (
                    <span
                      className="inline-flex items-center"
                      role="status"
                      aria-label="Loading business"
                    >
                      <LoaderCircle
                        size={17}
                        className="animate-spin text-[#1379f4]"
                      />
                    </span>
                  ) : (
                    businessName
                  )}
                </div>

                <div className="text-xs text-[#7a86a8]">
                  Business workspace
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden min-w-[180px] items-center justify-between rounded-xl border border-[#d8e2f0] bg-white px-4 py-2.5 text-sm font-extrabold text-[#07143f] shadow-sm sm:flex lg:hidden">
                <span className="max-w-[145px] truncate">
                  {isLoading ? "Loading..." : businessName}
                </span>
              </div>

              <NotificationMenu />

              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf2fc] font-extrabold text-[#16366f]"
                aria-label={`${businessName} profile`}
              >
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 pb-28 sm:p-7 sm:pb-28 lg:p-8 xl:p-9">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[#dfe6f1] bg-white px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_28px_rgba(7,20,63,.08)] lg:hidden">
        {mobileMainLinks.map(
          ({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-[54px] flex-col items-center justify-center gap-1 text-[11px] font-bold transition ${
                  isActive
                    ? "text-[#ff5d49]"
                    : "text-[#64749c]"
                }`
              }
            >
              <Icon size={22} strokeWidth={2.2} />
              <span>{label}</span>
            </NavLink>
          ),
        )}

        <button
          type="button"
          className="flex min-h-[54px] flex-col items-center justify-center gap-1 text-[11px] font-bold text-[#64749c]"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open more navigation options"
        >
          <MoreHorizontal size={23} strokeWidth={2.2} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}