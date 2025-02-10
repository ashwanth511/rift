import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://siddesh:sid123@cluster0.ql1hido.mongodb.net/rift';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Token Schema with validation
const tokenSchema = new mongoose.Schema({
  tokenName: {
    type: String,
    required: [true, 'Token name is required'],
    trim: true,
    minlength: [2, 'Token name must be at least 2 characters'],
    maxlength: [50, 'Token name cannot exceed 50 characters']
  },
  tokenSymbol: {
    type: String,
    required: [true, 'Token symbol is required'],
    trim: true,
    uppercase: true,
    minlength: [2, 'Token symbol must be at least 2 characters'],
    maxlength: [10, 'Token symbol cannot exceed 10 characters']
  },
  totalSupply: {
    type: String,
    required: [true, 'Total supply is required'],
    validate: {
      validator: function(v) {
        return /^\d+$/.test(v);
      },
      message: 'Total supply must be a valid number'
    }
  },
  decimals: {
    type: String,
    required: [true, 'Decimals is required'],
    validate: {
      validator: function(v) {
        return /^\d+$/.test(v) && parseInt(v) <= 18;
      },
      message: 'Decimals must be a number between 0 and 18'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  website: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  telegram: String,
  twitter: String,
  lockPeriod: {
    type: String,
    required: [true, 'Lock period is required'],
    validate: {
      validator: function(v) {
        return /^\d+$/.test(v);
      },
      message: 'Lock period must be a valid number'
    }
  },
  tokenImage: {
    type: String,
    required: [true, 'Token image URL is required']
  },
  agentImage: {
    type: String,
    required: [true, 'Agent image URL is required']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Token = mongoose.model('Token', tokenSchema);

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({ error: 'Validation Error', details: errors });
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(404).json({ error: 'Token not found' });
  }

  res.status(500).json({ error: 'Internal Server Error' });
};

// Token routes
const tokenRouter = express.Router();

// Create token
tokenRouter.post('/', async (req, res, next) => {
  try {
    console.log('Received token creation request:', req.body);
    const token = new Token(req.body);
    console.log('Created token model:', token);
    await token.save();
    console.log('Token saved successfully');
    res.status(201).json(token);
  } catch (error) {
    console.error('Error creating token:', error);
    next(error);
  }
});

// Get all tokens with optional search and sorting
tokenRouter.get('/', async (req, res, next) => {
  try {
    const { search, sort = 'createdAt', order = 'desc' } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { tokenName: { $regex: search, $options: 'i' } },
          { tokenSymbol: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const tokens = await Token.find(query)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .exec();

    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

// Search tokens
tokenRouter.get('/search/:query', async (req, res, next) => {
  try {
    const searchQuery = req.params.query;
    const tokens = await Token.find({
      $or: [
        { tokenName: { $regex: searchQuery, $options: 'i' } },
        { tokenSymbol: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

// Get token by ID
tokenRouter.get('/:id', async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id);
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }
    res.json(token);
  } catch (error) {
    next(error);
  }
});

// Mount token routes
app.use('/api/tokens', tokenRouter);

// Apply error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
