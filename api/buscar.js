export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  // ESTA ES LA ÚNICA LLAVE: Apuntamos al servidor regional donde está su cuota "Ilimitada"
  const API_URL = `https://us-central1-generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Actúa como experto musical. Dame el JSON de la canción: ${query}. Responde ÚNICAMENTE el objeto JSON puro.` }] }]
      })
    });

    // Si no es un 200 OK, leemos el error exacto para no adivinar más
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Fallo Regional de Google (${response.status}): ${errorText}` 
      });
    }

    const data = await response.json();
    const txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (e) {
    return res.status(500).json({ error: "Falla de Motor: " + e.message });
  }
}
