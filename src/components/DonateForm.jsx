import { useState } from 'react';
import { Heart, Loader2, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';
import { submitDonation, checkTransactionStatus } from '../services/contract';
import BigNumber from 'bignumber.js';

export default function DonateForm({ pubKey, onDonationSuccess, onConnectClick }) {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('idle'); // idle, pending, success, error
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!pubKey) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-purple-400/30 rounded-3xl p-7 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 hover:-translate-y-1 transition-all h-[220px] flex flex-col justify-center">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
            <Wallet size={24} className="text-white" />
          </div>
          <h3 className="text-[18px] font-bold text-white mb-2">Connect Wallet to Donate</h3>
          <p className="text-[14px] text-slate-400 leading-snug">
            Please connect your Stellar wallet (Freighter, xBull, or Albedo) to contribute to this campaign.
          </p>
        </div>
        <button 
          onClick={onConnectClick}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Wallet size={20} />
          Connect Wallet
        </button>
      </div>
    );
  }

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!pubKey) {
      setErrorMsg('Please connect your wallet first');
      setStatus('error');
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setErrorMsg('Please enter a valid amount');
      setStatus('error');
      return;
    }

    try {
      setStatus('pending');
      setErrorMsg('');
      setTxHash('');

      // Convert XLM to stroops (1 XLM = 10^7 stroops)
      const stroopsAmount = new BigNumber(amount).multipliedBy(10000000).toString();
      
      const submitResponse = await submitDonation(pubKey, stroopsAmount);
      
      // The sendTransaction returns a hash
      const hash = submitResponse.hash;
      setTxHash(hash);

      const txStatus = await checkTransactionStatus(hash);
      
      if (txStatus.status === 'SUCCESS') {
        setStatus('success');
        setAmount('');
        onDonationSuccess();
      } else {
        throw new Error(`Transaction failed with status: ${txStatus.status}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      const msg = err.message || JSON.stringify(err);
      if (msg.includes('User declined') || msg.includes('declined') || msg.includes('cancel')) {
        setErrorMsg('Transaction cancelled by user');
      } else if (msg.includes('Insufficient balance') || msg.includes('op_underfunded') || msg.includes('underfunded')) {
        setErrorMsg('Insufficient XLM balance for this donation. Please fund your wallet via Friendbot.');
      } else {
        setErrorMsg(`Transaction failed: ${msg}`);
      }
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl border border-purple-400/30 rounded-3xl p-7 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 hover:-translate-y-1 transition-all min-h-[220px] flex flex-col justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
          <Heart size={20} />
        </div>
        <h2 className="text-[20px] font-bold text-white font-[SF_Pro]">Make a Donation</h2>
      </div>

      <form onSubmit={handleDonate} className="flex flex-col gap-4 mt-2">
        <div className="relative">
          <input
            type="number"
            step="0.0000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (XLM)"
            disabled={status === 'pending'}
            className="input-field pr-16"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-cyan-400 font-bold">
            XLM
          </span>
        </div>

        <button 
          type="submit" 
          disabled={status === 'pending' || !amount}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {status === 'pending' ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Processing...
            </>
          ) : (
            <>
              <Heart size={18} />
              Donate Now
            </>
          )}
        </button>
      </form>

      {status === 'success' && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col gap-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 size={18} />
            <span className="font-semibold text-sm">Donation Successful!</span>
          </div>
          {txHash && (
            <a 
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-300 hover:text-green-200 underline break-all font-mono"
            >
              View on Stellar Expert
            </a>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400 font-medium leading-normal">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
