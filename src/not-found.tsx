export const notFoundTitle = "Not found, Hezaerd";

export function NotFound() {
  return (
    <section className="mx-auto flex min-h-[80svh] max-w-6xl flex-col justify-center px-5 sm:px-8">
      <p className="text-[clamp(5rem,20vw,14rem)] leading-none font-[700] tracking-[-0.06em] [font-stretch:115%]">
        404
      </p>
      <p className="mt-6 max-w-md text-lg text-muted">Nothing here. The light never reached this page.</p>
      <a href="/" className="link mt-8 w-fit text-foreground">
        Back home
      </a>
    </section>
  );
}

export function NotFoundWithTitle() {
  return (
    <>
      <title>{notFoundTitle}</title>
      <NotFound />
    </>
  );
}
