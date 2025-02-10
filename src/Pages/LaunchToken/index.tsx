import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { generateImages } from '@/lib/replicate';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const LaunchToken = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Rift Assistant. I can help you with:\n\n1. Creating and minting NFTs\n2. Checking Sui wallet balance\n3. Buying/selling Rift tokens\n4. Making Sui transactions\n\nWhat would you like to do?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    agentType: '',
    agentPersonality: '',
    battleStyle: '',
    specialAbility: '',
    background: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNextStep = () => {
    setCurrentStep(2);
  };

  const handleCreateNFT = async () => {
    try {
      setIsCreating(true);
      
      // 1. Generate image using Replicate
      const { nftImage } = await generateImages(formData.description);

      // 2. Store NFT data in database
      const nftData = {
        name: formData.name,
        description: formData.description,
        imageUrl: nftImage,
        agentType: formData.agentType,
        agentPersonality: formData.agentPersonality,
        battleStyle: formData.battleStyle,
        specialAbility: formData.specialAbility,
        background: formData.background
      };
      const dbResponse = await axios.post('/api/nfts', nftData);

      // 3. Mint NFT using Sui contract
      const mintTx = await window.suiWallet.executeMoveCall({
        packageObjectId: import.meta.env.VITE_RIFT_PACKAGE_ID,
        module: 'rift_nft',
        function: 'mint',
        typeArguments: [],
        arguments: [
          formData.name,
          formData.description,
          nftImage // URL for the NFT image
        ],
        gasBudget: 10000,
      });

      toast.success('NFT created successfully!');
      navigate(`/token/${dbResponse.data.id}`);
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error('Failed to create NFT. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const systemPrompt = `I'm your Rift Assistant. I can help with:
1. NFT Creation: Generate images, mint NFTs
2. Sui Wallet: Check balance, make transactions
3. Rift Trading: Buy/sell tokens, check prices

Current NFT:
Name: ${formData.name}
Description: ${formData.description}
Type: ${formData.agentType}
Personality: ${formData.agentPersonality}
Battle Style: ${formData.battleStyle}
Special Ability: ${formData.specialAbility}`;

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      // Add user message to chat
      const userMessage = {
        role: 'user' as const,
        content: inputMessage
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsProcessing(true);

      // Get AI response using chat completions API
      const response = await axios.post('https://api.atoma.network/v1/chat/completions', {
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          userMessage
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_ATOMASDK_BEARER_AUTH}`,
          'Content-Type': 'application/json'
        }
      });

      // Handle response
      if (response.data.choices && response.data.choices.length > 0) {
        const assistantMessage = {
          role: 'assistant' as const,
          content: response.data.choices[0].message.content
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Parse assistant's response for actions
        const content = response.data.choices[0].message.content.toLowerCase();
        
        // Check if response contains NFT parameters
        if (content.includes('nft') || content.includes('agent')) {
          updateFormDataFromResponse(response.data.choices[0].message.content);
        }
        
        // Check if response contains wallet actions
        if (content.includes('wallet') || content.includes('balance')) {
          // TODO: Implement wallet integration
          // const balance = await checkWalletBalance();
          // setMessages(prev => [...prev, { role: 'assistant', content: `Your wallet balance is: ${balance} SUI` }]);
        }
        
        // Check if response contains trading actions
        if (content.includes('buy') || content.includes('sell')) {
          // TODO: Implement trading integration
          // const price = await getRiftPrice();
          // setMessages(prev => [...prev, { role: 'assistant', content: `Current Rift price: ${price} SUI` }]);
        }
      }

    } catch (error) {
      console.error('Error details:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateFormDataFromResponse = (content: string) => {
    // Extract NFT parameters using regex
    const nameMatch = content.match(/name:\s*([^\n]+)/i);
    const descriptionMatch = content.match(/description:\s*([^\n]+)/i);
    const agentTypeMatch = content.match(/agent type:\s*([^\n]+)/i);
    const agentPersonalityMatch = content.match(/agent personality:\s*([^\n]+)/i);
    const battleStyleMatch = content.match(/battle style:\s*([^\n]+)/i);
    const specialAbilityMatch = content.match(/special ability:\s*([^\n]+)/i);
    const backgroundMatch = content.match(/background:\s*([^\n]+)/i);

    // Update form data if matches found
    setFormData(prev => ({
      ...prev,
      name: nameMatch?.[1] || prev.name,
      description: descriptionMatch?.[1] || prev.description,
      agentType: agentTypeMatch?.[1] || prev.agentType,
      agentPersonality: agentPersonalityMatch?.[1] || prev.agentPersonality,
      battleStyle: battleStyleMatch?.[1] || prev.battleStyle,
      specialAbility: specialAbilityMatch?.[1] || prev.specialAbility,
      background: backgroundMatch?.[1] || prev.background,
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20">
      <h1 className='text-5xl text-blue-500 font-bold mt-[1%] text-center'>Launch Token</h1>
      <div className="max-w-4xl mt-[5%] mx-auto">
        <Button className='text-white mb-8 pl-[50px] pr-[50px]' onClick={() => navigate('/dashboard')}>
          <ArrowLeft/>Tokens
        </Button>
          
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
                  // Step 1: NFT Basic Information
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">NFT Name</Label>
                      <Input 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter NFT name" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Description</Label>
                      <Textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your NFT and its associated agent..."
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Agent Type</Label>
                      <select 
                        name="agentType"
                        value={formData.agentType}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded-md p-2"
                      >
                        <option value="">Select Type</option>
                        <option value="warrior">Warrior</option>
                        <option value="mage">Mage</option>
                        <option value="rogue">Rogue</option>
                        <option value="healer">Healer</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Agent Personality</Label>
                      <select 
                        name="agentPersonality"
                        value={formData.agentPersonality}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded-md p-2"
                      >
                        <option value="">Select Personality</option>
                        <option value="aggressive">Aggressive</option>
                        <option value="strategic">Strategic</option>
                        <option value="defensive">Defensive</option>
                        <option value="balanced">Balanced</option>
                      </select>
                    </div>

                    <Button 
                      onClick={handleNextStep}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                    >
                      Next Step
                    </Button>
                  </form>
                ) : (
                  // Step 2: Agent Configuration
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">Battle Style</Label>
                      <select 
                        name="battleStyle"
                        value={formData.battleStyle}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded-md p-2"
                      >
                        <option value="">Select Style</option>
                        <option value="melee">Melee Combat</option>
                        <option value="ranged">Ranged Combat</option>
                        <option value="magic">Magic Combat</option>
                        <option value="hybrid">Hybrid Combat</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Special Ability</Label>
                      <Input 
                        name="specialAbility"
                        value={formData.specialAbility}
                        onChange={handleInputChange}
                        placeholder="e.g., Time Manipulation, Energy Blast" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Background Story</Label>
                      <Textarea 
                        name="background"
                        value={formData.background}
                        onChange={handleInputChange}
                        placeholder="Write a brief background story for your agent..."
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px]"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button 
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                        className="w-1/2 border-zinc-700 hover:bg-zinc-800 text-white"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleCreateNFT}
                        className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-white"
                        disabled={isCreating}
                      >
                        {isCreating ? 'Creating...' : 'Create NFT & Agent'}
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
                      <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg p-3 text-white max-w-[80%] ${
                          message.role === 'user' ? 'bg-blue-600' : 'bg-zinc-700'
                        }`}>
                          {message.content}
                        </div>
                      </div>
                    ))}
                    {isProcessing && (
                    <div className="flex gap-3">
                        <div className="bg-zinc-700 rounded-lg p-3 text-white">
                          <span className="animate-pulse">Thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input 
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ask me about NFTs, wallet balance, or trading..."
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 flex-1"
                      disabled={isProcessing}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white"
                      disabled={isProcessing}
                    >
                      Send
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