import axios from 'axios';
import { generateImages } from '@/lib/replicate';
import { createAgent } from '@/lib/agent';

interface NFTData {
  name: string;
  description: string;
  agentType: string;
  agentPersonality: string;
  battleStyle: string;
  specialAbility: string;
  background: string;
}

interface NFTAssets {
  nftImage: string;
  agentImage: string;
}

interface AgentConfig {
  name: string;
  description: string;
  type: string;
  personality: string;
  battleStyle: string;
  specialAbility: string;
  background: string;
  imageUrl: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const createNFT = async (data: NFTData): Promise<{ nftId: string; agentId: string }> => {
  try {
    // 1. Generate images using Replicate
    const assets = await generateImages(data.description);

    // 2. Store NFT metadata in MongoDB
    const nftResponse = await axios.post(`${API_BASE_URL}/nfts`, {
      name: data.name,
      description: data.description,
      imageUrl: assets.nftImage,
      attributes: {
        agentType: data.agentType,
        agentPersonality: data.agentPersonality,
        battleStyle: data.battleStyle,
        specialAbility: data.specialAbility
      },
      createdAt: new Date().toISOString()
    });

    // 3. Create agent using chat completions
    const agentConfig: AgentConfig = {
      name: data.name,
      description: data.description,
      type: data.agentType,
      personality: data.agentPersonality,
      battleStyle: data.battleStyle,
      specialAbility: data.specialAbility,
      background: data.background,
      imageUrl: assets.agentImage
    };

    const agent = await createAgent(agentConfig);

    // 4. Update NFT with agent ID
    await axios.patch(`${API_BASE_URL}/nfts/${nftResponse.data._id}`, {
      agentId: agent.id
    });

    return {
      nftId: nftResponse.data._id,
      agentId: agent.id
    };
  } catch (error) {
    console.error('Error creating NFT:', error);
    throw new Error('Failed to create NFT and agent');
  }
};

export const getNFTs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/nfts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    throw new Error('Failed to fetch NFTs');
  }
};

export const getNFTById = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/nfts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NFT:', error);
    throw new Error('Failed to fetch NFT');
  }
};
