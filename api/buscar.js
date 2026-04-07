export default async function handler(req, res) {
  // 1. Control de acceso al motor
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Falta el parámetro de búsqueda" });

  // 2. Suministro de Energía (Variable de entorno para seguridad)
  const API_KEY = process.env.GEMINI_API_KEY; 
  const MODEL = "gemini-1.5-flash"; 
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  // 3. El "Blueprint" (Instrucciones precisas para la IA)
  const prompt = `Actúa como un experto en transcripción musical y cifrado. 
  Proporciona el cifrado completo de la canción: "${query}". 
  Es vital que identifiques estrofas, estribillos y coloques los acordes en sus compases correspondientes.
  
  Responde ÚNICAMENTE con un objeto JSON válido, sin texto extra ni comentarios, con esta estructura:
  {
    "titulo": "Nombre real de la canción",
    "artista": "Nombre del artista",
    "compas": "4/4",
    "capo": 0,
    "secciones": [
      {
        "label": "INTRO / ESTROFA / CORO",
        "compases": [
          {
            "beats": [{"chord": "Acorde", "note": ""}],
            "lyric": "fragmento de letra correspondiente"
          }
        ]
      }
    ]
  }`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1, // Baja temperatura para máxima precisión estructural
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 4096,
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Error de API: ${data.error.message}`);
    }

    // 4. Control de Calidad: Extraer y limpiar el JSON
    let txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("La IA no devolvió un formato compatible");
    
    const cancionFinal = JSON.parse(jsonMatch[0]);
    
    // Enviar a la planilla App.jsx
    return res.status(200).json(cancionFinal);

  } catch (e) {
    console.error("Falla en el buscador:", e.message);
    return res.status(500).json({ error: "Falla de conexión: " + e.message });
  }
}
