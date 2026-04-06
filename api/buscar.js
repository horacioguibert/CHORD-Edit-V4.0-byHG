export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro query" });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Genera el cifrado de la canción "${query}". 
            Responde ÚNICAMENTE con un JSON válido (sin etiquetas de código ni texto extra) con esta estructura:
            {"titulo":"Nombre","artista":"Nombre","compas":"4/4","secciones":[{"label":"ESTROFA","compases":[{"beats":[{"chord":"G","note":""}],"lyric":"letra"}]}]}`
          }]
        }]
      })
    });

    const data = await response.json();
    
    // Verificamos si Google devolvió un error de cuota o clave
    if (data.error) throw new Error(data.error.message);

    // Esta es la parte sensible que corregimos:
    const candidate = data.candidates?.[0];
    if (!candidate) throw new Error("Google no encontró resultados para esta búsqueda.");
    
    let txt = candidate.content.parts[0].text;
    
    // Limpiamos el texto por si Gemini puso etiquetas de ```json ... ```
    txt = txt.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const json = JSON.parse(txt);
    return res.status(200).json(json);
  } catch (e) {
    console.error("Error detallado:", e);
    return res.status(500).json({ error: "Error en el buscador: " + e.message });
  }
}
