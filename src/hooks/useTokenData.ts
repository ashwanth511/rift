import { useState, useEffect } from 'react';

interface TokenData {
  ticker: string;
  icon: string;
  address: string;
  price: number;
  priceChange: number;
  supply: string;
  balance?: string;
}

export const useTokenData = (tokenId: string | undefined) => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenData = async () => {
      if (!tokenId) {
        setError('Token ID is required');
        setLoading(false);
        return;
      }

      // Mock data
      setTokenData({
        ticker: "PIKA",
        icon: "https://placekitten.com/100/100",
        address: "0x1234567890abcdef1234567890abcdef12345678",
        price: 0.0045,
        priceChange: 12.5,
        supply: "1000000"
      });
      setLoading(false);
    };

    fetchTokenData();
  }, [tokenId]);

  return { tokenData, loading, error }; 
};
