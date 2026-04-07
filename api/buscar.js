export default async function handler(req, res) {
  // 1. Control de acceso: Solo permitimos pedidos POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }
  
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Falta el parámetro de búsqueda" });
  }

  // 2. Configuración de Energía de Pago (Versión estable v1)
  const API_KEY = process.env.GEMINI_API_KEY; 
  const MODEL = "gemini-1.5-flash"; 
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

  // 3. Instrucciones de Estructura Musical para la IA
  const prompt = `Actúa como un experto en transcripción musical. 
  Genera el cifrado completo de la canción: "${query}". 
  
  Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional, siguiendo esta estructura exacta:
  {
    "titulo": "Nombre de la canción",
    "artista": "Nombre del artista",
    "compas": "4/4",
    "capo": 0,
    "secciones": [
      {
        "label": "ESTROFA",
        "compases": [
          {
            "beats": [{"chord": "G", "note": ""}],
            "lyric": "Letra de este compás"
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
          temperature: 0.1, // Precisión máxima para evitar errores armónicos
          maxOutputTokens: 4000
        }
      })
    });

    const data = await response.json();

    // Verificación de Suministro: Si Google rechaza la llave o el modelo
    if (data.error) {
      throw new Error(`Error de Google API: ${data.error.message}`);
    }

    // 4. Limpieza de datos: Extraer el JSON del bloque de texto de la IA
    let txt = data.candidates[0].content.parts[0].text;
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("La IA no entregó un formato JSON válido");
    }
    
    const cancionProcesada = JSON.parse(jsonMatch[0]);
    
    // 5. Envío exitoso a la planilla App.jsx
    return res.status(200).json(cancionProcesada);

  } catch (e) {
    console.error("Falla Crítica:", e.message);
    return res.status(500).json({ 
      error: "Error en el motor de búsqueda: " + e.message 
    });
  }
}
