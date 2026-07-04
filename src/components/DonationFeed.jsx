import { formatDistanceToNow } from 'date-fns';
import BigNumber from 'bignumber.js';

export default function DonationFeed({ donations }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl border border-cyan-400/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/10 h-[500px] flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-8 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-[20px] font-bold text-white font-[SF_Pro]">Live Activity</h2>
        <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        {donations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-[22px] font-bold text-white mb-2 font-sans">No donations yet.</h3>
            <p className="text-[16px] text-slate-400 font-sans">Be the first to donate!</p>
          </div>
        ) : (
          donations.map((donation) => {
            const amountXlm = new BigNumber(donation.amount).dividedBy(10000000).toNumber();
            
            return (
              <div 
                key={donation.id} 
                className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-cyan-400/50 hover:-translate-y-0.5 transition-all duration-300 animate-in fade-in slide-in-from-top-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold text-sm">
                      {donation.donor.substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-mono text-gray-300 font-medium">
                        {donation.donor.substring(0, 4)}...{donation.donor.substring(donation.donor.length - 4)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {formatDistanceToNow(new Date(donation.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-cyan-400 text-base">
                      +{amountXlm.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xs text-gray-500 font-medium">XLM</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
