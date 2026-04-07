export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // RUTA REGIONALIZADA EXACTA: Apuntamos al galpón us-central1 donde usted tiene la cuota ilimitada.
  const API_URL = `https://us-central1-aiplatform.googleapis.com/v1/projects/gen-lang-client-0647716627/locations/us-central1/publishers/google/models/gemini-1.5-flash:streamGenerateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Actúa como experto musical. Genera el JSON de la canción: ${query}. Responde SOLO el JSON puro.` }] }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Fallo de Válvula (${response.status}): ${errorText.substring(0, 150)}` });
    }

    const data = await response.json();
    
    // Procesamos la respuesta que viene de la ruta regional (Vertex)
    const txt = data[0].candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
