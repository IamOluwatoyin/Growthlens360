import {
  BarChart3,
  CheckSquare,
  ClipboardList,
  Compass,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LoaderCircle,
  Menu,
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

const links = [
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

const navClassName = ({
  isActive,
}: {
  isActive: boolean;
}) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition ${
    isActive
      ? "bg-[#fff0ed] text-[#ff5d49]"
      : "text-white/90 hover:bg-white/10 hover:text-white"
  }`;

function NavItems({ close }: { close?: () => void }) {
  return (
    <>
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={close}
          className={navClassName}
        >
          <Icon size={19} />
          {label}
        </NavLink>
      ))}
    </>
  );
}

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { profile, isLoading } = useBusinessProfile();

  const businessInitials = (
    profile?.business_name ?? "Your business"
  )
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f5f8fd]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] overflow-y-auto bg-[#0b2f63] p-6 text-white lg:flex lg:flex-col">
        <div className="mb-8 px-1">
          <Logo inverse compact />
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1">
          <NavItems />

          <div className="mt-auto border-t border-white/20 pt-4">
            <NavLink
              to="/settings"
              className={navClassName}
            >
              <Settings size={19} />
              Settings
            </NavLink>

            <NavLink
              to="/help"
              className={navClassName}
            >
              <HelpCircle size={19} />
              Help & Support
            </NavLink>

            <LogoutButton />
          </div>
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-[#07143f]/55 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="h-full w-[86%] max-w-[310px] overflow-y-auto bg-[#0b2f63] p-5 text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <Logo inverse compact />

              <button
                type="button"
                className="rounded-lg p-2 text-white hover:bg-white/10"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
              >
                <X />
              </button>
            </div>

            <nav className="grid gap-1">
              <NavItems close={() => setOpen(false)} />

              <div className="mt-4 border-t border-white/20 pt-4">
                <NavLink
                  to="/settings"
                  className={navClassName}
                  onClick={() => setOpen(false)}
                >
                  <Settings size={19} />
                  Settings
                </NavLink>

                <NavLink
                  to="/help"
                  className={navClassName}
                  onClick={() => setOpen(false)}
                >
                  <HelpCircle size={19} />
                  Help & Support
                </NavLink>

                <LogoutButton />
              </div>
            </nav>
          </aside>
        </div>
      )}

      <div className="min-w-0 lg:pl-[264px]">
       <header className="sticky top-0 z-20 border-b border-[#dfe6f1] bg-white">
          <div className="flex h-[74px] min-w-0 items-center justify-between gap-3 px-4 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="shrink-0 rounded-lg border border-[#dfe6f1] p-2 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold">
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
                    profile?.business_name ?? "Your business"
                  )}
                </div>

                <div className="text-xs text-[#7a86a8]">
                  Business workspace
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <NotificationMenu />

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef5ff] font-extrabold text-[#1379f4]">
                {businessInitials}
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0 p-4 pb-24 sm:p-7 lg:p-9">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#dfe6f1] bg-white px-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] pt-2 lg:hidden">
        {links
          .slice(0, 5)
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center gap-1 text-[10px] font-bold ${
                  isActive
                    ? "text-[#e84632]"
                    : "text-[#6b7799]"
                }`
              }
            >
              <Icon size={20} />

              <span className="max-w-full truncate">
                {label.split(" ")[0]}
              </span>
            </NavLink>
          ))}
      </nav>
    </div>
  );
}