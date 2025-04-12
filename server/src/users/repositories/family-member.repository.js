const mongoose = require('mongoose');
const { FamilyMemberSchema } = require('../schemas/user.schema');

// Create model
const FamilyMemberModel = mongoose.model('FamilyMember', FamilyMemberSchema);

class FamilyMemberRepository {
  // Get all family members for a user
  async getFamilyMembers(userId) {
    console.log('查询用户的家庭成员，userId:', userId);

    try {
      // 先检查数据库中是否有家庭成员数据
      const totalCount = await FamilyMemberModel.countDocuments();
      console.log('数据库中家庭成员总数:', totalCount);

      if (totalCount === 0) {
        console.log('数据库中没有任何家庭成员数据');
        return [];
      }

      // 检查数据库中的userId格式
      const sampleMember = await FamilyMemberModel.findOne();
      if (sampleMember) {
        console.log('样本成员的userId类型:', typeof sampleMember.userId);
        console.log('样本成员的userId值:', sampleMember.userId);
      }

      // 尝试使用字符串userId查询
      const result = await FamilyMemberModel.find({ userId: userId }).lean();
      console.log(`找到用户 ${userId} 的家庭成员数量:`, result.length);

      if (result.length === 0) {
        // 如果没有找到，可能userId在数据库中是ObjectId格式，尝试转换
        try {
          const objectIdUserId = new mongoose.Types.ObjectId(userId);
          const resultWithObjectId = await FamilyMemberModel.find({
            userId: objectIdUserId,
          }).lean();
          console.log(
            `使用ObjectId查询找到用户的家庭成员数量:`,
            resultWithObjectId.length,
          );

          if (resultWithObjectId.length > 0) {
            return resultWithObjectId;
          }
        } catch (error) {
          console.log('尝试将userId转换为ObjectId失败:', error.message);
        }
      }

      if (result.length > 0) {
        console.log('查询结果第一条:', result[0]);
      }

      return result;
    } catch (error) {
      console.error('查询家庭成员出错:', error);
      return [];
    }
  }

  // Get family member by ID
  async getFamilyMemberById(userId, memberId) {
    try {
      // Try with string userId first
      let result = await FamilyMemberModel.findOne({
        _id: new mongoose.Types.ObjectId(memberId),
        userId: userId,
      });

      // If not found, try with ObjectId userId
      if (!result) {
        try {
          const objectIdUserId = new mongoose.Types.ObjectId(userId);
          result = await FamilyMemberModel.findOne({
            _id: new mongoose.Types.ObjectId(memberId),
            userId: objectIdUserId,
          });
        } catch (error) {
          console.log('尝试将userId转换为ObjectId失败:', error.message);
        }
      }

      return result;
    } catch (error) {
      console.error(`获取ID为 ${memberId} 的家庭成员出错:`, error);
      return null;
    }
  }

  // Add new family member
  async addFamilyMember(userId, memberData) {
    console.log('原始接收数据:', memberData);
    console.log('添加家庭成员使用的userId:', userId, typeof userId);

    // 直接创建家庭成员数据，确保字段类型正确
    const familyMemberData = {
      // 必填字段
      name: memberData.name,
      relationship: memberData.relationship,
      userId: userId, // 使用传入的userId字符串格式

      // 选填字段，确保类型正确
      gender: memberData.gender || 'other',
      birthdate: memberData.birthdate ? new Date(memberData.birthdate) : null,
      height:
        memberData.height === ''
          ? null
          : memberData.height
            ? Number(memberData.height)
            : null,
      weight:
        memberData.weight === ''
          ? null
          : memberData.weight
            ? Number(memberData.weight)
            : null,
      allergies: memberData.allergies || '',
      dietaryRestrictions: memberData.dietaryRestrictions || '',
    };

    console.log('处理后的数据:', familyMemberData);

    try {
      // 创建并保存模型
      const familyMember = new FamilyMemberModel(familyMemberData);

      // 检查模型是否有效
      const validationError = familyMember.validateSync();
      if (validationError) {
        console.error('数据验证错误:', validationError);
        throw new Error(`数据验证错误: ${validationError.message}`);
      }

      // 保存到数据库
      const savedMember = await familyMember.save();
      console.log('保存成功，ID:', savedMember._id);

      // 立即查询验证是否保存成功
      const verifyMember = await FamilyMemberModel.findById(savedMember._id);
      if (verifyMember) {
        console.log('验证查询成功，数据已保存');
        console.log('保存的完整数据:', verifyMember);
      } else {
        console.log('验证查询失败，数据可能未正确保存');
      }

      return savedMember;
    } catch (error) {
      console.error('保存家庭成员时出错:', error);
      throw error;
    }
  }

  // Update family member
  async updateFamilyMember(userId, memberId, updateData) {
    try {
      // 处理更新数据中的特殊字段
      const processedData = { ...updateData };
      console.log('原始更新数据:', updateData);

      // 处理数值和日期字段
      if (processedData.height === '') processedData.height = null;
      else if (processedData.height)
        processedData.height = Number(processedData.height);

      if (processedData.weight === '') processedData.weight = null;
      else if (processedData.weight)
        processedData.weight = Number(processedData.weight);

      if (processedData.birthdate)
        processedData.birthdate = new Date(processedData.birthdate);

      console.log('处理后的更新数据:', processedData);

      // 先尝试使用字符串userId查询
      let result = await FamilyMemberModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(memberId),
          userId: userId,
        },
        processedData,
        { new: true }, // 返回更新后的文档
      );

      // 如果没有找到结果，尝试使用ObjectId格式的userId
      if (!result) {
        try {
          const objectIdUserId = new mongoose.Types.ObjectId(userId);
          result = await FamilyMemberModel.findOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(memberId),
              userId: objectIdUserId,
            },
            processedData,
            { new: true },
          );
        } catch (error) {
          console.log('尝试将userId转换为ObjectId失败:', error.message);
        }
      }

      // 打印更新结果以供调试
      if (result) {
        console.log('更新成功，更新后的数据:', result);
      } else {
        console.log('未找到要更新的记录');
      }

      return result;
    } catch (error) {
      console.error(`更新ID为 ${memberId} 的家庭成员出错:`, error);
      throw error;
    }
  }

  // Delete family member
  async deleteFamilyMember(userId, memberId) {
    try {
      // 先尝试使用字符串userId删除
      let result = await FamilyMemberModel.deleteOne({
        _id: new mongoose.Types.ObjectId(memberId),
        userId: userId,
      });

      // 如果没有删除任何记录，尝试使用ObjectId格式的userId
      if (result.deletedCount === 0) {
        try {
          const objectIdUserId = new mongoose.Types.ObjectId(userId);
          result = await FamilyMemberModel.deleteOne({
            _id: new mongoose.Types.ObjectId(memberId),
            userId: objectIdUserId,
          });
        } catch (error) {
          console.log('尝试将userId转换为ObjectId失败:', error.message);
        }
      }

      return result.deletedCount > 0;
    } catch (error) {
      console.error(`删除ID为 ${memberId} 的家庭成员出错:`, error);
      throw error;
    }
  }
}

module.exports = new FamilyMemberRepository();
