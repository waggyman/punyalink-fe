import {
  ArrowRight,
  BarChart3,
  Globe,
  Layers,
  LayoutDashboard,
  Link2,
  MousePointerClick,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";
import { getBaseDomain } from "@/lib/tenant";
import { Button } from "../components/ui/button";

const heroVisualLinks = ["Shop launch", "Press kit", "Book a call", "Latest drop"];

function getLandingFeatures(baseDomain: string) {
  return [
    {
      icon: Globe,
      title: "A link hub on your own subdomain",
      description:
        `Choose your slug on ${baseDomain} — every flyer, QR, Twitch panel, or recap ends on turf you fully control.`,
    },
    {
      icon: Link2,
      title: "Short links that arrive at the right place",
      description:
        "Turn cluttered URLs into clean slugs. Works for evergreen destinations and fast-moving launches alike.",
    },
    {
      icon: Layers,
      title: "Bundles for playlists, menus & campaigns",
      description:
        "Group destinations into curated collections perfect for recap pages, event kits, menus, or press drops.",
    },
    {
      icon: MousePointerClick,
      title: "Metrics tuned to taps, not fluff",
      description:
        "Track how often people open your store page versus how often they bounce out to outbound links.",
    },
    {
      icon: BarChart3,
      title: "A sane dashboard backstage",
      description:
        "Reorder links on the fly, toggle visibility or activity, tune branding—all without begging an engineer.",
    },
    {
      icon: LayoutDashboard,
      title: "Private links stay off the marquee",
      description:
        "Hide links from public discovery yet keep them humming for anyone holding the slug—VIP lists, testers, insiders.",
    },
  ] as const;
}

function getLandingSteps(baseDomain: string) {
  return [
    {
      n: "01",
      title: "Name your storefront",
      body: "Reserve a subdomain, verify your email with an OTP, and lock your password—all before you obsess over thumbnails.",
    },
    {
      n: "02",
      title: "Drop links & bundles fast",
      body: "Add destinations, previews, bundles, or quiet backstage links alongside the flashy ones destined for strangers.",
    },
    {
      n: "03",
      title: "Share one evergreen URL forever",
      body: `Your hub stays anchored at brand.${baseDomain} — swap what each tile surfaces without rewriting your bio link again.`,
    },
  ];
}

const personas = [
  {
    eyebrow: "Creators",
    headline: "One bio URL that survives every pivot.",
    quote:
      "Swap drops, donations, ticketing, playlists, merch, or fundraisers without losing whoever already follows that single link.",
    gradient: "from-fuchsia-500/90 to-violet-600",
  },
  {
    eyebrow: "Growing brands",
    headline: "Press-ready hubs without commissioning a brochure site.",
    quote:
      "Treat Punyalink as the launch cockpit: storefront polish up front for fans, ruthless redirect analytics behind the curtain.",
    gradient: "from-sky-500/90 to-indigo-600",
  },
  {
    eyebrow: "Communities",
    headline: "One stable door for onboarding flows.",
    quote:
      "Queue office hours forms, FAQs, onboarding docs, RSVP links—even quiet admin-only redirects when you need parity across channels.",
    gradient: "from-emerald-500/85 to-teal-600",
  },
];

function HeroVisual({ baseDomain }: { baseDomain: string }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-4 -right-4 h-72 w-72 rounded-full bg-purple-300/80 mix-blend-multiply blur-3xl opacity-70 animate-blob" />
      <div className="pointer-events-none absolute -bottom-8 -left-4 h-72 w-72 rounded-full bg-sky-300/80 mix-blend-multiply blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-red-400/90" />
            <span className="size-2.5 rounded-full bg-amber-400/90" />
            <span className="size-2.5 rounded-full bg-emerald-400/90" />
          </div>
          <div className="ml-2 flex flex-1 items-center gap-2 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground shadow-inner">
            <Sparkles className="size-3.5 shrink-0 text-violet-500" aria-hidden />
            <span className="truncate font-medium text-foreground">
              blossom.{baseDomain}
            </span>
          </div>
        </div>
        <div className="space-y-4 bg-gradient-to-br from-muted/35 via-background to-violet-50/40 px-6 py-8 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Public storefront
            </p>
            <p className="mt-3 text-xl font-semibold text-foreground md:text-2xl">
              Fresh drops • Studio diary • Booking
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Fans land here first. Flip tiles from the Punyalink dashboard whenever the storyline changes — no stale QR codes needed.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {heroVisualLinks.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {[
              { title: "One hub", subtitle: "All active links surfaced together" },
              { title: "Quiet edits", subtitle: "Reorder without renaming URLs" },
              { title: "Live analytics", subtitle: "Views opens & outbound clicks" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border bg-background/80 p-4 shadow-sm backdrop-blur-sm"
              >
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                <div className="mt-1 text-[13px] leading-snug text-muted-foreground">
                  {item.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const baseDomain = getBaseDomain();
  const devTenant = import.meta.env.VITE_DEV_TENANT;
  const year = new Date().getFullYear();

  const landingFeatures = getLandingFeatures(baseDomain);
  const steps = getLandingSteps(baseDomain);

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-sky-500 shadow-lg shadow-violet-500/25">
              <Link2 className="size-[22px] text-white" aria-hidden />
            </div>
            <div className="leading-tight">
              <p className="text-lg font-semibold tracking-tight">Punyalink</p>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                Link storefronts
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#why"
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950"
            >
              Why Punyalink
            </a>
            <a
              href="#how"
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950"
            >
              How it works
            </a>
            <a
              href="#fit"
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950"
            >
              Who it fits
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
              <a href="#how">Peek the flow</a>
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30 hover:bg-violet-600"
              asChild
            >
              <Link to="/register">
                Claim your hub
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-sky-50 px-6 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
            <div className="space-y-8">
              <p className="inline-flex items-center rounded-full bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 shadow-sm ring-1 ring-violet-200/70 backdrop-blur">
                Own your storefront URL on {baseDomain}
              </p>
              <h1 className="text-[2.65rem] font-bold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.55rem]">
                Your quickest path from idea to a clickable hub.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-neutral-600 md:text-xl">
                Punyalink gives creators and teams polished{" "}
                <strong className="font-semibold text-neutral-900">
                  link storefronts + short redirects
                </strong>{" "}
                anchored on their own subdomain. Share one memorable address while iterating mercilessly behind the curtain.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="group h-12 px-8 text-base shadow-lg shadow-violet-500/35 bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 hover:bg-violet-600"
                  asChild
                >
                  <Link to="/register" className="gap-2">
                    Spin yours up — it takes minutes
                    <ArrowRight
                      className="size-5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-7" asChild>
                  <a href="#why">Tour the toolkit</a>
                </Button>
              </div>
              <dl className="grid gap-4 text-sm sm:grid-cols-3">
                <div className="rounded-xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <dt className="font-semibold text-neutral-950">Audience-first UX</dt>
                  <dd className="mt-1 text-neutral-600">
                    Public pages load fast with mobile-conscious layouts borrowed from storefront design playbooks.
                  </dd>
                </div>
                <div className="rounded-xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <dt className="font-semibold text-neutral-950">Founder safeguards</dt>
                  <dd className="mt-1 text-neutral-600">
                    Email OTP plus password onboarding keeps dashboard edits gated to verified owners.
                  </dd>
                </div>
                <div className="rounded-xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <dt className="font-semibold text-neutral-950">Bundles + analytics</dt>
                  <dd className="mt-1 text-neutral-600">
                    Pair evergreen links with ephemeral bundles and sane view/click instrumentation.
                  </dd>
                </div>
              </dl>
            </div>
            <HeroVisual baseDomain={baseDomain} />
          </div>
        </section>

        <section id="why" className="scroll-mt-28 bg-white px-6 py-20 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <h2 className="text-[2rem] font-bold tracking-tight text-neutral-950 sm:text-4xl md:text-[2.5rem]">
                Behind one calm URL sits the whole playbook.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
                We obsessed over restless builders who churn through campaigns faster than brittle link spreadsheets can breathe.
              </p>
            </div>
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {landingFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-xl border border-neutral-100 p-7 transition-all hover:border-violet-200 hover:shadow-lg"
                  >
                    <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-violet-100 transition-colors group-hover:bg-violet-600">
                      <Icon
                        className="size-6 text-violet-600 transition-colors group-hover:text-white"
                        aria-hidden
                      />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold tracking-tight text-neutral-950">
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed text-neutral-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-28 bg-neutral-50 px-6 py-20 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
              <div>
                <h2 className="text-[2rem] font-bold tracking-tight text-neutral-950 sm:text-4xl">
                  From signup to swagger in three disciplined beats.
                </h2>
                <p className="mt-4 max-w-xl text-lg text-neutral-600">
                  No bloated questionnaires—just subdomain selection, OTP confirmation, dashboard access, then you get back to hustling outward.
                </p>
              </div>
              <div className="space-y-5">
                {steps.map((step) => (
                  <article
                    key={step.n}
                    className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-violet-500">
                      {step.n}
                    </span>
                    <h3 className="mt-3 text-xl font-semibold text-neutral-950">{step.title}</h3>
                    <p className="mt-3 leading-relaxed text-neutral-600">{step.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="fit" className="scroll-mt-28 bg-white px-6 py-20 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.36em] text-violet-500">
                Built for momentum
              </p>
              <h2 className="mt-3 text-[2rem] font-bold tracking-tight text-neutral-950 sm:text-4xl">
                Tailored energy for teams that never stop shipping.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
                Whether you orchestrate digital goods, hybrid retail, or decentralized communities, Punyalink keeps the exterior composed while the interior stays experimental.
              </p>
            </div>
            <div className="grid gap-7 md:grid-cols-3">
              {personas.map((persona) => (
                <div
                  key={persona.headline}
                  className="relative isolate overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-950 p-8 text-neutral-50 shadow-xl"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-95 ${persona.gradient}`}
                  />
                  <div className="relative flex h-full min-h-[220px] flex-col">
                    <p className="text-xs font-bold uppercase tracking-[0.34em] text-white/85">
                      {persona.eyebrow}
                    </p>
                    <h3 className="mt-4 text-xl font-semibold leading-snug md:text-[1.35rem]">
                      {persona.headline}
                    </h3>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-white/90">{persona.quote}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-violet-600 via-purple-600 to-sky-600 px-6 py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-2 text-center sm:px-6">
            <h2 className="text-[2rem] font-bold tracking-tight text-white sm:text-4xl md:text-[2.6rem]">
              Ready whenever you stop overthinking the tooling.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-purple-50/95">
              Register once from this marketing surface and parachute onto your subdomain login. Iterate links tonight, rinse whenever the roadmap shifts.
            </p>
            <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:justify-center sm:gap-6">
              <Button
                size="lg"
                className="group h-12 min-w-[220px] gap-2 border-transparent bg-white text-violet-700 hover:bg-purple-50"
                asChild
              >
                <Link to="/register">
                  Claim your storefront URL
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 min-w-[220px] border-white/85 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <a href="#how">Walk through onboarding</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-neutral-50 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-sky-500">
                <Link2 className="size-5 text-white" aria-hidden />
              </div>
              <div>
                <p className="text-lg font-semibold text-neutral-950">Punyalink</p>
                <p className="text-sm text-neutral-600">
                  Branded link storefronts for teams who obsess over outbound clarity.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm text-neutral-700">
            <div>
              <p className="font-semibold text-neutral-950">Owners</p>
              <div className="mt-2 space-y-1">
                <Button variant="link" className="h-auto px-0 py-0 text-violet-700" asChild>
                  <Link to="/register">Start registration</Link>
                </Button>
                <p className="max-w-[18rem] text-xs leading-relaxed text-neutral-500">
                  Existing stores sign in on{" "}
                  <code className="rounded-md bg-white px-1 py-0.5 text-neutral-900">
                    &lt;subdomain&gt;.{baseDomain}/login
                  </code>
                  .
                </p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-neutral-950">Developers</p>
              <p className="mt-2 max-w-[21rem] text-xs leading-relaxed text-neutral-500">
                Running locally?
                {devTenant ? (
                  <>
                    Simulate{" "}
                    <code className="rounded-md bg-white px-1 py-0.5 text-neutral-900">
                      {devTenant}
                    </code>{" "}
                    via env or browse{" "}
                    <code className="rounded-md bg-white px-1 py-0.5 text-neutral-900">
                      {devTenant}.localhost
                    </code>
                    .
                  </>
                ) : (
                  <>
                    Define{" "}
                    <code className="rounded-md bg-white px-1 py-0.5 text-neutral-900">
                      VITE_DEV_TENANT=slug
                    </code>{" "}
                    or use{" "}
                    <code className="rounded-md bg-white px-1 py-0.5 text-neutral-900">
                      slug.localhost
                    </code>
                    .
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-neutral-200 pt-8 text-center text-xs text-neutral-500">
          © {year} Punyalink — loud links, quiet infrastructure.
        </div>
      </footer>
    </div>
  );
}
