export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 
  const PROJECT_ID = "gen-lang-client-0647716627"; // ID de su captura

  // RUTA DE ALTA DISPONIBILIDAD (Vertex AI Bridge)
  // Esta ruta ignora los errores 404 de la API estándar
  const API_URL = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/gemini-1.5-flash:predict?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ content: `Genera el JSON de la canción: ${query}. Responde SOLO el JSON puro.` }],
        parameters: { temperature: 0.1, maxOutputTokens: 1000 }
      })
    });

    const data = await response.json();

    if (data.error) {
      // Si Vertex también falla, intentamos la ruta global simplificada al extremo
      const GLOBAL_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
      const fallback = await fetch(GLOBAL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `JSON de: ${query}` }] }] })
      });
      const fallbackData = await fallback.json();
      
      if (fallbackData.error) throw new Error(fallbackData.error.message);
      
      const txt = fallbackData.candidates[0].content.parts[0].text;
      return res.status(200).json(JSON.parse(txt.match(/\{[\s\S]*\}/)[0]));
    }

    // Respuesta de Vertex
    const prediction = data.predictions[0].content;
    return res.status(200).json(JSON.parse(prediction.match(/\{[\s\S]*\}/)[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla Crítica: " + e.message });
  }
}
