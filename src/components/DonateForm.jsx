import { useState } from 'react';
import { Heart, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitDonation, checkTransactionStatus } from '../services/contract';
import BigNumber from 'bignumber.js';

export default function DonateForm({ pubKey, kit, onDonationSuccess }) {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('idle'); // idle, pending, success, error
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
      
      const submitResponse = await submitDonation(kit, pubKey, stroopsAmount);
      
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
      if (err.message.includes('User declined')) {
        setErrorMsg('Transaction cancelled by user');
      } else if (err.message.includes('Insufficient balance') || err.message.includes('op_underfunded')) {
        setErrorMsg('Insufficient XLM balance for this donation');
      } else {
        setErrorMsg('Transaction failed. Please try again.');
      }
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Heart className="text-pink-500" />
        Make a Donation
      </h2>

      <form onSubmit={handleDonate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Amount (XLM)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.0000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              disabled={status === 'pending'}
              className="input-field pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              XLM
            </span>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={status === 'pending' || !amount}
          className="btn-primary w-full flex justify-center items-center gap-2"
        >
          {status === 'pending' ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Processing...
            </>
          ) : (
            'Donate Now'
          )}
        </button>
      </form>

      {status === 'success' && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex flex-col gap-2">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 size={18} />
            <span className="font-medium">Donation Successful!</span>
          </div>
          {txHash && (
            <a 
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-300 hover:text-green-200 underline break-all"
            >
              View on Stellar Expert
            </a>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
