"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Coins, Download, Gift, ImagePlus, LockKeyhole, Sparkles } from "lucide-react";

type Reward = { id: string; name: string; description: string; icon: string; price: number; category: string };
type Filter = "ALL" | "OWNED";

function downloadCanvas(canvas: HTMLCanvasElement, name: string) {
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = name; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, "image/png");
}

function createSticker(item: Reward) {
  const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  ctx.clearRect(0,0,512,512);
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#7259e4"; ctx.lineWidth = 9;
  ctx.beginPath();ctx.roundRect(24,28,464,452,96);ctx.fill();ctx.stroke();
  ctx.font = '220px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';ctx.textAlign="center";ctx.fillText(item.icon,256,282);
  ctx.fillStyle = "#4c39b8";ctx.font="bold 54px system-ui";ctx.fillText(item.id.includes("owl") ? "WELL DONE!" : "YOU ROCK!",256,408);
  downloadCanvas(canvas,`willingue-${item.id}.png`);
}

async function createFrame(file: File, item: Reward) {
  if (!file.type.startsWith("image/")) throw new Error("Selecione uma imagem.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve,reject)=>{ image.onload=()=>resolve();image.onerror=()=>reject(new Error("Não foi possível carregar a foto."));image.src=url; });
    const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1080;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    ctx.fillStyle="#7653e9";ctx.fillRect(0,0,1080,1080);
    const size=880; const scale=Math.max(size/image.width,size/image.height);
    ctx.drawImage(image,(1080-image.width*scale)/2,(1080-image.height*scale)/2,image.width*scale,image.height*scale);
    ctx.strokeStyle="#fcdf74";ctx.lineWidth=42;ctx.strokeRect(38,38,1004,1004);
    ctx.fillStyle="#7653e9";ctx.beginPath();ctx.roundRect(185,870,710,130,40);ctx.fill();
    ctx.textAlign="center";ctx.fillStyle="white";ctx.font="bold 55px system-ui";ctx.fillText("ENGLISH CHAMPION!",540,953);
    ctx.font='68px "Apple Color Emoji", "Segoe UI Emoji",sans-serif';ctx.fillText(item.icon,540,130);
    downloadCanvas(canvas,`willingue-${item.id}.png`);
  } finally { URL.revokeObjectURL(url); }
}

export function RewardShop({ items, unlocked, initialCoins, currentAvatar }: {
  items: Reward[]; unlocked: string[]; initialCoins: number; currentAvatar: string | null;
}) {
  const router=useRouter();
  const [owned,setOwned]=useState(unlocked);
  const [coins,setCoins]=useState(initialCoins);
  const [avatar,setAvatar]=useState(currentAvatar);
  const [filter,setFilter]=useState<Filter>("ALL");
  const [busy,setBusy]=useState("");
  const [message,setMessage]=useState("");
  const fileRef=useRef<HTMLInputElement>(null);
  const [frameReward,setFrameReward]=useState<Reward|null>(null);
  const list=items.filter(r=>filter==="ALL"||owned.includes(r.id));
  async function purchase(item:Reward) {
    setBusy(item.id);setMessage("");
    try {
      const response=await fetch(`/api/rewards/${item.id}/redeem`,{method:"POST"});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Não foi possível desbloquear.");
      setOwned(a=>[...a,item.id]);setCoins(data.coins);setMessage(`${item.name} foi adicionado à sua coleção! 🎉`);router.refresh();
    }catch(error){setMessage(error instanceof Error?error.message:"Erro ao resgatar recompensa.");}
    finally{setBusy("");}
  }
  async function useItem(item:Reward){
    if(item.category==="STICKER"){createSticker(item);return;}
    if(item.category==="FRAME"){setFrameReward(item);fileRef.current?.click();return;}
    setBusy(item.id);setMessage("");
    try{
      const response=await fetch("/api/profile/avatar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rewardId:item.id})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"Não foi possível usar este avatar.");
      setAvatar(item.icon);setMessage("Seu avatar foi atualizado! ✨");router.refresh();
    }catch(error){setMessage(error instanceof Error?error.message:"Erro ao aplicar avatar.");}
    finally{setBusy("");}
  }
  return <div className="reward-content">
    <section className="wallet-hero"><div><p className="eyebrow">SUA CARTEIRA MÁGICA ✨</p><strong><Coins size={31}/> {coins.toLocaleString("pt-BR")}</strong><span>moedas disponíveis</span><p>Complete lições para juntar ainda mais!</p></div><div className="wallet-illustration">🎁<span>✦</span></div></section>
    <div className="reward-tabs" role="tablist" aria-label="Filtrar recompensas"><button type="button" className={filter==="ALL"?"selected":""} onClick={()=>setFilter("ALL")} role="tab" aria-selected={filter==="ALL"}>🛍️ Loja de prêmios</button><button type="button" className={filter==="OWNED"?"selected":""} onClick={()=>setFilter("OWNED")} role="tab" aria-selected={filter==="OWNED"}>🎒 Minha coleção ({owned.length})</button></div>
    {message && <p className="shop-message" role="status">{message}</p>}
    {list.length ? <div className="rewards-grid">{list.map(item=>{
      const isOwned=owned.includes(item.id);
      return <article className="reward-card" key={item.id}><div className={`reward-picture category-${item.category.toLowerCase()}`}><span>{item.icon}</span>{isOwned&&<span className="owned-pill"><Check size={14}/> Adquirido</span>}</div>
        <div className="reward-card-body"><span className="reward-category">{item.category==="AVATAR"?"AVATAR":item.category==="STICKER"?"FIGURINHA":"MOLDURA"}</span><h3>{item.name}</h3><p>{item.description}</p>
          {isOwned ? <button type="button" className="reward-use" disabled={busy===item.id || (item.category==="AVATAR"&&avatar===item.icon)} onClick={()=>void useItem(item)}>{item.category==="AVATAR"&&avatar===item.icon ? <><Check size={16}/> Em uso</> : item.category==="AVATAR" ? <><Sparkles size={16}/> Usar avatar</> : <><Download size={16}/> {item.category==="FRAME"?"Criar foto":"Baixar PNG"}</>}</button>
            : <button type="button" className="reward-buy" disabled={busy===item.id||coins<item.price} onClick={()=>void purchase(item)}>{busy===item.id?"Aguarde...":coins<item.price?<><LockKeyhole size={15}/> {item.price} moedas</>:<><Coins size={16}/> Resgatar · {item.price}</>}</button>}
        </div></article>;
    })}</div> : <div className="empty-card"><span>🎁</span><h3>Sua coleção começa aqui!</h3><p>Resgate uma recompensa na loja para vê-la nesta área.</p><button className="secondary-button" onClick={()=>setFilter("ALL")}>Explorar loja</button></div>}
    <input ref={fileRef} type="file" accept="image/*" hidden aria-label="Selecionar foto para moldura" onChange={async e=>{const file=e.target.files?.[0];if(file&&frameReward){try{await createFrame(file,frameReward);setMessage("Sua moldura foi criada! Confira seus downloads.");}catch(err){setMessage(err instanceof Error?err.message:"Não foi possível criar a foto.");}}e.target.value="";}}/>
    <p className="rewards-help"><Gift size={17}/> Prêmios digitais permanentes. As figurinhas são exportadas como PNG para compartilhar e as molduras podem ser aplicadas às suas fotos.</p>
  </div>;
}
