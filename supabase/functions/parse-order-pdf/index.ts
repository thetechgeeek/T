// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

declare var Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userAuthError(userError, user)) {
      return errorResponse('Unauthorized', 401);
    }

    const { base64Data, mimeType, aiKey } = await req.json();

    if (!base64Data || !mimeType) {
      return errorResponse('Missing base64Data or mimeType', 400);
    }

    const geminiKey = aiKey || Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return errorResponse('AI API Key not provided. Please set it in Settings.', 400);
    }

    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    
    const requestPayload = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: base64Data } },
            { text: "Extract the inventory order items from this document. Output strict JSON matching the schema." }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini Error:", errText);
      return errorResponse(`Vision API Error: ${errText}`, 502);
    }

    const resultData = await response.json();
    const extractedText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!extractedText) {
      throw new Error("Empty response from Vision AI");
    }

    let cleanText = extractedText.trim();
    if (cleanText.startsWith('\`\`\`json')) cleanText = cleanText.substring(7);
    if (cleanText.startsWith('\`\`\`')) cleanText = cleanText.substring(3);
    if (cleanText.endsWith('\`\`\`')) cleanText = cleanText.substring(0, cleanText.length - 3);

    const parsedData = JSON.parse(cleanText);

    return new Response(JSON.stringify({ success: true, data: parsedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    console.error("Function error:", error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
});

function userAuthError(error: any, user: any) {
    return error || !user;
}

function errorResponse(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
