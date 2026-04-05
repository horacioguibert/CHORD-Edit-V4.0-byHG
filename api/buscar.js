export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro query" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4000,
        system: "Responde solo con JSON válido. Sin texto extra ni comentarios.",
        messages: [{
          role: "user",
          content: `Cifrado completo de "${query}". Formato: {"titulo":"X","artista":"X","compas":"4/4","secciones":[{"label":"ESTROFA","compases":[{"beats":[{"chord":"G","note":""}],"lyric":"letra"}]}]}`
        }]
      })
    });

    const data = await response.json();
    const txt = data.content[0].text;
    const json = JSON.parse(txt.match(/\{[\s\S]*\}/)[0]);
    return res.status(200).json(json);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
