export function ProgressRing({ value, size = 84, stroke = 9, color = "#7460e8" }: { value: number; size?: number; stroke?: number; color?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  return <div className="ring-wrap" style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${value}% concluído`}>
      <circle cx={size/2} cy={size/2} r={radius} stroke="#e9e7f3" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} transform={`rotate(-90 ${size/2} ${size/2})`}/>
    </svg><strong className="ring-label">{value}%</strong>
  </div>;
}
