"use strict";

import "./sidebar.css";

class BUI_SIDEBAR_SECTION extends HTMLELement {
	static observedAttributes = ["collapsible"];

	constructor() {
		this._internals = this.attachInternals();
	}

	connectedCallback() {
		this._parseAttributes();
	}

	_parseAttributes() {
		this._collapsible = this.getAttribute("collapsible") || false;
	}
}

class BUI_SIDEBAR_SECTION_HEADER extends HTMLElement {}
class BUI_SIDEBAR_HEADER extends HTMLElement {}
class BUI_SIDEBAR_FOOTER extends HTMLElement {}

class BUI_SIDEBAR extends HTMLElement {
	static observedAttributes = ["collapsible", "hovering"];

	constructor() {
		this._internals = this.attachInternals();
	}

	connectedCallback() {
		this._parseAttributes();
	}

	_parseAttributes() {
		this._collapsible = this.getAttribute("collapsible") || false;
		this._hovering = this.getAttribute("hovering") || false;
	}
}

customElements.define("bui-sidebar", BUI_SIDEBAR);
customElements.define("bui-sidebar-header", BUI_SIDEBAR_HEADER);
customElements.define("bui-sidebar-footer", BUI_SIDEBAR_FOOTER);
customElements.define("bui-sidebar-section", BUI_SIDEBAR_SECTION);
customElements.define("bui-sidebar-section-header", BUI_SIDEBAR_SECTION_HEADER);
