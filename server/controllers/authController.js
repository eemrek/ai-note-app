const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    // Create new user instance
    user = new User({
      name,
      email,
      password // Password will be hashed by pre-save hook in User model
    });

    // Save user to database
    await user.save();

    // Create and return JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || 360000 // Default to 100 hours if not set
      },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      }
    );

  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).send('Sunucu Hatası (Kayıt)');
  }
};

// @route   POST api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Geçersiz e-posta veya şifre.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Geçersiz e-posta veya şifre.' });
    }

    // Create and return JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || 360000
      },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      }
    );

  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).send('Sunucu Hatası (Giriş)');
  }
};

// @route   GET api/auth/user
// @desc    Get logged in user data
// @access  Private (requires token)
exports.getLoggedInUser = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ msg: 'Kullanıcı bulunamadı.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get User Error:', err.message);
    res.status(500).send('Sunucu Hatası (Kullanıcı Bilgisi)');
  }
};
