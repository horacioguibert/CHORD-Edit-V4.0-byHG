export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro query" });

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Cifrado completo de la canción "${query}". Devolvé SOLO este JSON sin texto adicional, sin backticks, sin comentarios:
{"titulo":"X","artista":"X","compas":"4/4","secciones":[{"label":"ESTROFA","compases":[{"beats":[{"chord":"G","note":""}],"lyric":"letra"}]}]}
Labels válidos: INTRO ESTROFA ESTRIBILLO PUENTE OUTRO. Acordes reales correctos. Máximo 4 secciones, 8 compases por sección.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4000
        }
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: `Google API (${data.error.code}): ${data.error.message}` });

    const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const match = txt.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: "Respuesta inválida de la IA" });

    // balance de llaves para asegurar JSON completo
    let depth = 0, end = 0;
    for (let i = 0; i < match[0].length; i++) {
      if (match[0][i] === "{") depth++;
      if (match[0][i] === "}") depth--;
      if (depth === 0) { end = i; break; }
    }
    const json = JSON.parse(match[0].substring(0, end + 1));
    return res.status(200).json(json);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
