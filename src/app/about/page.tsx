import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">About NeurelPress</h1>
      <p className="mt-4 text-sm uppercase tracking-[0.2em] text-primary">
        AI-first publishing for serious engineers
      </p>

      <section className="mt-8 space-y-4 text-base leading-relaxed text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">NeurelPress</span> is a
          focused publishing platform for people who build with data, machine
          learning, and modern software. It is designed to feel as simple as
          writing in a notebook, while giving you the distribution, structure,
          and AI tooling of a serious technical publication.
        </p>
        <p>
          Our goal is to make it effortless for engineers, researchers, and
          founders to share real-world experience: design docs, postmortems,
          research notes, deep dives, and hard‑won lessons from shipping applied
          AI systems.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">What you can do with NeurelPress</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Write long‑form articles</span>{" "}
            in a clean, distraction‑free editor with Markdown support, image
            embedding, and keyboard shortcuts that work on both macOS and Windows.
          </li>
          <li>
            <span className="font-medium text-foreground">Use AI as an editor</span> —
            get suggested titles, summaries, and tags powered by Gemini or
            Mistral, then refine them before publishing.
          </li>
          <li>
            <span className="font-medium text-foreground">Build your technical profile</span>{" "}
            with a public identity page that highlights your headline, bio, tech
            stack, links (GitHub, LinkedIn, personal site), and publishing stats.
          </li>
          <li>
            <span className="font-medium text-foreground">Curate references</span> by
            attaching books and resources from the Library to your articles, so
            readers can go deeper on the underlying theory and practice.
          </li>
          <li>
            <span className="font-medium text-foreground">Explore the ecosystem</span>{" "}
            through tags, trending articles, and the library – built to surface
            practical AI engineering work instead of generic content.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Our motto</h2>
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">
            &ldquo;Ship knowledge, not noise.&rdquo;
          </span>{" "}
          NeurelPress is intentionally opinionated: we optimize for depth,
          clarity, and reproducibility. Articles should help someone build,
          debug, or reason about a real system — not just repeat documentation.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">For the AI &amp; tech community</h2>
        <p className="text-muted-foreground">
          The platform is built with the belief that open, high‑quality writing
          moves the AI community forward: it makes new ideas legible, lets
          people learn from each other&apos;s mistakes, and gives individual
          engineers a voice beyond big‑tech blog posts and marketing decks.
        </p>
        <p className="text-muted-foreground">
          Whether you are documenting a new model architecture, explaining a
          production incident, or teaching fundamentals to the next generation,
          NeurelPress is meant to be your home on the web for serious,
          long‑lived technical writing.
        </p>
      </section>

      <section className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
        <p>
          Ready to share something?{" "}
          <Link href="/write" className="text-primary underline-offset-4 hover:underline">
            Start a new article
          </Link>{" "}
          or{" "}
          <Link href="/explore" className="text-primary underline-offset-4 hover:underline">
            explore what others are publishing
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

