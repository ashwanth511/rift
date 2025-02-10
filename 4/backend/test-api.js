import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Test data
const validToken = {
  tokenName: "Test Token",
  tokenSymbol: "TEST",
  totalSupply: "1000000",
  decimals: "18",
  description: "A test token for development",
  website: "https://test.com",
  telegram: "https://t.me/test",
  twitter: "https://twitter.com/test",
  lockPeriod: "365",
  tokenImage: "https://example.com/token.png",
  agentImage: "https://example.com/agent.png"
};

const invalidToken = {
  tokenName: "T", // Too short
  tokenSymbol: "TOOLONGTOKEN", // Too long
  totalSupply: "invalid", // Not a number
  decimals: "20", // Greater than 18
  description: "",
  website: "invalid-url",
  lockPeriod: "abc", // Not a number
  tokenImage: "",
  agentImage: ""
};

// Test storing a valid token
const testStoreValidToken = async () => {
  try {
    console.log('\nTesting valid token storage...');
    const response = await axios.post(`${API_BASE_URL}/tokens`, validToken);
    console.log('Token stored successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error storing token:', error.response?.data || error.message);
  }
};

// Test storing an invalid token
const testStoreInvalidToken = async () => {
  try {
    console.log('\nTesting invalid token storage...');
    await axios.post(`${API_BASE_URL}/tokens`, invalidToken);
    console.log('Warning: Invalid token was accepted');
  } catch (error) {
    if (error.response?.data?.error === 'Validation Error') {
      console.log('Validation errors (as expected):', error.response.data.details);
    } else {
      console.error('Unexpected error:', error.response?.data || error.message);
    }
  }
};

// Test getting all tokens with sorting
const testGetTokens = async () => {
  try {
    console.log('\nTesting get tokens with sorting...');
    // Test different sorting options
    const responses = await Promise.all([
      axios.get(`${API_BASE_URL}/tokens`), // default sorting
      axios.get(`${API_BASE_URL}/tokens?sort=tokenName&order=asc`), // sort by name
      axios.get(`${API_BASE_URL}/tokens?sort=createdAt&order=desc`) // sort by date
    ]);
    
    console.log('Default sort count:', responses[0].data.length);
    console.log('Name sort count:', responses[1].data.length);
    console.log('Date sort count:', responses[2].data.length);
  } catch (error) {
    console.error('Error getting tokens:', error.response?.data || error.message);
  }
};

// Test getting a single token
const testGetSingleToken = async (id) => {
  try {
    console.log('\nTesting get single token...');
    const response = await axios.get(`${API_BASE_URL}/tokens/${id}`);
    console.log('Token retrieved successfully:', response.data.tokenName);
    return response.data;
  } catch (error) {
    console.error('Error getting token:', error.response?.data || error.message);
  }
};

// Test searching tokens
const testSearchTokens = async () => {
  try {
    console.log('\nTesting token search...');
    const searchTerm = 'test';
    const response = await axios.get(`${API_BASE_URL}/tokens/search/${searchTerm}`);
    console.log('Search results count:', response.data.length);
    console.log('Found tokens:', response.data.map(t => t.tokenName));
  } catch (error) {
    console.error('Error searching tokens:', error.response?.data || error.message);
  }
};

// Test searching with query parameters
const testQuerySearch = async () => {
  try {
    console.log('\nTesting query parameter search...');
    const response = await axios.get(`${API_BASE_URL}/tokens?search=test`);
    console.log('Query search results count:', response.data.length);
    console.log('Found tokens:', response.data.map(t => t.tokenName));
  } catch (error) {
    console.error('Error searching tokens:', error.response?.data || error.message);
  }
};

// Run all tests
const runTests = async () => {
  console.log('Starting API tests...');
  
  // Test storing tokens
  const storedToken = await testStoreValidToken();
  await testStoreInvalidToken();
  
  if (storedToken) {
    // Test getting single token
    await testGetSingleToken(storedToken._id);
  }
  
  // Test getting all tokens with different sorting
  await testGetTokens();
  
  // Test both search methods
  await testSearchTokens();
  await testQuerySearch();
  
  console.log('\nTests completed!');
};

runTests();
