export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // RUTA DE MÁXIMA COMPATIBILIDAD: v1beta/models/gemini-pro
  // Es el nombre de "comodín" que Google mantiene para evitar el error 404 en cuentas nuevas.
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `Actúa como experto musical. Genera el JSON de la canción: ${query}. Responde SOLO el objeto JSON puro.` 
          }] 
        }],
        generationConfig: {
          temperature: 0.1
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      // Si sigue dando 404, el mensaje nos dirá si es por el nombre o por el permiso.
      throw new Error(`${data.error.message} (Código ${data.error.code})`);
    }

    if (!data.candidates || !data.candidates[0]) {
      throw new Error("Respuesta vacía de Google.");
    }

    const txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("La IA no devolvió JSON válido.");
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
