import mongoose from 'mongoose';

// Test token data
const testData = {
  tokenName: "Test Token",
  tokenSymbol: "TEST",
  totalSupply: "1000000",
  decimals: "18",
  description: "This is a test token for testing purposes",
  website: "https://test.com",
  telegram: "https://t.me/test",
  twitter: "https://twitter.com/test",
  lockPeriod: "365",
  tokenImage: "https://test.com/token.png",
  agentImage: "https://test.com/agent.png"
};

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rift')
  .then(async () => {
    console.log('Connected to MongoDB successfully!');
    
    // Create token schema
    const tokenSchema = new mongoose.Schema({
      tokenName: String,
      tokenSymbol: String,
      totalSupply: String,
      decimals: String,
      description: String,
      website: String,
      telegram: String,
      twitter: String,
      lockPeriod: String,
      tokenImage: String,
      agentImage: String,
      createdAt: { type: Date, default: Date.now }
    });

    // Create model
    const Token = mongoose.model('Token', tokenSchema);

    try {
      // Try to save test data
      const token = new Token(testData);
      await token.save();
      console.log('Test token saved successfully!');

      // Retrieve the saved token
      const savedToken = await Token.findOne({ tokenName: "Test Token" });
      console.log('Retrieved token:', savedToken);

    } catch (error) {
      console.error('Error during test:', error);
    }

    // Close the connection
    await mongoose.connection.close();
    console.log('Test completed and connection closed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
