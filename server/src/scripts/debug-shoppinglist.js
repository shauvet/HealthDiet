const mongoose = require('mongoose');
const {
  ShoppingItemSchema,
} = require('../inventory/schemas/shoppingItem.schema');

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/health-diet', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB!');

    // 显示MongoDB中所有集合
    console.log('MongoDB中的所有集合:');
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    collections.forEach((collection) => {
      console.log(`- ${collection.name}`);
    });

    // 显示mongoose中已注册的所有模型
    console.log('\nMongoose中已注册的所有模型:');
    Object.keys(mongoose.models).forEach((modelName) => {
      console.log(`- ${modelName}`);
    });

    // 定义模型
    const ShoppingItem =
      mongoose.models.ShoppingItem ||
      mongoose.model('ShoppingItem', ShoppingItemSchema);

    // 查询所有购物清单项
    console.log('\n查询所有购物清单项...');
    const allItems = await ShoppingItem.find({});
    console.log(`总共找到 ${allItems.length} 个购物清单项`);

    // 显示前3个项目的完整内容
    if (allItems.length > 0) {
      console.log('\n前3个购物清单项的完整内容:');
      allItems.slice(0, 3).forEach((item, index) => {
        console.log(`\n项目 #${index + 1}:`);
        console.log(
          JSON.stringify(item.toObject ? item.toObject() : item, null, 2),
        );
      });
    }

    // 直接使用原始集合查询
    console.log('\n使用原始集合查询所有购物清单项:');
    const rawItems = await mongoose.connection.db
      .collection('shoppingitems')
      .find({})
      .toArray();
    console.log(`通过原始集合找到 ${rawItems.length} 个购物清单项`);

    if (rawItems.length > 0) {
      console.log('\n前3个原始购物清单项:');
      rawItems.slice(0, 3).forEach((item, index) => {
        console.log(`\n原始项目 #${index + 1}:`);
        console.log(JSON.stringify(item, null, 2));
      });
    }

    // 关闭连接
    await mongoose.connection.close();
    console.log('\n已关闭MongoDB连接');
  } catch (error) {
    console.error('错误:', error);
  }
}

main();
