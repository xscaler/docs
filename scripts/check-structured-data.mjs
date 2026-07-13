import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {parse} from 'parse5';

const buildDirectory = path.resolve(process.argv[2] ?? 'build');

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findHtmlFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : [];
    }),
  );
  return files.flat();
}

function findJsonLdScripts(node, results = []) {
  if (node.nodeName === 'script') {
    const typeAttribute = node.attrs?.find((attribute) => attribute.name === 'type');
    if (typeAttribute?.value.trim().toLowerCase() === 'application/ld+json') {
      results.push(
        node.childNodes?.map((child) => child.value ?? '').join('') ?? '',
      );
    }
  }

  node.childNodes?.forEach((child) => findJsonLdScripts(child, results));
  return results;
}

function findBreadcrumbLists(value, results = []) {
  if (!value || typeof value !== 'object') {
    return results;
  }

  const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
  if (types.includes('BreadcrumbList')) {
    results.push(value);
  }

  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      child.forEach((item) => findBreadcrumbLists(item, results));
    } else {
      findBreadcrumbLists(child, results);
    }
  }
  return results;
}

const failures = [];
const htmlFiles = await findHtmlFiles(buildDirectory);

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  for (const jsonLd of findJsonLdScripts(parse(html))) {
    let structuredData;
    try {
      structuredData = JSON.parse(jsonLd);
    } catch (error) {
      failures.push(`${path.relative(buildDirectory, file)}: malformed JSON-LD (${error.message})`);
      continue;
    }

    for (const breadcrumbList of findBreadcrumbLists(structuredData)) {
      if (
        !Array.isArray(breadcrumbList.itemListElement) ||
        breadcrumbList.itemListElement.length === 0
      ) {
        failures.push(
          `${path.relative(buildDirectory, file)}: BreadcrumbList requires a non-empty itemListElement`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error('Invalid structured data:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Structured data valid across ${htmlFiles.length} HTML files.`);
}
