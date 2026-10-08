import { ArrowLeft, MessageCircle, UserRound, UsersRound } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Logo } from "../components/Logo";

export function AuthLayout() {
  const { pathname } = useLocation();
  const isLogin = pathname === "/login";
  const isForgot = pathname === "/forgot-password";
  const isReset = pathname === "/reset-password";
  const isSuccess = pathname === "/reset-success";
  const isRecovery = isForgot || isReset || isSuccess;
  const recoveryEyebrow = isForgot
    ? "Reset access"
    : isReset
      ? "Secure your account"
      : "Access restored";
  const recoveryCopy =
    isForgot
      ? "Enter the email linked to your account and we’ll send you a secure reset link."
      : isReset
        ? "Create a strong new password to protect your business insights."
        : "Your GrowthLens account is secure and ready when you are.";

  return (
    <main className="min-h-screen bg-[#f7f8fa] lg:grid lg:grid-cols-[49%_51%]">
      <div className="lg:hidden">
        <header className="flex items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <div className="[&_img]:h-10 [&_img]:max-w-[190px] sm:[&_img]:h-12 sm:[&_img]:max-w-[230px]">
            <Logo />
          </div>

          {!isSuccess && (
            <Link
              to={isRecovery ? "/login" : "/"}
              className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#1266e8] sm:text-base"
            >
              <ArrowLeft size={21} strokeWidth={2.4} />
              {isRecovery ? "Back to login" : "Back to home"}
            </Link>
          )}
        </header>

        <section
          className={`relative mx-4 overflow-hidden rounded-[22px] px-6 py-9 text-white shadow-[0_14px_36px_rgba(6,31,66,.16)] sm:mx-8 sm:px-8 sm:py-10 ${
            isLogin
              ? "bg-[linear-gradient(120deg,#ff674f_0%,#ff5848_58%,#ff6d55_100%)]"
              : "bg-[radial-gradient(circle_at_42%_48%,#0d3a6a_0%,#082b54_50%,#061f42_100%)]"
          }`}
        >
          {isLogin ? <MobileGrowthBars /> : <MobileOrbit />}

          <div className="relative z-10 max-w-[92%]">
            <p className="text-xs font-extrabold uppercase tracking-[.28em] text-white/90">
              {isLogin
                ? "Welcome back"
                : isRecovery
                  ? recoveryEyebrow
                  : "Get started"}
            </p>

            <h2 className="mt-5 text-[2rem] font-black leading-[1.03] tracking-[-.035em] sm:text-[2.35rem]">
              {isLogin ? (
                <>
                  Welcome back —
                  <br />
                  to clearer decisions.
                </>
              ) : isRecovery ? (
                isForgot ? (
                  <>
                    <span className="text-[#c7f044]">Regain clarity</span>
                    <span className="text-[#ff674f]">.</span>
                  </>
                ) : isReset ? (
                  <>
                    <span className="text-[#c7f044]">Move forward</span>
                    <span className="text-[#ff674f]">.</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#c7f044]">Clarity</span>
                    <br />
                    continues<span className="text-[#ff674f]">.</span>
                  </>
                )
              ) : (
                <>
                  See your business
                  <br />
                  from <span className="text-[#8fd128]">every angle.</span>
                </>
              )}
            </h2>

            <p className="mt-5 max-w-[570px] text-[15px] leading-6 text-white/95 sm:text-base">
              {isLogin
                ? "Return to your assessments, insights and next actions."
                : isRecovery
                  ? recoveryCopy
                  : "Compare owner, employee and customer perspectives. Find the gaps. Act with clarity."}
            </p>
          </div>
        </section>
      </div>

      <section
        className={
          isLogin
            ? "relative hidden min-h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_48%,#0d3a6a_0%,#082b54_43%,#061f42_100%)] px-12 text-white lg:flex lg:items-center xl:px-20"
            : "hidden"
        }
      >
        <DesktopDecisionOrbit />

        <div className="relative z-10 max-w-[620px]">
          <h2 className="text-[clamp(3rem,4.5vw,4.8rem)] font-black leading-[.98] tracking-[-.04em]">
            Welcome back
            <br />
            to clearer decisions<span className="text-[#ff674f]">.</span>
          </h2>

          <p className="mt-7 max-w-[590px] text-[clamp(1.25rem,1.7vw,1.8rem)] leading-[1.4] text-white/95">
            Return to your assessments, insights and next actions.
          </p>
        </div>
      </section>

      <section
        className={
          isRecovery
            ? "relative hidden min-h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_48%,#0d3a6a_0%,#082b54_43%,#061f42_100%)] px-12 text-white lg:flex lg:items-center xl:px-20"
            : "hidden"
        }
      >
        <DesktopDecisionOrbit />

        <div className="relative z-10 max-w-[660px]">
          <h2 className="text-[clamp(3rem,4.5vw,4.8rem)] font-black leading-[.98] tracking-[-.04em]">
            {isForgot ? (
              <>
                Reset access<span className="text-[#ff674f]">.</span>
                <br />
                <span className="text-[#c7f044]">Regain clarity</span>
                <span className="text-[#8fd128]">.</span>
              </>
            ) : isReset ? (
              <>
                Secure your account<span className="text-[#ff674f]">.</span>
                <br />
                <span className="text-[#c7f044]">Move forward</span>
                <span className="text-[#8fd128]">.</span>
              </>
            ) : (
              <>
                Access restored<span className="text-[#ff674f]">.</span>
                <br />
                <span className="text-[#c7f044]">Clarity continues</span>
                <span className="text-[#8fd128]">.</span>
              </>
            )}
          </h2>

          <p className="mt-7 max-w-[620px] text-[clamp(1.25rem,1.7vw,1.8rem)] leading-[1.4] text-white/95">
            {recoveryCopy}
          </p>
        </div>
      </section>

      <section
        className={
          isLogin || isRecovery
            ? "hidden"
            : "relative hidden min-h-screen overflow-hidden bg-[radial-gradient(circle_at_48%_48%,#0d3a6a_0%,#082b54_44%,#061f42_100%)] px-10 py-10 text-white lg:flex lg:flex-col xl:px-14 xl:py-12"
        }
      >
        <div className="relative z-10 [&_img]:h-[74px] xl:[&_img]:h-[88px]">
          <Logo inverse />
        </div>

        <div className="relative z-10 mt-[9vh] max-w-[650px]">
          <h2 className="text-[clamp(3rem,4.7vw,5rem)] font-black leading-[.94] tracking-[-.045em]">
            See your business
            <br />
            from <span className="text-[#8fd128]">every angle.</span>
          </h2>

          <p className="mt-7 max-w-[620px] text-[clamp(1.2rem,1.7vw,1.8rem)] leading-[1.45] text-white/95">
            Compare owner, employee and customer perspectives. Find the gaps.
            Act with clarity.
          </p>
        </div>

        <div className="relative z-10 mx-auto mt-10 h-[280px] w-full max-w-[640px] xl:mt-12">
          <div className="absolute left-1/2 top-0 flex w-[258px] -translate-x-1/2 items-center gap-5 rounded-xl bg-white px-5 py-4 text-[#07143f] shadow-[0_18px_40px_rgba(0,0,0,.18)]">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#ff5d49] text-white">
              <UserRound size={34} />
            </span>
            <div className="flex-1">
              <strong className="text-lg font-black tracking-[.08em]">OWNER</strong>
              <div className="mt-3 h-1.5 w-full rounded bg-[#d3d8df]" />
              <div className="mt-2 h-1.5 w-3/4 rounded bg-[#d3d8df]" />
            </div>
          </div>

          <div className="absolute left-1/2 top-[108px] h-[90px] w-1 -translate-x-1/2 bg-[#ff5d49]" />
          <div className="absolute left-[28%] top-[182px] h-1 w-[25%] origin-right -rotate-[31deg] bg-[#ff5d49]" />
          <div className="absolute right-[28%] top-[182px] h-1 w-[25%] origin-left rotate-[31deg] bg-[#8fd128]" />

          <div className="absolute left-1/2 top-[145px] z-10 h-[70px] w-[70px] -translate-x-1/2 rounded-full bg-[#8fd128] shadow-[0_12px_25px_rgba(0,0,0,.18)]" />

          <PerspectiveCard
            className="bottom-0 left-0"
            title="EMPLOYEE"
            color="green"
            icon={UsersRound}
          />

          <PerspectiveCard
            className="bottom-0 right-0"
            title="CUSTOMER"
            color="coral"
            icon={MessageCircle}
          />
        </div>

        <p className="relative z-10 mt-auto text-sm font-semibold uppercase leading-7 tracking-[.23em] text-white/90">
          Clearer perspectives.
          <br />
          Stronger businesses.
        </p>

        <div className="pointer-events-none absolute -bottom-32 -left-40 h-[460px] w-[460px] rounded-full border border-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -left-24 h-[340px] w-[340px] rounded-full border border-white/5" />
      </section>

      <section className="flex items-center justify-center px-4 py-7 sm:px-8 sm:py-9 lg:min-h-screen lg:px-12 lg:py-10 xl:px-[5.3rem]">
        <div className="w-full max-w-[680px] rounded-[22px] border border-[#e0e5ee] bg-white px-6 py-8 shadow-[0_18px_55px_rgba(21,40,87,.08)] sm:px-10 sm:py-10 lg:border-white lg:shadow-[0_24px_70px_rgba(21,40,87,.09)] xl:px-[3.8rem] xl:py-[3rem]">
          {(isLogin || isRecovery) && (
            <div className="mb-9 hidden justify-center lg:flex lg:[&_img]:h-[76px] lg:[&_img]:max-w-none">
              <Logo />
            </div>
          )}
          <Outlet />
        </div>
      </section>
    </main>
  );
}

