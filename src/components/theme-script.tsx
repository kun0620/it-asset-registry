/**
 * Inline, synchronous script — must run before first paint so the page
 * never flashes the wrong theme. Kept as the very first element in <body>
 * so the browser executes it while still parsing, ahead of any rendered
 * content. No next/script or client component here on purpose: both would
 * defer past first paint.
 */
const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('wdi-theme');
    var mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    var dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
