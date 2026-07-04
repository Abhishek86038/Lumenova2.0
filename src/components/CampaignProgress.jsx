import { Target, TrendingUp } from 'lucide-react';
import BigNumber from 'bignumber.js';

export default function CampaignProgress({ goal, raised, isRefreshing }) {
  // We'll treat the values as stroops (1 XLM = 10^7 stroops)
  const goalXlm = new BigNumber(goal).dividedBy(10000000).toNumber();
  const raisedXlm = new BigNumber(raised).dividedBy(10000000).toNumber();
  
  const progressPercent = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  return (
    <div className={`card transition-opacity duration-300 ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="text-primary-500" />
          Campaign Status
        </h2>
        {isRefreshing && (
          <span className="text-xs text-primary-400 animate-pulse bg-primary-500/10 px-2 py-1 rounded">
            Syncing...
          </span>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="font-medium text-white">{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-dark-900 rounded-full h-3 overflow-hidden border border-dark-700">
            <div 
              className="bg-gradient-to-r from-primary-600 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-900 p-4 rounded-lg border border-dark-700">
            <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
              <TrendingUp size={14} /> Raised
            </div>
            <div className="text-2xl font-bold text-white">
              {raisedXlm.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-sm text-gray-400 font-normal">XLM</span>
            </div>
          </div>
          <div className="bg-dark-900 p-4 rounded-lg border border-dark-700">
            <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
              <Target size={14} /> Goal
            </div>
            <div className="text-2xl font-bold text-white">
              {goalXlm.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-sm text-gray-400 font-normal">XLM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
