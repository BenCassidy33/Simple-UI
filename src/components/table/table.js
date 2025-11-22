"use strict";

import "./table.css"

class BUI_TABLE_ROW extends HTMLElement {
  static observedAttributes = ["row-data", "row-seperator"];

  constructor() {
    super();

    this._internals = this.attachInternals();

    this._table_parent = null;
    this._rowSeperator = ",";
    this._rowData = [];
  }

  connectedCallback() {
    this._table_parent = this.closest("bui-table");
    if (this._table_parent === null) {
      throw new Error("ERROR: bui-table-row must have a parent!");
    }

    this._parseAttributes();
  }

  _parseAttributes() {
    const parentSeperator = this._table_parent?.columnSeperator || ",";
    this._rowSeperator = this.getAttribute("row-seperator") || parentSeperator;

    const rowDataAttr = this.getAttribute("row-data");
    this._rowData = rowDataAttr ? rowDataAttr.split(this._rowSeperator) : [];
  }

  get rowData() {
    return this._rowData;
  }

  get rowSeperator() {
    return this._rowSeperator;
  }

  render() {}
}

class BUI_TABLE extends HTMLElement {
  static observedAttributes = [
    "column-names",
    "column-types",
    "column-seperator",
  ];

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this._internals = this.attachInternals();
    this._columnSeperator = ",";
    this._columnNames = [];
    this.columnTypes = [];
    this._rows = [];
  }

  connectedCallback() {
    this._parseAttributes();

    setTimeout(() => {
      this._rows = Array.from(this.querySelectorAll("bui-table-row"));
      this.render();
    }, 0);

    this._observeRows();
  }

  _observeRows() {
    const observer = new MutationObserver(() => {
      this._rows = Array.from(this.querySelectorAll("bui-table-row"));
      this.render();
    });

    observer.observe(this, {
      childList: true,
    });
  }

  // attributeChangedCallback(name, oldValue, newValue) {
  // console.log(name, oldValue, newValue);
  // }

  _parseAttributes() {
    this._columnSeperator = this.getAttribute("column-seperator") || ",";

    const columnNamesAttr = this.getAttribute("column-names");
    this._columnNames = columnNamesAttr
      ? columnNamesAttr.split(this._columnSeperator)
      : [];

    const columnTypesAttr = this.getAttribute("column-types");
    this._columnTypes = columnTypesAttr
      ? columnTypesAttr.split(this._columnSeperator)
      : [];
  }

  get columnNames() {
    return this._columnNames;
  }

  get columnTypes() {
    return this._columnTypes;
  }

  get columnSeperator() {
    return this._columnSeperator;
  }

  set columnNames(value) {
    const stringValue = Array.isArray(value)
      ? value.join(this._columnSeperator)
      : value;
    this.setAttribute("column-names", stringValue);
  }

  set columnTypes(value) {
    const stringValue = Array.isArray(value)
      ? value.join(this._columnSeperator)
      : value;
    this.setAttribute("column-types", stringValue);
  }

  set columnSeperator(value) {
    this.setAttribute("column-seperator", value);
  }

  render() {
    const header = this._columnNames
      .map((name, idx) => {
        return `<th data-type=${this._columnTypes[idx] || "string"}>${name}</th>`;
      })
      .join("");

    const rows = this._rows
      .map((row, _) => {
        const cells = row.rowData
          .map((data, idx) => {
            return `<td data-type=${this.columnTypes[idx] || "string"}>${data}</td>`;
          })
          .join("");

        return `<tr>${cells}</tr>`;
      })
      .join("");

    this.shadowRoot.innerHTML = `
      <table>
        <thead><tr>${header}</tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="display: none;">
        <slot></slot>
      </div>
    `;
    console.log(header, rows);
  }
}

customElements.define("bui-table-row", BUI_TABLE_ROW);
customElements.define("bui-table", BUI_TABLE);
