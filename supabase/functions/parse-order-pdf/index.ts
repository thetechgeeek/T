import { createClient } from "npm:@supabase/supabase-js@2";
import { encodeBase64 } from "jsr:@std/encoding/base64";

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
			console.error('Auth check failed:', userError?.message || 'No user session');
			return errorResponse('Unauthorized', 401, requestId);
		}

		const body = await req.json();
		const { mimeType, textContent } = body;
		let base64Data: string | undefined = body.base64Data;

		// --- Text paste mode: no file needed ---
		const isTextMode = typeof textContent === 'string' && textContent.trim().length > 0;

		if (!isTextMode) {
			if (!mimeType) {
				return errorResponse('Missing mimeType or textContent', 400, requestId);
			}

			if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
				return errorResponse('Unsupported file type', 415, requestId);
			}

			// Storage path preferred over inline base64 (avoids large request payloads)
			if (body.storagePath && !base64Data) {
				const serviceClient = createClient(
					Deno.env.get('SUPABASE_URL') ?? '',
					Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
				);
				const { data: fileData, error: downloadError } = await serviceClient.storage
					.from('order-pdfs')
					.download(body.storagePath);

				if (downloadError || !fileData) {
					return errorResponse('Failed to download file from storage', 500, requestId);
				}

				const arrayBuffer = await fileData.arrayBuffer();
				const uint8Array = new Uint8Array(arrayBuffer);

				// Optimized base64 encoding for large files
				const encodingStart = performance.now();
				base64Data = encodeBase64(uint8Array);
				console.log(`[${requestId}] Base64 encoding took ${Math.round(performance.now() - encodingStart)}ms`);

				// Clean up the temporary upload after we've read it
				serviceClient.storage.from('order-pdfs').remove([body.storagePath]).catch(() => {});
			}

			if (!base64Data) {
				return errorResponse('Missing base64Data or storagePath', 400, requestId);
			}

			if (base64Data.length > MAX_BASE64_LENGTH) {
				return errorResponse('File too large (max 7.5MB)', 413, requestId);
			}
		}

		const geminiKey = Deno.env.get('GEMINI_API_KEY');
		if (!geminiKey) {
			return errorResponse('AI service not configured', 503, requestId);
		}

		const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

		const contentParts = isTextMode
			? [
					{
						text: `Extract inventory order items from this pasted text. Output strict JSON matching the schema.\n\n${textContent}`,
					},
			  ]
			: [
					{ inline_data: { mime_type: mimeType, data: base64Data } },
					{
						text: 'Extract the inventory order items from this document. Output strict JSON matching the schema.',
					},
			  ];

		const requestPayload = {
			system_instruction: {
				parts: [{ text: SYSTEM_PROMPT }],
			},
			contents: [
				{
					parts: contentParts,
				},
			],
			generationConfig: {
				temperature: 0.1,
				responseMimeType: 'application/json',
			},
		};

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 50_000); // 50 seconds to allow for deep analysis

		const apiStart = performance.now();
		let response: Response;
		try {
			response = await fetch(apiEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestPayload),
				signal: controller.signal,
			});
			console.log(`[${requestId}] Gemini API latency: ${Math.round(performance.now() - apiStart)}ms`);
		} finally {
			clearTimeout(timeout);
		}

		if (!response.ok) {
			const errText = await response.text();
			console.error(`Gemini API Error [${response.status}]:`, errText);
			return errorResponse(`Vision API Error (${response.status}): ${errText}`, 502, requestId);
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
			return errorResponse('Request timed out', 504, requestId);
		}
		return errorResponse(
			error instanceof Error ? error.message : 'Internal Server Error',
			500,
			requestId,
		);
	}
});

function errorResponse(msg: string, status: number, requestId: string) {
	return new Response(JSON.stringify({ error: msg }), {
		status,
		headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-request-id': requestId },
	});
}
