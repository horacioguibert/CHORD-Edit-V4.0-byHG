export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro de búsqueda" });

  const API_KEY = process.env.GEMINI_API_KEY; 
  
  // MOTOR DE ALTA POTENCIA: Gemini 1.5 Pro (Ruta Estable)
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

  const prompt = `Actúa como un experto en transcripción musical. 
  Genera el cifrado completo de la canción: "${query}". 
  Responde ÚNICAMENTE con un objeto JSON válido, sin texto extra, con esta estructura:
  {"titulo":"X","artista":"X","compas":"4/4","capo":0,"secciones":[{"label":"ESTROFA","compases":[{"beats":[{"chord":"G","note":""}],"lyric":"letra"}]}]}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Google indica: ${data.error.message} (Código ${data.error.code})`);
    }

    let txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("La IA no devolvió un formato JSON válido");
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Error en el motor: " + e.message });
  }
}
