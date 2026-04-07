export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY; 
  
  // ESCÁNER TÉCNICO: Interrogamos a la fábrica para ver qué modelos nos dejan usar
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.error) {
      return res.status(data.error.code || 500).json({ 
        error: `ERROR DE ACCESO: ${data.error.message}. Esto confirma que su API KEY no tiene permisos.` 
      });
    }

    // EXTRAEMOS SOLO LOS NOMBRES DE LOS MODELOS DISPONIBLES
    const modelosDisponibles = data.models.map(m => m.name.replace('models/', ''));
    
    return res.status(200).json({
      mensaje: "INVENTARIO ENCONTRADO",
      modelos_que_si_funcionan: modelosDisponibles
    });

  } catch (e) {
    return res.status(500).json({ error: "Falla de Comunicación: " + e.message });
  }
}
