export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;
    const query = body && body.query ? body.query : null;
    if (!query) return res.status(400).json({ error: "Falta query" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API key no configurada" });

    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

    const body2 = {
      contents: [{
        parts: [{
          text: 'Return only this JSON for song "' + query + '": {"titulo":"X","artista":"X","compas":"4/4","secciones":[{"label":"ESTROFA","compases":[{"beats":[{"chord":"Am","note":""}],"lyric":"lyric"}]}]}'
        }]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 2000 }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body2)
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
    if (first === -1) return res.status(500).json({ error: "No JSON en respuesta. Raw: " + txt.substring(0, 300) });

    const jsonStr = txt.substring(first, last + 1);
    const result = JSON.parse(jsonStr);
    return res.status(200).json(result);

  } catch(e) {
    return res.status(500).json({ error: "Exception: " + e.message + " | stack: " + (e.stack||"").substring(0,200) });
  }
}
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro query" });

  const apiKey = process.env.GEMINI_API_KEY;

  const modelos = [
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
  ];

  const prompt = `Generate a chord chart JSON for the song "${query}".
Return ONLY a valid JSON object. No markdown, no backticks, no explanation.
Use this exact structure:
{"titulo":"Song Name","artista":"Artist Name","compas":"4/4","secciones":[{"label":"VERSE","compases":[{"beats":[{"chord":"G","note":""}],"lyric":"lyric line"}]}]}
Valid labels: INTRO ESTROFA ESTRIBILLO PUENTE OUTRO
Maximum 4 sections, 8 bars each. Real chords only.`;

  let lastError = "";
  let lastRawText = "";

  for (const modelo of modelos) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4000
          }
        })
      });

      const data = await response.json();
      if (data.error) { lastError = `${modelo}: ${data.error.message}`; continue; }

      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      lastRawText = txt.substring(0, 500);

      let clean = txt.replace(/```json/gi,"").replace(/```/g,"").trim();
      const first = clean.indexOf("{");
      const last = clean.lastIndexOf("}");
      if (first === -1 || last === -1) { lastError = `${modelo}: no JSON. Raw: ${lastRawText}`; continue; }
      clean = clean.substring(first, last + 1);

      let json;
      try {
        json = JSON.parse(clean);
      } catch(e) {
        // devolver el texto crudo para diagnosticar
        return res.status(200).json({
          _debug: true,
          _modelo: modelo,
          _parseError: e.message,
          _rawText: txt.substring(0, 1000)
        });
      }

      if (!json.secciones || !json.titulo) {
        return res.status(200).json({
          _debug: true,
          _modelo: modelo,
          _issue: "missing fields",
          _keys: Object.keys(json),
          _rawText: txt.substring(0, 500)
        });
      }

      return res.status(200).json(json);

    } catch (e) {
      lastError = `${modelo}: ${e.message}`;
      continue;
    }
  }

  return res.status(500).json({ error: `No model worked. Last: ${lastError}`, raw: lastRawText });
}
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro query" });

  const apiKey = process.env.GEMINI_API_KEY;

  const modelos = [
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
  ];

  const prompt = `Generate a chord chart JSON for the song "${query}".
Return ONLY a valid JSON object. No markdown, no backticks, no explanation.
Use this exact structure:
{"titulo":"Song Name","artista":"Artist Name","compas":"4/4","secciones":[{"label":"VERSE","compases":[{"beats":[{"chord":"G","note":""}],"lyric":"lyric line"}]}]}
Valid labels: INTRO ESTROFA ESTRIBILLO PUENTE OUTRO
Maximum 4 sections, 8 bars each. Real chords only.`;

  let lastError = "";
  let lastRawText = "";

  for (const modelo of modelos) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4000,
            responseMimeType: "application/json"
          }
        })
      });

      const data = await response.json();
      if (data.error) { lastError = `${modelo}: ${data.error.message}`; continue; }

      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      lastRawText = txt.substring(0, 200);

      // limpiar el texto agresivamente
      let clean = txt
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/^\s*[\r\n]/gm, "")
        .trim();

      // encontrar primer { y último }
      const first = clean.indexOf("{");
      const last = clean.lastIndexOf("}");
      if (first === -1 || last === -1) { lastError = `${modelo}: no JSON found. Raw: ${lastRawText}`; continue; }

      clean = clean.substring(first, last + 1);

      let json;
      try {
        json = JSON.parse(clean);
      } catch(parseErr) {
        lastError = `${modelo}: parse error: ${parseErr.message}. Raw start: ${lastRawText}`;
        continue;
      }

      if (!json.secciones || !json.titulo) { lastError = `${modelo}: missing fields`; continue; }

      return res.status(200).json(json);

    } catch (e) {
      lastError = `${modelo}: ${e.message}`;
      continue;
    }
  }

  return res.status(500).json({
    error: `No model worked. Last error: ${lastError}`,
    rawPreview: lastRawText
  });
}
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro query" });

  const apiKey = process.env.GEMINI_API_KEY;

  // Lista de modelos en orden de preferencia
  const modelos = [
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
  ];

  const prompt = `Cifrado completo de la canción "${query}". Devolvé SOLO este JSON sin texto adicional, sin backticks, sin comentarios:
{"titulo":"X","artista":"X","compas":"4/4","secciones":[{"label":"ESTROFA","compases":[{"beats":[{"chord":"G","note":""}],"lyric":"letra"}]}]}
Labels válidos: INTRO ESTROFA ESTRIBILLO PUENTE OUTRO. Acordes reales correctos. Máximo 4 secciones, 8 compases por sección.`;

  let lastError = "";

  for (const modelo of modelos) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4000 }
        })
      });

      const data = await response.json();

      // si este modelo da error, probamos el siguiente
      if (data.error) {
        lastError = `${modelo}: ${data.error.message}`;
        continue;
      }

      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const match = txt.match(/\{[\s\S]*\}/);
      if (!match) { lastError = `${modelo}: no JSON en respuesta`; continue; }

      let depth = 0, end = 0;
      for (let i = 0; i < match[0].length; i++) {
        if (match[0][i] === "{") depth++;
        if (match[0][i] === "}") depth--;
        if (depth === 0) { end = i; break; }
      }

      const json = JSON.parse(match[0].substring(0, end + 1));
      if (!json.secciones || !json.titulo) { lastError = `${modelo}: estructura inválida`; continue; }

      // éxito — devolvemos el resultado indicando qué modelo funcionó
      json._modelo = modelo;
      return res.status(200).json(json);

    } catch (e) {
      lastError = `${modelo}: ${e.message}`;
      continue;
    }
  }

  // ningún modelo funcionó
  return res.status(500).json({ error: `Ningún modelo disponible. Último error: ${lastError}` });
}
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro query" });

  const apiKey = process.env.GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

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
