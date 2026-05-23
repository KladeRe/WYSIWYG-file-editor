const htmlSample = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Sample</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <h1>Hello World</h1>
    <p>This is a sample HTML file.</p>
  </body>
</html>`;

const cssSample = `.sv-root {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  color: #111827;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.sv-root h1 {
  color: #2563eb;
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.sv-root p {
  line-height: 1.4;
  text-align: center;
}
`;

// Export rendered HTML (body-only) combined with CSS so it can be injected
export const RENDERED_HTML = (() => {
	const bodyMatch = htmlSample.match(/<body[^>]*>([\s\S]*)<\/body>/i);
	const body = bodyMatch ? bodyMatch[1] : htmlSample;

	// Reset styles to prevent inheritance from the page into the shadow root.
	// Keep this minimal and then reapply the component's CSS below.
	// Ensure the shadow host fills the entire `.paper` element.
	const resetCss = `:host{display:block;width:100%;height:100%} html, body {box-sizing: border-box; margin:0; padding:0; width:100%; height:100%} *, *::before, *::after {box-sizing: inherit} body {text-align: left; -webkit-font-smoothing:antialiased}`;

	// Wrap the body content in a container so styles are scoped and isolation is stronger
	return `<style>${resetCss}\n${cssSample}</style><div class="sv-root">${body}</div>`;
})();
