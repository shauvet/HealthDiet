const express = require('express');
const router = express.Router();

// Get user profile
router.get('/profile', (req, res) => {
  const userId = req.userId || '000000000000000000000001';
  res.json({
    id: userId,
    email: 'user@example.com',
    name: 'Sample User',
    preferences: {
      dietaryRestrictions: [],
      allergies: [],
      cuisinePreferences: [1, 2], // 川菜, 粤菜
    },
  });
});

// Update user profile
router.patch('/profile', (req, res) => {
  const userData = req.body;
  console.log('Updating user profile:', userData);

  res.json({
    id: req.userId || '000000000000000000000001',
    email: userData.email || 'user@example.com',
    name: userData.name || 'Sample User',
    preferences: {
      dietaryRestrictions: userData.preferences?.dietaryRestrictions || [],
      allergies: userData.preferences?.allergies || [],
      cuisinePreferences: userData.preferences?.cuisinePreferences || [1, 2],
    },
    ...userData,
  });
});

// Get family members
router.get('/family', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Family Member 1',
      relationship: 'Spouse',
      dietary: { restrictions: [], allergies: [] },
    },
    {
      id: 2,
      name: 'Family Member 2',
      relationship: 'Child',
      dietary: { restrictions: ['vegetarian'], allergies: [] },
    },
  ]);
});

// Add family member
router.post('/family', (req, res) => {
  const memberData = req.body;
  console.log('Adding family member:', memberData);

  res.status(201).json({
    id: Date.now(),
    name: memberData.name || 'New Family Member',
    relationship: memberData.relationship || 'Other',
    dietary: {
      restrictions: memberData.dietary?.restrictions || [],
      allergies: memberData.dietary?.allergies || [],
    },
    ...memberData,
  });
});

// Update family member
router.patch('/family/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log(`Updating family member ${id}:`, updateData);

  res.json({
    id: parseInt(id),
    name: updateData.name || 'Updated Family Member',
    relationship: updateData.relationship || 'Other',
    dietary: {
      restrictions: updateData.dietary?.restrictions || [],
      allergies: updateData.dietary?.allergies || [],
    },
    ...updateData,
  });
});

// Delete family member
router.delete('/family/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Deleting family member ${id}`);

  res.json({ success: true, message: `Family member ${id} deleted` });
});

module.exports = router;
