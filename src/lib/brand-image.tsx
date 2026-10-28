import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
export function BrandImage({size}:{size:number}){
 return new ImageResponse(
  <div style={{background:"#6754e8",width:"100%",height:"100%",display:"flex",
   alignItems:"center",justifyContent:"center",borderRadius:size*.20}}>
   <svg xmlns="http://www.w3.org/2000/svg" width={size*.76} height={size*.76} viewBox="0 0 192 192">
    <path d="M39 56L66 138L96 86L126 138L153 56" stroke="#fff" strokeWidth="18"
     strokeLinecap="round" strokeLinejoin="round" fill="none"/>
   </svg>
  </div>,{width:size,height:size}
 );
}
