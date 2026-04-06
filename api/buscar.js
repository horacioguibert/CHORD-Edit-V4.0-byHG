export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro query" });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    // Usamos el modelo de última generación 2.0 que es el estándar actual
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Actúa como experto musical. Genera el cifrado de "${query}". 
            Responde SOLO con un JSON válido (sin texto extra ni marcas de código):
            {"titulo":"X","artista":"X","compas":"4/4","secciones":[{"label":"ESTROFA","compases":[{"beats":[{"chord":"G","note":""}],"lyric":"letra"}]}]}`
          }]
        }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const txt = data.candidates[0].content.parts[0].text;
    const inicio = txt.indexOf('{');
    const fin = txt.lastIndexOf('}') + 1;
    const json = JSON.parse(txt.substring(inicio, fin));
    
    return res.status(200).json(json);
  } catch (e) {
    return res.status(500).json({ error: "Error en el buscador: " + e.message });
  }
}
