import { formatHUF } from '../../utils/currency'

interface Props {
  income: number
  expense: number
}

export default function BalanceSummary({ income, expense }: Props) {
  const balance = income - expense

  return (
    <div className="text-white">
      <p className="text-white/70 text-sm mb-1">Havi egyenleg</p>
      <p className="text-4xl font-bold mb-6 tracking-tight">{formatHUF(balance)}</p>
      <div className="flex gap-3">
        <div className="flex-1 bg-white/15 rounded-2xl p-3">
          <p className="text-white/70 text-xs mb-1">↑ Bevétel</p>
          <p className="font-semibold text-sm">{formatHUF(income)}</p>
        </div>
        <div className="flex-1 bg-white/15 rounded-2xl p-3">
          <p className="text-white/70 text-xs mb-1">↓ Kiadás</p>
          <p className="font-semibold text-sm">{formatHUF(expense)}</p>
        </div>
      </div>
    </div>
  )
}
