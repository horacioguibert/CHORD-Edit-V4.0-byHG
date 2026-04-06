export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro query" });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    // Esta es la URL que funciona con la mayoría de las claves personales de AI Studio
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Actúa como un experto musical. Genera el cifrado completo de la canción "${query}". 
            Responde ÚNICAMENTE con un JSON válido con esta estructura:
            {"titulo":"X","artista":"X","compas":"4/4","secciones":[{"label":"ESTROFA","compases":[{"beats":[{"chord":"G","note":""}],"lyric":"letra"}]}]}
            No incluyas texto extra, solo el JSON.`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No se encontraron resultados para esa canción.");
    }

    const txt = data.candidates[0].content.parts[0].text;
    
    // Limpieza de cualquier residuo de texto
    const inicio = txt.indexOf('{');
    const fin = txt.lastIndexOf('}') + 1;
    const jsonLimpio = txt.substring(inicio, fin);
    
    const json = JSON.parse(jsonLimpio);
    return res.status(200).json(json);
  } catch (e) {
    return res.status(500).json({ error: "Error en el buscador: " + e.message });
  }
}
