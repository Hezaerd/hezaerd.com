/**
 * Regenerates public/og-image.png to match the portfolio hero treatment.
 *
 * Usage: bun scripts/generate-og.ts
 *
 * Fonts are downloaded once into scripts/og-fonts/ (OFL).
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
  background: "#111111",
  foreground: "#eeeeee",
  primary: "#ffe0c2",
  muted: "#b4b4b4",
} as const;

const FONT_DIR = join(import.meta.dir, "og-fonts");
const OUT = join(import.meta.dir, "../public/og-image.png");

const FONTS = [
  {
    file: "BricolageGrotesque-Bold.ttf",
    url: "https://cdn.jsdelivr.net/fontsource/fonts/bricolage-grotesque@5.2.8/latin-700-normal.ttf",
    name: "Bricolage Grotesque",
    weight: 700 as const,
  },
  {
    file: "IBMPlexMono-Medium.ttf",
    url: "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-mono@5.2.5/latin-500-normal.ttf",
    name: "IBM Plex Mono",
    weight: 500 as const,
  },
  {
    file: "SourceSans3-Regular.ttf",
    url: "https://cdn.jsdelivr.net/fontsource/fonts/source-sans-3@5.2.8/latin-400-normal.ttf",
    name: "Source Sans 3",
    weight: 400 as const,
  },
] as const;

async function ensureFonts() {
  await mkdir(FONT_DIR, { recursive: true });

  for (const font of FONTS) {
    const path = join(FONT_DIR, font.file);
    try {
      await access(path);
    } catch {
      const res = await fetch(font.url);
      if (!res.ok) {
        throw new Error(`Failed to download ${font.file}: ${res.status}`);
      }
      await writeFile(path, Buffer.from(await res.arrayBuffer()));
      console.log(`Downloaded ${font.file}`);
    }
  }
}

async function main() {
  await ensureFonts();

  const fontData = await Promise.all(
    FONTS.map(async (f) => ({
      ...f,
      data: await readFile(join(FONT_DIR, f.file)),
    })),
  );

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.background,
          backgroundImage:
            "radial-gradient(ellipse 70% 55% at 50% 45%, #1a1612 0%, #111111 70%)",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                padding: "0 80px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontFamily: "Bricolage Grotesque",
                      fontSize: 96,
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                      color: COLORS.foreground,
                      lineHeight: 1.05,
                    },
                    children: "Hezaerd",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontFamily: "IBM Plex Mono",
                      fontSize: 28,
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                      color: COLORS.primary,
                      lineHeight: 1.2,
                    },
                    children: "Full-stack engineer",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontFamily: "Source Sans 3",
                      fontSize: 28,
                      fontWeight: 400,
                      color: COLORS.muted,
                      lineHeight: 1.45,
                      textAlign: "center",
                      maxWidth: 720,
                      marginTop: 8,
                    },
                    children:
                      "Projects, experiments, résumé, and creative work.",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: fontData.map((f) => ({
        name: f.name,
        data: f.data,
        weight: f.weight,
        style: "normal" as const,
      })),
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  });
  const png = resvg.render().asPng();
  await writeFile(OUT, png);
  console.log(`Wrote ${OUT} (${png.byteLength} bytes)`);
}

await main();
