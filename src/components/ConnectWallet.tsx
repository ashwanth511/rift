import { useWallet } from '@suiet/wallet-kit';
import { Button } from './ui/button';

export const ConnectWallet = () => {
  const wallet = useWallet();

  if (!wallet.connected) {
    return (
      <Button onClick={() => wallet.select()}>
        Connect Wallet
      </Button>
    );
  }

  return (
    <Button onClick={() => wallet.disconnect()}>
      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
    </Button>
  );
}; 