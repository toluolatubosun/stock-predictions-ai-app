import OpenAI from "openai";
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type"
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: CORS_HEADERS })
		}

		if (request.method !== "POST") {
			return new Response(JSON.stringify({ error: `Unsupported method ${request.method}`}), { status: 405, headers: CORS_HEADERS })
		}

		const openai = new OpenAI({ apiKey: env.OPEN_AI_API_KEY, baseURL: "https://gateway.ai.cloudflare.com/v1/ca61e33fdc9c9d08b124c2af54237145/stock-predictions/openai" })

		const messages = await request.json();
		
		try {
			const chatCompletions = await openai.chat.completions.create({
				model: "gpt-3.5-turbo",
				messages: messages as any,
				temperature: 1.1,
			})
			const response = chatCompletions.choices[0].message

			return new Response(JSON.stringify(response), { headers: CORS_HEADERS })
		} catch (err: any) {
			return new Response(JSON.stringify({ error: err.message }), {  status: 500, headers: CORS_HEADERS });
		}
	},
} satisfies ExportedHandler<Env>;
