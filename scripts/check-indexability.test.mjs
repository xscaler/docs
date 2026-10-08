import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);
const checkerPath = path.resolve('scripts/check-indexability.mjs');
const siteUrl = 'https://docs.xscalerlabs.com';
const validFiles = {
  'index.html': '<!doctype html><html><head><title>Docs</title></head><body><a href="/search">Search</a></body></html>',
  'search.html': '<!doctype html><html><head><meta name="robots" content="noindex, follow"></head><body>Search</body></html>',
  'sitemap.xml': `<urlset><url><loc>${siteUrl}/</loc></url></urlset>`,
  'robots.txt': `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
};

async function runChecker(overrides = {}) {
  const buildDirectory = await mkdtemp(path.join(tmpdir(), 'indexability-'));
  try {
    for (const [file, content] of Object.entries({...validFiles, ...overrides})) {
      if (content === null) continue;
      const filePath = path.join(buildDirectory, file);
      await mkdir(path.dirname(filePath), {recursive: true});
      await writeFile(filePath, content);
    }
    try {
      const result = await execFileAsync(process.execPath, [checkerPath, buildDirectory]);
      return {exitCode: 0, ...result};
    } catch (error) {
      return {exitCode: error.code, stdout: error.stdout, stderr: error.stderr};
    }
  } finally {
    await rm(buildDirectory, {recursive: true, force: true});
  }
}

test('accepts public docs and a crawlable noindex search outside the sitemap', async () => {
  const result = await runChecker();
  assert.equal(result.exitCode, 0, result.stderr);
});

test('rejects internal documents even when omitted from navigation and sitemap', async () => {
  const result = await runChecker({'superpowers/specs/future-design.html': '<h1>Internal design</h1>'});
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /Internal build output/);
});

test('rejects links to removed internal routes', async () => {
  const result = await runChecker({'index.html': '<a href="/superpowers/plans/future-plan">Plan</a>'});
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /public link to internal source/);
});

for (const route of ['/search', '/search/', '/superpowers/plans/future-plan']) {
  test(`rejects non-indexable sitemap route ${route}`, async () => {
    const result = await runChecker({'sitemap.xml': `<urlset><url><loc>${siteUrl}${route}</loc></url></urlset>`});
    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /Non-indexable sitemap URL/);
  });
}

for (const metadata of [
  '<meta property="robots" content="noindex, follow">',
  '<meta name="robots" content="index, follow">',
  '<meta name="robots" content="noindex, nofollow">',
]) {
  test(`rejects search metadata ${metadata}`, async () => {
    const result = await runChecker({'search.html': `<head>${metadata}</head>`});
    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /Search must have/);
  });
}

test('requires the public search page to remain available', async () => {
  const result = await runChecker({'search.html': null});
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /Public search HTML is missing/);
});

test('rejects blocking search crawlers from seeing noindex', async () => {
  const result = await runChecker({'robots.txt': `${validFiles['robots.txt']}Disallow: /search\n`});
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /robots.txt must allow crawling/);
});
