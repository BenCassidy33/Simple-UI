import type { BunFile } from "bun";
import { parse_items_request } from "./main";
import esbuild from "esbuild";
import path from "path";

export async function bundle_components(
	requested_components: string,
	minify: boolean = false,
): Promise<BunFile> {
	const all_component_file_paths: string[] =
		await parse_items_request(requested_components);

	const hash = Bun.hash(requested_components);

	// if (!DEBUG) {
	// 	if (bundle_cache_file_paths.has(hash)) {
	// 		let filepath = bundle_cache_file_paths.get(hash)!;
	// 		return Bun.file(filepath);
	// 	}
	// }

	// TODO: REPLACE ALL CACHING WITH REDIS
	const outfile_path = `./dist/components/${hash}${minify ? ".min" : ""}.js`;

	let js_code = "";

	for (const component_file_path of all_component_file_paths) {
		const abs_path = path.resolve(component_file_path);
		const statement = `import "${abs_path}";`;
		js_code += statement;
	}

	await esbuild.build({
		entryPoints: all_component_file_paths,
		outfile: outfile_path,
		bundle: true,
		minify: minify,
		minifyIdentifiers: minify,
		minifySyntax: minify,
		minifyWhitespace: minify,
	});

	const bundled_file = Bun.file(outfile_path);
	if ((await bundled_file.exists()) === false) {
		throw new Error("Error bundling JS files! File not found!");
	}

	return bundled_file;
}

export async function bundle_styles(
	requested_styles: string,
): Promise<Response> {
	const all_style_paths: string[] = await parse_items_request(
		requested_styles,
		true,
	);

	let styles = "";

	for (const file_path of all_style_paths) {
		let style_content = await Bun.file(file_path).text();
		styles += style_content;
	}

	return new Response(styles, {
		headers: {
			"Content-Type": "text/css; charset=utf-8",
		},
	});
}
