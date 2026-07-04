import { X } from 'lucide-react';

const WALLETS = [
  { id: 'freighter', name: 'Freighter', icon: '🛳️' },
  { id: 'xbull', name: 'xBull', icon: '🐂' },
  { id: 'albedo', name: 'Albedo', icon: '🌌' },
];

export default function WalletModal({ isOpen, onClose, onConnect }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card w-full max-w-sm relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold mb-6 text-white">Connect Wallet</h2>
        
        <div className="space-y-3">
          {WALLETS.map(wallet => (
            <button
              key={wallet.id}
              onClick={() => onConnect(wallet.id)}
              className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-primary-500 hover:bg-slate-700 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{wallet.icon}</span>
                <span className="font-medium text-gray-200 group-hover:text-white">{wallet.name}</span>
              </div>
              <span className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Connect →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
