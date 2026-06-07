import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  showText?: boolean;
  subtitle?: string;
  href?: string | null;
  className?: string;
};

export function Logo({
  size = 36,
  showText = true,
  subtitle,
  href = "/",
  className,
}: LogoProps) {
  const inner = (
    <>
      <Image
        src="/upside.png"
        alt="Upside"
        width={size}
        height={size}
        className="shrink-0"
        priority
      />
      {showText && (
        <div>
          <p className="display text-base font-bold leading-tight tracking-tight">Upside</p>
          {subtitle && <p className="text-[10px] text-[#64748b]">{subtitle}</p>}
        </div>
      )}
    </>
  );

  const classes = cn("flex items-center gap-2.5", className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return <div className={classes}>{inner}</div>;
}
