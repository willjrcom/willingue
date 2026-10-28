import { BrandImage } from "@/lib/brand-image";
export async function GET(_request:Request,{params}:{params:Promise<{size:string}>}){
 const {size}=await params;
 if(size!=="192"&&size!=="512")return new Response("Não encontrado",{status:404});
 return BrandImage({size:Number(size)});
}
