import { useState, useEffect, useRef } from 'react';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit/sdk';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';
import { Networks } from '@creit.tech/stellar-wallets-kit/types';
import { fetchContractState, submitDonation, checkTransactionStatus, server, CONTRACT_ID } from './services/contract';
import WalletModal from './components/WalletModal';
import CampaignProgress from './components/CampaignProgress';
import DonateForm from './components/DonateForm';
import DonationFeed from './components/DonationFeed';
import { Wallet, LogOut } from 'lucide-react';

import { xdr, scValToNative } from '@stellar/stellar-sdk';

// Initialize the static StellarWalletsKit class
StellarWalletsKit.init({
  modules: defaultModules(),
  network: Networks.TESTNET,
});

function App() {
  const [pubKey, setPubKey] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaign, setCampaign] = useState({ goal: 0, raised: 0 });
  const [donations, setDonations] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startLedgerRef = useRef(null);

  const fetchEvents = async () => {
    try {
      if (!startLedgerRef.current) {
        const latest = await server.getLatestLedger();
        // Go back 10,000 ledgers (approx 12-14 hours) to fetch historical donations
        startLedgerRef.current = Math.max(1, latest.sequence - 10000);
      }

      const eventsRes = await server.getEvents({
        startLedger: startLedgerRef.current,
        filters: [
          {
            type: 'contract',
            contractIds: [CONTRACT_ID],
          }
        ],
        pagination: { limit: 1000 }
      });

      if (eventsRes && eventsRes.events) {
        const newDonations = [];
        for (let evt of eventsRes.events) {
          // Decode the topics and values directly using scValToNative
          let parsedTopic0 = '';
          let donorAddress = '';
          let amount = 0;
          try {
            if (evt.topic && evt.topic[0]) {
              parsedTopic0 = scValToNative(evt.topic[0]);
            }
            if (evt.topic && evt.topic[1]) {
              donorAddress = scValToNative(evt.topic[1]);
            }
            if (evt.value) {
              const val = scValToNative(evt.value);
              if (Array.isArray(val)) {
                amount = Number(val[0]);
              } else if (val && typeof val === 'object') {
                amount = val.amount ? Number(val.amount) : 0;
              } else {
                amount = Number(val);
              }
            }
          } catch (err) {
            console.error("Error decoding event:", err);
          }

          if (parsedTopic0 === 'donate' && donorAddress) {
            newDonations.push({
              id: evt.id,
              donor: donorAddress,
              amount: amount,
              timestamp: evt.ledgerClosedAt || new Date().toISOString()
            });
          }
        }

        if (newDonations.length > 0) {
          const sorted = newDonations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setDonations(sorted);
        } else {
          setDonations([]);
        }
      }
    } catch (e) {
      console.error("Event fetch error:", e);
    }
  };

  useEffect(() => {
    loadCampaignState();
    fetchEvents();

    // Set up standard 4-second polling interval for events
    const interval = setInterval(fetchEvents, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadCampaignState = async () => {
    setIsRefreshing(true);
    const state = await fetchContractState();
    setCampaign(state);
    setIsRefreshing(false);
  };

  const handleDonationSuccess = async () => {
    // 1. Immediately refresh campaign goal & raised stats
    await loadCampaignState();
    // 2. Poll events immediately, then schedule another one 1.5 seconds later (allowing ledger indexing to finalize)
    await fetchEvents();
    setTimeout(async () => {
      await fetchEvents();
    }, 1500);
  };

  const handleConnect = async (walletId) => {
    try {
      StellarWalletsKit.setWallet(walletId);
      const { address } = await StellarWalletsKit.fetchAddress();
      setPubKey(address);
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to connect wallet: " + (e.message || JSON.stringify(e)));
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] p-8 relative overflow-hidden font-[Inter]">
      {/* Glow Orbs - Premium background */}
      <div className="absolute w-[600px] h-[600px] bg-cyan-500/20 blur-[200px] -top-40 -left-40 rounded-full animate-pulse pointer-events-none"></div>
      <div className="absolute w-[600px] h-[600px] bg-purple-500/15 blur-[200px] -bottom-40 -right-40 rounded-full animate-pulse pointer-events-none"></div>

      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 xmlns=http://www.w3.org/2000/svg%3E%3Cfilter id=n%3E%3CfeTurbulence type=fractalNoise baseFrequency=0.8 numOctaves=4/%3E%3C/filter%3E%3Crect width=100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E')] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-[32px] font-bold font-[Space_Grotesk] bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Lumenova-L2
          </h1>
          {pubKey ? (
            <div className="flex items-center gap-4 bg-slate-900/80 rounded-2xl py-2.5 px-5 border border-cyan-500/20 backdrop-blur-md shadow-lg shadow-cyan-500/5">
              <span className="text-sm font-mono text-cyan-300">
                {pubKey.substring(0, 4)}...{pubKey.substring(pubKey.length - 4)}
              </span>
              <button 
                onClick={() => setPubKey('')}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Disconnect"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-[2px] transition-all cursor-pointer"
            >
              <Wallet size={18} />
              Connect Wallet
            </button>
          )}
        </div>

        {/* Main Grid - Asymmetric heights */}
        <div className="grid grid-cols-3 gap-7">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <CampaignProgress 
              goal={campaign.goal} 
              raised={campaign.raised} 
              isRefreshing={isRefreshing}
            />
            
            <DonateForm 
              pubKey={pubKey} 
              onDonationSuccess={handleDonationSuccess} 
              onConnectClick={() => setIsModalOpen(true)}
            />
          </div>

          {/* Right Column - Live Activity 500px */}
          <div className="col-span-2">
            <DonationFeed donations={donations} />
          </div>
        </div>

        <WalletModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onConnect={handleConnect} 
        />
      </div>
    </div>
  );
}

export default App;
