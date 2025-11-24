import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { Logestic } from "logestic";
import path from "path";
import { bundle_components, bundle_styles } from "./bundle";
import { redis, RedisClient } from "bun";

const component_base_path: string = path.resolve("./src/components/");

export async function parse_items_request(
	request_components: string,
	css: boolean = false,
): Promise<string[]> {
	const components = request_components.split(",");
	const result: string[] = [];

	for (const component_name of components) {
		const component_path = path.join(component_base_path, component_name);

		let file = path.join(
			component_path,
			`${component_name}.${css ? "css" : "js"}`,
		);

		if ((await Bun.file(file).exists()) === false) {
			throw new Error(`Could not find component '${component_name}'.`);
		}

		result.push(file);
	}

	return result;
}

interface QueryParams {
	components?: string;
	minify?: string;
}

interface StyleQueryParams {
	styles?: string;
}

async function main() {
	const redis_client = new RedisClient()
    await redis_client.connect();

    if (!redis_client.connected) {
        console.log("Failed to connect to redis!")
    }

	const app = new Elysia();

	app.use(Logestic.preset("common")).use(
		staticPlugin({ prefix: "/", indexHTML: true }),
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

			return bundle_components(
				query.components!,
				query.minify?.toLowerCase() === "true" ? true : false,
			);
		},
		{},
	);

	app.get("/styles", async ({ query }: { query: StyleQueryParams }) => {
		if (query.styles === undefined) {
			throw new Error("Error, styles must be defined in uri path!");
		}

		let styles = await bundle_styles(query.styles);
		return styles;
	});

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

    redis_client.close()
}

if (import.meta.main) {
	await main();
}
