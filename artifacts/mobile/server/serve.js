/**
 * Static web server for the Expo web export (dist/).
 *
 * Serves the SPA produced by `expo export --platform web` so visitors can open
 * the deployed URL in any browser — no Expo Go, no native app required.
 *
 * On wide viewports, the app is wrapped client-side in a phone-shaped frame
 * so desktop visitors see a realistic mobile mockup. On narrow viewports
 * (real phones) and inside iframes (e.g. the Replit canvas), the app renders
 * full-bleed as before.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const STATIC_ROOT = path.resolve(__dirname, "..", "dist");
const basePath = (process.env.BASE_PATH || "/").replace(/\/+$/, "");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json",
};

const PHONE_WRAPPER_SCRIPT = `
<script>
(function () {
  try {
    if (window.top !== window.self) return;
    if (window.matchMedia('(max-width: 700px)').matches) return;
    if (location.search.indexOf('embed=1') !== -1) return;

    var url = location.pathname + (location.search ? location.search + '&' : '?') + 'embed=1' + location.hash;
    var html =
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>SAGE</title>' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<link rel="icon" href="' + (${JSON.stringify(basePath)} || "") + '/favicon.ico">' +
      '<style>' +
      '  html, body { margin: 0; padding: 0; height: 100%; background: radial-gradient(ellipse at top, #eef2ff 0%, #e0e7ff 40%, #c7d2fe 100%); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif; }' +
      '  .stage { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 16px; box-sizing: border-box; gap: 20px; }' +
      '  .brand { text-align: center; color: #1e1b4b; }' +
      '  .brand h1 { margin: 0 0 6px; font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }' +
      '  .brand p { margin: 0; font-size: 14px; color: #4338ca; opacity: 0.85; }' +
      '  .phone { position: relative; width: 402px; height: 874px; max-height: calc(100vh - 140px); aspect-ratio: 402 / 874; background: #0b0b0f; border-radius: 56px; padding: 14px; box-shadow: 0 40px 80px -20px rgba(30, 27, 75, 0.45), 0 0 0 2px rgba(255,255,255,0.4) inset, 0 0 0 6px #1c1c22 inset; box-sizing: border-box; }' +
      '  .phone::before { content: ""; position: absolute; top: 22px; left: 50%; transform: translateX(-50%); width: 110px; height: 32px; background: #0b0b0f; border-radius: 20px; z-index: 2; pointer-events: none; }' +
      '  .screen { width: 100%; height: 100%; border-radius: 42px; overflow: hidden; background: #ffffff; position: relative; }' +
      '  .screen iframe { width: 100%; height: 100%; border: 0; display: block; background: #ffffff; }' +
      '  .footer { color: #4338ca; font-size: 12px; opacity: 0.7; }' +
      '  @media (max-height: 920px) { .phone { width: calc((100vh - 160px) * (402/874)); } }' +
      '</style></head><body>' +
      '<div class="stage">' +
      '  <div class="brand"><h1>SAGE</h1><p>Continuously monitoring 30 residents</p></div>' +
      '  <div class="phone"><div class="screen"><iframe src="' + url + '" title="SAGE" allow="clipboard-read; clipboard-write"></iframe></div></div>' +
      '  <div class="footer">Open this link on your phone for the full mobile experience</div>' +
      '</div></body></html>';

    document.open();
    document.write(html);
    document.close();
  } catch (e) {
    /* if anything fails, fall through to the normal app */
  }
})();
</script>
`;

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  if (ext === ".html") {
    let content = fs.readFileSync(filePath, "utf-8");
    if (!content.includes("data-phone-wrapper")) {
      content = content.replace(
        /<body([^>]*)>/i,
        `<body$1><span data-phone-wrapper hidden></span>${PHONE_WRAPPER_SCRIPT}`,
      );
    }
    res.writeHead(200, { "content-type": contentType });
    res.end(content);
    return;
  }

  const content = fs.readFileSync(filePath);
  res.writeHead(200, { "content-type": contentType });
  res.end(content);
}

const indexPath = path.join(STATIC_ROOT, "index.html");

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  let pathname = url.pathname;

  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(STATIC_ROOT, safePath);

  if (!filePath.startsWith(STATIC_ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return sendFile(filePath, res);
  }

  if (fs.existsSync(indexPath)) {
    return sendFile(indexPath, res);
  }

  res.writeHead(404);
  res.end("Not Found");
});

const port = parseInt(process.env.PORT || "3000", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`Serving Expo web build from ${STATIC_ROOT} on port ${port}`);
});
