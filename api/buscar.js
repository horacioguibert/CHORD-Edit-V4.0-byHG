export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // RUTA DE PRODUCCIÓN PURA (Sin versiones beta, sin nombres variables)
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Genera el cifrado musical de: ${query}. Responde estrictamente un JSON con titulo, artista, compas, capo y secciones.` }] 
        }],
        generationConfig: {
          response_mime_type: "application/json" // Fuerza a la IA a entregar solo datos
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      // Si esto falla, el mensaje de Google dirá exactamente qué falta en tu consola
      return res.status(data.error.code || 500).json({ error: `Google API: ${data.error.message}` });
    }

    const respuestaIA = data.candidates[0].content.parts[0].text;
    return res.status(200).json(JSON.parse(respuestaIA));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
