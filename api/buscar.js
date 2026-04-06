export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro query" });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    // Usamos el modelo más actualizado y estable: gemini-1.5-flash-latest
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Genera el cifrado musical de la canción "${query}". 
            Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
            {"titulo":"X","artista":"X","compas":"4/4","secciones":[{"label":"ESTROFA","compases":[{"beats":[{"chord":"G","note":""}],"lyric":"letra"}]}]}
            Usa nombres de acordes estándar (Am7, Gmaj7, etc.). Sin texto extra.`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const txt = data.candidates[0].content.parts[0].text;
    
    // Filtro de seguridad para limpiar el JSON
    const inicio = txt.indexOf('{');
    const fin = txt.lastIndexOf('}') + 1;
    const jsonLimpio = txt.substring(inicio, fin);
    
    const json = JSON.parse(jsonLimpio);
    return res.status(200).json(json);
  } catch (e) {
    return res.status(500).json({ error: "Error en el buscador: " + e.message });
  }
}
