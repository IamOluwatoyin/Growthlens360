import { Link } from "react-router-dom";
import logo from "../assets/growthlens-logo.png";
import inverseLogo from "../assets/growthlens-logo-inverse.png";


type LogoProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function Logo({
  compact = false,
  inverse = false,
}: LogoProps) {
  const size = compact
    ? "h-10 sm:h-11"
    : "h-12 sm:h-14";

  const appearance = inverse
    ? ""
    : "saturate-[1.45] contrast-[1.18]";

  return (
    <Link
      to="/"
      aria-label="GrowthLens 360 home"
      className="inline-flex shrink-0 items-center"
    >
      <img
        src={inverse ? inverseLogo : logo}
        alt="GrowthLens 360"
        className={`${size} ${appearance} w-auto max-w-[240px] object-contain`}
      />
    </Link>
  );
}