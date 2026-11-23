import { site } from "@/data/site";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="mx-auto grid min-h-[66svh] max-w-6xl content-center px-5 pt-16 pb-24 sm:px-8"
    >
      <h2 id="contact-title" className="section-label">
        Contact
      </h2>
      <a
        href={`mailto:${site.email}`}
        className="my-[clamp(2rem,5vw,5rem)] w-fit max-w-full text-[clamp(1.6rem,7.35vw,7rem)] leading-none font-[640] tracking-[-0.045em] [overflow-wrap:anywhere] transition-colors hover:text-muted"
      >
        {site.email}
      </a>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-3 border-t border-line pt-5 text-sm text-muted">
        <p>{site.location}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Social links">
          {site.links.map(({ label, href }) => (
            <li key={href}>
              <a className="link" href={href}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
