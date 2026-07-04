import { Activity, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import BigNumber from 'bignumber.js';

export default function DonationFeed({ donations }) {
  return (
    <div className="card h-full">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-primary-500" />
        <h2 className="text-xl font-bold text-white">Live Activity</h2>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {donations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No donations yet. Be the first!
          </div>
        ) : (
          donations.map((donation) => {
            const amountXlm = new BigNumber(donation.amount).dividedBy(10000000).toNumber();
            
            return (
              <div 
                key={donation.id} 
                className="bg-dark-900 p-4 rounded-lg border border-dark-700 animate-in fade-in slide-in-from-top-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {donation.donor.substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-mono text-gray-300">
                        {donation.donor.substring(0, 4)}...{donation.donor.substring(donation.donor.length - 4)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(donation.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary-400">
                      +{amountXlm.toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM
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
