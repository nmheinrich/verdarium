// Downloads the licensed TAY Roony display face into public/fonts before a build.
// The font is never committed (the repo is public). Its source is a private,
// signed URL in TAYROONY_WOFF2_URL: a Vercel build env var, or .env.local locally.
// Without it the build still succeeds and headings fall back to Newsreader.
import { access, mkdir, writeFile } from "node:fs/promises";

const OUTPUT = "public/fonts/TAYRoony.woff2";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Optional file.
  }
}

const source = process.env.TAYROONY_WOFF2_URL;
const isProduction = process.env.VERCEL_ENV === "production";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!source) {
    console.warn(
      "[fonts] TAYROONY_WOFF2_URL is not set; headings will use the Newsreader fallback.",
    );
    return;
  }

  if (!isProduction && (await exists(OUTPUT))) {
    console.log("[fonts] TAY Roony already present.");
    return;
  }

  const response = await fetch(source);

  if (!response.ok) {
    throw new Error(`download failed with HTTP ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());

  if (bytes.subarray(0, 4).toString("latin1") !== "wOF2") {
    throw new Error("downloaded file is not a WOFF2 font");
  }

  await mkdir("public/fonts", { recursive: true });
  await writeFile(OUTPUT, bytes);
  console.log(`[fonts] TAY Roony downloaded (${bytes.length} bytes).`);
}

main().catch((error) => {
  // A missing display face must never take production down; it degrades to Newsreader.
  console.warn(`[fonts] Could not fetch TAY Roony: ${error.message}`);
});