function MobileGrowthBars() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 w-[48%] opacity-20">
      <span className="absolute bottom-0 left-[3%] h-[27%] w-[19%] rounded-t-xl bg-white" />
      <span className="absolute bottom-0 left-[28%] h-[42%] w-[19%] rounded-t-xl bg-white" />
      <span className="absolute bottom-0 left-[53%] h-[61%] w-[19%] rounded-t-xl bg-white" />
      <span className="absolute bottom-0 left-[78%] h-[86%] w-[19%] rounded-t-xl bg-white" />
    </div>
  );
}

function DesktopDecisionOrbit() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] max-h-[760px] w-[78%] max-w-[760px] -translate-x-1/2 -translate-y-1/2 opacity-25">
      <div className="absolute inset-0 rounded-full border-[18px] border-[#155a9b]" />
      <div className="absolute inset-[17%] rounded-full border-[16px] border-[#155a9b]" />
      <span className="absolute -left-5 top-[47%] h-16 w-16 rounded-full bg-[#ff674f]" />
      <span className="absolute right-[9%] top-[6%] h-20 w-20 rounded-full bg-[#8fd128]" />
      <span className="absolute bottom-[7%] right-[8%] h-[72px] w-[72px] rounded-full bg-[#155a9b]" />
      <span className="absolute left-[24%] top-[22%] h-16 w-16 rounded-full bg-[#155a9b]" />
      <span className="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8fd128]" />
    </div>
  );
}

