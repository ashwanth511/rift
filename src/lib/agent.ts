import axios from 'axios';

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

// Get environment variables
const API_URL = 'https://api.atoma.network/v1';
const BEARER_AUTH = import.meta.env.VITE_ATOMASDK_BEARER_AUTH;

export const createAgent = async (config: AgentConfig) => {
  try {
    // Create agent personality prompt
    const systemPrompt = `
      You are ${config.name}, a ${config.type} agent with a ${config.personality} personality.
      Your battle style is ${config.battleStyle} and you possess the special ability: ${config.specialAbility}.
      Background: ${config.background}
      
      Core traits:
      - Type: ${config.type}
      - Personality: ${config.personality}
      - Battle Style: ${config.battleStyle}
      
      When battling:
      - Use your ${config.battleStyle} combat style
      - Leverage your ${config.specialAbility} ability strategically
      - Maintain your ${config.personality} personality traits
      
      Interaction style:
      - Respond in character as ${config.name}
      - Reference your background and experiences
      - Stay true to your personality type
      - Use battle-appropriate language and terminology
    `;

    // Create agent using chat completions API
    const response = await axios.post(`${API_URL}/chat/completions`, {
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Introduce yourself and your combat capabilities.' }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${BEARER_AUTH}`,
        'Content-Type': 'application/json'
      }
    });

    // Store agent data in MongoDB
    const agentData = {
      name: config.name,
      description: config.description,
      systemPrompt,
      imageUrl: config.imageUrl,
      metadata: {
        type: config.type,
        personality: config.personality,
        battleStyle: config.battleStyle,
        specialAbility: config.specialAbility
      },
      introduction: response.data.choices[0].message.content
    };

    const dbResponse = await axios.post(`${import.meta.env.VITE_API_URL}/agents`, agentData);

    return {
      id: dbResponse.data._id,
      ...agentData
    };
  } catch (error) {
    console.error('Error creating agent:', error);
    throw new Error('Failed to create agent');
  }
};

export const getAgent = async (agentId: string) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/agents/${agentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching agent:', error);
    throw new Error('Failed to fetch agent');
  }
};

export const startBattle = async (agent1Id: string, agent2Id: string) => {
  try {
    // Get both agents
    const [agent1, agent2] = await Promise.all([
      getAgent(agent1Id),
      getAgent(agent2Id)
    ]);

    // Create battle context
    const battleContext = `A battle is starting between ${agent1.name} and ${agent2.name}.`;

    // Create battle in database
    const battle = await axios.post(`${import.meta.env.VITE_API_URL}/battles`, {
      agent1Id,
      agent2Id,
      status: 'active',
      messages: [],
      createdAt: new Date().toISOString()
    });

    return battle.data;
  } catch (error) {
    console.error('Error starting battle:', error);
    throw new Error('Failed to start battle');
  }
};

export const sendBattleMessage = async (battleId: string, agentId: string, message: string) => {
  try {
    // Get battle and agent data
    const [battle, agent] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/battles/${battleId}`),
      getAgent(agentId)
    ]);

    // Get battle history
    const messages = battle.data.messages;

    // Create conversation context
    const conversationMessages = [
      { role: 'system', content: agent.systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.agentId === agentId ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Get response from chat completions API
    const response = await axios.post(`${API_URL}/chat/completions`, {
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: conversationMessages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${BEARER_AUTH}`,
        'Content-Type': 'application/json'
      }
    });

    const agentResponse = response.data.choices[0].message.content;

    // Store message in battle history
    await axios.post(`${import.meta.env.VITE_API_URL}/battles/${battleId}/messages`, {
      agentId,
      content: agentResponse,
      timestamp: new Date().toISOString()
    });

    return agentResponse;
  } catch (error) {
    console.error('Error sending battle message:', error);
    throw new Error('Failed to send battle message');
  }
};
