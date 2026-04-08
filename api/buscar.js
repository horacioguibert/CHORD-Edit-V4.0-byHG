module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const query = req.body && req.body.query ? req.body.query : null;
  if (!query) return res.status(400).json({ error: "Falta query" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Sin API key" });

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Return ONLY valid JSON for song "' + query + '": {"titulo":"X","artista":"X","compas":"4/4","secciones":[{"label":"ESTROFA","compases":[{"beats":[{"chord":"Am","note":""}],"lyric":"lyric"}]}]}. Labels: INTRO ESTROFA ESTRIBILLO PUENTE OUTRO. Max 4 sections, 8 bars.' }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 2000 }
    })
  });

  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch(e) { return res.status(500).json({ error: "Parse error: " + text.substring(0, 200) }); }
  if (data.error) return res.status(500).json({ error: data.error.code + ": " + data.error.message });

  const txt = data.candidates[0].content.parts[0].text;
  const first = txt.indexOf("{");
  const last = txt.lastIndexOf("}");
  if (first === -1) return res.status(500).json({ error: "No JSON: " + txt.substring(0, 200) });

  try {
    const result = JSON.parse(txt.substring(first, last + 1));
    return res.status(200).json(result);
  } catch(e) {
    return res.status(500).json({ error: "JSON parse failed: " + txt.substring(first, first + 200) });
  }
};
