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

const cssSample = `body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  background: #f6f7fb;
  color: #111827;
}

h1 {
  color: #2563eb;
  margin: 0 0 0.5rem 0;
}

p { line-height: 1.4 }
`;

// Export rendered HTML (body-only) combined with CSS so it can be injected
export const RENDERED_HTML = (() => {
	const bodyMatch = htmlSample.match(/<body[^>]*>([\s\S]*)<\/body>/i);
	const body = bodyMatch ? bodyMatch[1] : htmlSample;
	return `<style>${cssSample}</style>${body}`;
})();
