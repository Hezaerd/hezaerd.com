import { site } from "@/data/site";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="mx-auto max-w-6xl px-5 pt-[clamp(5rem,13svh,9rem)] pb-[clamp(6rem,18svh,14rem)] sm:px-8"
    >
      <h2 id="about-title" className="section-label">
        About
      </h2>
      <blockquote className="mt-[clamp(2rem,5vw,5rem)] max-w-[16ch] text-[clamp(2.65rem,6.2vw,6.15rem)] leading-[0.98] font-[640] tracking-[-0.045em]">
        {site.hero}
      </blockquote>
      <div className="mt-[clamp(2rem,5vw,4.5rem)] ml-auto max-w-[37rem] text-[clamp(1rem,1.43vw,1.25rem)] leading-relaxed">
        {site.bio.map((paragraph) => (
          <p key={paragraph} className="mb-4">
            {paragraph}
          </p>
        ))}
        <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted" aria-label="Skills">
          {site.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
