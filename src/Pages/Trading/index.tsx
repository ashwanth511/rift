import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from '@suiet/wallet-kit';
import { suiService } from '@/lib/sui';

const Trading = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [riftPrice, setRiftPrice] = useState(0);
  const [walletBalance, setWalletBalance] = useState({
    sui: 0,
    rift: 0
  });
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [stakingInfo, setStakingInfo] = useState({
    totalStaked: 0,
    rewardsEarned: 0,
    apr: 15 // Example APR percentage
  });
  const [isLoading, setIsLoading] = useState({
    buy: false,
    sell: false,
    stake: false,
    unstake: false,
    price: true,
    balance: true,
    claim: false
  });
  const [lendingData, setLendingData] = useState({
    supplied: 0,
    borrowed: 0,
    availableToBorrow: 0,
    healthFactor: 0
  });

  useEffect(() => {
    if (wallet.connected) {
      suiService.setWallet(wallet);
      fetchBalances();
      fetchLendingData();
    }
  }, [wallet.connected]);

  const fetchBalances = async () => {
    try {
      setIsLoading(prev => ({ ...prev, balance: true }));
      const suiBalance = await suiService.getBalance(wallet.address!);
      const riftBalance = await suiService.getRiftBalance(wallet.address!);
      
      setWalletBalance({
        sui: Number(suiBalance.totalBalance) / 1e9,
        rift: Number(riftBalance.totalBalance) / 1e9
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
      toast.error('Failed to fetch balances');
    } finally {
      setIsLoading(prev => ({ ...prev, balance: false }));
    }
  };

  const fetchRiftPrice = async () => {
    try {
      // TODO: Implement price fetching from your Sui contract
      setRiftPrice(1.5); // Example price
    } catch (error) {
      console.error('Error fetching price:', error);
      toast.error('Failed to fetch Rift price');
    } finally {
      setIsLoading(prev => ({ ...prev, price: false }));
    }
  };

  const fetchLendingData = async () => {
    try {
      const data = await suiService.getUserLendingData(wallet.address!);
      setLendingData({
        supplied: Number(data.totalSupplied) / 1e9,
        borrowed: Number(data.totalBorrowed) / 1e9,
        availableToBorrow: Number(data.availableToBorrow) / 1e9,
        healthFactor: Number(data.healthFactor)
      });
    } catch (error) {
      console.error('Error fetching lending data:', error);
      toast.error('Failed to fetch lending data');
    }
  };

  const handleBuyRift = async () => {
    try {
      setIsLoading(prev => ({ ...prev, buy: true }));
      const amount = parseFloat(buyAmount);
      if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');

      await suiService.buyRiftWithSui(amount * 1e9);
      toast.success('Successfully bought RIFT tokens!');
      setBuyAmount('');
      fetchBalances();
    } catch (error) {
      console.error('Error buying RIFT:', error);
      toast.error('Failed to buy RIFT tokens');
    } finally {
      setIsLoading(prev => ({ ...prev, buy: false }));
    }
  };

  const handleSellRift = async () => {
    try {
      setIsLoading(prev => ({ ...prev, sell: true }));
      const amount = parseFloat(sellAmount);
      if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');

      await suiService.sellRiftForSui(amount * 1e9);
      toast.success('Successfully sold RIFT tokens!');
      setSellAmount('');
      fetchBalances();
    } catch (error) {
      console.error('Error selling RIFT:', error);
      toast.error('Failed to sell RIFT tokens');
    } finally {
      setIsLoading(prev => ({ ...prev, sell: false }));
    }
  };

  const handleStakeRift = async () => {
    try {
      setIsLoading(prev => ({ ...prev, stake: true }));
      const amount = parseFloat(stakeAmount);
      if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');

      await suiService.stakeRift(amount * 1e9);
      toast.success('Successfully staked RIFT tokens!');
      setStakeAmount('');
      fetchBalances();
    } catch (error) {
      console.error('Error staking RIFT:', error);
      toast.error('Failed to stake RIFT tokens');
    } finally {
      setIsLoading(prev => ({ ...prev, stake: false }));
    }
  };

  const handleUnstakeRift = async () => {
    try {
      setIsLoading(prev => ({ ...prev, unstake: true }));
      const amount = parseFloat(unstakeAmount);
      if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');

      await suiService.unstakeRift(amount * 1e9);
      toast.success('Successfully unstaked RIFT tokens!');
      setUnstakeAmount('');
      fetchBalances();
    } catch (error) {
      console.error('Error unstaking RIFT:', error);
      toast.error('Failed to unstake RIFT tokens');
    } finally {
      setIsLoading(prev => ({ ...prev, unstake: false }));
    }
  };

  const handleClaimRewards = async () => {
    try {
      setIsLoading(prev => ({ ...prev, claim: true }));
      await suiService.claimStakingRewards();
      toast.success('Successfully claimed rewards!');
      fetchBalances();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast.error('Failed to claim rewards');
    } finally {
      setIsLoading(prev => ({ ...prev, claim: false }));
    }
  };

  const handleSupply = async () => {
    try {
      setIsLoading(prev => ({ ...prev, supply: true }));
      const amount = parseFloat(supplyAmount);
      if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');

      await suiService.supply(poolId, amount * 1e9);
      toast.success('Successfully supplied RIFT tokens!');
      setSupplyAmount('');
      fetchLendingData();
    } catch (error) {
      console.error('Error supplying RIFT:', error);
      toast.error('Failed to supply RIFT tokens');
    } finally {
      setIsLoading(prev => ({ ...prev, supply: false }));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20">
      <h1 className='text-5xl text-blue-500 font-bold mt-[1%] text-center'>Trade Rift Tokens</h1>
      <div className="max-w-4xl mt-[5%] mx-auto">
        <Button className='text-white mb-8 pl-[50px] pr-[50px]' onClick={() => navigate('/dashboard')}>
          <ArrowLeft/>Dashboard
        </Button>

        {/* Wallet Info */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-zinc-400">Rift Price</Label>
                <p className="text-2xl font-bold">
                  {isLoading.price ? 'Loading...' : `${riftPrice} SUI`}
                </p>
              </div>
              <div>
                <Label className="text-zinc-400">SUI Balance</Label>
                <p className="text-2xl font-bold">
                  {isLoading.balance ? 'Loading...' : `${walletBalance.sui} SUI`}
                </p>
              </div>
              <div>
                <Label className="text-zinc-400">Rift Balance</Label>
                <p className="text-2xl font-bold">
                  {isLoading.balance ? 'Loading...' : `${walletBalance.rift} RIFT`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trading Interface */}
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900 mb-6">
            <TabsTrigger value="buy" className="data-[state=active]:bg-zinc-800">Buy Rift</TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-zinc-800">Sell Rift</TabsTrigger>
            <TabsTrigger value="stake" className="data-[state=active]:bg-zinc-800">Stake</TabsTrigger>
            <TabsTrigger value="lend" className="data-[state=active]:bg-zinc-800">Lend</TabsTrigger>
          </TabsList>

          <TabsContent value="buy">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleBuyRift(); }} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">Amount to Buy (RIFT)</Label>
                    <Input
                      type="number"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      min="0"
                      step="0.1"
                    />
                    {buyAmount && !isNaN(parseFloat(buyAmount)) && (
                      <p className="text-sm text-zinc-400">
                        Cost: {(parseFloat(buyAmount) * riftPrice).toFixed(2)} SUI
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                    disabled={isLoading.buy || !buyAmount}
                  >
                    {isLoading.buy ? 'Processing...' : 'Buy Rift'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sell">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSellRift(); }} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">Amount to Sell (RIFT)</Label>
                    <Input
                      type="number"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      min="0"
                      step="0.1"
                    />
                    {sellAmount && !isNaN(parseFloat(sellAmount)) && (
                      <p className="text-sm text-zinc-400">
                        You'll receive: {(parseFloat(sellAmount) * riftPrice).toFixed(2)} SUI
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                    disabled={isLoading.sell || !sellAmount}
                  >
                    {isLoading.sell ? 'Processing...' : 'Sell Rift'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stake">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Staking Info Card */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Staking Overview</h3>
                    <Clock className="text-blue-500" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-zinc-400">Total Staked</Label>
                      <p className="text-2xl font-bold">{stakingInfo.totalStaked} RIFT</p>
                    </div>
                    <div>
                      <Label className="text-zinc-400">Rewards Earned</Label>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-green-500">+{stakingInfo.rewardsEarned} RIFT</p>
                        <Button
                          onClick={handleClaimRewards}
                          disabled={isLoading.claim || stakingInfo.rewardsEarned === 0}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isLoading.claim ? 'Claiming...' : 'Claim Rewards'}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-zinc-400">Current APR</Label>
                      <p className="text-2xl font-bold text-blue-500">{stakingInfo.apr}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stake/Unstake Actions Card */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <Tabs defaultValue="stake-action" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-zinc-800 mb-6">
                      <TabsTrigger value="stake-action">Stake</TabsTrigger>
                      <TabsTrigger value="unstake-action">Unstake</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stake-action">
                      <form onSubmit={(e) => { e.preventDefault(); handleStakeRift(); }} className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-white">Amount to Stake</Label>
                          <Input
                            type="number"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="bg-zinc-800 border-zinc-700 text-white"
                            min="0"
                            step="0.1"
                          />
                          {stakeAmount && !isNaN(parseFloat(stakeAmount)) && (
                            <p className="text-sm text-zinc-400">
                              Estimated daily reward: {(parseFloat(stakeAmount) * (stakingInfo.apr/365/100)).toFixed(4)} RIFT
                            </p>
                          )}
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={isLoading.stake || !stakeAmount}
                        >
                          {isLoading.stake ? 'Processing...' : 'Stake RIFT'}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="unstake-action">
                      <form onSubmit={(e) => { e.preventDefault(); handleUnstakeRift(); }} className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-white">Amount to Unstake</Label>
                          <Input
                            type="number"
                            value={unstakeAmount}
                            onChange={(e) => setUnstakeAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="bg-zinc-800 border-zinc-700 text-white"
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-zinc-800 hover:bg-zinc-700"
                          disabled={isLoading.unstake || !unstakeAmount}
                        >
                          {isLoading.unstake ? 'Processing...' : 'Unstake RIFT'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lend">
            {/* Add lending UI here */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Trading;
