import axios from 'axios';

interface GeneratedAssets {
  nftImage: string;
  agentImage: string;
}

// Get environment variables
const REPLICATE_API_TOKEN = import.meta.env.VITE_REPLICATE_API_TOKEN;

// Validate environment variables
if (!REPLICATE_API_TOKEN) {
  console.warn('VITE_REPLICATE_API_TOKEN is not set in .env file');
}

export const generateImages = async (description: string): Promise<GeneratedAssets> => {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('Replicate API token is not configured. Please check your .env file.');
  }

  try {
    // Generate NFT image using Stable Diffusion
    const nftResponse = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        input: {
          prompt: `Create a professional NFT artwork based on: ${description}. Make it modern, minimalist, and suitable for a game character.`,
          negative_prompt: "text, watermark, low quality, blurry, complex, busy, cluttered",
          num_outputs: 1,
          width: 512,
          height: 512,
          num_inference_steps: 50,
          guidance_scale: 7.5
        }
      },
      {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );

    // Generate agent image using Stable Diffusion
    const agentResponse = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        input: {
          prompt: `Create a unique character avatar for: ${description}. Make it futuristic, professional, and battle-ready.`,
          negative_prompt: "text, watermark, low quality, blurry, multiple characters, busy background",
          num_outputs: 1,
          width: 512,
          height: 512,
          num_inference_steps: 50,
          guidance_scale: 7.5
        }
      },
      {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );

    // Get the results
    const nftImageUrl = await waitForResult(nftResponse.data.id);
    const agentImageUrl = await waitForResult(agentResponse.data.id);

    return {
      nftImage: nftImageUrl,
      agentImage: agentImageUrl
    };
  } catch (error) {
    console.error('Error generating images:', error);
    throw new Error('Failed to generate images. Please try again.');
  }
};

const waitForResult = async (predictionId: string): Promise<string> => {
  const maxAttempts = 30;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await axios.get(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        }
      }
    );

    if (response.data.status === 'succeeded') {
      return response.data.output[0];
    }

    if (response.data.status === 'failed') {
      throw new Error('Image generation failed');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }

  throw new Error('Timeout waiting for image generation');
};
