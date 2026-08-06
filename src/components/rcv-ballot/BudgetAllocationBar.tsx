import { DollarSign, AlertTriangle } from 'lucide-react';

export function BudgetAllocationBar({
  cumulativeCost,
  percentage,
  barWidth,
  BUDGET_CAP,
}: {
  cumulativeCost: number;
  percentage: number;
  barWidth: number;
  BUDGET_CAP: number;
}) {
  return (
    <div className="sticky top-0 z-30 bg-primary-950/95 backdrop-blur-md border-b border-primary-800/80 -mt-8 -mx-8 px-8 py-4 mb-6 shadow-xl transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${cumulativeCost > BUDGET_CAP ? "bg-danger-500 animate-ping" : "bg-success-500 animate-pulse"}`} />
            <h2 className="text-xs font-semibold tracking-wider text-primary-300 uppercase">
              Tampa Municipal Area
            </h2>
          </div>
          <h1 className="text-lg font-bold text-primary-100 flex items-center gap-1.5 mt-0.5">
            <DollarSign className="w-5 h-5 text-accent-400" />
            City Budget Allocation Board
          </h1>
        </div>

        <div className="flex-1 max-w-xl">
          <div className="flex items-center justify-between mb-1.5 text-sm">
            <span className="text-primary-300 font-medium flex items-center gap-1">
              Allocated: <span className={cumulativeCost > BUDGET_CAP ? "text-danger-400 font-bold" : "text-success-400 font-bold"}>
                ${cumulativeCost.toLocaleString()}
              </span>
              <span className="text-primary-500">/ ${BUDGET_CAP.toLocaleString()}</span>
            </span>
            <span className={`font-mono font-bold ${cumulativeCost > BUDGET_CAP ? "text-danger-400" : "text-accent-300"}`}>
              {percentage.toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full h-3 bg-primary-900 rounded-full overflow-hidden border border-primary-800/80 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                cumulativeCost > BUDGET_CAP
                  ? 'bg-danger-500 shadow-lg shadow-danger-500/50'
                  : 'bg-gradient-to-r from-accent-500 via-accent-400 to-success-500 shadow-lg shadow-accent-500/25'
              }`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>

        <div className="flex items-center">
          {cumulativeCost > BUDGET_CAP ? (
            <div className="flex items-center gap-2 text-danger-400 bg-danger-500/10 border border-danger-500/20 px-4 py-2 rounded-lg text-sm font-bold animate-shake">
              <AlertTriangle className="w-4 h-4 text-danger-400 animate-bounce" />
              Municipal Budget Exceeded
            </div>
          ) : (
            <div className="text-primary-400 bg-primary-900/40 border border-primary-800/60 px-4 py-2 rounded-lg text-sm">
              Remaining: <span className="text-success-400 font-bold">${Math.max(0, BUDGET_CAP - cumulativeCost).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
