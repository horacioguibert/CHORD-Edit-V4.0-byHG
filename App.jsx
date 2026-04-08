import { useState, useEffect, useRef } from "react";

const CROM   = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const CROM_B = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
const AFIN   = {6:"E",5:"A",4:"D",3:"G",2:"B",1:"E"};
const idxN   = n => { const i=CROM.indexOf(n); return i!==-1?i:CROM_B.indexOf(n); };
const usarB  = r => ["F","Bb","Eb","Ab","Db","Gb"].includes(r);
const mover  = (n,s,b) => { const i=idxN(n); if(i===-1)return n; return(b?CROM_B:CROM)[((i+s)%12+12)%12]; };
const notaEn = (c,t) => CROM[(idxN(AFIN[c])+t)%12];
const ITVS   = ["1","b2","2","b3","3","4","b5","5","b6","6","b7","7"];
const itvFn  = (r,n) => ITVS[(idxN(n)-idxN(r)+12)%12];
const simplify = a => { if(!a)return""; const m=a.match(/^([A-G][#b]?)(m?)/); return m?m[1]+m[2]:a; };
const raizDeStr = str => { const m=(str||"").trim().match(/^([A-G][#b]?)/i); return m?m[1][0].toUpperCase()+m[1].slice(1):null; };

function tAcorde(a,s,b){
  if(!a)return""; if(s===0)return a;
  return a.split("/").map(p=>{ const m=p.match(/^([A-G][#b]?)(.*)$/); return m?mover(m[1],s,b)+m[2]:p; }).join("/");
}

const MI=[0,2,4,5,7,9,11], mI=[0,2,3,5,7,8,10];
const MQ=["maj","m","m","maj","maj","m","dim"], mQ=["m","dim","maj","m","m","maj","maj"];
const MF=["T","SD","T","SD","D","T","D"], mF=["T","D","T","SD","SD","SD","D"];
const MG=["I","ii","iii","IV","V","vi","vii°"], mG=["i","ii°","III","iv","v","VI","VII"];
function buildEscala(raiz,menor){
  const ints=menor?mI:MI, q=menor?mQ:MQ, f=menor?mF:MF, g=menor?mG:MG;
  const b=usarB(raiz), base=idxN(raiz);
  return ints.map((iv,i)=>{ const r=(b?CROM_B:CROM)[(base+iv)%12]; const a=q[i]==="maj"?r:q[i]==="m"?r+"m":r+"dim"; return{g:g[i],a,f:f[i]}; });
}

const ITV_LABEL = {"1":"T","b2":"b2","2":"2","b3":"3m","3":"3M","4":"4","b5":"b5","5":"5","b6":"b6","6":"6","b7":"7m","7":"7M"};

function DiagramaBib({nombre,raiz,cuerdas,barre,barreDesde,barreHasta,dedos,sz=1}){
  const x0=22*sz,y0=34*sz,cw=18*sz,rh=20*sz,nt=5;
  const W=x0*2+cw*5+20*sz, H=y0+rh*nt+18*sz;
  const cx=s=>x0+(6-s)*cw;
  const bD=barreDesde||1, bH=barreHasta||5;
  const notasCuerda=[6,5,4,3,2,1].map((s,i)=>{
    const v=cuerdas[i];
    if(v==="x")return null;
    if(v==="o")return notaEn(s,0);
    const d=dedos&&dedos.find(d=>d.s===s);
    if(d)return notaEn(s,d.f);
    if(barre)return notaEn(s,barre);
    return null;
  });
  const formula=notasCuerda.map(n=>n&&raiz?itvFn(raiz,n):null);
  return(
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      {[6,5,4,3,2,1].map((s,i)=>(
        <text key={s} x={cx(s)} y={y0-21*sz} textAnchor="middle" style={{fontSize:8.5*sz,fontWeight:700,fill:"#111",fontFamily:"Arial,sans-serif"}}>{notasCuerda[i]||""}</text>
      ))}
      {[6,5,4,3,2,1].map((s,i)=>{
        const v=cuerdas[i];
        if(v==="x") return <text key={s} x={cx(s)} y={y0-11*sz} textAnchor="middle" style={{fontSize:10*sz,fontWeight:900,fill:"#cc3333"}}>x</text>;
        if(v==="o") return <text key={s} x={cx(s)} y={y0-11*sz} textAnchor="middle" style={{fontSize:10*sz,fontWeight:900,fill:"#2a882a"}}>o</text>;
        return null;
      })}
      <rect x={x0-1} y={y0-5*sz} width={cw*5+2} height={5*sz} rx={1.5} fill="#8B5E3C"/>
      <rect x={x0} y={y0} width={cw*5} height={rh*nt} fill="#f5e6c8" rx={1}/>
      {[0,1,2,3,4,5].map(f=>(
        <line key={f} x1={x0} y1={y0+f*rh} x2={x0+cw*5} y2={y0+f*rh} stroke="#c8a87a" strokeWidth={f===0?1.5:0.8}/>
      ))}
      {[1,2,3,4,5,6].map(s=>(
        <line key={s} x1={cx(s)} y1={y0} x2={cx(s)} y2={y0+nt*rh} stroke="#999" strokeWidth={0.5+(s-1)*0.35}/>
      ))}
      {[1,2,3,4,5].map(f=>(
        <text key={f} x={x0+cw*5+12*sz} y={y0+(f-1)*rh+rh/2+3*sz} textAnchor="start" style={{fontSize:7*sz,fill:"#111",fontWeight:700,fontFamily:"Arial,sans-serif"}}>{f}</text>
      ))}
      {barre&&(()=>{
        const y=y0+(barre-1)*rh+2*sz, h=rh-4*sz;
        const barreStrings=[6,5,4,3,2,1].filter(s=>{
          const idx=[6,5,4,3,2,1].indexOf(s);
          if(cuerdas[idx]!=="b") return false;
          if(s<bD||s>bH) return false;
          return !(dedos&&dedos.some(d=>d.s===s));
        });
        return(
          <g>
            <text x={x0+cw*5+12*sz} y={y+h/2+3*sz} textAnchor="start" style={{fontSize:8*sz,fill:"#111",fontWeight:900,fontFamily:"Arial,sans-serif"}}>{barre}</text>
            <rect x={cx(bH)-6*sz} y={y} width={cx(bD)-cx(bH)+12*sz} height={h} rx={h/2} fill="#e0e0e0" stroke="#666" strokeWidth={1.5}/>
            {barreStrings.map(s=>{
              const nota=notaEn(s,barre);
              const itv=raiz?itvFn(raiz,nota):null;
              const lbl=ITV_LABEL[itv]||itv||"";
              const fs=lbl.length>=2?6*sz:8*sz;
              return(
                <g key={s}>
                  <circle cx={cx(s)} cy={y+h/2} r={7*sz} fill="white" stroke="#cc3333" strokeWidth={1.2}/>
                  <text x={cx(s)} y={y+h/2+fs*0.38} textAnchor="middle" style={{fontSize:fs,fill:"#cc3333",fontWeight:900,fontFamily:"Arial,sans-serif"}}>{lbl}</text>
                </g>
              );
            })}
          </g>
        );
      })()}
      {dedos&&dedos.map((d,i)=>{
        if(d.f<1||d.f>5) return null;
        const nota=notaEn(d.s,d.f);
        const itv=raiz?itvFn(raiz,nota):null;
        const lbl=ITV_LABEL[itv]||itv||"";
        const fs=lbl.length>=2?6*sz:8*sz;
        return(
          <g key={i}>
            <circle cx={cx(d.s)} cy={y0+(d.f-1)*rh+rh/2} r={7.5*sz} fill="white" stroke="#cc3333" strokeWidth={1.2}/>
            <text x={cx(d.s)} y={y0+(d.f-1)*rh+rh/2+fs*0.38} textAnchor="middle" style={{fontSize:fs,fill:"#cc3333",fontWeight:900,fontFamily:"Arial,sans-serif"}}>{lbl}</text>
          </g>
        );
      })}
      {[6,5,4,3,2,1].map((s,i)=>(
        <text key={s} x={cx(s)} y={H-3} textAnchor="middle" style={{fontSize:6.5*sz,fill:cuerdas[i]==="x"?"#ccc":"#cc3333",fontWeight:700}}>{formula[i]||"-"}</text>
      ))}
    </svg>
  );
}

function getShapeBib(nombre){
  if(!nombre) return null;
  const sb=nombre.split("/")[0];
  for(const grupo of Object.values(DEFS_BIB)){
    const f=grupo.find(a=>a.nombre===nombre||a.nombre===sb);
    if(f) return f;
  }
  return null;
}

function Popup({acorde,onClose}){
  const sh=getShapeBib(acorde);
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:10,padding:"20px 24px",boxShadow:"0 8px 32px rgba(0,0,0,0.2)",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{fontSize:15,fontWeight:900,marginBottom:8,color:"#333"}}>{acorde}</div>
        {sh?<DiagramaBib {...sh} sz={1.5}/>:<div style={{padding:20,color:"#888",fontSize:13}}>Sin diagrama para <strong>{acorde}</strong></div>}
        <button onClick={onClose} style={{marginTop:12,padding:"5px 20px",borderRadius:5,border:"1px solid #ccc",background:"#f5f5f5",cursor:"pointer",fontSize:11}}>Cerrar</button>
      </div>
    </div>
  );
}

const DEFS_BIB = {
  mayor:[
    {nombre:"A",raiz:"A",cuerdas:["x","o","p","p","p","o"],dedos:[{s:4,f:2,n:1},{s:3,f:2,n:2},{s:2,f:2,n:3}]},
    {nombre:"B",raiz:"B",cuerdas:["x","b","b","b","b","b"],barre:2,barreDesde:1,barreHasta:5,dedos:[{s:4,f:4,n:2},{s:3,f:4,n:3},{s:2,f:4,n:4}]},
    {nombre:"C",raiz:"C",cuerdas:["x","p","p","o","p","o"],dedos:[{s:2,f:1,n:1},{s:4,f:2,n:2},{s:5,f:3,n:3}]},
    {nombre:"D",raiz:"D",cuerdas:["x","x","o","p","p","p"],dedos:[{s:3,f:2,n:1},{s:1,f:2,n:2},{s:2,f:3,n:3}]},
    {nombre:"E",raiz:"E",cuerdas:["o","p","p","p","o","o"],dedos:[{s:3,f:1,n:1},{s:5,f:2,n:2},{s:4,f:2,n:3}]},
    {nombre:"F",raiz:"F",cuerdas:["b","b","b","b","b","b"],barre:1,barreDesde:1,barreHasta:6,dedos:[{s:3,f:2,n:2},{s:5,f:3,n:3},{s:4,f:3,n:4}]},
    {nombre:"G",raiz:"G",cuerdas:["p","p","o","o","p","p"],dedos:[{s:5,f:2,n:1},{s:6,f:3,n:2},{s:2,f:3,n:3},{s:1,f:3,n:4}]},
  ],
  menor:[
    {nombre:"Am",raiz:"A",cuerdas:["x","o","p","p","p","o"],dedos:[{s:2,f:1,n:1},{s:4,f:2,n:2},{s:3,f:2,n:3}]},
    {nombre:"Bm",raiz:"B",cuerdas:["x","b","b","b","b","b"],barre:2,barreDesde:1,barreHasta:5,dedos:[{s:4,f:4,n:3},{s:3,f:4,n:4},{s:2,f:3,n:2}]},
    {nombre:"Cm",raiz:"C",cuerdas:["x","b","b","b","b","b"],barre:3,barreDesde:1,barreHasta:5,dedos:[{s:4,f:5,n:3},{s:3,f:5,n:4},{s:2,f:4,n:2}]},
    {nombre:"Dm",raiz:"D",cuerdas:["x","x","o","p","p","p"],dedos:[{s:1,f:1,n:1},{s:3,f:2,n:2},{s:2,f:3,n:3}]},
    {nombre:"Em",raiz:"E",cuerdas:["o","p","p","o","o","o"],dedos:[{s:5,f:2,n:2},{s:4,f:2,n:3}]},
    {nombre:"Fm",raiz:"F",cuerdas:["b","b","b","b","b","b"],barre:1,barreDesde:1,barreHasta:6,dedos:[{s:5,f:3,n:3},{s:4,f:3,n:4}]},
    {nombre:"Gm",raiz:"G",cuerdas:["b","b","b","b","b","b"],barre:3,barreDesde:1,barreHasta:6,dedos:[{s:5,f:5,n:3},{s:4,f:5,n:4}]},
  ],
  dom7:[
    {nombre:"A7",raiz:"A",cuerdas:["x","o","p","o","p","o"],dedos:[{s:4,f:2,n:2},{s:2,f:2,n:3}]},
    {nombre:"B7",raiz:"B",cuerdas:["x","p","p","p","o","p"],dedos:[{s:4,f:1,n:1},{s:5,f:2,n:2},{s:3,f:2,n:3},{s:1,f:2,n:4}]},
    {nombre:"C7",raiz:"C",cuerdas:["x","p","p","p","p","o"],dedos:[{s:2,f:1,n:1},{s:4,f:2,n:2},{s:5,f:3,n:3},{s:3,f:3,n:4}]},
    {nombre:"D7",raiz:"D",cuerdas:["x","x","o","p","p","p"],dedos:[{s:2,f:1,n:1},{s:3,f:2,n:2},{s:1,f:2,n:3}]},
    {nombre:"E7",raiz:"E",cuerdas:["o","p","o","p","o","o"],dedos:[{s:3,f:1,n:1},{s:5,f:2,n:2}]},
    {nombre:"F7",raiz:"F",cuerdas:["b","b","b","b","b","b"],barre:1,barreDesde:1,barreHasta:6,dedos:[{s:3,f:2,n:2},{s:5,f:3,n:3},{s:4,f:3,n:4}]},
    {nombre:"G7",raiz:"G",cuerdas:["p","p","o","o","o","p"],dedos:[{s:5,f:2,n:2},{s:6,f:3,n:3},{s:1,f:1,n:1}]},
  ],
  m7:[
    {nombre:"Am7",raiz:"A",cuerdas:["x","o","p","o","p","o"],dedos:[{s:2,f:1,n:1},{s:4,f:2,n:2}]},
    {nombre:"Bm7",raiz:"B",cuerdas:["x","b","b","b","b","b"],barre:2,barreDesde:1,barreHasta:5,dedos:[{s:2,f:3,n:2},{s:4,f:4,n:3}]},
    {nombre:"Cm7",raiz:"C",cuerdas:["x","b","b","b","b","b"],barre:3,barreDesde:1,barreHasta:5,dedos:[{s:2,f:4,n:2},{s:4,f:5,n:3}]},
    {nombre:"Dm7",raiz:"D",cuerdas:["x","x","o","p","p","p"],dedos:[{s:2,f:1,n:1},{s:1,f:1,n:1},{s:3,f:2,n:2}]},
    {nombre:"Em7",raiz:"E",cuerdas:["o","p","o","o","o","o"],dedos:[{s:5,f:2,n:2}]},
    {nombre:"Fm7",raiz:"F",cuerdas:["b","b","b","b","b","b"],barre:1,barreDesde:1,barreHasta:6,dedos:[{s:5,f:3,n:3}]},
    {nombre:"Gm7",raiz:"G",cuerdas:["b","b","b","b","b","b"],barre:3,barreDesde:1,barreHasta:6,dedos:[{s:5,f:5,n:3}]},
  ],
  maj7:[
    {nombre:"Amaj7",raiz:"A",cuerdas:["x","o","p","p","p","o"],dedos:[{s:4,f:2,n:2},{s:3,f:1,n:1},{s:2,f:2,n:3}]},
    {nombre:"Bmaj7",raiz:"B",cuerdas:["x","p","p","p","p","x"],dedos:[{s:5,f:2,n:1},{s:4,f:4,n:3},{s:3,f:3,n:2},{s:2,f:4,n:4}]},
    {nombre:"Cmaj7",raiz:"C",cuerdas:["x","p","p","p","p","x"],dedos:[{s:5,f:3,n:1},{s:4,f:5,n:3},{s:3,f:4,n:2},{s:2,f:5,n:4}]},
    {nombre:"Dmaj7",raiz:"D",cuerdas:["x","x","o","p","p","p"],dedos:[{s:3,f:2,n:1},{s:2,f:2,n:2},{s:1,f:2,n:3}]},
    {nombre:"Emaj7",raiz:"E",cuerdas:["b","b","b","b","b","b"],barre:0,barreDesde:1,barreHasta:6,dedos:[{s:5,f:2,n:1},{s:4,f:1,n:2},{s:3,f:2,n:3}]},
    {nombre:"Fmaj7",raiz:"F",cuerdas:["p","x","p","p","x","p"],dedos:[{s:6,f:1,n:1},{s:2,f:1,n:2},{s:4,f:3,n:3},{s:3,f:3,n:4}]},
    {nombre:"Gmaj7",raiz:"G",cuerdas:["p","x","p","p","x","p"],dedos:[{s:6,f:3,n:1},{s:2,f:3,n:2},{s:4,f:5,n:3},{s:3,f:5,n:4}]},
  ],
  m7b5:[
    {nombre:"Am7b5",raiz:"A",cuerdas:["x","o","p","p","p","p"],dedos:[{s:4,f:1,n:1},{s:3,f:1,n:2},{s:2,f:1,n:3},{s:1,f:3,n:4}]},
    {nombre:"Bm7b5",raiz:"B",cuerdas:["x","p","p","p","p","x"],dedos:[{s:5,f:2,n:1},{s:3,f:2,n:2},{s:4,f:3,n:3},{s:2,f:3,n:4}]},
    {nombre:"Cm7b5",raiz:"C",cuerdas:["x","b","b","b","b","x"],barre:3,barreDesde:2,barreHasta:5,dedos:[{s:4,f:4,n:3},{s:2,f:4,n:4}]},
    {nombre:"Dm7b5",raiz:"D",cuerdas:["x","x","o","p","p","p"],dedos:[{s:3,f:1,n:1},{s:2,f:1,n:2},{s:1,f:1,n:3}]},
    {nombre:"Em7b5",raiz:"E",cuerdas:["o","x","p","o","p","x"],dedos:[{s:4,f:1,n:1},{s:2,f:3,n:3}]},
    {nombre:"Fm7b5",raiz:"F",cuerdas:["x","b","b","b","b","x"],barre:1,barreDesde:2,barreHasta:5,dedos:[{s:4,f:2,n:3},{s:2,f:2,n:4}]},
    {nombre:"Gm7b5",raiz:"G",cuerdas:["x","b","b","b","b","x"],barre:2,barreDesde:2,barreHasta:5,dedos:[{s:4,f:3,n:3},{s:2,f:3,n:4}]},
  ],
  sus2:[
    {nombre:"Asus2",raiz:"A",cuerdas:["x","o","p","p","o","o"],dedos:[{s:4,f:2,n:1},{s:3,f:2,n:2}]},
    {nombre:"Bsus2",raiz:"B",cuerdas:["x","b","b","b","b","b"],barre:2,barreDesde:1,barreHasta:5,dedos:[{s:4,f:4,n:3},{s:3,f:4,n:4}]},
    {nombre:"Csus2",raiz:"C",cuerdas:["x","p","p","p","x","o"],dedos:[{s:3,f:1,n:1},{s:4,f:3,n:3},{s:5,f:3,n:4}]},
    {nombre:"Dsus2",raiz:"D",cuerdas:["x","x","o","p","p","o"],dedos:[{s:3,f:2,n:1},{s:2,f:3,n:2}]},
    {nombre:"Esus2",raiz:"E",cuerdas:["o","p","p","p","o","o"],dedos:[{s:5,f:2,n:1},{s:4,f:4,n:3},{s:3,f:4,n:4}]},
    {nombre:"Fsus2",raiz:"F",cuerdas:["b","b","b","b","b","b"],barre:1,barreDesde:1,barreHasta:6,dedos:[{s:4,f:3,n:3},{s:3,f:3,n:4}]},
    {nombre:"Gsus2",raiz:"G",cuerdas:["p","p","o","o","p","p"],dedos:[{s:5,f:2,n:1},{s:6,f:3,n:2},{s:2,f:3,n:3},{s:1,f:3,n:4}]},
  ],
  sus4:[
    {nombre:"Asus4",raiz:"A",cuerdas:["x","o","p","p","p","o"],dedos:[{s:4,f:2,n:1},{s:3,f:2,n:2},{s:2,f:3,n:3}]},
    {nombre:"Bsus4",raiz:"B",cuerdas:["x","b","b","b","b","b"],barre:2,barreDesde:1,barreHasta:5,dedos:[{s:4,f:4,n:3},{s:3,f:4,n:4},{s:2,f:5,n:4}]},
    {nombre:"Csus4",raiz:"C",cuerdas:["x","p","p","p","p","x"],dedos:[{s:3,f:1,n:1},{s:2,f:1,n:2},{s:4,f:3,n:3},{s:5,f:3,n:4}]},
    {nombre:"Dsus4",raiz:"D",cuerdas:["x","x","o","p","p","p"],dedos:[{s:3,f:2,n:1},{s:2,f:3,n:2},{s:1,f:3,n:3}]},
    {nombre:"Esus4",raiz:"E",cuerdas:["o","p","p","p","o","o"],dedos:[{s:5,f:2,n:2},{s:4,f:2,n:3},{s:3,f:2,n:4}]},
    {nombre:"Fsus4",raiz:"F",cuerdas:["b","b","b","b","b","b"],barre:1,barreDesde:1,barreHasta:6,dedos:[{s:4,f:3,n:3},{s:3,f:3,n:4},{s:2,f:3,n:4}]},
    {nombre:"Gsus4",raiz:"G",cuerdas:["p","p","o","o","p","p"],dedos:[{s:2,f:1,n:1},{s:5,f:3,n:2},{s:6,f:3,n:3},{s:1,f:3,n:4}]},
  ],
};

const TABS_BIB=[
  {id:"mayor",label:"Mayor",f:[["1",""],["3","M"],["5",""]]},
  {id:"menor",label:"Menor",f:[["1",""],["3","m"],["5",""]]},
  {id:"dom7", label:"7",    f:[["1",""],["3","M"],["5",""],["7","m"]]},
  {id:"m7",   label:"m7",   f:[["1",""],["3","m"],["5",""],["7","m"]]},
  {id:"maj7", label:"maj7", f:[["1",""],["3","M"],["5",""],["7","M"]]},
  {id:"m7b5", label:"m7b5", f:[["1",""],["3","m"],["5","b"],["7","m"]]},
  {id:"sus2", label:"sus2", f:[["1",""],["2",""],["5",""]]},
  {id:"sus4", label:"sus4", f:[["1",""],["4",""],["5",""]]},
];

function Biblioteca({onVolver}){
  const [tab,setTab]=useState("mayor");
  return(
    <div style={{fontFamily:"Arial,sans-serif",padding:10,background:"white"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <button onClick={onVolver} style={{padding:"4px 14px",borderRadius:5,border:"1px solid #99bb99",background:"#ddeedd",cursor:"pointer",fontWeight:700,fontSize:11,color:"#557755"}}>← Partitura</button>
        <span style={{fontSize:13,fontWeight:900,color:"#333"}}>Biblioteca de acordes</span>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"flex-start"}}>
        {TABS_BIB.map(t=>(
          <div key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",padding:"6px 10px",borderRadius:6,border:`1.5px solid ${tab===t.id?"#99bbcc":"#ddd"}`,background:tab===t.id?"#dceaf4":"white",minWidth:44}}>
            <span style={{fontWeight:700,fontSize:11,color:tab===t.id?"#557799":"#555",marginBottom:3}}>{t.label}</span>
            {t.f.map(([n,m],i)=>(
              <div key={i} style={{display:"flex",width:26}}>
                <span style={{fontSize:8,fontWeight:700,color:tab===t.id?"#557799":"#888",width:9,textAlign:"right"}}>{n}</span>
                <span style={{fontSize:8,color:tab===t.id?"#557799":"#aaa",width:9,paddingLeft:2}}>{m}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
        {(DEFS_BIB[tab]||[]).map((a,i)=>(
          <div key={i} style={{background:"white",border:"1px solid #ddd",borderRadius:7,padding:"8px 10px",display:"flex",flexDirection:"column",alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:12,fontWeight:900,color:"#333",marginBottom:4}}>{a.nombre}</div>
            <DiagramaBib {...a}/>
          </div>
        ))}
      </div>
    </div>
  );
}

const T12=["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"];
const EN={"A#":"Bb","C#":"Db","D#":"Eb","F#":"Gb","G#":"Ab"};
function TonoPicker({value,onChange}){
  const [open,setOpen]=useState(false);
  const ref=useRef();
  useEffect(()=>{
    const fn=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",fn);
    return()=>document.removeEventListener("mousedown",fn);
  },[]);
  return(
    <div ref={ref} style={{position:"relative"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",borderBottom:"2px solid #ccbb66",padding:"0 2px",minWidth:115}}>
        <span style={{fontSize:14,fontWeight:900,color:"#333"}}>{value}</span>
        <span style={{fontSize:9,color:"#aaa",marginLeft:"auto"}}>▾</span>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:99,background:"white",border:"1px solid #ddd",borderRadius:6,boxShadow:"0 4px 16px rgba(0,0,0,0.13)",minWidth:160,overflow:"hidden"}}>
          {[["mayor","#ddeedd","#557755"],["menor","#f2e0e0","#996666"]].map(([suf,bg,col])=>(
            <div key={suf}>
              <div style={{background:bg,padding:"4px 10px",fontSize:8,fontWeight:900,color:col,letterSpacing:1}}>{suf.toUpperCase()}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
                {T12.map((r,i)=>{
                  const alt=EN[r];
                  return(
                    <div key={i} onClick={()=>{onChange(r+" "+suf);setOpen(false);}} style={{padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700,color:"#333",borderBottom:"1px solid #f0f0f0"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#f5f5f5"}
                      onMouseLeave={e=>e.currentTarget.style.background="white"}>
                      {alt?`${r}/${alt}`:r} <span style={{fontSize:9,color:"#aaa",fontWeight:400}}>{suf.slice(0,3)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SC={INTRO:{bg:"#eee",bd:"#bbb",lc:"#888"},ESTROFA:{bg:"#ddeedd",bd:"#99bb99",lc:"#557755"},ESTRIBILLO:{bg:"#f2e0e0",bd:"#ccaaaa",lc:"#996666"},PUENTE:{bg:"#dceaf4",bd:"#99bbcc",lc:"#557799"},OUTRO:{bg:"#eee",bd:"#bbb",lc:"#888"},VARIACION:{bg:"#f5f2cc",bd:"#ccbb66",lc:"#887733"}};
const LS={ESTROFA:"VERSO",ESTRIBILLO:"EST."};
const LW=30;
const FC={T:"#557799",SD:"#887733",D:"#996666"};
const FB={T:"#dceaf4",SD:"#f5f2cc",D:"#f2e0e0"};
const FL={T:"T — Tónica",SD:"SD — Subdominante",D:"D — Dominante"};
const pcs=a=>{ const m=(a||"").match(/^([A-G][#b]?)(.*)$/); return m?{root:m[1],sfx:m[2]}:{root:a||"",sfx:""}; };

function TablaGrados({escala}){
  if(!escala?.length)return null;
  return(
    <div style={{marginBottom:8,border:"1px solid #ddd",borderRadius:5,overflow:"hidden",marginTop:8}}>
      <div style={{display:"flex",background:"#f0f0f0",borderBottom:"1px solid #ddd"}}>
        {escala.map((e,i)=><div key={i} style={{flex:1,padding:"1px 0",fontWeight:900,fontSize:12,color:"#333",borderRight:i<6?"1px solid #ddd":"none",textAlign:"center"}}>{e.g}</div>)}
      </div>
      <div style={{display:"flex"}}>
        {escala.map((e,i)=>(
          <div key={i} style={{flex:1,borderRight:i<6?"1px solid #eee":"none",background:FB[e.f]||"#f9f9f9",display:"flex",flexDirection:"column",alignItems:"center",padding:"3px 2px",gap:1}}>
            <span style={{fontWeight:900,fontSize:15.4,color:"#111",lineHeight:1}}>{simplify(e.a)}</span>
            {e.f&&<span style={{fontSize:8.8,fontWeight:700,color:FC[e.f],background:"white",borderRadius:3,padding:"0 3px"}}>{FL[e.f]}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function HojaAcordes({nombres,onBiblioteca}){
  return(
    <div style={{marginTop:40,paddingTop:20,borderTop:"1px solid #ddd"}}>
      <div style={{fontSize:9,fontWeight:700,color:"#888",marginBottom:8}}>DIAGRAMAS DE ACORDES</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {nombres.map((nm,i)=>{
          const sh=getShapeBib(nm);
          if(!sh) return null;
          return(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",border:"1px solid #e0e0e0",borderRadius:5,padding:"6px 8px",background:"#fafafa"}}>
              <div style={{fontSize:11,fontWeight:900,color:"#333",marginBottom:4}}>{nm}</div>
              <DiagramaBib {...sh}/>
            </div>
          );
        })}
      </div>
      <button onClick={onBiblioteca} style={{marginTop:12,padding:"5px 18px",borderRadius:5,border:"1px solid #99bbcc",background:"#dceaf4",cursor:"pointer",fontWeight:700,fontSize:11,color:"#557799"}}>📚 Biblioteca de acordes</button>
    </div>
  );
}

function BeatEdit({beat,onChange,onRemove,canRemove,bd,zoom}){
  const z=zoom||1;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:2,padding:"3px 4px",borderRight:`1px dashed ${bd}55`,flex:1,minWidth:0,position:"relative"}}>
      <input value={beat.chord||""} onChange={e=>onChange({...beat,chord:e.target.value})} placeholder="acorde"
        style={{fontSize:20*z,fontWeight:900,border:"none",borderBottom:`1.5px solid ${bd}99`,background:"transparent",width:"100%",padding:"1px 0",outline:"none",color:"#111",lineHeight:1}}/>
      <input value={beat.note||""} onChange={e=>onChange({...beat,note:e.target.value})} placeholder="nota…"
        style={{fontSize:10*z,border:"none",background:"transparent",width:"100%",padding:"1px 0",outline:"none",color:"#884848",fontStyle:"italic"}}/>
      {canRemove&&<button onClick={onRemove} style={{position:"absolute",top:2,right:2,fontSize:9,color:"#ccc",border:"none",background:"none",cursor:"pointer",padding:0,lineHeight:1}}>✕</button>}
    </div>
  );
}

function CompasEdit({compas,bd,bg,num,isLast,cols,semi,b,conLetra,onChange,onFocus,isFocused,zoom}){
  const z=zoom||1;
  const beats=compas.beats||[{chord:"",note:""}];
  const upd=(bi,nb)=>{const a=[...beats];a[bi]=nb;onChange({...compas,beats:a});};
  const add=()=>{if(beats.length<4)onChange({...compas,beats:[...beats,{chord:"",note:""}]});};
  const rem=bi=>{if(beats.length>1){const a=[...beats];a.splice(bi,1);onChange({...compas,beats:a});}};
  return(
    <div onClick={onFocus} style={{flex:`0 0 ${100/cols}%`,minWidth:0,boxSizing:"border-box",borderRight:isLast?"none":`2px solid ${bd}66`,position:"relative",background:isFocused?"#fffde7":bg,outline:isFocused?`2px solid #ccbb66`:"none",zIndex:isFocused?1:0}}>
      <div style={{position:"absolute",top:1,right:3,fontSize:7*z,color:"#b0c4a0",zIndex:3}}>{num}</div>
      <div style={{display:"flex",minHeight:48*z}}>
        {beats.map((beat,bi)=>{
          const shown=tAcorde(beat.chord||"",semi,b);
          return <BeatEdit key={bi} beat={{...beat,chord:shown}} bd={bd} zoom={z}
            onChange={nb=>{const orig=tAcorde(nb.chord||"",(12-semi)%12,usarB(raizDeStr(nb.chord)));upd(bi,{...nb,chord:orig});}}
            onRemove={()=>rem(bi)} canRemove={beats.length>1}/>;
        })}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4,padding:"2px 4px"}}>
        {beats.length<4&&<button onClick={add} style={{fontSize:10*z,fontWeight:900,color:"#1a7fd4",border:"none",background:"none",cursor:"pointer",padding:"1px 3px"}}>+ acorde</button>}
        {beats.length>1&&<span onClick={()=>rem(beats.length-1)} style={{fontSize:13*z,fontWeight:900,color:"#d44",cursor:"pointer",userSelect:"none"}}>−</span>}
      </div>
      {conLetra&&<input value={compas.lyric||""} onChange={e=>onChange({...compas,lyric:e.target.value})} placeholder="letra…"
        style={{fontSize:13*z,border:"none",borderTop:`1px dashed ${bd}55`,background:`${bd}11`,width:"100%",padding:"2px 4px",outline:"none",color:"#5a2d0c",fontStyle:"italic",fontWeight:"bold",boxSizing:"border-box"}}/>}
    </div>
  );
}

function CompasView({compas,bd,bg,num,isLast,cols,semi,b,capo,conLetra,onClickAcorde,zoom}){
  const z=zoom||1;
  const beats=compas.beats||[{chord:"",note:""}];
  const nB=beats.length;
  const chordFs=20*z, sfxFs=13*z, noteFs=10*z, lyricFs=13*z, numFs=7*z;
  return(
    <div style={{flex:`0 0 ${100/cols}%`,minWidth:0,boxSizing:"border-box",borderRight:isLast?"none":`2px solid ${bd}66`,position:"relative",background:bg,display:"flex",flexDirection:"column"}}>
      <div style={{position:"absolute",top:1,right:3,fontSize:numFs,color:"#b0c4a0",zIndex:3}}>{num}</div>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {beats.map((beat,bi)=>{
          const cT=tAcorde(beat.chord||"",semi,b);
          const cC=capo>0?tAcorde(cT,-capo,false):null;
          const{root,sfx}=pcs(cT);
          let emptyAfter=0;
          for(let k=bi+1;k<nB;k++){
            if(!(beats[k].chord||"").trim()) emptyAfter++;
            else break;
          }
          const widthPct=(1+emptyAfter)/nB*100;
          return(
            <div key={bi} onClick={()=>cT&&onClickAcorde(cT)}
              style={{width:`${widthPct}%`,flexShrink:0,boxSizing:"border-box",borderRight:bi===nB-1?"none":`1px dashed ${bd}55`,padding:"3px 3px 2px",display:"flex",flexDirection:"column",alignItems:"flex-start",cursor:"pointer",borderRadius:3,position:"relative",zIndex:emptyAfter>0?2:1}}
              onMouseEnter={e=>e.currentTarget.style.background=bd+"33"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{display:"flex",alignItems:"baseline",gap:1,whiteSpace:"nowrap"}}>
                <span style={{fontSize:chordFs,fontWeight:900,color:"#111",lineHeight:1}}>{root}</span>
                {sfx&&<span style={{fontSize:sfxFs,color:"#111",lineHeight:1}}>{sfx}</span>}
              </div>
              {cC&&<div style={{fontSize:8*z,color:"#a07800",fontWeight:700,background:"#fff8e1",borderRadius:3,padding:"0 2px",marginTop:1,whiteSpace:"nowrap"}}>({cC})</div>}
              {beat.note&&<div style={{fontSize:noteFs,color:"#884848",fontWeight:"bold",fontStyle:"italic",whiteSpace:"nowrap"}}>{beat.note}</div>}
            </div>
          );
        })}
      </div>
      {conLetra&&compas.lyric&&<div style={{fontSize:lyricFs,color:"#5a2d0c",fontWeight:"bold",padding:"1px 4px 3px",lineHeight:1.3,borderTop:`1px solid ${bd}22`,fontStyle:"italic"}}>{compas.lyric}</div>}
    </div>
  );
}

// ── BUSCADOR — versión Vercel (llama al servidor /api/buscar) ──
function BuscadorCancion({onCargar}){
  const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const buscar=async()=>{
    if(!query.trim()) return;
    setLoading(true);
    setError("");
    try{
      const res=await fetch("/api/buscar",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({query})
      });

      const txt=await res.text();
      let data;
      try{
        data=JSON.parse(txt);
      }catch(e){
        setError(`Respuesta inválida: ${txt.substring(0,200)}`);
        setLoading(false);
        return;
      }

      if(data._debug){
        setError(`Debug — modelo: ${data._modelo} | error: ${data._parseError||data._issue} | raw: ${(data._rawText||"").substring(0,150)}`);
        setLoading(false);
        return;
      }

      if(data.error){
        setError(`Error: ${data.error}${data.rawPreview?" | raw: "+data.rawPreview.substring(0,150):""}`);
        setLoading(false);
        return;
      }

      if(!data.secciones||!data.titulo){
        setError(`Estructura inválida: ${JSON.stringify(Object.keys(data))}`);
        setLoading(false);
        return;
      }

      onCargar(data);
      setQuery("");
    }catch(e){
      setError(`Error de red: ${e.message}`);
    }
    setLoading(false);
  };

  return(
    <div style={{marginBottom:12,background:"#f0f7ff",border:"1.5px solid #99bbcc",borderRadius:8,padding:"10px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:10,fontWeight:700,color:"#557799"}}>🔍 BUSCAR CANCIÓN</span>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&buscar()}
          placeholder='Ej: "Yesterday Beatles" o "Autumn Leaves"'
          style={{flex:1,fontSize:13,padding:"6px 10px",borderRadius:6,border:"1.5px solid #99bbcc",outline:"none",fontFamily:"Arial,sans-serif"}}/>
        <button onClick={buscar} disabled={loading||!query.trim()}
          style={{padding:"6px 18px",borderRadius:6,border:"none",background:loading?"#aaa":"#557799",color:"white",fontWeight:700,fontSize:12,cursor:loading?"wait":"pointer",whiteSpace:"nowrap"}}>
          {loading?"Buscando...":"Cargar ✓"}
        </button>
      </div>
      {error&&<div style={{marginTop:6,fontSize:11,color:"#cc3333",wordBreak:"break-all"}}>{error}</div>}
      {loading&&<div style={{marginTop:6,fontSize:11,color:"#557799",fontStyle:"italic"}}>Generando cifrado con IA...</div>}
    </div>
  );
}

const R0="G", S0=" menor";
const INIT={
  titulo:"Autumn Leaves",artista:"Joseph Kosma / Jacques Prévert",compas:"4/4",
  secciones:[
    {label:"INTRO",compases:[
      {beats:[{chord:"Am7",note:""}],lyric:""},
      {beats:[{chord:"D7",note:""}],lyric:""},
      {beats:[{chord:"Gmaj7",note:""}],lyric:""},
      {beats:[{chord:"Cmaj7",note:""}],lyric:""},
    ]},
    {label:"ESTROFA",compases:[
      {beats:[{chord:"Am7",note:""}],lyric:"The falling leaves"},
      {beats:[{chord:"D7",note:""}],lyric:"drift by my window,"},
      {beats:[{chord:"Gmaj7",note:""}],lyric:"the autumn leaves"},
      {beats:[{chord:"Cmaj7",note:""}],lyric:"of red and gold."},
      {beats:[{chord:"Bm7b5",note:""},{chord:"E7",note:""}],lyric:"I see your lips,"},
      {beats:[{chord:"Am7",note:""}],lyric:"the summer kisses,"},
      {beats:[{chord:"Am7",note:""},{chord:"D7",note:""}],lyric:"the sunburned hands"},
      {beats:[{chord:"Am7",note:""}],lyric:"I used to hold."},
    ]},
    {label:"ESTROFA",compases:[
      {beats:[{chord:"Am7",note:""}],lyric:"Since you went away"},
      {beats:[{chord:"D7",note:""}],lyric:"the days grow long,"},
      {beats:[{chord:"Gmaj7",note:""}],lyric:"and soon I'll hear"},
      {beats:[{chord:"Cmaj7",note:""}],lyric:"old winter's song."},
      {beats:[{chord:"Bm7b5",note:""},{chord:"E7",note:""}],lyric:"But I miss you most"},
      {beats:[{chord:"Am7",note:""}],lyric:"of all, my darling,"},
      {beats:[{chord:"Bm7b5",note:""},{chord:"E7",note:""}],lyric:"when autumn leaves"},
      {beats:[{chord:"Am7",note:""}],lyric:"start to fall."},
    ]},
    {label:"PUENTE",compases:[
      {beats:[{chord:"Am7",note:"swing"},{chord:"D7",note:""}],lyric:""},
      {beats:[{chord:"Gmaj7",note:""},{chord:"Cmaj7",note:""}],lyric:""},
      {beats:[{chord:"Bm7b5",note:""},{chord:"E7",note:""}],lyric:""},
      {beats:[{chord:"Am7",note:""}],lyric:""},
    ]},
    {label:"ESTRIBILLO",compases:[
      {beats:[{chord:"Am7",note:""}],lyric:"The falling leaves"},
      {beats:[{chord:"D7",note:""}],lyric:"drift by my window,"},
      {beats:[{chord:"Gmaj7",note:""}],lyric:"the autumn leaves"},
      {beats:[{chord:"Cmaj7",note:""}],lyric:"of red and gold."},
      {beats:[{chord:"Bm7b5",note:""},{chord:"E7",note:""}],lyric:"I see your lips,"},
      {beats:[{chord:"Am7",note:""}],lyric:"the summer kisses,"},
      {beats:[{chord:"Am7",note:""},{chord:"D7",note:""}],lyric:"the sunburned hands"},
      {beats:[{chord:"Am7",note:"ritard."}],lyric:"I used to hold."},
    ]},
    {label:"OUTRO",compases:[
      {beats:[{chord:"Bm7b5",note:""},{chord:"E7",note:""}],lyric:"But I miss you most"},
      {beats:[{chord:"Am7",note:""}],lyric:"of all, my darling,"},
      {beats:[{chord:"Bm7b5",note:""},{chord:"E7",note:""}],lyric:"when autumn leaves"},
      {beats:[{chord:"Am7",note:"rit. al fine"}],lyric:"start to fall."},
    ]},
  ],
};

export default function App(){
  const [data,setData]=useState(INIT);
  const [edit,setEdit]=useState(false);
  const [conLetra,setConLetra]=useState(true);
  const [focus,setFocus]=useState(null);
  const [cols,setCols]=useState(4);
  const [capo,setCapo]=useState(0);
  const [semi,setSemi]=useState(0);
  const [tono,setTono]=useState("A menor");
  const [vista,setVista]=useState("partitura");
  const [popup,setPopup]=useState(null);
  const [zoom,setZoom]=useState(1);

  const raiz=mover(R0,semi,false);
  const b=usarB(raiz);
  const menor=tono.toLowerCase().includes("menor");
  const escala=buildEscala(raiz,menor);

  const acordesUnicos=[...new Set(
    data.secciones.flatMap(s=>s.compases.flatMap(c=>c.beats.map(bt=>bt.chord||"").filter(Boolean)))
  )].map(a=>a.split("/")[0]);

  const aplicarTono=str=>{
    const r=raizDeStr(str);
    if(r&&idxN(r)!==-1){ setSemi(((idxN(r)-idxN(R0))%12+12)%12); setTono(r+(str.replace(/^[A-G][#b]?/,"")||S0)); }
    else setTono(raiz+S0);
  };
  const btnSemi=d=>{ const s=((semi+d)%12+12)%12; setSemi(s); setTono(mover(R0,s,false)+S0); };

  const updC=(si,ci,nc)=>{const ns=[...data.secciones];ns[si]={...ns[si],compases:[...ns[si].compases]};ns[si].compases[ci]=nc;setData({...data,secciones:ns});};
  const updL=(si,v)=>{const ns=[...data.secciones];ns[si]={...ns[si],label:v};setData({...data,secciones:ns});};
  const addC=si=>{const ns=[...data.secciones];ns[si]={...ns[si],compases:[...ns[si].compases,{beats:[{chord:"",note:""}],lyric:""}]};setData({...data,secciones:ns});};
  const remC=si=>{const ns=[...data.secciones];const c=[...ns[si].compases];if(c.length<=1)return;c.pop();ns[si]={...ns[si],compases:c};setData({...data,secciones:ns});};
  const addS=()=>setData({...data,secciones:[...data.secciones,{label:"ESTROFA",compases:[{beats:[{chord:"",note:""}],lyric:""},{beats:[{chord:"",note:""}],lyric:""},{beats:[{chord:"",note:""}],lyric:""},{beats:[{chord:"",note:""}],lyric:""}]}]});
  const remS=si=>{const ns=[...data.secciones];ns.splice(si,1);setData({...data,secciones:ns});};

  if(vista==="biblioteca") return <Biblioteca onVolver={()=>setVista("partitura")}/>;

  return(
    <div style={{fontFamily:"Arial,sans-serif",padding:10,background:"white"}}>
      {popup&&<Popup acorde={popup} onClose={()=>setPopup(null)}/>}

      <BuscadorCancion onCargar={cancion=>{setData(cancion);setSemi(0);setTono("A menor");}}/>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:4,marginTop:28}}>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#aaa"}}>Tono:</span>
          <TonoPicker value={tono} onChange={aplicarTono}/>
          {capo>0&&<span style={{fontSize:10,color:"#a07800"}}>· capo {capo}</span>}
          <span style={{fontSize:10,color:"#bbb"}}>· {data.compas}</span>
        </div>
        <div style={{textAlign:"right"}}>
          {edit
            ?<>
              <input value={data.titulo} onChange={e=>setData({...data,titulo:e.target.value})} style={{fontSize:17,fontWeight:900,border:"none",borderBottom:"1px solid #ccc",textAlign:"right",width:220,outline:"none",display:"block"}}/>
              <input value={data.artista} onChange={e=>setData({...data,artista:e.target.value})} style={{fontSize:11,border:"none",borderBottom:"1px solid #ccc",textAlign:"right",width:180,outline:"none",color:"#777",display:"block"}}/>
            </>
            :<>
              <div style={{fontSize:19,fontWeight:900,lineHeight:1}}>{data.titulo}</div>
              <div style={{fontSize:13,color:"#777",lineHeight:1}}>{data.artista}</div>
            </>
          }
        </div>
      </div>

      <TablaGrados escala={escala}/>

      <div style={{display:"flex",gap:6,marginBottom:16,marginTop:14,alignItems:"center",flexWrap:"wrap"}}>
        <button onClick={()=>setEdit(v=>!v)} style={{fontSize:9,padding:"3px 12px",borderRadius:4,border:`1.5px solid ${edit?"#99bb99":"#bbb"}`,background:edit?"#ddeedd":"#f5f5f5",cursor:"pointer",color:edit?"#557755":"#666",fontWeight:edit?700:400}}>{edit?"✓ Ver":"✏️ Editar"}</button>
        <button onClick={()=>setConLetra(v=>!v)} style={{fontSize:9,padding:"3px 12px",borderRadius:4,border:`1.5px solid ${conLetra?"#ccaaaa":"#bbb"}`,background:conLetra?"#f2e0e0":"#f5f5f5",cursor:"pointer",color:conLetra?"#996666":"#666",fontWeight:conLetra?700:400}}>{conLetra?"🎵 Sin letra":"📝 Con letra"}</button>
        {[
          {lbl:"Transp.",val:semi===0?"0":semi<=6?`+${semi}`:`−${12-semi}`,mn:()=>btnSemi(-1),pl:()=>btnSemi(+1),rst:semi!==0?()=>{setSemi(0);setTono(R0+S0);}:null},
          {lbl:`Capo ${capo}°`,val:"",mn:()=>setCapo(c=>Math.max(0,c-1)),pl:()=>setCapo(c=>Math.min(7,c+1)),rst:capo>0?()=>setCapo(0):null},
          {lbl:"Sección",val:"",mn:()=>remS(data.secciones.length-1),pl:addS,rst:null},
          {lbl:`Col.(${cols})`,val:"",mn:()=>setCols(c=>Math.max(1,c-1)),pl:()=>setCols(c=>Math.min(8,c+1)),rst:null},
          {lbl:"Zoom",val:`${Math.round(zoom*100)}%`,mn:()=>setZoom(z=>Math.max(0.6,+(z-0.1).toFixed(1))),pl:()=>setZoom(z=>Math.min(1.8,+(z+0.1).toFixed(1))),rst:zoom!==1?()=>setZoom(1):null},
        ].map(({lbl,val,mn,pl,rst},i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",border:"1px solid #99bbcc",borderRadius:6,overflow:"hidden"}}>
            <button onClick={mn} style={{fontSize:13,fontWeight:900,color:"#d44",border:"none",borderRight:"1px solid #99bbcc",background:"#dceaf4",cursor:"pointer",padding:"4px 10px",lineHeight:1}}>−</button>
            <span style={{fontSize:10,fontWeight:700,color:"#557799",background:"#dceaf4",padding:"4px 7px",userSelect:"none",minWidth:58,textAlign:"center"}}>
              {lbl}{val?` ${val}`:""}
              {rst&&<span onClick={rst} style={{marginLeft:4,fontSize:8,color:"#a07800",cursor:"pointer"}}>↺</span>}
            </span>
            <button onClick={pl} style={{fontSize:13,fontWeight:900,color:"#1a7fd4",border:"none",borderLeft:"1px solid #99bbcc",background:"#dceaf4",cursor:"pointer",padding:"4px 10px",lineHeight:1}}>+</button>
          </div>
        ))}
        <div style={{marginLeft:"auto"}}>
          <button onClick={()=>window.print()} style={{fontSize:9,padding:"3px 10px",borderRadius:4,border:"1px solid #bbb",background:"#f5f5f5",cursor:"pointer",color:"#666"}}>🖨</button>
        </div>
      </div>

      {data.secciones.map((sec,si)=>{
        const c=SC[sec.label]||SC.ESTROFA;
        const lbl=LS[sec.label]||sec.label;
        const nR=Math.ceil(sec.compases.length/cols);
        const rH=edit?52:32;
        const totalH=nR*rH;
        const fs=lbl.length>0?Math.min(9,Math.max(5,Math.floor(totalH/lbl.length*1.8))):7;
        const rows=[];
        for(let i=0;i<sec.compases.length;i+=cols)
          rows.push(sec.compases.slice(i,i+cols).map((cm,di)=>({cm,idx:i+di})));
        let n=1;
        return(
          <div key={si} style={{position:"relative",paddingLeft:LW,marginBottom:7,border:`2px solid ${c.bd}`,borderRadius:5,overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,bottom:0,width:LW,background:c.bg,borderRight:`2px solid ${c.bd}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"hidden",gap:2}}>
              {edit
                ?<select value={sec.label} onChange={e=>updL(si,e.target.value)} style={{writingMode:"vertical-rl",transform:"rotate(180deg)",fontSize:8,border:"none",background:"transparent",color:c.lc,fontWeight:900,cursor:"pointer",outline:"none"}}>
                  {["INTRO","ESTROFA","ESTRIBILLO","PUENTE","OUTRO"].map(l=><option key={l} value={l}>{l}</option>)}
                </select>
                :<span style={{writingMode:"vertical-rl",transform:"rotate(180deg)",fontWeight:"bold",fontSize:fs,color:c.lc,whiteSpace:"nowrap"}}>{lbl}</span>
              }
              {edit&&<button onClick={()=>remS(si)} style={{fontSize:7,color:"#ccc",border:"none",background:"none",cursor:"pointer"}}>✕</button>}
            </div>
            <div style={{background:c.bg}}>
              {rows.map((row,ri)=>{
                const padded=[...row];
                while(padded.length<cols) padded.push(null);
                return(
                  <div key={ri} style={{display:"flex",borderTop:ri>0?`1px solid ${c.bd}33`:"none",minHeight:edit?(conLetra?64*zoom:51*zoom):conLetra?37*zoom:28*zoom}}>
                    {padded.map((item,ci)=>{
                      const num=item?n++:null;
                      const isLast=ci===cols-1;
                      if(!item) return <div key={ci} style={{flex:`0 0 ${100/cols}%`,minWidth:0,background:c.bg}}/>;
                      return edit
                        ?<CompasEdit key={ci} compas={item.cm} bd={c.bd} bg={c.bg} num={num} isLast={isLast} cols={cols} semi={semi} b={b} conLetra={conLetra} onChange={nc=>updC(si,item.idx,nc)} onFocus={()=>setFocus({si,ci:item.idx})} isFocused={focus?.si===si&&focus?.ci===item.idx} zoom={zoom}/>
                        :<CompasView key={ci} compas={item.cm} bd={c.bd} bg={c.bg} num={num} isLast={isLast} cols={cols} semi={semi} b={b} capo={capo} conLetra={conLetra} onClickAcorde={setPopup} zoom={zoom}/>;
                    })}
                  </div>
                );
              })}
              {edit&&<div style={{display:"flex"}}><button onClick={()=>addC(si)} style={{fontSize:11,fontWeight:900,color:"#1a7fd4",border:"none",background:"transparent",cursor:"pointer",padding:"3px 8px"}}>+ compás <span onClick={e=>{e.stopPropagation();remC(si);}} style={{color:"#d44",cursor:"pointer"}}>−</span></button></div>}
            </div>
          </div>
        );
      })}

      <HojaAcordes nombres={acordesUnicos} onBiblioteca={()=>setVista("biblioteca")}/>
      <div style={{marginTop:8,textAlign:"center",fontSize:7,color:"#ccc"}}>PLANTILLA PRO+edit v3.2 by HG</div>
      <style>{`@media print{button,select{display:none!important}input{border:none!important}}`}</style>
    </div>
  );
}
