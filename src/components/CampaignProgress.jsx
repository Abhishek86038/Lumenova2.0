import BigNumber from 'bignumber.js';

export default function CampaignProgress({ goal, raised, isRefreshing }) {
  // We'll treat the values as stroops (1 XLM = 10^7 stroops)
  const goalXlm = new BigNumber(goal).dividedBy(10000000).toNumber();
  const raisedXlm = new BigNumber(raised).dividedBy(10000000).toNumber();
  
  const progressPercent = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  return (
    <div className={`bg-slate-900/60 backdrop-blur-2xl border border-cyan-400/30 rounded-3xl p-7 shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all h-[260px] flex flex-col justify-between ${isRefreshing ? 'opacity-85' : 'opacity-100'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            {isRefreshing ? (
              <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h2 className="text-[20px] font-bold text-white font-[SF_Pro]">Campaign Status</h2>
        </div>
        {isRefreshing && (
          <span className="text-xs text-cyan-400 animate-pulse bg-cyan-500/10 px-2 py-1 rounded">
            Syncing...
          </span>
        )}
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-baseline mb-1">
          <p className="text-[12px] uppercase tracking-[2px] text-slate-400 font-medium">Progress</p>
          <p className="text-[42px] font-bold text-cyan-400 leading-none">{progressPercent.toFixed(1)}%</p>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-lg shadow-cyan-500/50 transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 hover:border-cyan-400/50 transition-all">
          <p className="text-[11px] uppercase tracking-[1px] text-slate-400 mb-1 flex items-center gap-1 font-semibold">
            ↗ RAISED
          </p>
          <p className="text-[36px] font-bold text-white leading-none">
            {raisedXlm.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-[16px] text-cyan-400 ml-1">XLM</span>
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 hover:border-purple-400/50 transition-all">
          <p className="text-[11px] uppercase tracking-[1px] text-slate-400 mb-1 flex items-center gap-1 font-semibold">
            ◎ GOAL
          </p>
          <p className="text-[36px] font-bold text-white leading-none">
            {goalXlm.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-[16px] text-purple-400 ml-1">XLM</span>
          </p>
        </div>
      </div>
    </div>
  );
}
