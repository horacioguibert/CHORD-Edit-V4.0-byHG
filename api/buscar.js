export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // RUTA DE ALTA PRECISIÓN: Usamos el ID de modelo gemini-1.5-flash-8b (u otros derivados)
  // que son los que Google está activando primero en cuentas de Nivel 1 en Argentina.
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Genera el JSON de la canción: ${query}. Responde SOLO el JSON.` }] }]
      })
    });

    const data = await response.json();

    // Si el modelo específico falla, el sistema nos devolverá la LISTA real en el error
    if (data.error) {
      return res.status(data.error.code || 500).json({ 
        error: `Google API Error: ${data.error.message}. Intente cambiar el modelo en el código por 'gemini-1.5-flash-8b' si este falla.` 
      });
    }

    const txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
