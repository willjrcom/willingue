import { ImageResponse } from "next/og";
export const alt="Willingue — Aprender inglês é uma conquista";
export const size={width:1200,height:630};
export const contentType="image/png";
export default function OpenGraphImage(){
 return new ImageResponse(
  <div style={{height:"100%",width:"100%",display:"flex",background:"#f7f5ff",
   position:"relative",fontFamily:"sans-serif",padding:76,alignItems:"center"}}>
   <div style={{display:"flex",flexDirection:"column",width:"68%",gap:24}}>
    <div style={{display:"flex",alignItems:"center",gap:20}}>
     <div style={{width:84,height:84,borderRadius:22,background:"#6754e8",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg viewBox="0 0 192 192" width={72} height={72}>
       <path d="M39 56L66 138L96 86L126 138L153 56" stroke="white" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
     </div>
     <div style={{fontSize:49,fontWeight:900,color:"#292548",letterSpacing:-3}}>Willingue<span style={{color:"#6754e8"}}>.</span></div>
    </div>
    <div style={{fontWeight:900,color:"#272248",fontSize:63,lineHeight:1.1,letterSpacing:-3}}>
     Aprender inglês é uma conquista.
    </div>
    <div style={{fontSize:26,color:"#827a9e",maxWidth:690,lineHeight:1.5}}>
     Trilhas interativas, progresso escolar e recompensas para evoluir no seu ritmo.
    </div>
    <div style={{display:"flex",alignItems:"center",background:"#ede8ff",color:"#604ed1",
     borderRadius:99,padding:"13px 23px",fontSize:21,fontWeight:800,width:380}}>
     Estude • Evolua • Conquiste
    </div>
   </div>
   <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginLeft:20,
    width:300,height:330,borderRadius:42,background:"#e4dcff",transform:"rotate(8deg)"}}>
    <div style={{background:"#6754e8",width:212,height:212,borderRadius:46,
     display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 30px 52px #4935af30"}}>
     <svg viewBox="0 0 192 192" width={183} height={183}>
      <path d="M39 56L66 138L96 86L126 138L153 56" stroke="white" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
     </svg>
    </div>
   </div>
  </div>,{...size}
 );
}
