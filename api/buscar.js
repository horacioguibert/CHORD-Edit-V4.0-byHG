export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // RUTA ESTÁNDAR DE PRODUCCIÓN FINAL
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Actúa como experto musical. Genera el JSON (titulo, artista, compas, capo, secciones) de la canción: ${query}. Responde ÚNICAMENTE el objeto JSON puro.` }] 
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Si esto falla, el mensaje será el oficial de Google para su cuenta
      return res.status(data.error.code || 500).json({ error: `Google API (${data.error.code}): ${data.error.message}` });
    }

    const txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
