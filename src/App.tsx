import { type JSX, useEffect, useRef } from "react";
import "./App.css";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { RENDERED_HTML } from "./FileView";

const App = (): JSX.Element => {
	const editorRef = useRef<HTMLDivElement | null>(null);

	// Attach shadow root and inject rendered HTML when the component mounts
	useEffect(() => {
		const host = editorRef.current;
		if (!host) return;

		let root = host.shadowRoot as ShadowRoot | null;
		if (!root) {
			root = host.attachShadow({ mode: "open" });
		}

		root.innerHTML = RENDERED_HTML;

		return () => {
			if (root) root.innerHTML = "";
		};
	}, []);

	return (
		<div className="app-root">
			<main className="content">
				<div className="left-column">
					<div className="paper-wrap">
						<div ref={editorRef} className="paper editor" />

						{/* Attach a Shadow DOM to the `.paper.editor` host and inject the rendered document. */}
						{/* Use an effect to perform DOM attachment once the host is mounted. */}
					</div>
				</div>

				<div className="right-column">
					<h1 className="app-title">WYSIWYG File Editor</h1>
					<div className="right-center">
						<button
							className="download-btn"
							onClick={async () => {
								const host = editorRef.current;
								if (!host) return;
								const rect = host.getBoundingClientRect();
								const width = Math.round(rect.width);
								const height = Math.round(rect.height);

								// Create offscreen host sized to match the visible editor
								const off = document.createElement("div");
								// Copy classes from the real host so global CSS (e.g. .paper) applies
								off.className = host.className;
								off.style.position = "fixed";
								off.style.left = "-10000px";
								off.style.top = "0";
								// Explicitly set size to match on-screen element
								off.style.width = `${width}px`;
								off.style.height = `${height}px`;
								document.body.appendChild(off);

								// Attach a shadow root so the rendered HTML/CSS matches the editor
								const sroot = off.attachShadow({ mode: "open" });
								sroot.innerHTML = RENDERED_HTML;

								try {
									const scale = 2; // high-res render
									const canvas = await html2canvas(off, {
										scale,
										useCORS: true,
										backgroundColor: null,
									});
									const imgData = canvas.toDataURL("image/png", 1.0);

									const pdf = new jsPDF({ unit: "pt", format: "a4" });
									const pdfWidth = pdf.internal.pageSize.getWidth();
									const pdfHeight = pdf.internal.pageSize.getHeight();

									// Fit the rendered image into the A4 page while preserving whitespace/margins
									const imgW = canvas.width;
									const imgH = canvas.height;
									const ratio = Math.min(pdfWidth / imgW, pdfHeight / imgH);
									const drawW = imgW * ratio;
									const drawH = imgH * ratio;
									const x = (pdfWidth - drawW) / 2;
									const y = (pdfHeight - drawH) / 2;

									pdf.addImage(imgData, "PNG", x, y, drawW, drawH);
									pdf.save("document.pdf");
								} catch (err) {
									// eslint-disable-next-line no-console
									console.error(err);
								} finally {
									document.body.removeChild(off);
								}
							}}
							aria-label="Download document"
						>
							Download
						</button>
					</div>
				</div>
			</main>
		</div>
	);
};

export default App;
