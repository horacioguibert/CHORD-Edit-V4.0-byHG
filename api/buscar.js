module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const query = req.body && req.body.query ? req.body.query : null;
    if (!query) return res.status(400).json({ error: "Falta query" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API key no configurada" });

    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

    const payload = {
      contents: [{
        parts: [{
          text: 'Return ONLY a JSON object for song "' + query + '". Structure: {"titulo":"X","artista":"X","compas":"4/4","secciones":[{"label":"ESTROFA","compases":[{"beats":[{"chord":"Am","note":""}],"lyric":"lyric"}]}]}. Labels: INTRO ESTROFA ESTRIBILLO PUENTE OUTRO. Max 4 sections.'
        }]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 2000 }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    let geminiData;
    try {
      geminiData = JSON.parse(text);
    } catch(e) {
      return res.status(500).json({ error: "Gemini raw: " + text.substring(0, 300) });
    }

    if (geminiData.error) {
      return res.status(500).json({ error: geminiData.error.code + ": " + geminiData.error.message });
    }

    const txt = geminiData.candidates[0].content.parts[0].text;
    const first = txt.indexOf("{");
    const last = txt.lastIndexOf("}");
    if (first === -1) return res.status(500).json({ error: "No JSON. Raw: " + txt.substring(0, 300) });

    const result = JSON.parse(txt.substring(first, last + 1));
    return res.status(200).json(result);

  } catch(e) {
    return res.status(500).json({ error: "Exception: " + e.message });
  }
}
