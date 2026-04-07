export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // RUTA ESTABLE v1
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Actúa como experto musical. Genera el cifrado (título, artista, compás, capo, secciones) de la canción: ${query}. Responde ÚNICAMENTE el objeto JSON puro, sin decoraciones de texto ni markdown.` }] 
        }],
        generationConfig: {
          temperature: 0.1 // Eliminamos el campo que causaba el error y bajamos temperatura para precisión
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(data.error.code || 500).json({ error: `Google API: ${data.error.message}` });
    }

    // Limpieza manual del JSON por si la IA agrega texto extra
    let txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("La IA no entregó un formato de datos válido.");
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
