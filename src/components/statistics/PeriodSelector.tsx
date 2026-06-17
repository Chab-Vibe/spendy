interface Props {
  value: 'week' | 'month'
  onChange: (v: 'week' | 'month') => void
}

export default function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="flex bg-white/20 rounded-xl p-1 w-fit">
      {(['week', 'month'] as const).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-6 py-1.5 rounded-lg text-sm font-medium transition-all ${
            value === p ? 'bg-white text-[#5B4FCF]' : 'text-white'
          }`}
        >
          {p === 'week' ? 'Heti' : 'Havi'}
        </button>
      ))}
    </div>
  )
}
