import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import WhitepaperDemo from "@/components/WhitepaperDemo";

export const metadata: Metadata = {
  title: "Whitepaper · Fern",
  description:
    "Fern is building scalable evaluation and RL environments for general robot policies — high-fidelity, action-conditioned simulators learned end-to-end from real robot data.",
  openGraph: {
    title: "Whitepaper · Fern",
    description:
      "Scalable evaluation and RL environments for general robot policies, learned end-to-end from real robot data.",
    url: "https://fern.bot/whitepaper",
    siteName: "fern.bot",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Whitepaper · Fern",
    description:
      "Scalable evaluation and RL environments for general robot policies, learned end-to-end from real robot data.",
  },
};

export default function Whitepaper() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-neutral-900">
      {/* Top nav — same column width as the article so the logo sits flush
          with the body copy below. */}
      <header className="mx-auto flex w-full max-w-[720px] items-center justify-between px-6 pb-4 pt-10 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-neutral-700 transition hover:text-neutral-900"
        >
          <Image
            src="/fern-logo-bw.svg"
            alt="Fern"
            width={28}
            height={28}
            priority
          />
          <span className="font-[family-name:var(--font-serif)] text-base">
            Fern
          </span>
        </Link>
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500 transition hover:text-neutral-900"
        >
          ← Home
        </Link>
      </header>

      {/* Generous left/right gutter at every viewport — the global reset in
          `globals.css` zeroes default element padding, so this padding has
          to come from the container. `max-w-[680px]` is the readable measure
          for body prose; figures and tables happily fill it. */}
      <article className="mx-auto w-full max-w-[680px] px-6 pb-24 pt-6 sm:px-8 lg:px-10">
        {/* Hero */}
        <section className="border-b border-neutral-200 pb-14 pt-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Whitepaper · v0.1 · April 2026
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-serif)] text-[34px] leading-[1.15] text-neutral-900 sm:text-[44px]">
            Learned simulators for evaluating
            <br className="hidden sm:inline" /> general robot policies
          </h1>
          <p className="mt-7 text-[15px] leading-[1.75] text-neutral-700">
            Fern is building scalable evaluation and reinforcement-learning
            environments for robotics. We train high-fidelity, action-conditioned
            world models from real robot data, so any policy can be benchmarked
            and improved without ever running on physical hardware.
          </p>
        </section>

        {/* The problem */}
        <Section title="The problem with evaluating robot policies">
          <Body>
            General robot policies are improving fast — but the way we measure
            them hasn&rsquo;t. The dominant evaluation methodology is still
            &ldquo;put it on a real robot, run a few rollouts, eyeball the
            results.&rdquo; That has three problems.
          </Body>
          <List
            items={[
              <>
                <strong>It doesn&rsquo;t scale.</strong> Each evaluation costs
                operator time, hardware wear, and resets between trials.
                Comparing two checkpoints meaningfully takes hours, not seconds.
              </>,
              <>
                <strong>It isn&rsquo;t reproducible.</strong> Lighting, object
                placements, and contact dynamics drift between sessions, so two
                research groups can&rsquo;t compare numbers directly.
              </>,
              <>
                <strong>It isn&rsquo;t safe to optimize against.</strong>{" "}
                Reinforcement learning needs millions of rollouts. Doing those
                on hardware is slow, expensive, and dangerous.
              </>,
            ]}
          />
          <Body>
            The same problems were solved for game-playing agents and language
            models with simulators and benchmark suites. Robotics doesn&rsquo;t
            have either yet — not because nobody tried, but because hand-built
            physics simulators don&rsquo;t cover the full visual and contact
            distribution of the real world. Sim2real is hard for a reason.
          </Body>
        </Section>

        {/* Approach */}
        <Section title="A simulator learned end-to-end from real data">
          <Body>
            Instead of writing a simulator, we learn one. Given a starting
            image and a stream of actions, our model rolls out future frames
            that match what would have happened on the real robot. The physics
            isn&rsquo;t hand-coded — every contact, every shadow, every cable
            and gripper finger is something the model has seen during training.
          </Body>
          <List
            items={[
              <>
                <strong>High-fidelity images.</strong> The simulator outputs
                256&times;256 RGB frames at the same effective rate as the
                real teleop trajectories that trained it.
              </>,
              <>
                <strong>Action-conditioned.</strong> Drive it with the same
                end-effector commands you&rsquo;d send a real bimanual setup;
                the rollout responds to your input frame-by-frame.
              </>,
              <>
                <strong>No real robot needed.</strong> Once the model is
                trained, every researcher gets the same physics — no shipping
                hardware, no calibration drift, no operator queue.
              </>,
              <>
                <strong>Apples-to-apples comparison.</strong> Two policies,
                one identical environment, one identical starting state. We
                plan to host these benchmarks publicly so the field can move
                from anecdotal to quantitative comparisons.
              </>,
            ]}
          />
        </Section>

        {/* GT vs sim videos — rope PoC (Wang et al. data with our new
            architecture) followed by OpenArm 4-camera 16-DoF (the same
            architecture scaled up on first-party data). */}
        <Section title="What it looks like">
          <Body>
            Two clips from the validation set.{" "}
            <strong>Left half</strong>{" "}
            is the real robot recording;{" "}
            <strong>right half</strong>{" "}
            is the model&rsquo;s rollout from the same starting frame and
            the same action stream — never seen during training.
          </Body>

          {/* Rope clip — single-camera proof of concept */}
          <figure className="mt-6 overflow-hidden rounded-2xl bg-black ring-1 ring-black/10">
            <video
              src="/videos/rope_gt_vs_sim.mp4"
              poster="/images/rope_gt_vs_sim_poster.png"
              autoPlay
              loop
              muted
              playsInline
              controls
              preload="metadata"
              style={{ width: "100%", display: "block", aspectRatio: "516 / 256" }}
            />
            <figcaption className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              <div className="px-4 py-3 text-center">Ground truth</div>
              <div className="px-4 py-3 text-center">Generated</div>
            </figcaption>
          </figure>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
            bimanual rope · validation episode br_0000
          </p>
          <Body>
            The clip above is from a proof-of-concept model we trained on
            the bimanual teleop dataset from{" "}
            <a
              href="https://www.yixuanwang.me/interactive_world_sim/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-900 underline decoration-neutral-300 underline-offset-2 transition hover:decoration-neutral-700"
            >
              Wang et&nbsp;al.&rsquo;s <em>Interactive World Simulator</em>
            </a>{" "}
            project. We took inspiration from that work but trained it with
            a different, more scalable architecture: a single
            diffusion-forcing transformer handling all four task families
            through one unified action head at 256&times;256 RGB. The two
            streams stay aligned through the full 20-second episode.
          </Body>

          {/* OpenArm 4-cam, 16-DoF — same architecture scaled up */}
          <Body>
            Since then we&rsquo;ve scaled that architecture to a 16-DoF
            action space and four synchronized camera views — which required
            novel techniques for keeping the views physically consistent
            with each other. To our knowledge, the clip below is the first
            published world model that handles a production-scale bimanual
            setup end-to-end in a single network:
          </Body>
          <List
            items={[
              <>
                <strong>16-DoF action conditioning.</strong>{" "}
                Joint-space commands, not a reduced end-effector
                parameterization.
              </>,
              <>
                <strong>Four synchronized camera views.</strong>{" "}
                Left wrist, right wrist, chest, and waist — generated jointly
                and consistent across views frame by frame.
              </>,
              <>
                <strong>First-party data.</strong>{" "}
                Collected by Fern on an OpenArm — the open-source 16-DoF
                bimanual robot from Anvil — not a retrofit of a public
                benchmark.
              </>,
            ]}
          />
          <figure className="mt-6 overflow-hidden rounded-2xl bg-black ring-1 ring-black/10">
            <video
              src="/videos/openarm_4cam_gt_vs_gen.mp4"
              poster="/images/openarm_4cam_gt_vs_gen_poster.png"
              autoPlay
              loop
              muted
              playsInline
              controls
              preload="metadata"
              style={{ width: "100%", display: "block", aspectRatio: "2 / 1" }}
            />
            <figcaption className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              <div className="px-4 py-3 text-center">Ground truth</div>
              <div className="px-4 py-3 text-center">Generated</div>
            </figcaption>
          </figure>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
            OpenArm · 4-view validation episode
          </p>
          <Body>
            All four views stay coherent with each other across the episode
            — gripper poses, cloth geometry, and scene background line up
            across cameras the way physics requires.
          </Body>
        </Section>

        {/* Live demo */}
        <Section title="Try it yourself">
          <Body>
            The simulator below is the same model running live on a single cloud
            GPU. Click <em>Start the demo</em>, then steer the bimanual setup
            with the keyboard. Every frame you see is generated on demand from
            the actions you send — there&rsquo;s no recorded video being
            replayed.
          </Body>
          <Body>
            <strong>This demo is a proof of concept.</strong> It&rsquo;s pinned
            to a single multi-task checkpoint trained on a public open dataset,
            served just to prove the architecture and the live-driving loop
            work end-to-end in a browser.
          </Body>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-neutral-500">
            Note: the GPU is shared. If the canvas takes a moment to come live,
            it&rsquo;s likely already in use by someone else.
          </p>
          <div className="mt-6">
            <WhitepaperDemo />
          </div>
        </Section>

        {/* Roadmap + audience / call to action. Combines the internal R&D
            workstreams (architecture, first-party data, custom customer
            models) with the user-facing surfaces (public benchmarks, RL
            envs). They share a single narrative — the demo is the PoC, this
            is where it goes. */}
        <Section title="What&rsquo;s next">
          <Body>What we&rsquo;re actively working on:</Body>
          <List
            items={[
              <>
                <strong>Architecture R&amp;D.</strong>{" "}
                We&rsquo;re actively iterating on the model architecture for
                decreasing sim-to-real gap, longer horizon stability, lower
                per-frame latency, and sharper contact physics.
              </>,
              <>
                <strong>First-party data collection.</strong>{" "}
                We&rsquo;re recording our own bimanual teleoperation in-house
                on a growing fleet of robots — expanding the base
                model&rsquo;s coverage of grippers, contact regimes, and scene
                diversity well beyond what any single open dataset provides.
              </>,
              <>
                <strong>Custom world models for customers.</strong>{" "}
                Most robotics companies already have terabytes of teleoperation
                data sitting in cold storage from training their own policies.
                We re-purpose that data to fit a world model on their specific
                embodiments and tasks, so they can evaluate and RL-train their
                checkpoints against <em>their</em> physics, not a generic one.
              </>,
              <>
                <strong>Public benchmarks.</strong>{" "}
                A growing catalog of evaluation tasks — manipulation,
                navigation, mobile manipulation — hosted on this site. Submit
                a policy, get a leaderboard placement, see exactly where it
                succeeds and fails.
              </>,
              <>
                <strong>RL environments.</strong>{" "}
                The same world models exposed as Gym-style environments for
                offline + online RL. Train against learned physics, deploy to
                real robots without ever burning hardware time on bad
                policies.
              </>,
            ]}
          />
          <Body>
            We&rsquo;re building this for three kinds of teams.{" "}
            <strong>Policy developers</strong> who want their checkpoints
            evaluated end-to-end on a managed cloud platform, without standing
            up their own robot fleet.{" "}
            <strong>RL researchers</strong>{" "}
            who want Gym-style environments backed by learned physics, so
            training runs don&rsquo;t need real hardware in the loop. And{" "}
            <strong>robotics companies</strong> who want a custom world model
            fitted to their own embodiments and existing teleop data — so
            evaluation and RL training happen in <em>their</em> physics, not
            a generic one. If any of those describe you, reach out at founders@fern.bot.
          </Body>
        </Section>

        <footer className="mt-16 flex items-center justify-between border-t border-neutral-200 pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
          <span>&copy; {new Date().getFullYear()} Ishiki Labs</span>
          <Link
            href="/"
            className="transition hover:text-neutral-700"
          >
            ← Home
          </Link>
        </footer>
      </article>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-neutral-200 py-14 last:border-b-0">
      <h2 className="mb-6 font-[family-name:var(--font-serif)] text-[26px] leading-[1.2] text-neutral-900 sm:text-[30px]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-[15px] leading-[1.75] text-neutral-700 first:mt-0">
      {children}
    </p>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-5 space-y-3.5">
      {items.map((it, i) => (
        <li
          key={i}
          className="relative pl-5 text-[15px] leading-[1.75] text-neutral-700 before:absolute before:left-0 before:top-[12px] before:h-[5px] before:w-[5px] before:rounded-full before:bg-neutral-400"
        >
          {it}
        </li>
      ))}
    </ul>
  );
}

