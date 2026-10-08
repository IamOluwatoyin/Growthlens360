import {
  CalendarCheck,
  ChartNoAxesColumnIncreasing,
  Check,
  CircleAlert,
  ClipboardCheck,
  FileText,
  Search,
  Target,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../assets/growthlens-hero.png";
import { Logo } from "../components/Logo";
import advisorImage from "../assets/growth-advisor-approved.png";

const steps = [
  {
    icon: Users,
    title: "Choose your perspectives",
    copy: "Select the perspectives that fit your business—owner, customer and optionally employees.",
  },
  {
    icon: ClipboardCheck,
    title: "Collect honest responses",
    copy: "Share short, structured feedback from each perspective.",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: "Find the gaps and act",
    copy: "See where perspectives differ, understand what it means and get clear next steps.",
  },
];

const benefits = [
  {
    icon: FileText,
    title: "Clear Findings",
    copy: "Understand where perspectives agree and where they differ.",
    color: "bg-[#eaf5ff] text-[#1379f4]",
  },
  {
    icon: CircleAlert,
    title: "Priority Gaps",
    copy: "See which issues deserve attention first.",
    color: "bg-[#fff0ed] text-[#ff5d49]",
  },
  {
    icon: Check,
    title: "Practical Next Steps",
    copy: "Get recommendations you can review and act on.",
    color: "bg-[#e8f8ef] text-[#10a968]",
  },
];

export function LandingPage() {
  return (
    <>
      <section className="overflow-hidden bg-white">
        <div className="page-wrap grid min-h-[510px] items-stretch lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative z-10 flex flex-col justify-center py-12 pr-0 lg:py-14 lg:pr-6">
            <h1 className="max-w-[610px] text-[clamp(3rem,5.7vw,5.25rem)] font-black leading-[.94] tracking-[-.055em]">
              See your business from every angle.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-7 text-[#354f99]">
              Compare the perspectives that matter to your business—owner,
              employee and customer. Find the gaps. Act with clarity.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="btn-primary">
                Start a Business Diagnosis
              </Link>
              <Link to="/reports" className="btn-secondary">
                View Example Report
              </Link>
            </div>
          </div>

         <div className="relative min-h-[360px] overflow-hidden lg:-mr-[max(0px,calc((100vw-1180px)/2))]">
  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-24 bg-gradient-to-r from-white to-transparent lg:block" />

  <img
  src={heroImage}
  className="h-full w-full object-cover object-center lg:object-fill"
  alt="Business owner and colleagues reviewing business insights"
/>

  {/* Largest gap */}
  <div
    className="
      absolute bottom-[82px] left-3
      max-w-[calc(100%_-_1.5rem)]
      rounded-xl bg-white px-3 py-2.5
      shadow-[0_12px_30px_rgba(9,28,78,.18)]
      sm:bottom-auto sm:left-auto sm:right-[26%] sm:top-7
      sm:px-4 sm:py-3
    "
  >
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff0ed] text-[#ff5d49]">
        <CircleAlert size={20} />
      </span>

      <div>
        <div className="text-[11px] font-bold text-[#66729b]">
          Largest gap
        </div>

        <div className="text-sm font-extrabold text-[#0a1d54]">
          Customer communication
        </div>
      </div>
    </div>
  </div>

  {/* First action */}
  <div
    className="
      absolute bottom-4 right-3
      rounded-xl bg-white px-3 py-2.5
      shadow-[0_12px_30px_rgba(9,28,78,.18)]
      sm:bottom-6 sm:right-5 sm:px-4 sm:py-3
    "
  >
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10a968] text-white">
        <Check size={20} />
      </span>

      <b className="text-sm text-[#072b85]">
        First action identified
      </b>
    </div>
  </div>
</div>
</div>
      </section>
      
      <section
        id="measure"
        className="relative z-10 bg-white shadow-[0_12px_28px_rgba(7,20,63,0.07)]"
      >
        <div className="page-wrap grid gap-2 py-5 md:grid-cols-3">
          {[
            [
              Users,
              "Flexible Perspectives",
              "Owner and customer—with employees when relevant.",
              "bg-[#eaf5ff] text-[#1379f4]",
            ],
            [
              Target,
              "4 Business Areas",
              "People, operations, customers and digital readiness.",
              "bg-[#fff0ed] text-[#ff5d49]",
            ],
            [
              CalendarCheck,
              "Clear Next Steps",
              "Prioritised actions, clearly explained.",
              "bg-[#e8f8ef] text-[#10a968]",
            ],
          ].map(([Icon, title, copy, iconColor], index) => (
            <div
              key={String(title)}
              className={`flex items-center gap-4 px-2 py-3 ${
                index < 2 ? "md:border-r md:border-[#d9e2ef]" : ""
              }`}
            >
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconColor}`}
              >
                <Icon size={27} />
              </span>

              <div>
                <h3 className="font-extrabold !text-[#072b85]">
                  {title as string}
                </h3>

                <p className="mt-1 text-sm leading-5 !text-[#2d4797]">
                  {copy as string}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* <section id="measure" className="border-b bg-white">
        <div className="page-wrap grid gap-2 py-5 md:grid-cols-3">
          {[
            [
              Users,
              "Flexible Perspectives",
              "Owner and customer—with employees when relevant.",
              "bg-[#eaf5ff] text-[#1379f4]",
            ],
            [
              Target,
              "4 Business Areas",
              "People, operations, customers and digital readiness.",
              "bg-[#fff0ed] text-[#ff5d49]",
            ],
            [
              CalendarCheck,
              "Clear Next Steps",
              "Prioritised actions, clearly explained.",
              "bg-[#e8f8ef] text-[#10a968]",
            ],
          ].map(([Icon, title, copy, color], index) => (
            <div
              className={`flex items-center gap-4 !text-[#072b85] px-2 py-3 ${index < 2 ? "md:border-r" : ""}`}
              key={String(title)}
            >
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${color}`}
              >
                <Icon size={27} />
              </span>
              <div>
                <h3 className="font-extrabold">{title as string}</h3>
                <p className="mt-1 text-sm leading-5 !text-[#2d4797]">
                  {copy as string}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      <main className="bg-[#fbfcff] py-14 sm:py-16">
        <div className="page-wrap">
          <section id="how">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              How it works
            </h2>
            <div className="mt-7 grid gap-4 md:grid-cols-3 !text-[#072b85]">
              {steps.map(({ icon: Icon, title, copy }, index) => (
                <div className="card p-6" key={title}>
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf5ff] text-lg font-black !text-[#2d4797]">
                      {index + 1}
                    </span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf5ff] text-[#1379f4]">
                      <Icon size={25} />
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold">{title}</h3>
                  <p className="mt-2 leading-6 text-[#2d4797]">{copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Use the perspectives that fit your business.
            </h2>
            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[22px] border border-[#ffdcd5] bg-[#fff8f6] p-6 sm:p-8">
                <span className="rounded-full bg-[#ffe4df] px-4 py-2 text-xs font-black text-[#ed4c38]">
                  OWNER-LED BUSINESS
                </span>
                <h3 className="mt-5 text-2xl font-black text-[#072b85]">
                  Owner + Customer
                </h3>
                <p className="mt-2 max-w-md leading-6 text-[#2d4797]">
                  Understand how your view compares with what customers
                  experience.
                </p>
                <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center text-[#072b85">
                  <Perspective icon={UserRound} label="Owner" color="blue" />
                  <div className="h-14 border-l border-dashed border-[#90a3ca]" />
                  <Perspective
                    icon={UserRound}
                    label="Customer"
                    color="coral"
                  />
                </div>
              </div>
              <div className="rounded-[22px] border border-[#cfe7ff] bg-[#f1f8ff] p-6 sm:p-8">
                <span className="rounded-full bg-[#ddecff] px-4 py-2 text-xs font-black text-[#1379f4]">
                  BUSINESS WITH A TEAM
                </span>
                <h3 className="mt-5 text-2xl font-black text-[#072b85]">
                  Owner + Employee + Customer
                </h3>
                <p className="mt-2 max-w-lg leading-6 text-[#2d4797]">
                  See where leadership, team experience and customer
                  expectations differ.
                </p>
                <div className="mt-8 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center text-[#072b85]">
                  <Perspective icon={UserRound} label="Owner" color="blue" />
                  <div className="h-14 border-l border-dashed border-[#90a3ca]" />
                  <Perspective
                    icon={UsersRound}
                    label="Employees"
                    sublabel="(optional)"
                    color="green"
                  />
                  <div className="h-14 border-l border-dashed border-[#90a3ca]" />
                  <Perspective
                    icon={UserRound}
                    label="Customer"
                    color="coral"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              What you'll receive
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {benefits.map(({ icon: Icon, title, copy, color }) => (
                <div
                  className="card flex items-center gap-4 p-5 text-[#072b85] "
                  key={title}
                >
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${color}`}
                  >
                    <Icon size={26} />
                  </span>
                  <div>
                    <h3 className="font-extrabold">{title}</h3>
                    <p className="mt-1 text-sm leading-5 text-[#2d4797]">
                      {copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            id="about"
            className="mt-6 overflow-hidden rounded-[22px] border border-[#cae5ff] bg-[#eaf6ff]"
          >
            <div className="grid items-stretch lg:grid-cols-[.72fr_1.28fr]">
              <img
                src={advisorImage}
                alt="Small-business owner using the Growth Advisor"
                className="h-full min-h-[230px] w-full object-cover object-center"
              />
              <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_.8fr]">
                <div>
                  <div className="text-xs font-black uppercase tracking-[.12em] text-[#1379f4]">
                    Growth Advisor
                  </div>
                  <h2 className="mt-3 text-3xl font-black leading-tight">
                    Understand your results.
                    <br />
                    Decide what comes next.
                  </h2>
                </div>
                <div className="rounded-2xl border border-[#d8e5f5] bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3 text-[#566892]">
                    <Search className="text-[#193a80]" size={21} />
                    <span>What should I focus on first?</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <section className="bg-[#fbfcff] pb-5">
        <div className="page-wrap rounded-[18px] bg-[#ff5d49] px-6 py-6 text-white sm:px-9">
          <div className="grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
            <ChartNoAxesColumnIncreasing size={54} strokeWidth={2.5} />
            <div className="md:border-l md:border-white/50 md:pl-7">
              <h2 className="text-2xl font-extrabold">
                Ready to see your business more clearly?
              </h2>
              <p className="mt-1 text-white/85">
                Choose the perspectives that fit your business and begin your
                first diagnosis.
              </p>
            </div>
            <div className="grid min-w-[200px] gap-2">
              <Link
                to="/signup"
                className="rounded-xl bg-white px-5 py-3 text-center font-extrabold !text-[#0a1d54]"
              >
                Start Diagnosis
              </Link>
              <Link
                to="/reports"
                className="rounded-xl border border-white px-5 py-3 text-center font-extrabold text-white"
              >
                View Example Report
              </Link>
            </div>
          </div>
        </div>
      </section>
<footer className="bg-[#071a45] py-8 text-white sm:py-10">
  <div
    className="
      page-wrap grid grid-cols-2 gap-x-6 gap-y-7
      sm:grid-cols-2 sm:gap-8
      lg:grid-cols-[1.7fr_.8fr_.7fr_.75fr_1.25fr]
    "
  >
    <div className="col-span-2 sm:col-span-1">
      <Logo inverse />

      <p className="mt-3 text-xs text-blue-100">
        Clear perspectives. Better business decisions.
      </p>
    </div>

    <div>
      <FooterLinks
        title="Product"
        links={[
          "How It Works",
          "What We Measure",
          "Example Report",
        ]}
      />
    </div>

    <div>
      <FooterLinks
        title="Company"
        links={["About", "Contact"]}
      />
    </div>

    <div className="col-span-2 sm:col-span-1">
      <FooterLinks
        title="Legal"
        links={["Privacy", "Terms"]}
      />
    </div>

    <div
      className="
        col-span-2 border-t border-white/20 pt-5
        text-xs leading-5 text-blue-100
        sm:col-span-1 sm:border-t-0 sm:pt-0
        lg:border-l lg:pl-7
      "
    >
      © 2026 GrowthLens 360. All rights reserved.
      <br />
      Built to help small businesses act with clarity.
    </div>
  </div>
</footer>
    </>
  );
}

function Perspective({
  icon: Icon,
  label,
  sublabel,
  color,
}: {
  icon: typeof UserRound;
  label: string;
  sublabel?: string;
  color: "blue" | "green" | "coral";
}) {
  const styles = {
    blue: "bg-[#dff0ff] text-[#1379f4]",
    green: "bg-[#ddf7ea] text-[#10a968]",
    coral: "bg-[#ffe7e1] text-[#ff5d49]",
  };
  return (
    <div>
      <span
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${styles[color]}`}
      >
        <Icon size={31} />
      </span>
      <div className="mt-3 font-extrabold">{label}</div>
      {sublabel && <div className="text-sm text-[#53689e]">{sublabel}</div>}
    </div>
  );
}

function FooterLinks({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="font-extrabold">{title}</h3>
      <div className="mt-3 grid gap-1.5 text-xs text-blue-100">
        {links.map((link) => (
          <a
            href={
              link === "How It Works"
                ? "/#how"
                : link === "What We Measure"
                  ? "/#measure"
                  : "#"
            }
            key={link}
          >
            {link}
          </a>
        ))}
      </div>
    </div>
  );
}
