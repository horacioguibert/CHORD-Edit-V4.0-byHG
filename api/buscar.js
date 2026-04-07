export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // RUTA ESTÁNDAR PARA CUENTAS DE PAGO (V1)
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Actúa como experto musical. Dame el cifrado completo (título, artista, compás, capo, secciones con compases, beats y lyric) de la canción: ${query}. Responde ÚNICAMENTE el objeto JSON puro.` }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Google dice: ${data.error.message}`);
    }

    const txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("La IA no devolvió un formato válido.");
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
