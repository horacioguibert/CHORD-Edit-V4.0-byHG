export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // RUTA ESTÁNDAR DE PRODUCCIÓN (v1) con modelo de alta compatibilidad
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Genera el JSON musical de: ${query}. Responde SOLO el objeto JSON.` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Si este también da 404, Google está obligando a usar un ID de modelo específico de región
      throw new Error(`${data.error.message} (Código ${data.error.code})`);
    }

    const txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
