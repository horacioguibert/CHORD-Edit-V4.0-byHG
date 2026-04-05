import { useState, useEffect, useRef } from "react";
 
const CROM = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const CROM_B = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];
const AFIN = { 6: "E", 5: "A", 4: "D", 3: "G", 2: "B", 1: "E" };
const idxN = (n) => {
  const i = CROM.indexOf(n);
  return i !== -1 ? i : CROM_B.indexOf(n);
};
const usarB = (r) => ["F", "Bb", "Eb", "Ab", "Db", "Gb"].includes(r);
const mover = (n, s, b) => {
  const i = idxN(n);
  if (i === -1) return n;
  return (b ? CROM_B : CROM)[(((i + s) % 12) + 12) % 12];
};
const notaEn = (c, t) => CROM[(idxN(AFIN[c]) + t) % 12];
const ITVS = ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"];
const itvFn = (r, n) => ITVS[(idxN(n) - idxN(r) + 12) % 12];
const simplify = (a) => {
  if (!a) return "";
  const m = a.match(/^([A-G][#b]?)(m?)/);
  return m ? m[1] + m[2] : a;
};
const raizDeStr = (str) => {
  const m = (str || "").trim().match(/^([A-G][#b]?)/i);
  return m ? m[1][0].toUpperCase() + m[1].slice(1) : null;
};
 
function tAcorde(a, s, b) {
  if (!a) return "";
  if (s === 0) return a;
  return a
    .split("/")
    .map((p) => {
      const m = p.match(/^([A-G][#b]?)(.*)$/);
      return m ? mover(m[1], s, b) + m[2] : p;
    })
    .join("/");
}
 
const MI = [0, 2, 4, 5, 7, 9, 11],
  mI = [0, 2, 3, 5, 7, 8, 10];
const MQ = ["maj", "m", "m", "maj", "maj", "m", "dim"],
  mQ = ["m", "dim", "maj", "m", "m", "maj", "maj"];
const MF = ["T", "SD", "T", "SD", "D", "T", "D"],
  mF = ["T", "D", "T", "SD", "SD", "SD", "D"];
const MG = ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
  mG = ["i", "ii°", "III", "iv", "v", "VI", "VII"];
function buildEscala(raiz, menor) {
  const ints = menor ? mI : MI,
    q = menor ? mQ : MQ,
    f = menor ? mF : MF,
    g = menor ? mG : MG;
  const b = usarB(raiz),
    base = idxN(raiz);
  return ints.map((iv, i) => {
    const r = (b ? CROM_B : CROM)[(base + iv) % 12];
    const a = q[i] === "maj" ? r : q[i] === "m" ? r + "m" : r + "dim";
    return { g: g[i], a, f: f[i] };
  });
}
 
const ITV_LABEL = {
  "1": "T",
  b2: "b2",
  "2": "2",
  b3: "3m",
  "3": "3M",
  "4": "4",
  b5: "b5",
  "5": "5",
  b6: "b6",
  "6": "6",
  b7: "7m",
  "7": "7M",
};
 
function DiagramaBib({
  nombre,
  raiz,
  cuerdas,
  barre,
  barreDesde,
  barreHasta,
  dedos,
  sz = 1,
}) {
  const x0 = 22 * sz,
    y0 = 34 * sz,
    cw = 18 * sz,
    rh = 20 * sz,
    nt = 5;
  const W = x0 * 2 + cw * 5 + 20 * sz,
    H = y0 + rh * nt + 18 * sz;
  const cx = (s) => x0 + (6 - s) * cw;
  const bD = barreDesde || 1,
    bH = barreHasta || 5;
  const notasCuerda = [6, 5, 4, 3, 2, 1].map((s, i) => {
    const v = cuerdas[i];
    if (v === "x") return null;
    if (v === "o") return notaEn(s, 0);
    const d = dedos && dedos.find((d) => d.s === s);
    if (d) return notaEn(s, d.f);
    if (barre) return notaEn(s, barre);
    return null;
  });
  const formula = notasCuerda.map((n) => (n && raiz ? itvFn(raiz, n) : null));
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block" }}
    >
      {[6, 5, 4, 3, 2, 1].map((s, i) => (
        <text
          key={s}
          x={cx(s)}
          y={y0 - 21 * sz}
          textAnchor="middle"
          style={{
            fontSize: 8.5 * sz,
            fontWeight: 700,
            fill: "#111",
            fontFamily: "Arial,sans-serif",
          }}
        >
          {notasCuerda[i] || ""}
        </text>
      ))}
      {[6, 5, 4, 3, 2, 1].map((s, i) => {
        const v = cuerdas[i];
        if (v === "x")
          return (
            <text
              key={s}
              x={cx(s)}
              y={y0 - 11 * sz}
              textAnchor="middle"
              style={{ fontSize: 10 * sz, fontWeight: 900, fill: "#cc3333" }}
            >
              x
            </text>
          );
        if (v === "o")
          return (
            <text
              key={s}
              x={cx(s)}
              y={y0 - 11 * sz}
              textAnchor="middle"
              style={{ fontSize: 10 * sz, fontWeight: 900, fill: "#2a882a" }}
            >
              o
            </text>
          );
        return null;
      })}
      <rect
        x={x0 - 1}
        y={y0 - 5 * sz}
        width={cw * 5 + 2}
        height={5 * sz}
        rx={1.5}
        fill="#8B5E3C"
      />
      <rect
        x={x0}
        y={y0}
        width={cw * 5}
        height={rh * nt}
        fill="#f5e6c8"
        rx={1}
      />
      {[0, 1, 2, 3, 4, 5].map((f) => (
        <line
          key={f}
          x1={x0}
          y1={y0 + f * rh}
          x2={x0 + cw * 5}
          y2={y0 + f * rh}
          stroke="#c8a87a"
          strokeWidth={f === 0 ? 1.5 : 0.8}
        />
      ))}
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <line
          key={s}
          x1={cx(s)}
          y1={y0}
          x2={cx(s)}
          y2={y0 + nt * rh}
          stroke="#999"
          strokeWidth={0.5 + (s - 1) * 0.35}
        />
      ))}
      {[1, 2, 3, 4, 5].map((f) => (
        <text
          key={f}
          x={x0 + cw * 5 + 12 * sz}
          y={y0 + (f - 1) * rh + rh / 2 + 3 * sz}
          textAnchor="start"
          style={{
            fontSize: 7 * sz,
            fill: "#111",
            fontWeight: 700,
            fontFamily: "Arial,sans-serif",
          }}
        >
          {f}
        </text>
      ))}
{barre &&
        (() => {
          const y = y0 + (barre - 1) * rh + 2 * sz,
            h = rh - 4 * sz;
          const barreStrings = [6, 5, 4, 3, 2, 1].filter((s) => {
            const idx = [6, 5, 4, 3, 2, 1].indexOf(s);
            if (cuerdas[idx] !== "b") return false;
            if (s < bD || s > bH) return false;
            return !(dedos && dedos.some((d) => d.s === s));
          });
          return (
            <g>
              <text
                x={x0 + cw * 5 + 12 * sz}
                y={y + h / 2 + 3 * sz}
                textAnchor="start"
                style={{
                  fontSize: 8 * sz,
                  fill: "#111",
                  fontWeight: 900,
                  fontFamily: "Arial,sans-serif",
                }}
              >
                {barre}
              </text>
              <rect
                x={cx(bH) - 6 * sz}
                y={y}
                width={cx(bD) - cx(bH) + 12 * sz}
                height={h}
                rx={h / 2}
                fill="#e0e0e0"
                stroke="#666"
                strokeWidth={1.5}
              />
              {barreStrings.map((s) => {
                const nota = notaEn(s, barre);
                const itv = raiz ? itvFn(raiz, nota) : null;
                const lbl = ITV_LABEL[itv] || itv || "";
                const fs = lbl.length >= 2 ? 6 * sz : 8 * sz;
                return (
                  <g key={s}>
                    <circle
                      cx={cx(s)}
                      cy={y + h / 2}
                      r={7 * sz}
                      fill="white"
                      stroke="#cc3333"
                      strokeWidth={1.2}
                    />
                    <text
                      x={cx(s)}
                      y={y + h / 2 + fs * 0.38}
                      textAnchor="middle"
                      style={{
                        fontSize: fs,
                        fill: "#cc3333",
                        fontWeight: 900,
                        fontFamily: "Arial,sans-serif",
                      }}
                    >
                      {lbl}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })()}
      {dedos &&
        dedos.map((d, i) => {
          if (d.f < 1 || d.f > 5) return null;
          const nota = notaEn(d.s, d.f);
          const itv = raiz ? itvFn(raiz, nota) : null;
          const lbl = ITV_LABEL[itv] || itv || "";
          const fs = lbl.length >= 2 ? 6 * sz : 8 * sz;
          return (
            <g key={i}>
              <circle
                cx={cx(d.s)}
                cy={y0 + (d.f - 1) * rh + rh / 2}
                r={7.5 * sz}
                fill="white"
                stroke="#cc3333"
                strokeWidth={1.2}
              />
              <text
                x={cx(d.s)}
                y={y0 + (d.f - 1) * rh + rh / 2 + fs * 0.38}
                textAnchor="middle"
                style={{
                  fontSize: fs,
                  fill: "#cc3333",
                  fontWeight: 900,
                  fontFamily: "Arial,sans-serif",
                }}
              >
                {lbl}
              </text>
            </g>
          );
        })}
      {[6, 5, 4, 3, 2, 1].map((s, i) => (
        <text
          key={s}
          x={cx(s)}
          y={H - 3}
          textAnchor="middle"
          style={{
            fontSize: 6.5 * sz,
            fill: cuerdas[i] === "x" ? "#ccc" : "#cc3333",
            fontWeight: 700,
          }}
        >
          {formula[i] || "-"}
        </text>
      ))}
    </svg>
  );
}
 
function getShapeBib(nombre) {
  if (!nombre) return null;
  const sb = nombre.split("/")[0];
  for (const grupo of Object.values(DEFS_BIB)) {
    const f = grupo.find((a) => a.nombre === nombre || a.nombre === sb);
    if (f) return f;
  }
  return null;
}
 
function Popup({ acorde, onClose }) {
  const sh = getShapeBib(acorde);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 10,
          padding: "20px 24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            marginBottom: 8,
            color: "#333",
          }}
        >
          {acorde}
        </div>
        {sh ? (
          <DiagramaBib {...sh} sz={1.5} />
        ) : (
          <div style={{ padding: 20, color: "#888", fontSize: 13 }}>
            Sin diagrama para <strong>{acorde}</strong>
          </div>
        )}
        <button
          onClick={onClose}
          style={{
            marginTop: 12,
            padding: "5px 20px",
            borderRadius: 5,
            border: "1px solid #ccc",
            background: "#f5f5f5",
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
 
const DEFS_BIB = {
  mayor: [
    {
      nombre: "A",
      raiz: "A",
      cuerdas: ["x", "o", "p", "p", "p", "o"],
      dedos: [
        { s: 4, f: 2, n: 1 },
        { s: 3, f: 2, n: 2 },
        { s: 2, f: 2, n: 3 },
      ],
    },
    {
      nombre: "B",
      raiz: "B",
      cuerdas: ["x", "b", "b", "b", "b", "b"],
      barre: 2,
      barreDesde: 1,
      barreHasta: 5,
      dedos: [
        { s: 4, f: 4, n: 2 },
        { s: 3, f: 4, n: 3 },
        { s: 2, f: 4, n: 4 },
      ],
    },
    {
      nombre: "C",
      raiz: "C",
      cuerdas: ["x", "p", "p", "o", "p", "o"],
      dedos: [
        { s: 2, f: 1, n: 1 },
        { s: 4, f: 2, n: 2 },
        { s: 5, f: 3, n: 3 },
      ],
    },
    {
      nombre: "D",
      raiz: "D",
      cuerdas: ["x", "x", "o", "p", "p", "p"],
      dedos: [
        { s: 3, f: 2, n: 1 },
        { s: 1, f: 2, n: 2 },
        { s: 2, f: 3, n: 3 },
      ],
    },
    {
      nombre: "E",
      raiz: "E",
      cuerdas: ["o", "p", "p", "p", "o", "o"],
      dedos: [
        { s: 3, f: 1, n: 1 },
        { s: 5, f: 2, n: 2 },
        { s: 4, f: 2, n: 3 },
      ],
    },
    {
      nombre: "F",
      raiz: "F",
      cuerdas: ["b", "b", "b", "b", "b", "b"],
      barre: 1,
      barreDesde: 1,
      barreHasta: 6,
      dedos: [
        { s: 3, f: 2, n: 2 },
        { s: 5, f: 3, n: 3 },
        { s: 4, f: 3, n: 4 },
      ],
    },
    {
      nombre: "G",
      raiz: "G",
      cuerdas: ["p", "p", "o", "o", "p", "p"],
      dedos: [
        { s: 5, f: 2, n: 1 },
        { s: 6, f: 3, n: 2 },
        { s: 2, f: 3, n: 3 },
        { s: 1, f: 3, n: 4 },
      ],
    },
  ],
  menor: [
    {
      nombre: "Am",
      raiz: "A",
      cuerdas: ["x", "o", "p", "p", "p", "o"],
      dedos: [
        { s: 2, f: 1, n: 1 },
        { s: 4, f: 2, n: 2 },
        { s: 3, f: 2, n: 3 },
      ],
    },
    {
      nombre: "Bm",
      raiz: "B",
      cuerdas: ["x", "b", "b", "b", "b", "b"],
      barre: 2,
      barreDesde: 1,
      barreHasta: 5,
      dedos: [
        { s: 4, f: 4, n: 3 },
        { s: 3, f: 4, n: 4 },
        { s: 2, f: 3, n: 2 },
      ],
    },
    {
      nombre: "Cm",
      raiz: "C",
      cuerdas: ["x", "b", "b", "b", "b", "b"],
      barre: 3,
      barreDesde: 1,
      barreHasta: 5,
      dedos: [
        { s: 4, f: 5, n: 3 },
        { s: 3, f: 5, n: 4 },
        { s: 2, f: 4, n: 2 },
      ],
    },
    {
      nombre: "Dm",
      raiz: "D",
      cuerdas: ["x", "x", "o", "p", "p", "p"],
      dedos: [
        { s: 1, f: 1, n: 1 },
        { s: 3, f: 2, n: 2 },
        { s: 2, f: 3, n: 3 },
      ],
    },
    {
      nombre: "Em",
      raiz: "E",
      cuerdas: ["o", "p", "p", "o", "o", "o"],
      dedos: [
        { s: 5, f: 2, n: 2 },
        { s: 4, f: 2, n: 3 },
      ],
    },
    {
      nombre: "Fm",
      raiz: "F",
      cuerdas: ["b", "b", "b", "b", "b", "b"],
      barre: 1,
      barreDesde: 1,
      barreHasta: 6,
      dedos: [
        { s: 5, f: 3, n: 3 },
        { s: 4, f: 3, n: 4 },
      ],
    },
    {
      nombre: "Gm",
      raiz: "G",
      cuerdas: ["b", "b", "b", "b", "b", "b"],
      barre: 3,
      barreDesde: 1,
      barreHasta: 6,
      dedos: [
        { s: 5, f: 5, n: 3 },
        { s: 4, f: 5, n: 4 },
      ],
    },
  ],
dom7: [
    {
      nombre: "A7",
      raiz: "A",
      cuerdas: ["x", "o", "p", "o", "p", "o"],
      dedos: [
        { s: 4, f: 2, n: 2 },
        { s: 2, f: 2, n: 3 },
      ],
    },
    {
      nombre: "B7",
      raiz: "B",
      cuerdas: ["x", "p", "p", "p", "o", "p"],
      dedos: [
        { s: 4, f: 1, n: 1 },
        { s: 5, f: 2, n: 2 },
        { s: 3, f: 2, n: 3 },
        { s: 1, f: 2, n: 4 },
      ],
    },
    {
      nombre: "C7",
      raiz: "C",
      cuerdas: ["x", "p", "p", "p", "p", "o"],
      dedos: [
        { s: 2, f: 1, n: 1 },
        { s: 4, f: 2, n: 2 },
        { s: 5, f: 3, n: 3 },
        { s: 3, f: 3, n: 4 },
      ],
    },
    {
      nombre: "D7",
      raiz: "D",
      cuerdas: ["x", "x", "o", "p", "p", "p"],
      dedos: [
        { s: 2, f: 1, n: 1 },
        { s: 3, f: 2, n: 2 },
        { s: 1, f: 2, n: 3 },
      ],
    },
    {
      nombre: "E7",
      raiz: "E",
      cuerdas: ["o", "p", "o", "p", "o", "o"],
      dedos: [
        { s: 3, f: 1, n: 1 },
        { s: 5, f: 2, n: 2 },
      ],
    },
    {
      nombre: "F7",
      raiz: "F",
      cuerdas: ["b", "b", "b", "b", "b", "b"],
      barre: 1,
      barreDesde: 1,
      barreHasta: 6,
      dedos: [
        { s: 3, f: 2, n: 2 },
        { s: 5, f: 3, n: 3 },
        { s: 4, f: 3, n: 4 },
      ],
    },
    {
      nombre: "G7",
      raiz: "G",
      cuerdas: ["p", "p", "o", "o", "o", "p"],
      dedos: [
        { s: 5, f: 2, n: 2 },
        { s: 6, f: 3, n: 3 },
        { s: 1, f: 1, n: 1 },
      ],
    },
  ],
};
 
const TABS_BIB = [
  { id: "mayor", label: "Mayor", f: [["1", ""], ["3", "M"], ["5", ""]] },
  { id: "menor", label: "Menor", f: [["1", ""], ["3", "m"], ["5", ""]] },
  { id: "dom7", label: "7", f: [["1", ""], ["3", "M"], ["5", ""], ["7", "m"]] },
  { id: "m7", label: "m7", f: [["1", ""], ["3", "m"], ["5", ""], ["7", "m"]] },
  { id: "maj7", label: "maj7", f: [["1", ""], ["3", "M"], ["5", ""], ["7", "M"]] },
  { id: "m7b5", label: "m7b5", f: [["1", ""], ["3", "m"], ["5", "b"], ["7", "m"]] },
  { id: "sus2", label: "sus2", f: [["1", ""], ["2", ""], ["5", ""]] },
  { id: "sus4", label: "sus4", f: [["1", ""], ["4", ""], ["5", ""]] },
];
 
// --- CONTINUACIÓN DEL MOTOR DE LA APP ---
export default function App() {
  const [data, setData] = useState({
    titulo: "Nueva Canción",
    artista: "",
    compas: "4/4",
    capo: 0,
    secciones: []
  });
  const [edit, setEdit] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [popup, setPopup] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const buscarIA = async (q) => {
    if (!q) return;
    setBuscando(true);
    try {
      const res = await fetch("/api/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });
      const json = await res.json();
      if (json.titulo) setData(json);
    } catch (e) {
      alert("Error al conectar con la IA");
    }
    setBuscando(false);
  };

  const agregarSeccion = () => {
    const nueva = { label: "ESTROFA", compases: [{ beats: [{ chord: "G", note: "" }], lyric: "" }] };
    setData({ ...data, secciones: [...data.secciones, nueva] });
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      padding: '20px', 
      maxWidth: '1000px', 
      margin: 'auto',
      background: '#fff',
      minHeight: '100vh'
    }}>
      <header style={{ borderBottom: '2px solid #eee', marginBottom: '20px', paddingBottom: '10px' }}>
        <input 
          value={data.titulo} 
          onChange={e => setData({...data, titulo: e.target.value})}
          style={{ fontSize: '24px', fontWeight: '900', border: 'none', width: '100%', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={() => setEdit(!edit)} style={{
            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
            background: edit ? '#0070f3' : '#eee', color: edit ? '#fff' : '#000', border: 'none'
          }}>
            {edit ? "✅ Guardar Vista" : "✏️ Editar"}
          </button>
          <button onClick={() => window.print()} style={{ padding: '8px 16px', cursor: 'pointer' }}>🖨️ Imprimir PDF</button>
        </div>
      </header>

      <main>
        {edit && (
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}><strong>IA:</strong> Escribe nombre y artista para generar el cifrado:</p>
            <input id="ia-input" placeholder="Ej: De música ligera - Soda Stereo" style={{ padding: '8px', width: '70%' }} />
            <button 
              onClick={() => buscarIA(document.getElementById('ia-input').value)}
              disabled={buscando}
              style={{ padding: '8px', marginLeft: '5px' }}
            >
              {buscando ? "Cargando..." : "Buscar con IA"}
            </button>
          </div>
        )}

        {data.secciones.map((sec, sIdx) => (
          <div key={sIdx} style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#d44', borderBottom: '1px solid #ffcccc' }}>{sec.label}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {sec.compases.map((comp, cIdx) => (
                <div key={cIdx} style={{ 
                  border: '1px solid #ddd', 
                  padding: '10px', 
                  position: 'relative',
                  minHeight: '60px',
                  background: '#fff'
                }}>
                  <div onClick={() => setPopup(comp.beats[0].chord)} style={{ fontWeight: 'bold', cursor: 'pointer', color: '#0070f3' }}>
                    {comp.beats[0].chord}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{comp.lyric}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {edit && (
          <button onClick={agregarSeccion} style={{ width: '100%', padding: '15px', border: '2px dashed #ccc', background: 'none', cursor: 'pointer' }}>
            + Agregar Sección Nueva
          </button>
        )}
      </main>

      {popup && <Popup acorde={popup} onClose={() => setPopup(null)} />}
      
      <footer style={{ marginTop: '50px', fontSize: '11px', color: '#aaa', textAlign: 'center' }}>
        Editor Musical HG v3.0 - Generado para mantenimiento de obras civiles
      </footer>
    </div>
  );
}
