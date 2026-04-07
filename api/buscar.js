export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // CORRECCIÓN FINAL: Ruta v1beta con el nombre exacto de modelo para cuentas nuevas con facturación activa
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Actúa como experto musical. Dame el JSON (titulo, artista, compas, capo, secciones) de la canción: ${query}. Responde SOLO el objeto JSON puro.` }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`${data.error.message} (Código ${data.error.code})`);
    }

    if (!data.candidates || !data.candidates[0]) {
      throw new Error("Google no devolvió candidatos. Revisa los filtros de seguridad en tu consola.");
    }

    const txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("La IA no devolvió un formato JSON válido.");
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
