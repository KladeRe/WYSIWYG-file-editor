import { type JSX, useEffect, useRef } from "react";
import "./App.css";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { RENDERED_HTML } from "./FileView";

const App = (): JSX.Element => {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const paperWrapRef = useRef<HTMLDivElement | null>(null);
	const shadowRootRef = useRef<ShadowRoot | null>(null);

	// Attach shadow root and inject rendered HTML when the component mounts
	useEffect(() => {
		const host = editorRef.current;
		if (!host) return;

		let root = host.shadowRoot as ShadowRoot | null;
		if (!root) {
			root = host.attachShadow({ mode: "open" });
		}

		root.innerHTML = RENDERED_HTML;
		shadowRootRef.current = root;

		return () => {
			if (root) {
				root.innerHTML = "";
				shadowRootRef.current = null;
			}
		};
	}, []);

	return (
		<div className="app-root">
			<main className="content">
				<div className="left-column">
					<div ref={paperWrapRef} className="paper-wrap">
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
								const root = shadowRootRef.current;
								if (!root) return;
								const hostEl = editorRef.current;
								// Create an offscreen container with the ShadowRoot's HTML
								const temp = document.createElement("div");
								temp.style.position = "fixed";
								temp.style.left = "-9999px";
								temp.style.top = "0px";
								temp.style.width = `${hostEl?.getBoundingClientRect().width ?? 600}px`;
								// Create a wrapper for the shadow content so we can copy computed styles cleanly
								const contentWrapper = document.createElement("div");
								contentWrapper.innerHTML = root.innerHTML;
								// Give the wrapper the host classes so shadow-content layout rules still apply
								contentWrapper.className = hostEl?.className ?? "";

								// Clone global <link> and <style> nodes so styles apply to the offscreen copy
								const globalStyleNodes = Array.from(
									document.querySelectorAll('link[rel="stylesheet"], style'),
								) as Node[];
								globalStyleNodes.forEach((n) =>
									temp.appendChild(n.cloneNode(true)),
								);
								// Also copy any <style> or <link> nodes from the shadow root (scoped styles)
								const shadowStyleNodes = Array.from(
									root.querySelectorAll('link[rel="stylesheet"], style'),
								) as Node[];
								shadowStyleNodes.forEach((n) => {
									if (n instanceof HTMLStyleElement) {
										const text = n.textContent ?? "";
										// Convert common shadow selectors to host-class selectors
										let converted = text.replace(
											/:host\(([^)]+)\)/g,
											".paper.editor$1",
										);
										converted = converted.replace(
											/:host(?![\w-])/g,
											".paper.editor",
										);
										const s = document.createElement("style");
										s.textContent = converted;
										temp.appendChild(s);
									} else {
										// Clone stylesheet links as-is (will load externally)
										temp.appendChild(n.cloneNode(true));
									}
								});

								// Append the content wrapper last so styles are present
								temp.appendChild(contentWrapper);
								// Also give the outer temp container the shell classes so the exported border matches the UI
								temp.className = hostEl?.className ?? "";

								// Copy computed styles from the shadow DOM elements into the cloned nodes
								const copyComputedStyles = (src: Element, dest: Element) => {
									try {
										const cs = window.getComputedStyle(src);
										let cssText = "";
										for (let i = 0; i < cs.length; i++) {
											const prop = cs[i];
											cssText += `${prop}:${cs.getPropertyValue(prop)};`;
										}
										if (dest instanceof HTMLElement) {
											dest.style.cssText = cssText;
										}
									} catch {
										// ignore cross-origin or other failures
									}

									const srcChildren = Array.from(src.children) as Element[];
									const destChildren = Array.from(dest.children) as Element[];
									const count = Math.min(
										srcChildren.length,
										destChildren.length,
									);
									for (let i = 0; i < count; i++) {
										copyComputedStyles(srcChildren[i], destChildren[i]);
									}
								};

								const srcTop = Array.from(root.children) as Element[];
								const destTop = Array.from(
									contentWrapper.children,
								) as Element[];
								for (
									let i = 0;
									i < Math.min(srcTop.length, destTop.length);
									i++
								) {
									copyComputedStyles(srcTop[i], destTop[i]);
								}

								// Copy CSS custom properties from the host element into the content wrapper
								if (hostEl) {
									try {
										const hostStyles = window.getComputedStyle(hostEl);
										for (let i = 0; i < hostStyles.length; i++) {
											const prop = hostStyles[i];
											if (prop.startsWith("--")) {
												contentWrapper.style.setProperty(
													prop,
													hostStyles.getPropertyValue(prop),
												);
											}
										}
									} catch {
										// ignore
									}
								}

								document.body.appendChild(temp);
								try {
									// Remove visual wrappers so the rendered image fills the page
									temp.style.background = "white";
									temp.style.padding = "0";
									temp.style.margin = "0";
									temp.style.boxSizing = "border-box";
									contentWrapper.style.margin = "0";

									const html2canvas = (await import("html2canvas")).default;
									const { jsPDF } = await import("jspdf");
									const canvas = await html2canvas(temp, {
										scale: 2,
										backgroundColor: null,
									});
									const imgData = canvas.toDataURL("image/png");
									const pdf = new jsPDF({ unit: "pt", format: "a4" });
									const pageWidth = pdf.internal.pageSize.getWidth();
									const pageHeight = pdf.internal.pageSize.getHeight();
									const imgWidth = canvas.width;
									const imgHeight = canvas.height;

									// Scale to COVER the page so there are no visible wrappers (may crop content)
									const coverRatio = Math.max(
										pageWidth / imgWidth,
										pageHeight / imgHeight,
									);
									const renderW = imgWidth * coverRatio;
									const renderH = imgHeight * coverRatio;
									const offsetX = (pageWidth - renderW) / 2;
									const offsetY = 0;
									pdf.addImage(
										imgData,
										"PNG",
										offsetX,
										offsetY,
										renderW,
										renderH,
									);
									pdf.save("document.pdf");
								} catch (err) {
									console.error(err);
									alert(
										"Failed to generate PDF. Ensure html2canvas and jspdf are installed.",
									);
								} finally {
									temp.remove();
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
