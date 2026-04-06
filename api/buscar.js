export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro query" });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    // Usamos la ruta v1beta con el modelo 'gemini-pro' que es el más estable para texto
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Actúa como un experto musical. Genera el cifrado completo de la canción "${query}". 
            Responde ÚNICAMENTE con un JSON válido (sin etiquetas de código ni texto extra) con esta estructura:
            {"titulo":"Nombre","artista":"Nombre","compas":"4/4","secciones":[{"label":"ESTROFA","compases":[{"beats":[{"chord":"G","note":""}],"lyric":"letra"}]}]}
            Usa nombres de acordes estándar (Am7, Gmaj7, etc.).`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "Error desconocido en la API de Google");
    }

    const candidate = data.candidates?.[0];
    if (!candidate) throw new Error("No se encontraron resultados. Intenta con otro nombre de canción.");
    
    let txt = candidate.content.parts[0].text;
    
    // Limpieza profunda de cualquier formato Markdown que Gemini pueda agregar
    txt = txt.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Intentamos encontrar el primer '{' y el último '}' por si hay texto basura alrededor
    const inicio = txt.indexOf('{');
    const fin = txt.lastIndexOf('}') + 1;
    const jsonLimpio = txt.substring(inicio, fin);
    
    const json = JSON.parse(jsonLimpio);
    return res.status(200).json(json);
  } catch (e) {
    return res.status(500).json({ error: "Error en el buscador: " + e.message });
  }
}
