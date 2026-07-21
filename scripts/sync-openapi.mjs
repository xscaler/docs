import {copyFile, mkdir, writeFile, access} from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';

const DEFAULT_SRC =
  '/Users/gamunu/work/xscaler/xscaler/services/portal-api/internal/publicapi/openapi.yaml';
const DEST = path.resolve('openapi/xscaler.yaml');

const source = process.env.SPEC_SRC ?? DEFAULT_SRC;

async function main() {
  await mkdir(path.dirname(DEST), {recursive: true});

  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(
        `failed to fetch spec from ${source}: ${response.status} ${response.statusText}`,
      );
    }
    const body = await response.text();
    await writeFile(DEST, body, 'utf8');
  } else {
    try {
      await access(source, constants.R_OK);
    } catch {
      throw new Error(`spec source not found or unreadable: ${source}`);
    }
    await copyFile(source, DEST);
  }

  console.log(`Synced OpenAPI spec from ${source} -> ${path.relative(process.cwd(), DEST)}`);
}

main().catch((error) => {
  console.error(`sync-openapi failed: ${error.message}`);
  process.exitCode = 1;
});
