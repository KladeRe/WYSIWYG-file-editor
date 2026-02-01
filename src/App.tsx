import { useRef, useEffect, type JSX } from 'react'
import './App.css'
import { RENDERED_HTML } from './FileView'

const App = (): JSX.Element => {
	const editorRef = useRef<HTMLDivElement | null>(null)

	// Attach shadow root and inject rendered HTML when the component mounts
	useEffect(() => {
		const host = editorRef.current
		if (!host) return

		let root = host.shadowRoot as ShadowRoot | null
		if (!root) {
			root = host.attachShadow({ mode: 'open' })
		}

		root.innerHTML = RENDERED_HTML

		return () => {
			if (root) root.innerHTML = ''
		}
	}, [])

	return (
		<div className="app-root">
			<main className="content">
				<div className="left-column">
					<div className="paper-wrap">
						<div ref={editorRef} className="paper editor" />

						{/* Attach a Shadow DOM to the `.paper.editor` host and inject the rendered document. */}
						{
							/* Use an effect to perform DOM attachment once the host is mounted. */
						}
					</div>
				</div>

				<div className="right-column">
					<h1 className="app-title">WYSIWYG File Editor</h1>
					<div className="right-center">
						<button
							className="download-btn"
							onClick={() => {
								// Download functionality to be implemented later
							}}
							aria-label="Download document"
						>
							Download
						</button>
					</div>
				</div>
			</main>
		</div>
	)
}



export default App

