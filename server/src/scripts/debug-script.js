const mongoose = require('mongoose');
const { FamilyMemberSchema } = require('../users/schemas/user.schema');

async function debugFamilyMembers() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/health-diet', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Create the model
    const FamilyMemberModel = mongoose.model(
      'FamilyMember',
      FamilyMemberSchema,
    );

    // Check total count
    const totalCount = await FamilyMemberModel.countDocuments();
    console.log('Total family members in database:', totalCount);

    // Remove all existing records for clean test
    console.log('Removing all existing family members...');
    await FamilyMemberModel.deleteMany({});
    console.log('All records deleted.');

    // Create a new family member with correct fields
    console.log('\nCreating a new test family member...');
    const testMember = new FamilyMemberModel({
      name: 'Debug Test Member',
      relationship: 'Test',
      gender: 'other',
      userId: '000000000000000000000001', // String format
      allergies: 'Test allergies',
      dietaryRestrictions: 'Test restrictions',
    });

    // Validate the model
    const validationError = testMember.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
    } else {
      // Save to database
      const savedMember = await testMember.save();
      console.log('Saved new family member:', savedMember);
    }

    // Add a second member
    const testMember2 = new FamilyMemberModel({
      name: 'Debug Test Member 2',
      relationship: 'Spouse',
      gender: 'female',
      userId: '000000000000000000000001', // Same userId
      allergies: 'None',
      dietaryRestrictions: 'Vegetarian',
    });
    await testMember2.save();

    // Check for our specific userId again
    const fixedUserId = '000000000000000000000001';
    const membersWithFixedId = await FamilyMemberModel.find({
      userId: fixedUserId,
    }).lean();

    console.log(
      `\nMembers with userId "${fixedUserId}":`,
      membersWithFixedId.length,
    );
    membersWithFixedId.forEach((member) => {
      console.log(
        'Found member:',
        member.name,
        member._id,
        'relation:',
        member.relationship,
      );
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

// Run the debug function
debugFamilyMembers();
