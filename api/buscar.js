export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // RUTA DE COMPATIBILIDAD TOTAL (Aprobada por Interconsulta)
  // Usamos la v1 (estable) con el modelo base que Google no puede ignorar
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Actúa como experto musical. Genera el JSON de la canción: ${query}. Responde SOLO el objeto JSON puro.` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Si esto falla, el error nos dirá si es un tema de 'Permisos' o 'Nombre'
      throw new Error(`Google API (${data.error.code}): ${data.error.message}`);
    }

    if (!data.candidates || !data.candidates[0]) {
      throw new Error("Google no devolvió contenido. Posible bloqueo de seguridad.");
    }

    const txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
