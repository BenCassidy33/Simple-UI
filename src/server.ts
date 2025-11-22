import type { BunFile } from "bun";
import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import path from "path";
import esbuild from "esbuild";
import { Logestic } from "logestic";

const component_base_path: string = path.resolve("./src/components/");

const bun_filecache = new Map<string, string>();

async function parse_component_request(
	request_components: string,
): Promise<string[]> {
	const components = request_components.split(",");
	const result: string[] = [];

	for (const component_name of components) {
		const component_path = path.join(component_base_path, component_name);

		if (bun_filecache.has(component_name)) {
			result.push(bun_filecache.get(component_name)!);
			continue;
		}

		let js_file = path.join(component_path, `${component_name}.js`);

		if ((await Bun.file(js_file).exists()) === false) {
			throw new Error(`Could not find component '${component_name}'.`);
		}

		bun_filecache.set(component_name, js_file);
		result.push(js_file);
	}

	return result;
}

const bundle_cache_file_paths = new Map<number | bigint, string>();

async function pack_and_serve_components(
	requested_components: string,
	minify: boolean = false,
): Promise<BunFile> {
	const all_component_file_paths: string[] =
		await parse_component_request(requested_components);

	const hash = Bun.hash(requested_components);

	if (bundle_cache_file_paths.has(hash)) {
		let filepath = bundle_cache_file_paths.get(hash)!;
		return Bun.file(filepath);
	}

    // TODO: REPLACE ALL CACHING WITH REDIS
	const outfile_path = `./dist/components/${hash}${minify ? ".min" : ""}.js`;

	let js_code = "";

	for (const component_file_path of all_component_file_paths) {
		const statement = `import "${component_file_path}";`;
		js_code += statement;
	}

	await esbuild.build({
		stdin: {
			contents: js_code,
			resolveDir: "./src/components/",
		},
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

interface QueryParams {
	components?: string;
	minify?: string;
}

function main() {
	const app = new Elysia();

	app.use(Logestic.preset("common")).use(
		staticPlugin({ prefix: "/", indexHTML: true  }),
	);

	app.get(
		"/dist",
		({ query }: { query: QueryParams }) => {
			const components = query.components;

			if (components === undefined) {
				throw new Error(
					"Error, components must be defined in uri path!",
				);
			}

			return pack_and_serve_components(
				query.components!,
				query.minify?.toLowerCase() === "true" ? true : false,
			);
		},
		{},
	);

	app.get(
		"/themes/:theme",
		async ({ params }: { params: { theme: string } }) => {
			const theme_file = Bun.file(`./src/themes/${params.theme}`);
			if ((await theme_file.exists()) === false) {
				throw new Error("Theme not found!");
			}

			return new Response(await theme_file.arrayBuffer(), {
				headers: {
					"Content-Type": "text/css",
				},
			});
		},
	);

	app.listen(3000, () => {
		console.log("Server running on port 3000");
	});
}

if (import.meta.main) {
	main();
}
