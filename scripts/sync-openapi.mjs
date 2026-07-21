import {copyFile, mkdir, writeFile, access} from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';

const DEST = path.resolve('openapi/xscaler.yaml');

// The spec source is the portal-api file in the monorepo, or any http(s) URL
// that serves it (e.g. the live /v1/openapi.yaml). It is deliberately not
// defaulted to a checkout-specific path so this works the same for everyone and
// in CI; the caller must point SPEC_SRC at their spec.
const source = process.env.SPEC_SRC;

if (!source) {
  console.error(
    'sync-openapi: set SPEC_SRC to the OpenAPI spec source (a file path or an http(s) URL).\n' +
      '  file: SPEC_SRC=../xscaler/services/portal-api/internal/publicapi/openapi.yaml npm run sync:spec\n' +
      '  url:  SPEC_SRC=https://api.xscalerlabs.com/v1/openapi.yaml npm run sync:spec',
  );
  process.exit(1);
}

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
