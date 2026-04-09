import Image from "next/image";
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

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div
          className="flex aspect-square max-w-lg flex-col items-center justify-center rounded-3xl bg-white/70 text-center shadow-[0_0_80px_-20px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.03] backdrop-blur-md"
          style={{ width: "min(90vw, 520px)", padding: "2.5rem" }}
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
            className="whitespace-nowrap font-[family-name:var(--font-serif)] text-3xl leading-[1.3] text-neutral-900 sm:text-4xl"
            style={{ marginTop: "3rem" }}
          >
            Enabling physical AI at scale
          </h1>
        </div>

        <p className="absolute bottom-6 text-xs text-neutral-300">
          &copy; {new Date().getFullYear()} Ishiki Labs, Inc.
        </p>
      </div>
    </div>
  );
}
