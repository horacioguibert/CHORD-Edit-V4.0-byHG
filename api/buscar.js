export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // RUTA DE COMPATIBILIDAD INICIAL (v1beta)
  // Es la que permite "activar" el flujo de datos en cuentas nuevas habilitadas.
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Actúa como experto musical. Genera el JSON (titulo, artista, compas, capo, secciones) de la canción: ${query}. Responde ÚNICAMENTE el objeto JSON puro.` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Si persiste el 404, el mensaje nos dirá si es por el modelo o por la región.
      return res.status(data.error.code || 500).json({ error: `Google API: ${data.error.message}` });
    }

    if (!data.candidates || !data.candidates[0]) {
      throw new Error("La API no devolvió resultados.");
    }

    const txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("No se encontró un formato JSON válido en la respuesta.");
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
