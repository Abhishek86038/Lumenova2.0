import { useState, useEffect } from 'react';
import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';
import { fetchContractState, submitDonation, checkTransactionStatus, server } from './services/contract';
import WalletModal from './components/WalletModal';
import CampaignProgress from './components/CampaignProgress';
import DonateForm from './components/DonateForm';
import DonationFeed from './components/DonationFeed';
import { Wallet, LogOut } from 'lucide-react';

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: 'freighter',
  modules: allowAllModules(),
});

function App() {
  const [pubKey, setPubKey] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaign, setCampaign] = useState({ goal: 0, raised: 0 });
  const [donations, setDonations] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCampaignState();
    
    // Listen for events via Soroban RPC
    let isMounted = true;
    let cursor = null;
    
    const fetchEvents = async () => {
      try {
        const eventsRes = await server.getEvents({
          startLedger: cursor ? cursor : undefined,
          filters: [
            {
              type: 'contract',
              contractIds: ['CBGPFHFBUHJ6QKWXTTUWRDC47PO6JIL6PN33HN7VQIDN5DOAHW4VQKOB'],
            }
          ]
        });

        if (eventsRes && eventsRes.events) {
          const newDonations = [];
          for (let evt of eventsRes.events) {
            // Check if topic[0] is "donate"
            if (evt.topic && evt.topic[0] && evt.topic[0].includes('donate')) {
              newDonations.push({
                id: evt.id,
                donor: evt.topic[1],
                amount: evt.value?.amount ? Number(evt.value.amount) : 0,
                timestamp: evt.ledgerClosedAt || new Date().toISOString()
              });
              cursor = evt.pagingToken;
            }
          }
          
          if (newDonations.length > 0 && isMounted) {
            setDonations(prev => [...newDonations, ...prev].filter((v,i,a)=>a.findIndex(t=>(t.id===v.id))===i).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            loadCampaignState(); // Refresh total when new event arrives
          }
        }
      } catch (e) {
        console.error("Event fetch error:", e);
      }
      
      if (isMounted) {
        setTimeout(fetchEvents, 5000);
      }
    };
    
    fetchEvents();
    
    return () => { isMounted = false; };
  }, []);

  const loadCampaignState = async () => {
    setIsRefreshing(true);
    const state = await fetchContractState();
    setCampaign(state);
    setIsRefreshing(false);
  };

  const handleConnect = async (walletId) => {
    try {
      kit.setWallet(walletId);
      const publicKey = await kit.getPublicKey();
      setPubKey(publicKey);
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to connect wallet: " + e.message);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-purple-400">
          Lumenova-L2
        </h1>
        
        {pubKey ? (
          <div className="flex items-center gap-4 bg-dark-800 rounded-full py-2 px-4 border border-dark-700">
            <span className="text-sm font-mono text-gray-300">
              {pubKey.substring(0, 4)}...{pubKey.substring(pubKey.length - 4)}
            </span>
            <button 
              onClick={() => setPubKey('')}
              className="text-gray-400 hover:text-white transition-colors"
              title="Disconnect"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            <Wallet size={18} />
            Connect Wallet
          </button>
        )}
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <CampaignProgress 
            goal={campaign.goal} 
            raised={campaign.raised} 
            isRefreshing={isRefreshing}
          />
          
          <DonateForm 
            pubKey={pubKey} 
            kit={kit} 
            onDonationSuccess={loadCampaignState} 
          />
        </div>
        
        <div className="space-y-8">
          <DonationFeed donations={donations} />
        </div>
      </main>

      <WalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConnect={handleConnect} 
      />
    </div>
  );
}

export default App;
