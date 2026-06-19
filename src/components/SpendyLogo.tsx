export default function SpendyLogo({ size = 72 }: { size?: number }) {
  const w = Math.round(size * (300 / 210))
  const c = '#1a9460'
  return (
    <svg width={w} height={size} viewBox="0 0 300 210" xmlns="http://www.w3.org/2000/svg">
      {/* speed line row 1 */}
      <rect x="6"   y="18" width="6"  height="5" rx="2.5" fill={c}/>
      <rect x="20"  y="18" width="10" height="5" rx="2.5" fill={c}/>
      <rect x="40"  y="18" width="16" height="5" rx="2.5" fill={c}/>
      <rect x="68"  y="18" width="22" height="5" rx="2.5" fill={c}/>
      <rect x="104" y="18" width="28" height="5" rx="2.5" fill={c}/>
      <rect x="145" y="18" width="18" height="5" rx="2.5" fill={c}/>
      {/* speed line row 2 */}
      <rect x="10"  y="36" width="8"  height="5" rx="2.5" fill={c}/>
      <rect x="28"  y="36" width="14" height="5" rx="2.5" fill={c}/>
      <rect x="54"  y="36" width="20" height="5" rx="2.5" fill={c}/>
      <rect x="88"  y="36" width="28" height="5" rx="2.5" fill={c}/>
      <rect x="130" y="36" width="34" height="5" rx="2.5" fill={c}/>
      {/* speed line row 3 */}
      <rect x="4"   y="78" width="6"  height="5" rx="2.5" fill={c}/>
      <rect x="18"  y="78" width="12" height="5" rx="2.5" fill={c}/>
      <rect x="40"  y="78" width="18" height="5" rx="2.5" fill={c}/>
      <rect x="72"  y="78" width="26" height="5" rx="2.5" fill={c}/>
      <rect x="114" y="78" width="32" height="5" rx="2.5" fill={c}/>
      <rect x="156" y="78" width="8"  height="5" rx="2.5" fill={c}/>
      {/* speed line row 4 */}
      <rect x="8"   y="104" width="8"  height="5" rx="2.5" fill={c}/>
      <rect x="26"  y="104" width="14" height="5" rx="2.5" fill={c}/>
      <rect x="52"  y="104" width="22" height="5" rx="2.5" fill={c}/>
      <rect x="88"  y="104" width="30" height="5" rx="2.5" fill={c}/>
      <rect x="132" y="104" width="32" height="5" rx="2.5" fill={c}/>
      {/* speed line row 5 */}
      <rect x="6"   y="130" width="6"  height="5" rx="2.5" fill={c}/>
      <rect x="20"  y="130" width="12" height="5" rx="2.5" fill={c}/>
      <rect x="44"  y="130" width="18" height="5" rx="2.5" fill={c}/>
      <rect x="76"  y="130" width="26" height="5" rx="2.5" fill={c}/>
      <rect x="116" y="130" width="32" height="5" rx="2.5" fill={c}/>
      <rect x="158" y="130" width="6"  height="5" rx="2.5" fill={c}/>
      {/* speed line row 6 */}
      <rect x="10"  y="156" width="8"  height="5" rx="2.5" fill={c}/>
      <rect x="28"  y="156" width="14" height="5" rx="2.5" fill={c}/>
      <rect x="56"  y="156" width="20" height="5" rx="2.5" fill={c}/>
      <rect x="90"  y="156" width="28" height="5" rx="2.5" fill={c}/>
      <rect x="132" y="156" width="32" height="5" rx="2.5" fill={c}/>
      {/* bills (3, fanned) */}
      <g transform="rotate(-8,217,47)">
        <rect x="168" y="27" width="98" height="30" rx="8" fill={c}/>
      </g>
      <g transform="rotate(-2,216,38)">
        <rect x="170" y="18" width="94" height="28" rx="8" fill={c}/>
      </g>
      <g transform="rotate(5,214,30)">
        <rect x="172" y="9"  width="90" height="26" rx="8" fill={c}/>
      </g>
      {/* wallet body */}
      <rect x="163" y="66" width="132" height="122" rx="18" fill={c}/>
      {/* card slot */}
      <rect x="178" y="80" width="102" height="20" rx="8" fill="#146d47"/>
      {/* clasp */}
      <circle cx="284" cy="127" r="13" fill="#146d47"/>
      <circle cx="284" cy="127" r="7"  fill={c}/>
    </svg>
  )
}
