const mongoose = require('mongoose');
const { UserSchema } = require('../schemas/user.schema');

// Initialize the User model
const UserModel = mongoose.model('User', UserSchema);

class UserRepository {
  /**
   * Get user profile by user ID
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object>} User profile data
   */
  static async getUserProfile(userId) {
    try {
      // Try to find the user
      let user = await UserModel.findById(userId).select('-password').lean();

      // If no user exists with this ID, ensure a default user is created
      if (!user) {
        console.log(
          `User with ID ${userId} not found. Creating default user...`,
        );
        await this.ensureDefaultUserExists(userId);
        user = await UserModel.findById(userId).select('-password').lean();

        if (!user) {
          throw new Error('Failed to create default user');
        }
      }

      return user;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - The ID of the user
   * @param {Object} userData - The user data to update
   * @returns {Promise<Object>} Updated user profile
   */
  static async updateUserProfile(userId, userData) {
    try {
      // Exclude sensitive fields that shouldn't be updated via this endpoint
      const { password, ...updateData } = userData; // eslint-disable-line no-unused-vars

      // Ensure user exists
      await this.ensureDefaultUserExists(userId);

      // Find and update user by ID
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }, // Return the updated document
      )
        .select('-password')
        .lean();

      if (!updatedUser) {
        throw new Error('User not found after ensuring existence');
      }

      return updatedUser;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      throw error;
    }
  }

  /**
   * Ensure a default user exists with the given ID
   * @param {string} userId - The ID to create the user with
   * @returns {Promise<Object>} Created or existing user
   */
  static async ensureDefaultUserExists(userId) {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findById(userId);

      if (existingUser) {
        return existingUser;
      }

      // Examine the schema to understand required fields
      console.log('User schema paths:', Object.keys(UserSchema.paths));

      // Create a default user with the specified ID
      const defaultUser = new UserModel({
        _id: new mongoose.Types.ObjectId(userId),
        name: 'Test User',
        email: 'user@example.com',
        password: 'hashed_password_would_go_here',
        phone: '13800138000',
        gender: 'male',
        height: 175,
        weight: 70,
        birthdate: new Date('1990-01-01'),
        allergies: ['海鲜', '花生'],
        dietaryRestrictions: ['低糖'],
        healthGoals: ['减肥', '增肌', '保持健康'],
      });

      console.log('Creating default user:', defaultUser);
      await defaultUser.save();
      return defaultUser;
    } catch (error) {
      console.error('Error ensuring default user exists:', error);
      console.error('Error details:', error.message);

      // If there's a validation error, log more details
      if (error.name === 'ValidationError') {
        for (const field in error.errors) {
          console.error(`Field "${field}" error:`, error.errors[field].message);
        }
      }

      throw error;
    }
  }
}

module.exports = UserRepository;
