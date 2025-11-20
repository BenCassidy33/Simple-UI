"use strict";

import "./code.css";

// BUI_CODE element always assumes that the code is written in plain text as the child of the element!
class BUI_CODE extends HTMLElement {
	static observedAttributes = ["language", "theme", "highlighter"];

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this._internals = this.attachInternals();

		this._code = "";
		this._language = "";
		this._theme = "";
		this._highlighter = "";
		this._observer = null;
	}

	_loadHLJS(callback) {
		if (window.hljs) {
			callback();
			return;
		}

		const script = document.createElement("script");
		script.src =
			"https://unpkg.com/@highlightjs/cdn-assets@11.11.1/highlight.min.js";
		script.onload = callback;
		document.head.appendChild(script);

		fetch(
			"https://unpkg.com/@highlightjs/cdn-assets@11.11.1/styles/default.min.css",
		)
			.then((res) => res.text())
			.then((css) => {
				this._hljsCSS = `<style>${css}</style>`;
			});
	}

	connectedCallback() {
		this._parseAttributes();

		this._observer = new MutationObserver(() => this._parseAttributes());
		this._observer.observe(this, { childList: true, subtree: true });
	}

	_parseAttributes() {
		this._code = this.innerHTML;
		this._language = this.getAttribute("language") || "javascript";
		this._theme = this.getAttribute("theme") || "none";
		this._highlighter = this._highlight;

		this._render();
	}

	_highlight(code) {
		if (!window.hljs) return;

		const highlighted = hljs.highlight(code, {
			language: this._language,
		}).value;

		this.shadowRoot.innerHTML = `${this._hljsCSS}<pre><code>${highlighted}</code></pre>`;
	}

	_render() {
		const escapeHTML = (str) =>
			str
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;");

		this._loadHLJS(() => {
			this._highlight(escapeHTML(this._code));
		});
	}
}

customElements.define("bui-code", BUI_CODE);
