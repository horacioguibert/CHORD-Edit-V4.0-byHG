export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro de búsqueda" });

  const API_KEY = process.env.GEMINI_API_KEY; 
  
  // RUTA TÉCNICA DEFINITIVA: Forzamos la v1beta con la estructura que tu cuenta reconoce
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const prompt = `Actúa como un experto en música. Proporciona el cifrado de la canción: "${query}". 
  Responde ÚNICAMENTE con un JSON válido, sin texto extra:
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

    // Diagnóstico en tiempo real si Google vuelve a rechazar
    if (data.error) {
      throw new Error(`Google indica: ${data.error.message} (Código ${data.error.code})`);
    }

    // Extracción segura del JSON (elimina posibles comentarios de la IA)
    let txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("La respuesta de la IA no es un JSON válido");
    
    const cancionFinal = JSON.parse(jsonMatch[0]);
    return res.status(200).json(cancionFinal);

  } catch (e) {
    console.error("Falla de Mantenimiento:", e.message);
    return res.status(500).json({ error: "Error en el motor: " + e.message });
  }
}
