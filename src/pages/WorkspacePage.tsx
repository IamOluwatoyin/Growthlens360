import {
  Check,
  CircleAlert,
  ClipboardList,
  FileText,
  HelpCircle,
  MessageCircle,
  Search,
  Settings2,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

type Page =
  | "assessments"
  | "reports"
  | "actions"
  | "advisor"
  | "profile"
  | "settings"
  | "help";
const copy: Record<Page, { tag: string; title: string; body: string }> = {
  assessments: {
    tag: "Assessments",
    title: "Collect the perspectives that matter",
    body: "Complete the owner assessment and invite customers or employees with secure links.",
  },
  reports: {
    tag: "Insight report",
    title: "Your business through every perspective",
    body: "See what is working, where views differ and what deserves attention first.",
  },
  actions: {
    tag: "Recommendations",
    title: "Know what to fix first",
    body: "Actions ranked by urgency, impact and the effort your business can manage.",
  },
  advisor: {
    tag: "Growth advisor",
    title: "Ask about your business in plain language",
    body: "Get guidance based on your report, not generic advice.",
  },
  profile: {
    tag: "Business profile",
    title: "Keep your context accurate",
    body: "Your profile helps tailor questions and recommendations to your reality.",
  },
  settings: {
    tag: "Settings",
    title: "Account and privacy",
    body: "Manage notifications, assessment access and how your data is handled.",
  },
  help: {
    tag: "Help & support",
    title: "How can we help?",
    body: "Find quick answers or contact the GrowthLens support team.",
  },
};
function Header({ page }: { page: Page }) {
  const value = copy[page];
  return (
    <>
      <span className="eyebrow">{value.tag}</span>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        {value.title}
      </h1>
      <p className="mt-2 max-w-2xl leading-7 text-[#66729b]">{value.body}</p>
    </>
  );
}
export function WorkspacePage({ page }: { page: Page }) {
  if (page === "assessments")
    return (
      <div className="mx-auto max-w-6xl">
        <Header page={page} />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Owner", "Complete", "100%"],
            ["Employees", "4 of 6 responses", "67%"],
            ["Customers", "10 of 18 responses", "56%"],
          ].map(([name, status, progress]) => (
            <div className="card p-6" key={name}>
              <Users className="text-[#1379f4]" />
              <h2 className="mt-5 text-xl font-extrabold">{name}</h2>
              <p className="mt-2 text-sm text-[#66729b]">{status}</p>
              <div className="mt-5 h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#1379f4]"
                  style={{ width: progress }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  if (page === "reports")
    return (
      <div className="mx-auto max-w-6xl">
        <Header page={page} />
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {[
            ["Overall clarity", "72/100"],
            ["People", "81"],
            ["Operations", "68"],
            ["Customers", "59"],
          ].map(([label, value]) => (
            <div className="card p-5" key={label}>
              <div className="text-sm font-bold text-[#66729b]">{label}</div>
              <div className="mt-4 text-4xl font-black">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-[22px] bg-[#fff7f5] p-6">
          <CircleAlert className="text-[#ff5d49]" />
          <h2 className="mt-4 text-2xl font-extrabold">
            Largest gap: customer communication
          </h2>
          <p className="mt-3 leading-7 text-[#66729b]">
            You feel communication is clear, but customers report uncertainty
            after purchase.
          </p>
          <Link to="/actions" className="btn-primary mt-6">
            See recommendations
          </Link>
        </div>
      </div>
    );
  if (page === "actions")
    return (
      <div className="mx-auto max-w-5xl">
        <Header page={page} />
        <div className="mt-8 grid gap-4">
          {[
            "Create a simple post-purchase update",
            "Document the customer handover",
            "Run a weekly 15-minute team check-in",
          ].map((title, index) => (
            <div
              className="card flex flex-col gap-5 p-6 sm:flex-row"
              key={title}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff0ed] font-black text-[#e84632]">
                {index + 1}
              </span>
              <div className="flex-1">
                <h2 className="text-xl font-extrabold">{title}</h2>
                <p className="mt-2 text-sm text-[#10a968]">
                  High impact · Low effort
                </p>
              </div>
              <button className="btn-secondary self-start">
                <Check size={17} />
                Mark started
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  if (page === "advisor")
    return (
      <div className="mx-auto max-w-4xl">
        <Header page={page} />
        <div className="mt-8 overflow-hidden rounded-[24px] border bg-white">
          <div className="flex items-center gap-3 bg-[#07143f] p-5 text-white">
            <Sparkles className="text-[#ff7563]" />
            <b>GrowthLens Advisor</b>
          </div>
          <div className="min-h-[380px] space-y-5 p-6">
            <div className="max-w-[82%] rounded-2xl bg-[#eef5ff] p-4">
              What would you like to understand about your results?
            </div>
            <div className="ml-auto max-w-[82%] rounded-2xl bg-[#ff5d49] p-4 text-white">
              What should I improve first with a small budget?
            </div>
            <div className="max-w-[82%] rounded-2xl bg-[#eef5ff] p-4">
              Start with one consistent post-purchase message. It addresses the
              largest gap and costs very little.
            </div>
          </div>
          <div className="flex gap-3 border-t p-4">
            <input className="field" placeholder="Ask about your results…" />
            <button className="btn-primary">
              <MessageCircle size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  if (page === "profile")
    return (
      <div className="mx-auto max-w-4xl">
        <Header page={page} />
        <div className="card mt-8 grid gap-5 p-6">
          <label className="grid gap-2 text-sm font-bold">
            Business name
            <input className="field" defaultValue="BrightPath Studio" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">
              Industry
              <select className="field">
                <option>Professional services</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Location
              <input className="field" defaultValue="Lagos, Nigeria" />
            </label>
          </div>
          <button className="btn-primary ml-auto">Save changes</button>
        </div>
      </div>
    );
  if (page === "settings")
    return (
      <div className="mx-auto max-w-4xl">
        <Header page={page} />
        <section className="card mt-8 p-6">
          <div className="flex gap-4">
            <Settings2 className="text-[#1379f4]" />
            <div className="flex-1">
              <h2 className="text-xl font-extrabold">Notifications</h2>
              {[
                "Assessment response updates",
                "Weekly progress summary",
                "Recommendation reminders",
              ].map((item, index) => (
                <label
                  className="mt-4 flex items-center justify-between border-t pt-4"
                  key={item}
                >
                  <span>{item}</span>
                  <input type="checkbox" defaultChecked={index < 2} />
                </label>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  return (
    <div className="mx-auto max-w-5xl">
      <Header page={page} />
      <div className="relative mt-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a86a8]" />
        <input className="field py-4 pl-12" placeholder="Search help topics…" />
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {[
          [ClipboardList, "Assessments"],
          [FileText, "Reports"],
          [UserRound, "Your account"],
        ].map(([Icon, title]) => (
          <div className="card p-6" key={String(title)}>
            <Icon className="text-[#1379f4]" />
            <h2 className="mt-4 text-lg font-extrabold">{title as string}</h2>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-[22px] bg-[#07143f] p-7 text-white">
        <HelpCircle />
        <h2 className="mt-4 text-2xl font-extrabold">Still need support?</h2>
        <button className="mt-5 rounded-xl bg-white px-5 py-3 font-bold text-[#07143f]">
          Contact support
        </button>
      </div>
    </div>
  );
}
