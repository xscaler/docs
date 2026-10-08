import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {parse} from 'parse5';

const buildDirectory = path.resolve(process.argv[2] ?? 'build');
const siteUrl = 'https://docs.xscalerlabs.com';
const failures = [];

async function findFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? findFiles(entryPath) : [entryPath];
  }));
  return files.flat();
}

function visit(node, callback) {
  callback(node);
  node.childNodes?.forEach((child) => visit(child, callback));
}

function attribute(node, name) {
  return node.attrs?.find((entry) => entry.name === name)?.value;
}

function isInternalPath(pathname) {
  return pathname.split('/').includes('superpowers');
}

function isSearchPath(pathname) {
  return pathname === '/search' || pathname.startsWith('/search/');
}

const files = await findFiles(buildDirectory);
let searchFound = false;

for (const file of files) {
  const relativePath = path.relative(buildDirectory, file).split(path.sep).join('/');
  if (isInternalPath(relativePath)) {
    failures.push(`Internal build output: ${relativePath}`);
  }
  if (!file.endsWith('.html')) continue;

  const isSearch = relativePath === 'search.html' || relativePath === 'search/index.html';
  let searchNoindex = false;
  visit(parse(await readFile(file, 'utf8')), (node) => {
    if (isSearch && node.nodeName === 'meta' && attribute(node, 'name')?.toLowerCase() === 'robots') {
      const directives = (attribute(node, 'content') ?? '').toLowerCase().split(/[\s,]+/);
      searchNoindex ||= directives.includes('noindex') && !directives.includes('nofollow');
    }
    if (node.nodeName === 'a') {
      const href = attribute(node, 'href');
      if (!href) return;
      const url = new URL(href, `${siteUrl}/${relativePath}`);
      if (url.origin === siteUrl && isInternalPath(url.pathname)) {
        failures.push(`${relativePath}: public link to internal source ${url.pathname}`);
      }
    }
  });
  if (isSearch) {
    searchFound = true;
    if (!searchNoindex) failures.push('Search must have a name="robots" noindex directive and allow following links');
  }
}

if (!searchFound) failures.push('Public search HTML is missing');

const sitemap = await readFile(path.join(buildDirectory, 'sitemap.xml'), 'utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (locations.length === 0) failures.push('Sitemap contains no public URLs');
for (const location of locations) {
  const url = new URL(location);
  if (isInternalPath(url.pathname) || isSearchPath(url.pathname)) {
    failures.push(`Non-indexable sitemap URL: ${location}`);
  }
}

// Keep the small crawl policy explicit: no crawler is blocked from seeing noindex.
const robots = await readFile(path.join(buildDirectory, 'robots.txt'), 'utf8');
const directives = robots.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
const expectedRobots = ['User-agent: *', 'Allow: /', `Sitemap: ${siteUrl}/sitemap.xml`];
if (directives.length !== expectedRobots.length || directives.some((line, index) => line !== expectedRobots[index])) {
  failures.push('robots.txt must allow crawling and advertise the canonical docs sitemap');
}

if (failures.length > 0) {
  console.error('Invalid publishing/indexability policy:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Publishing boundary and search indexability valid across ${files.length} build files.`);
}
