import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const LaunchToken = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    supply: '',
    type: 'fire',
    description: '',
    initialPrice: '',
    liquidity: '',
    lockPeriod: ''
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

  const handleLaunchToken = () => {
    // Add token launch logic here
    console.log('Launching token with data:', formData);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20">
          
      <div className="max-w-4xl  mt-[5%] mx-auto">
      <Button className='bg-[#ffffff] text-black mb-8 pl-[50px] pr-[50px] '>Tokens</Button>
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
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter token name" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Token Symbol</Label>
                      <Input 
                        name="symbol"
                        value={formData.symbol}
                        onChange={handleInputChange}
                        placeholder="e.g. PKMN" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Initial Supply</Label>
                      <Input 
                        name="supply"
                        value={formData.supply}
                        onChange={handleInputChange}
                        type="number" 
                        placeholder="1000000" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Pokemon Type</Label>
                      <select 
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded-md p-2"
                      >
                        <option value="fire">Fire</option>
                        <option value="water">Water</option>
                        <option value="grass">Grass</option>
                        <option value="electric">Electric</option>
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
                  // Step 2: Launch Configuration
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">Initial Price (ETH)</Label>
                      <Input 
                        name="initialPrice"
                        value={formData.initialPrice}
                        onChange={handleInputChange}
                        type="number" 
                        placeholder="0.0001" 
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Liquidity (%)</Label>
                      <Input 
                        name="liquidity"
                        value={formData.liquidity}
                        onChange={handleInputChange}
                        type="number" 
                        placeholder="70" 
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

                    <div className="space-y-2">
                      <Label className="text-white">Description</Label>
                      <Textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your Pokemon token..."
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
                        onClick={handleLaunchToken}
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
                    <div className="flex gap-3">
                      <div className="bg-zinc-700 rounded-lg p-3 text-white max-w-[80%]">
                        Hello! I'm your Pokemon Token Assistant. I can help you create and customize your token. What type of Pokemon-inspired token would you like to create?
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input 
                      placeholder="Ask me about creating your Pokemon token..."
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 flex-1"
                    />
                    <Button className="bg-zinc-800 hover:bg-zinc-700 text-white">Send</Button>
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