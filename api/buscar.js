export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro query" });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Actúa como un experto musical. Genera el cifrado completo de la canción "${query}". 
            Responde ÚNICAMENTE con un JSON válido que siga esta estructura:
            {"titulo":"X","artista":"X","compas":"4/4","secciones":[{"label":"ESTROFA","compases":[{"beats":[{"chord":"G","note":""}],"lyric":"letra"}]}]}
            Usa nombres de acordes estándar (Am7, Gmaj7, etc.). No incluyas texto extra.`
          }]
        }]
      })
    });

    const data = await response.json();
    const txt = data.candidates[0].content.parts[0].text;
    const json = JSON.parse(txt.match(/\{[\s\S]*\}/)[0]);
    return res.status(200).json(json);
  } catch (e) {
    return res.status(500).json({ error: "Error en el buscador: " + e.message });
  }
}
