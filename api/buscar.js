export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro de búsqueda" });

  const API_KEY = process.env.GEMINI_API_KEY; 
  
  // CAMBIO CRÍTICO: Usamos la ruta directa de modelos v1 con el nombre oficial del motor
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const prompt = `Actúa como un experto en música. Proporciona el cifrado de: "${query}". 
  Responde ÚNICAMENTE con un JSON válido:
  {
    "titulo": "Nombre",
    "artista": "Artista",
    "compas": "4/4",
    "capo": 0,
    "secciones": [
      {
        "label": "ESTROFA",
        "compases": [
          { "beats": [{"chord": "G", "note": ""}], "lyric": "letra" }
        ]
      }
    ]
  }`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // Si el error persiste, esto nos dirá exactamente el código de error de Google
    if (data.error) {
      throw new Error(`Código ${data.error.code}: ${data.error.message}`);
    }

    let txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("La IA no devolvió JSON");
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Error en el motor: " + e.message });
  }
}
