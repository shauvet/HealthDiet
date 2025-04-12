# 健康饮食应用 (HealthDiet)

一个全栈健康饮食管理应用，帮助用户管理食谱、规划饮食、跟踪食材库存和分析营养摄入。

## 技术栈

- **前端**：React + MobX + Javascript + Material-UI
- **后端**：Node.js + NestJS
- **数据库**：MongoDB

## 主要功能

### 1. 食谱清单

- 网络推荐菜单
- 用户自创菜单
- 收藏菜单
- 按菜系和辣度分类
- 详细的食材配比和营养价值
- 支持点餐和收藏功能
- 食材搜索

### 2. 已点菜单

- 日历形式展示饮食计划
- 当天、过去和未来菜谱安排
- 食材备料提示（红色表示缺料，绿色表示齐全）
- 点菜后自动调整库存
- 支持取消用餐，恢复库存

### 3. 健康分析

- 时间统计（周、月、年或自定义）
- 菜谱使用频率统计
- 食材摄入量统计
- 营养成分摄入量统计
- 可视化数据展示

### 4. 库存与采购

- 食材库存管理
- 自动生成采购清单
- 按食材类别分类（蔬菜、肉类、辅料等）
- 支持食材过期管理

### 5. 用户管理

- 个人信息管理
- 健康状况记录
- 家庭成员管理
- 饮食偏好设置

## 项目结构

```
HealthDiet/
├── client/                     # 前端React应用
│   └── src/
│       ├── components/         # UI组件
│       │   └── Layout/         # 布局组件
│       ├── pages/              # 页面组件
│       ├── stores/             # MobX状态管理
│       ├── services/           # API服务
│       └── utils/              # 工具函数
│
├── server/                     # 后端NestJS应用
│   └── src/
│       ├── models/             # MongoDB模型
│       │   ├── recipe.model.js
│       │   ├── menu.model.js
│       │   ├── inventory.model.js
│       │   ├── user.model.js
│       │   └── analysis.model.js
│       ├── modules/            # 功能模块
│       │   ├── recipes/
│       │   ├── menus/
│       │   ├── inventory/
│       │   ├── analysis/
│       │   └── users/
│       ├── app.module.js
│       └── main.js
│
└── README.md                   # 项目说明
```

## 安装和运行

### 前提条件

- Node.js 20.11.1 或更高版本
- MongoDB 4.4 或更高版本

### 安装步骤

1. 安装前端依赖:
   ```
   cd client
   pnpm install
   ```

2. 安装后端依赖:
   ```
   cd ../server
   pnpm install
   ```

3. 设置环境变量:
   为后端创建 `.env` 文件，包含以下内容:
   ```
   MONGODB_URI=mongodb://localhost:27017/healthdiet
   JWT_SECRET=your_jwt_secret_key
   PORT=3001
   ```

### 运行应用

1. 启动MongoDB:
   ```
   mongod
   ```

2. 启动前端和后端服务器:
   ```
   pnpm dev
   ```

3. 在浏览器中访问 `http://localhost:5173`

## 界面预览

应用包括以下主要界面：

1. 食谱清单 - 浏览和管理食谱
2. 已点菜单 - 日历形式的饮食计划
3. 库存与采购 - 食材管理
4. 健康分析 - 饮食习惯数据可视化
5. 个人资料 - 用户信息和设置

## 贡献

欢迎贡献代码、报告问题或提出新功能建议。请遵循以下步骤:

1. Fork 仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建一个 Pull Request

## 许可证

此项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系

项目链接: [https://github.com/shauvet/healthdiet](https://github.com/shauvet/healthdiet) 
