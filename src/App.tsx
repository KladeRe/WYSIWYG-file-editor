import { useRef, type JSX } from 'react'
import './App.css'

const App = (): JSX.Element => {
	const editorRef = useRef<HTMLDivElement | null>(null)

	return (
		<div className="app-root">
			<main className="content">
				<div className="left-column">
					<div className="paper-wrap">
						<div
							ref={editorRef}
							className="paper editor"
							contentEditable
							suppressContentEditableWarning
						>
							<p>Start typing here...</p>
						</div>
					</div>
				</div>

				<aside className="right-column">
          <h1 className="app-title">WYSIWYG File Editor</h1>
          <button
						className="download-btn"
						onClick={() => {
							// Download functionality to be implemented later
						}}
						aria-label="Download document"
					>
						Download
					</button>
					<div className="sidebar">
						<p>Controls / preview / metadata</p>
					</div>
				</aside>
			</main>
		</div>
	)
}

export default App

