// scripts/build.mjs
// Compiles src/App.tsx → index.html using esbuild, in-place, with the
// existing index.html's HEAD / toolbar / PWA / Service-Worker preserved.
//
// Strategy: find the <!-- Game bundle ... --><script>...</script> block
// in index.html and replace its contents with the freshly-bundled output.
//
// Run locally:   node scripts/build.mjs
// Run in CI:     GitHub Actions calls this on push to src/**

import { build } from 'esbuild';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';

const TMP_BUNDLE = '.build.tmp.js';

await build({
  entryPoints: ['src/App.tsx'],
  bundle: true,
  format: 'iife',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  target: 'es2020',
  alias: { 'react': './src/react-shim.ts' },
  outfile: TMP_BUNDLE,
  logLevel: 'info',
});

const compiled = readFileSync(TMP_BUNDLE, 'utf-8');
unlinkSync(TMP_BUNDLE);

const html = readFileSync('index.html', 'utf-8');
const re = /  <!-- Game bundle[^>]*-->\s*<script>([\s\S]*?)  <\/script>/;
if (!re.test(html)) {
  throw new Error('Could not find <!-- Game bundle --> anchor in index.html');
}
const newBlock = '  <!-- Game bundle (compiled from src/App.tsx via esbuild) -->\n  <script>\n' + compiled + '\n  </script>';
const newHtml = html.replace(re, newBlock);

if (newHtml === html) {
  console.log('No change to index.html');
} else {
  writeFileSync('index.html', newHtml);
  const oldSize = Buffer.byteLength(html, 'utf-8');
  const newSize = Buffer.byteLength(newHtml, 'utf-8');
  console.log(`index.html: ${oldSize} → ${newSize} bytes (${((newSize-oldSize)/1024).toFixed(1)} KB)`);
}
