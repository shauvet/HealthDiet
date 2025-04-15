const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();
const UserRepository = require('./repositories/user.repository');
const FamilyMemberRepository = require('./repositories/family-member.repository');
const mongoose = require('mongoose');

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    console.log('获取用户资料，用户ID:', userId);

    const userProfile = await UserRepository.getUserProfile(userId);
    console.log('用户资料获取成功:', userProfile);

    res.json(userProfile);
  } catch (error) {
    console.error('获取用户资料出错:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '获取用户资料失败: ' + error.message });
  }
});

// Update user profile
router.patch('/profile', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    const userData = req.body;
    console.log('更新用户资料，用户ID:', userId);
    console.log('用户资料数据:', userData);

    const updatedProfile = await UserRepository.updateUserProfile(
      userId,
      userData,
    );
    console.log('用户资料更新成功:', updatedProfile);

    res.json(updatedProfile);
  } catch (error) {
    console.error('更新用户资料出错:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '更新用户资料失败: ' + error.message });
  }
});

// Get family members
router.get('/family', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    console.log('获取家庭成员列表，用户ID:', userId);

    const familyMembers = await FamilyMemberRepository.getFamilyMembers(userId);
    console.log('找到家庭成员数量:', familyMembers.length);

    res.json(familyMembers);
  } catch (error) {
    console.error('获取家庭成员出错:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '获取家庭成员失败: ' + error.message });
  }
});

// Add family member
router.post('/family', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    const memberData = req.body;
    console.log('添加家庭成员，用户ID:', userId);
    console.log('家庭成员数据:', memberData);

    // 验证必填字段
    if (!memberData.name || !memberData.relationship) {
      return res.status(400).json({ error: '姓名和关系为必填项' });
    }

    const newMember = await FamilyMemberRepository.addFamilyMember(
      userId,
      memberData,
    );
    console.log('家庭成员添加成功，ID:', newMember._id);

    res.status(201).json(newMember);
  } catch (error) {
    console.error('添加家庭成员出错:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '添加家庭成员失败: ' + error.message });
  }
});

// Update family member
router.patch('/family/:id', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    const { id } = req.params;
    const updateData = req.body;
    console.log(`Updating family member ${id}:`, updateData);

    const updatedMember = await FamilyMemberRepository.updateFamilyMember(
      userId,
      id,
      updateData,
    );

    if (!updatedMember) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    res.json(updatedMember);
  } catch (error) {
    console.error('Error updating family member:', error);
    res
      .status(500)
      .json({ error: 'Failed to update family member: ' + error.message });
  }
});

// Delete family member
router.delete('/family/:id', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    const { id } = req.params;
    console.log(`Deleting family member ${id}`);

    const result = await FamilyMemberRepository.deleteFamilyMember(userId, id);

    if (!result) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    res.json({ success: true, message: `Family member ${id} deleted` });
  } catch (error) {
    console.error('Error deleting family member:', error);
    res
      .status(500)
      .json({ error: 'Failed to delete family member: ' + error.message });
  }
});

// Delete test user
router.delete('/profile/test', async (req, res) => {
  try {
    const userId = req.userId || '000000000000000000000001';
    console.log('删除测试用户，用户ID:', userId);

    // 删除用户
    const result = await mongoose.connection
      .collection('users')
      .deleteOne({ _id: new mongoose.Types.ObjectId(userId) });
    console.log('删除结果:', result);

    res.json({ success: true, message: '测试用户已删除' });
  } catch (error) {
    console.error('删除测试用户出错:', error);
    res.status(500).json({ error: '删除测试用户失败: ' + error.message });
  }
});

module.exports = router;
