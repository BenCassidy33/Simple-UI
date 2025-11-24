function build_link(components, min = false) {
	return `
        <code>
            <span>&lt</span><span style="color: var(--code-keyword);">script</span><span style="color: var(--code-attribute);"> src</span><span>=</span><span style="color: var(--code-string);">"http://localhost:3000/dist/?components=${components}&minify=${min}"</span><span>&gt&lt/</span><span style="color: var(--code-keyword);">script</span><span>&gt</span>
            <br>
            <span>&lt</span><span style="color: var(--code-keyword);">link</span>
            <span style="color: var(--code-attribute);">rel</span><span>=</span><span style="color: var(--code-string);">"stylesheet"</span>
            <span style="color: var(--code-attribute);">href</span><span>=</span><span style="color: var(--code-string);">"http://localhost:3000/styles/?styles=${components}"</span><span>/&gt</span>
        </code            
    `;
}

const link_text = document.getElementById("link-text");
const component_picker = document.getElementById("component-picker");
const copy_button = document.getElementById("copy-button");
const quick_start = document.getElementById("quick-start");
const link_builder = document.getElementById("link-builder");

quick_start.addEventListener("click", () => {
	link_builder.scrollIntoView({
		behavior: "smooth",
		block: "center",
		inline: "nearest",
	});
});

copy_button.addEventListener("click", () => {
	navigator.clipboard.writeText(link_text.innerText);
});

const all_components = ["Table", "Card", "Alert", "Tooltip", "Code", "Navbar"];

for (const component of all_components) {
	let html = `
        <div class="checkbox-container">
            <input type="checkbox" id="checkbox-${component}" value="${component.toLowerCase()}"></input>
            <label for="checkbox-${component}">${component}</label>
        </div>
    `;
	component_picker.innerHTML += html;
}

function render_link() {
	let components = component_picker.querySelectorAll("input");
	let selected_components = [];

	for (const component of components) {
		if (component.checked) {
			selected_components.push(component.value);
		}
	}

	// link_text.innerHTML = `<div>${build_link(selected_components.join(","))}</div>`;
	link_text.innerHTML = build_link(selected_components.join(","));
}

component_picker.addEventListener("change", (event) => {
	if (event.target.matches("input[type='checkbox']")) {
		render_link();
	}
});

(function () {
	render_link();
})();
