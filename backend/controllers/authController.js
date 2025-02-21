// controllers/authController.js
const User = require('../models/user');
const { ManagementClient } = require('auth0');
require('dotenv').config();

// Initialize Auth0 Management API client
const auth0 = new ManagementClient({
  domain: process.env.AUTH0_ISSUER.replace('https://', '').replace('/', ''),
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope:'create:users read:users update:users'
});

const authController = {
  handleSignup: async (req, res) => {
    try {
      const { email, password} = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'Email, password and name are required'
        });
      }

      // Create user in Auth0
      const auth0User = await auth0.users.create({
        name: email.split('@')[0],
        email: email,
        connection: 'Username-Password-Authentication',
        password: password,
        verify_email: true,
        user_metadata: {
          auth0Id: 'auth0|' + email,
          registration_date: new Date()
        }
      });
      console.log(auth0User);
      // Create user in our database
      const user = new User({
        auth0Id: 'auth0|' + email,
        email: email,
        name: email.split('@')[0],
        emailVerified: false,
        lastLogin: new Date(),
        metadata: {
          preferences: {
            language: 'en',
            notifications: true
          },
          deviceInfo: {
            lastDevice: req.headers['user-agent'],
            lastIP: req.ip
          }
        }
      });
      console.log(user);

      await user.save();

      res.status(201).json({
        message: 'User created successfully. Please verify your email.',
        user: {
          id: user._id,
          email: user.email,
          emailVerified: user.emailVerified
        }
      });

    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.name === 'Auth0Error') {
        return res.status(400).json({
          error: 'Signup failed',
          details: error.message
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  },
  // Verify and handle Auth0 login
  handleAuth0Login: async (req, res) => {
    try {
      // Get the user info from Auth0 token
      const auth0Id = req.auth.payload.sub;
      const userId = auth0Id.split('|')[1];
      // Verify the token with Auth0 Management API
      const auth0UserInfo = await auth0.users.get({ id: auth0Id });
      
      if (!auth0UserInfo) {
        return res.status(401).json({ error: 'Invalid Auth0 user' });
      }

      // Check if user exists in our database
      let user = await User.findOne({ auth0Id });
      
      if (!user) {
        // Verify email domain if needed
        if (process.env.ALLOWED_EMAIL_DOMAINS) {
          const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS.split(',');
          const emailDomain = auth0UserInfo.email.split('@')[1];
          
          if (!allowedDomains.includes(emailDomain)) {
            return res.status(403).json({ error: 'Email domain not allowed' });
          }
        }

        // Create new user
        user = new User({
          auth0Id: auth0UserInfo.user_id,
          email: auth0UserInfo.email,
          name: auth0UserInfo.name,
          picture: auth0UserInfo.picture,
          emailVerified: auth0UserInfo.email_verified,
          lastLogin: new Date(),
          metadata: {
            preferences: {
              language: auth0UserInfo.locale || 'en',
              notifications: true
            },
            deviceInfo: {
              lastDevice: req.headers['user-agent'],
              lastIP: req.ip
            }
          }
        });
      } else {
        // Update existing user with latest Auth0 info
        user.name = auth0UserInfo.name;
        user.picture = auth0UserInfo.picture;
        user.emailVerified = auth0UserInfo.email_verified;
        user.lastLogin = new Date();
        user.metadata.deviceInfo = {
          lastDevice: req.headers['user-agent'],
          lastIP: req.ip
        };
      }

      // Check required fields
      const requiredFields = ['email', 'auth0Id'];
      for (const field of requiredFields) {
        if (!user[field]) {
          return res.status(400).json({ 
            error: `Missing required field: ${field}`,
            details: 'Incomplete user profile from Auth0'
          });
        }
      }

      await user.save();
      
      // Create session token if needed
      const sessionToken = await auth0.createRefreshToken({
        user_id: auth0Id,
        scope: 'openid profile email'
      });

      res.json({
        message: 'Authentication successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          emailVerified: user.emailVerified
        },
        sessionToken
      });
    } catch (error) {
      console.error('Auth handler error:', error);
      
      // Handle specific Auth0 errors
      if (error.name === 'Auth0Error') {
        return res.status(401).json({ 
          error: 'Auth0 authentication failed',
          details: error.message
        });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get user profile with Auth0 verification
  getProfile: async (req, res) => {
    try {
      const auth0Id = req.auth.payload.sub;
      
      // Verify user exists in Auth0
      const auth0UserInfo = await auth0.getUser({ id: auth0Id });
      
      if (!auth0UserInfo) {
        return res.status(401).json({ error: 'Invalid Auth0 user' });
      }

      const user = await User.findOne({ auth0Id });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found in database' });
      }

      // Verify email is still verified in Auth0
      if (!auth0UserInfo.email_verified) {
        return res.status(403).json({ 
          error: 'Email not verified',
          details: 'Please verify your email address'
        });
      }

      res.json({
        profile: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          emailVerified: user.emailVerified,
          preferences: user.metadata.preferences,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      
      if (error.name === 'Auth0Error') {
        return res.status(401).json({ 
          error: 'Auth0 verification failed',
          details: error.message
        });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update profile with Auth0 verification
  updateProfile: async (req, res) => {
    try {
      const auth0Id = req.auth.payload.sub;
      
      // Verify user in Auth0
      const auth0UserInfo = await auth0.getUser({ id: auth0Id });
      
      if (!auth0UserInfo) {
        return res.status(401).json({ error: 'Invalid Auth0 user' });
      }

      const user = await User.findOne({ auth0Id });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found in database' });
      }

      // Validate update data
      const allowedUpdates = ['name', 'metadata.preferences'];
      const updates = req.body;

      const invalidFields = Object.keys(updates)
        .filter(key => !allowedUpdates.includes(key));

      if (invalidFields.length > 0) {
        return res.status(400).json({ 
          error: 'Invalid update fields',
          invalidFields
        });
      }

      // Update user in database
      Object.keys(updates).forEach(key => {
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          user[parent][child] = updates[key];
        } else {
          user[key] = updates[key];
        }
      });

      // Update name in Auth0 if it was changed
      if (updates.name && updates.name !== auth0UserInfo.name) {
        await auth0.updateUser({ id: auth0Id }, { name: updates.name });
      }

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        profile: {
          id: user._id,
          email: user.email,
          name: user.name,
          preferences: user.metadata.preferences,
          lastUpdated: user.updatedAt
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.name === 'Auth0Error') {
        return res.status(401).json({ 
          error: 'Auth0 verification failed',
          details: error.message
        });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = authController;