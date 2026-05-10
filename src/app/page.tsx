import Image from "next/image";
import Link from "next/link";
import ParticleField from "@/components/ParticleField";
import CursorGlow from "@/components/CursorGlow";

function YCBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-2 py-1">
      <span className="text-sm text-neutral-400">Backed by</span>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0"
      >
        <rect width="24" height="24" rx="4" fill="#F26522" />
        <path
          d="M12.3 14.4V17.5H11.1V14.4L7.5 7.5H8.9L11.7 13L14.5 7.5H15.9L12.3 14.4Z"
          fill="white"
        />
      </svg>
      <span className="-ml-0.5 text-sm font-medium text-neutral-700">Combinator</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa]">
      <ParticleField />
      <CursorGlow />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div
          className="flex max-w-xl flex-col items-center rounded-3xl bg-white/70 text-center shadow-[0_0_80px_-20px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.03] backdrop-blur-md"
          style={{ width: "min(92vw, 600px)", padding: "2.5rem" }}
        >
          <YCBadge />

          <Image
            src="/fern-logo-bw.svg"
            alt="Fern"
            width={120}
            height={120}
            style={{ marginTop: "3rem" }}
            priority
          />

          <h1
            className="font-[family-name:var(--font-serif)] text-4xl leading-[1.15] text-neutral-900 sm:text-5xl sm:leading-[1.1]"
            style={{ marginTop: "3rem" }}
          >
            Enabling physical AI at scale
          </h1>

          <h2 className="mt-6 font-[family-name:var(--font-serif)] text-xl leading-[1.4] text-neutral-700 sm:text-2xl sm:leading-[1.4]">
            Run your robot evals on high-fidelity environments built from your
            training data, or on real hardware.
          </h2>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://calendly.com/robert-ishikilabs/fern-eval-platform-intro-call"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition hover:bg-neutral-700"
            >
              <span>Schedule a meeting</span>
              <span
                aria-hidden
                className="translate-x-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>

            <Link
              href="/whitepaper"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-900 ring-1 ring-neutral-300 transition hover:bg-neutral-100"
            >
              <span>Whitepaper</span>
              <span
                aria-hidden
                className="translate-x-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>

        <p className="mt-8 text-xs text-neutral-300">
          &copy; {new Date().getFullYear()} Ishiki Labs, Inc.
        </p>
      </div>
    </div>
  );
}
