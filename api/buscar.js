export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // RUTA DE MÁXIMA COMPATIBILIDAD (v1) con el motor gemini-1.0-pro
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Dame el JSON musical de: ${query}. Responde SOLO el objeto JSON.` }] }]
      })
    });

    const data = await response.json();
    
    // Si falla, nos dirá el mensaje exacto de Google
    if (data.error) {
      throw new Error(`${data.error.message} (Código ${data.error.code})`);
    }

    const txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
