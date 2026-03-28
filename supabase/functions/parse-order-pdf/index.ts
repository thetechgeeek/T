import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? 'https://tilemaster.app',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_BASE64_LENGTH = 10_000_000; // ~7.5 MB decoded

const SYSTEM_PROMPT = `
You are an expert data extraction assistant for a tiles and ceramics business.
Extract the ordered items from this document (which may be a PDF, image, or invoice).
You must return your output strictly as a JSON object matching this schema.

Schema Requirements:
{
  "items": [
    {
      "design_name": "string (the exact name, model, or description of the item)",
      "base_item_number": "string (often the prefix of the design name, or primary product code. Leave blank if none)",
      "category": "string (Guess from: GLOSSY, FLOOR, MATT, SATIN, WOODEN, ELEVATION, OTHER)",
      "size": "string (e.g., 600x600, 800x1600. Leave blank if unknown)",
      "brand": "string (Manufacturer or brand, if visible)",
      "box_count": "number (Must be numeric! Quantity of boxes/pcs ordered)",
      "price_per_box": "number (Unit price, if available)",
      "total_price": "number (Total price for this line item, if available)"
    }
  ]
}

Constraints:
- You must output raw JSON only. Do not enclose in markdown blocks. Do not add explanations.
`;

Deno.serve(async (req: Request) => {
	const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();

	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: { ...corsHeaders, 'x-request-id': requestId } });
	}

	try {
		const supabaseClient = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_ANON_KEY') ?? '',
			{ global: { headers: { Authorization: req.headers.get('Authorization')! } } },
		);

		const {
			data: { user },
			error: userError,
		} = await supabaseClient.auth.getUser();
		if (userError || !user) {
			return errorResponse('Unauthorized', 401);
		}

		const { base64Data, mimeType } = await req.json();

		if (!base64Data || !mimeType) {
			return errorResponse('Missing base64Data or mimeType', 400);
		}

		if (base64Data.length > MAX_BASE64_LENGTH) {
			return errorResponse('File too large (max 7.5MB)', 413);
		}

		if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
			return errorResponse('Unsupported file type', 415);
		}

		const geminiKey = Deno.env.get('GEMINI_API_KEY');
		if (!geminiKey) {
			return errorResponse('AI service not configured', 503);
		}

		const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

		const requestPayload = {
			system_instruction: {
				parts: [{ text: SYSTEM_PROMPT }],
			},
			contents: [
				{
					parts: [
						{ inline_data: { mime_type: mimeType, data: base64Data } },
						{
							text: 'Extract the inventory order items from this document. Output strict JSON matching the schema.',
						},
					],
				},
			],
			generationConfig: {
				temperature: 0.1,
				responseMimeType: 'application/json',
			},
		};

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 30_000);

		let response: Response;
		try {
			response = await fetch(apiEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestPayload),
				signal: controller.signal,
			});
		} finally {
			clearTimeout(timeout);
		}

		if (!response.ok) {
			const errText = await response.text();
			console.error('Gemini Error:', errText);
			return errorResponse(`Vision API Error: ${errText}`, 502);
		}

		const resultData = await response.json();
		const extractedText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!extractedText) {
			throw new Error('Empty response from Vision AI');
		}

		let cleanText = extractedText.trim();
		if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
		if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
		if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);

		const parsedData = JSON.parse(cleanText);

		return new Response(JSON.stringify({ success: true, data: parsedData }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-request-id': requestId },
			status: 200,
		});
	} catch (error: unknown) {
		console.error('Function error:', error);
		if (error instanceof Error && error.name === 'AbortError') {
			return errorResponse('Request timed out', 504);
		}
		return errorResponse(
			error instanceof Error ? error.message : 'Internal Server Error',
			500,
		);
	}
});

function errorResponse(msg: string, status: number) {
	return new Response(JSON.stringify({ error: msg }), {
		status,
		headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-request-id': requestId },
	});
}
