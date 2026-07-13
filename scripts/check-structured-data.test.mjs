import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);
const checkerPath = path.resolve('scripts/check-structured-data.mjs');

async function runChecker(html) {
  const buildDirectory = await mkdtemp(path.join(tmpdir(), 'structured-data-'));
  await writeFile(path.join(buildDirectory, 'index.html'), html);

  try {
    const result = await execFileAsync(process.execPath, [checkerPath, buildDirectory]);
    return {exitCode: 0, ...result};
  } catch (error) {
    return {
      exitCode: error.code,
      stdout: error.stdout,
      stderr: error.stderr,
    };
  } finally {
    await rm(buildDirectory, {recursive: true, force: true});
  }
}

test('rejects an empty BreadcrumbList when the type attribute contains whitespace', async () => {
  const result = await runChecker(`
    <script type = "application/ld+json">
      {"@type":"BreadcrumbList","itemListElement":[]}
    </script>
  `);

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /requires a non-empty itemListElement/);
});

test('ignores data-type attributes on non-JSON-LD scripts', async () => {
  const result = await runChecker(`
    <script data-type="application/ld+json">not JSON</script>
  `);

  assert.equal(result.exitCode, 0);
});

test('recognises a quoted type attribute regardless of casing or ordering', async () => {
  const result = await runChecker(`
    <script nonce="test" TYPE = 'APPLICATION/LD+JSON' data-name="schema">
      {"@type":"BreadcrumbList","itemListElement":[]}
    </script>
  `);

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /requires a non-empty itemListElement/);
});

test('does not read a type assignment inside another quoted attribute', async () => {
  const result = await runChecker(`
    <script data-note=" type=text/plain" type="application/ld+json">
      {"@type":"BreadcrumbList","itemListElement":[]}
    </script>
  `);

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /requires a non-empty itemListElement/);
});

test('does not treat a type assignment inside another attribute as JSON-LD', async () => {
  const result = await runChecker(`
    <script data-note=" type=application/ld+json" type="text/plain">not JSON</script>
  `);

  assert.equal(result.exitCode, 0);
});

test('rejects an empty BreadcrumbList when @type is an array', async () => {
  const result = await runChecker(`
    <script type="application/ld+json">
      {"@type":["Thing","BreadcrumbList"],"itemListElement":[]}
    </script>
  `);

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /requires a non-empty itemListElement/);
});

test('rejects an empty BreadcrumbList nested in @graph', async () => {
  const result = await runChecker(`
    <script type="application/ld+json">
      {"@graph":[{"@type":"BreadcrumbList","itemListElement":[]}]}
    </script>
  `);

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /requires a non-empty itemListElement/);
});

test('rejects malformed JSON-LD', async () => {
  const result = await runChecker(`
    <script type="application/ld+json">{"@type":</script>
  `);

  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /malformed JSON-LD/);
});