function MobileOrbit() {
  return (
    <div className="pointer-events-none absolute -right-[72px] top-5 h-[220px] w-[220px] opacity-85 sm:-right-10 sm:top-3 sm:h-[250px] sm:w-[250px]">
      <div className="absolute inset-0 rounded-full border-[5px] border-[#1261ac]" />
      <div className="absolute inset-[43px] rounded-full border-[5px] border-[#1261ac]" />
      <span className="absolute left-[4px] top-[96px] h-7 w-7 rounded-full bg-[#ff674e]" />
      <span className="absolute right-[28px] top-[13px] h-7 w-7 rounded-full bg-[#8fd128]" />
      <span className="absolute bottom-[17px] right-[26px] h-7 w-7 rounded-full bg-[#12559a]" />
      <span className="absolute left-[57px] top-[51px] h-7 w-7 rounded-full bg-[#12559a]" />
      <span className="absolute left-1/2 top-1/2 h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8fd128]" />
    </div>
  );
}

function PerspectiveCard({
  className,
  title,
  color,
  icon: Icon,
}: {
  className: string;
  title: string;
  color: "green" | "coral";
  icon: typeof UsersRound;
}) {
  const iconColor =
    color === "green" ? "bg-[#8fd128] text-white" : "bg-[#ff5d49] text-white";

  return (
    <div
      className={`absolute flex w-[238px] items-center gap-4 rounded-xl bg-white px-5 py-4 text-[#07143f] shadow-[0_18px_40px_rgba(0,0,0,.18)] ${className}`}
    >
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconColor}`}
      >
        <Icon size={31} />
      </span>
      <div className="flex-1">
        <strong className="text-base font-black tracking-[.08em]">{title}</strong>
        <div className="mt-3 h-1.5 w-full rounded bg-[#d3d8df]" />
        <div className="mt-2 h-1.5 w-3/4 rounded bg-[#d3d8df]" />
      </div>
    </div>
  );
}
