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

        {/* GT vs sim video */}
        <Section title="What it looks like">
          <Body>
            Below: a clip from the validation set. <strong>Left half</strong> is
            the real robot recording (ground truth). <strong>Right half</strong>{" "}
            is the model&rsquo;s rollout, conditioned on the same starting frame
            and the same action stream — never seen during training. The model
            never gets to peek at the GT pixels; everything on the right is
            generated.
          </Body>
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
            {/* Two labels split 50/50 to mirror the GT / generated split inside
                the video frame itself. Centered over each half, separated by
                a hairline divider that lines up with the mid-seam of the clip. */}
            <figcaption className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              <div className="px-4 py-3 text-center">Ground truth</div>
              <div className="px-4 py-3 text-center">Generated</div>
            </figcaption>
          </figure>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
            bimanual rope · validation episode br_0000
          </p>
          <Body>
            The two streams stay aligned through the entire 20-second episode
            — the model has learned the rope&rsquo;s contact dynamics, the
            arms&rsquo; reachable workspace, and the gripper&rsquo;s closing
            geometry from teleoperation alone.
          </Body>
        </Section>

        {/* How it's trained */}
        <Section title="How the model is trained">
          <Body>
            Training data comes from the bimanual teleoperation dataset released
            by{" "}
            <a
              href="https://www.yixuanwang.me/interactive_world_sim/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-900 underline decoration-neutral-300 underline-offset-2 transition hover:decoration-neutral-700"
            >
              Wang et&nbsp;al.&rsquo;s <em>Interactive World Simulator</em>
            </a>{" "}
            project — four task families (T pushing, rope routing, mug grasping,
            pile sweeping) collected on a bimanual teleop rig. We share that
            project&rsquo;s core motivation — learn physics from real interaction
            data so policies can be evaluated and trained without burning
            hardware — but train it with a fundamentally different and more
            scalable architecture: a single <em>diffusion-forcing transformer</em>{" "}
            that handles all four task families through one unified action head,
            at 256&times;256 RGB output, in place of one specialist model per task
            at lower resolution.
          </Body>
          <Body>
            Concretely, the simulator denoises next-frame latents in a
            latent-VAE-encoded image space, conditioned on the past frames and
            the action history. Headline numbers from the current checkpoint:
          </Body>

          <Table
            rows={[
              ["Backbone", "DiT3D · 12 layers · 768 hidden · 12 heads · RoPE-3D"],
              ["Patch size", "2 × 2 latent patches · 4-channel SD-VAE latents"],
              ["Diffusion", "Cosine continuous schedule · v-prediction · 1000 train timesteps"],
              ["Sampling", "DDIM · 20 steps at inference · sigmoid loss weighting"],
              ["Resolution", "256 × 256 RGB output · 32 × 32 × 4 latents"],
              ["Sequence", "16-frame context window · frame-skip 2 (5 Hz effective)"],
              ["Action conditioning", "8-D end-effector deltas + grippers · 2 arms × 4 dims"],
              ["Optimizer", "AdamW · lr 7.5e-5 · betas (0.9, 0.99) · grad-clip 1.0"],
              ["Precision", "bf16-mixed · EMA 0.9999 · 50 epochs · batch 24"],
            ]}
          />

          <Body>
            The action vector is the same one you&rsquo;d send a real bimanual
            setup: 3-D end-effector translation deltas plus a continuous gripper
            command, per arm. We pad smaller scenes (push-T, single-arm grasp)
            with zeros so all four task families share one head, which lets the
            model transfer contact priors between them — pushing in push-T helps
            it learn arm-rope contacts, and vice versa.
          </Body>

          <Body>
            Inference runs at about{" "}
            <strong>3.5 frames per second on a single modern GPU</strong>, with
            end-to-end latency under 300&thinsp;ms per generated frame. That&rsquo;s
            fast enough that a researcher can drive the simulator interactively
            from their laptop, the way you&rsquo;d drive a video game — which
            is exactly what the demo below does.
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
            a generic one. If any of those describe you, reach out.
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

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-neutral-200 bg-white/60">
      <table className="w-full border-collapse text-[13px]">
        <tbody>
          {rows.map(([k, v], i) => (
            <tr
              key={k}
              className={i < rows.length - 1 ? "border-b border-neutral-200" : ""}
            >
              <td className="w-[40%] px-4 py-2.5 font-mono text-[12px] uppercase tracking-wider text-neutral-500">
                {k}
              </td>
              <td className="px-4 py-2.5 text-neutral-800">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
