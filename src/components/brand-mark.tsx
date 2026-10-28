/** W monogram; the same geometry is used in favicon, PWA and social media assets. */
export function BrandMark({size=40,className}:{size?:number;className?:string}){
 return <svg viewBox="0 0 192 192" width={size} height={size} className={className}
  role="img" aria-label="Willingue" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="42" fill="#6754e8"/>
  <path d="M39 56L66 138L96 86L126 138L153 56" stroke="white" strokeWidth="18"
    strokeLinecap="round" strokeLinejoin="round" fill="none"/>
 </svg>;
}
