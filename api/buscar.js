export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // RUTA UNIVERSAL ABSOLUTA: v1beta/models/gemini-pro
  // Es la ruta "maestra" que Google mantiene para compatibilidad total cuando los modelos 1.5 fallan por permisos de región o cuenta.
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `Eres un experto musical. Genera el JSON de la canción: ${query}. Responde ÚNICAMENTE el objeto JSON puro.` 
          }] 
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`${data.error.message} (Código ${data.error.code})`);
    }

    if (!data.candidates || !data.candidates[0]) {
      throw new Error("Respuesta vacía de la API.");
    }

    const txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("Formato JSON no encontrado.");
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
