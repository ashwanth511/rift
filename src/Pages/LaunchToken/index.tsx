import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '@suiet/wallet-kit';
import { TransactionBlock, TransactionObjectInput } from '@mysten/sui.js/transactions';
import { SuiClient } from '@mysten/sui.js/client'
interface Message {
  role: 'user' | 'assistant' | 'developer';
  content: string;
}

// Define your API key - in production, use environment variables properly injected during build
const BEARER_TOKEN = "7uabXiOonc28sJAussfv90cIeiJkPi";

const LaunchToken = () => {
  const { connected, account, signAndExecuteTransaction } = useWallet();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    decimals: '',
    description: '',
    website: '',
    telegram: '',
    twitter: '',
    lockPeriod: ''
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "🚀 Hey! I'm your Sui DeFi Assistant. I can help you with:\n\n" +
               "1️⃣ Send SUI tokens\n" +
               "2️⃣ Deploy new tokens\n" +
               "3️⃣ Interact with contracts\n" +
               "4️⃣ Check balances & transactions\n\n" +
               `${connected ? '✅ Wallet connected: ' + account?.address?.slice(0, 6) + '...' : '❌ Please connect your wallet first!'}\n\n` +
               "What would you like to do? Just ask naturally!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to send SUI tokens
  const sendSui = async (toAddress: string, amount: string) => {
    try {
      const amountInMist = BigInt(Math.floor(Number(amount) * 1e9)); // Convert SUI to MIST (9 decimals)
      const tx = new TransactionBlock();
      
      // Get all coins owned by the sender
      const client = new SuiClient({
        url: 'https://fullnode.devnet.sui.io:443'
      });

      const coins = await client.getCoins({
        owner: account?.address || '',
        coinType: '0x2::sui::SUI'
      });

      // Add coins to the transaction
      const coinIds = coins.data
        .filter((coin: { coinType: string; }) => coin.coinType === '0x2::sui::SUI')
        .map((coin: { coinObjectId: any; }) => coin.coinObjectId);

      if (coinIds.length === 0) {
        throw new Error('No SUI coins found in wallet');
      }

      // Merge all coins first
      const primaryCoin = tx.mergeCoins(
        tx.object(coinIds[0]),
        coinIds.slice(1).map((id: TransactionObjectInput) => tx.object(id))
      );
      
      // Split the exact amount needed
      const [sendCoin] = tx.splitCoins(primaryCoin, [tx.pure(amountInMist)]);
      
      // Transfer the split coin
      tx.transferObjects([sendCoin], tx.pure(toAddress));
      
      // Set gas budget
      tx.setGasBudget(10000000);

      // Use the new signAndExecuteTransaction method
      const result = await signAndExecuteTransaction({
        transaction: tx as unknown as { toJSON(): Promise<string> }
      });

      return { success: true, hash: result.digest };
    } catch (error) {
      console.error('Error sending SUI:', error);
      return { success: false, error };
    }
  };

  // Function to deploy a new token
  const deployToken = async (name: string, symbol: string, totalSupply: string) => {
    try {
      const tx = new TransactionBlock();
      // Add token deployment logic using rift_token contract
      // This is a placeholder - implement actual contract call
      return { success: true, message: "Token deployment initiated" };
    } catch (error) {
      return { success: false, error };
    }
  };

  const getWalletBalance = async () => {
    try {
      const client = new SuiClient({
        url: 'https://fullnode.devnet.sui.io:443'
      });

      const coins = await client.getCoins({
        owner: account?.address || '',
        coinType: '0x2::sui::SUI'
      });

      // Calculate total balance
      const totalBalance = coins.data.reduce((acc, coin) => {
        return acc + BigInt(coin.balance);
      }, BigInt(0));

      // Format balance to SUI units (9 decimals)
      return (Number(totalBalance) / 1e9).toFixed(4);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Check for balance query
      if (input.toLowerCase().includes('balance') || input.toLowerCase().includes('how much sui')) {
        const balance = await getWalletBalance();
        const response = {
          role: 'assistant' as const,
          content: `Your current wallet balance is ${balance} SUI on the devnet network.`
        };
        setMessages(prev => [...prev, response]);
        setIsLoading(false);
        return;
      }

      // Check for send command
      if (input.toLowerCase().includes('send') && input.toLowerCase().includes('sui')) {
        const amountMatch = input.match(/\d+(\.\d+)?/);
        const addressMatch = input.match(/0x[a-fA-F0-9]{64}/);
        
        if (amountMatch && addressMatch) {
          const amount = amountMatch[0];
          const toAddress = addressMatch[0];
          
          const response = {
            role: 'assistant' as const,
            content: `To send ${amount} SUI, I need to confirm the details:\n` +
                    `* Amount: ${amount} SUI\n` +
                    `* Recipient: ${toAddress}\n` +
                    `* Sender: ${account?.address} (your connected wallet)\n` +
                    `Estimated gas fee: 0.01 SUI\n\n` +
                    `Confirm sending ${amount} SUI to the specified address? (yes/no)`
          };
          setMessages(prev => [...prev, response]);
          setIsLoading(false);
          return;
        }
      }

      // Handle confirmation for send
      if (input.toLowerCase() === 'yes' && messages[messages.length - 1].content.includes('Confirm sending')) {
        const prevMessage = messages[messages.length - 1].content;
        const amount = prevMessage.match(/Amount: (\d+(\.\d+)?)/)?.[1];
        const toAddress = prevMessage.match(/Recipient: (0x[a-fA-F0-9]{64})/)?.[1];

        if (amount && toAddress) {
          const response = {
            role: 'assistant' as const,
            content: `Sending ${amount} SUI to ${toAddress}...`
          };
          setMessages(prev => [...prev, response]);

          const result = await sendSui(toAddress, amount);
          
          const confirmationResponse = {
            role: 'assistant' as const,
            content: result.success ? 
              `✅ Transaction successful!\nTransaction hash: ${result.hash}\n\nYour new balance is: ${await getWalletBalance()} SUI` :
              `❌ Transaction failed. Please try again.`
          };
          setMessages(prev => [...prev, confirmationResponse]);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('https://api.atoma.network/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.3-70B-Instruct",
          messages: [
            {
              role: 'system',
              content: `You are a Sui DeFi Assistant. You help users with:\n` +
                      `1. Sending SUI tokens\n` +
                      `2. Checking balances\n` +
                      `3. Deploying tokens\n` +
                      `4. Interacting with smart contracts\n\n` +
                      `Current wallet status: ${connected ? '✅ Connected' : '❌ Not connected'}\n` +
                      `Network: ${'unknown'}\n` +
                      `Address: ${account?.address || 'Not connected'}`
            },
            ...messages.slice(-10),
            userMessage
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await response.json();
      const assistantMessage = { role: 'assistant' as const, content: data.choices[0].message.content };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { role: 'assistant' as const, content: 'Sorry, there was an error processing your request.' };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Launching token with data:', formData);
  };

  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20">
          
          <h1 className='text-5xl text-blue-500 font-bold mt-[1%] text-center '>Launch Token</h1>
      <div className="max-w-4xl  mt-[5%] mx-auto">
      <Button className=' text-white mb-8 pl-[50px] pr-[50px] ' onClick={() => navigate('/dashboard')}><ArrowLeft/>Tokens</Button>
        <Tabs defaultValue="launch" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 mb-6">
            <TabsTrigger value="launch" className="data-[state=active]:bg-zinc-800">Launch Token</TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-zinc-800">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="launch">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-8">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-zinc-700' : 'bg-zinc-600'} text-white`}>
                    1
                  </div>
                  <div className={`h-1 w-20 ${currentStep === 1 ? 'bg-zinc-800' : 'bg-zinc-700'}`} />
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-zinc-800' : 'bg-zinc-700'} text-white`}>
                    2
                  </div>
                </div>

                {currentStep === 1 ? (
                  // Step 1: Basic Information
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">Token Name</Label>
                      <Input 
                        name="tokenName"
                        value={formData.tokenName}
                        onChange={handleInputChange}
                        placeholder="Enter token name" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Token Symbol</Label>
                      <Input 
                        name="tokenSymbol"
                        value={formData.tokenSymbol}
                        onChange={handleInputChange}
                        placeholder="e.g. PKMN" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Total Supply</Label>
                      <Input 
                        name="totalSupply"
                        value={formData.totalSupply}
                        onChange={handleInputChange}
                        type="number" 
                        placeholder="1000000" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Decimals</Label>
                      <Input 
                        name="decimals"
                        value={formData.decimals}
                        onChange={handleInputChange}
                        type="number" 
                        placeholder="18" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <Button 
                      onClick={() => setCurrentStep(2)}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                    >
                      Next Step
                    </Button>
                  </form>
                ) : (
                  // Step 2: Launch Configuration
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">Description</Label>
                      <Input 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your Pokemon token..." 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Website</Label>
                      <Input 
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://example.com" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Telegram</Label>
                      <Input 
                        name="telegram"
                        value={formData.telegram}
                        onChange={handleInputChange}
                        placeholder="https://t.me/example" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Twitter</Label>
                      <Input 
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleInputChange}
                        placeholder="https://twitter.com/example" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Lock Period (days)</Label>
                      <Input 
                        name="lockPeriod"
                        value={formData.lockPeriod}
                        onChange={handleInputChange}
                        type="number" 
                        placeholder="365" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button 
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                        className="w-1/2 border-zinc-700 hover:bg-zinc-800 text-white"
                      >
                        Go Back
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-white"
                      >
                        Launch Token
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-[500px] bg-zinc-800 rounded-lg p-4 overflow-y-auto space-y-4">
                    {messages.map((message, index) => (
                      <div key={index} className="flex gap-3">
                        <div className={`rounded-lg p-3 text-white max-w-[80%] ${
                          message.role === 'assistant' ? 'bg-zinc-700' : 'bg-blue-600 ml-auto'
                        }`}>
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me about creating your Pokemon token..."
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 flex-1"
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LaunchToken;