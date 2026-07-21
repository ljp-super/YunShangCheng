# YunShangCheng

云上商城 - 基于微服务架构的电商管理系统

## 项目简介

YunShangCheng 是一套基于微服务架构的电商管理系统，采用 Spring Cloud 2025 & Alibaba、Spring Boot 3.5、Vue 3 等核心技术栈构建。系统集成了注册中心、配置中心、API网关、认证授权、服务监控等微服务基础设施，提供完整的商品管理、订单管理、用户管理等电商业务功能。

## 项目架构

### 系统架构

- **服务注册与发现**: Nacos
- **配置中心**: Nacos
- **API网关**: Spring Cloud Gateway
- **认证授权**: JWT
- **服务监控**: Spring Boot Admin
- **分布式缓存**: Redis
- **消息队列**: RabbitMQ（可选）
- **搜索引擎**: Elasticsearch（可选）

### 模块结构

```
YunShangCheng
├── ysc-common          -- 工具类及通用代码模块
├── ysc-mbg             -- MyBatisGenerator生成的数据库操作代码模块
├── ysc-auth            -- 统一认证中心服务
├── ysc-gateway         -- 微服务API网关服务
├── ysc-monitor         -- 微服务监控中心
├── ysc-admin           -- 后台管理系统服务
├── ysc-search          -- 商品搜索系统服务
├── ysc-portal          -- 移动端商城系统服务
├── ysc-demo            -- 微服务远程调用测试服务
├── ysc-admin-web-master -- 后台管理前端(Vue 3)
├── config              -- 配置中心存储的配置
└── document            -- 项目文档资源
```

## 技术选型

### 后端技术

| 技术 | 说明 | 版本 |
|------|------|------|
| Spring Boot | 容器+MVC框架 | 3.5.x |
| Spring Cloud | 微服务框架 | 2025.x |
| Spring Cloud Alibaba | 微服务组件 | 2025.x |
| Nacos | 注册中心与配置中心 | 3.x |
| MyBatis | ORM框架 | 3.5.x |
| Redis | 分布式缓存 | 7.x |
| MySQL | 关系型数据库 | 8.x |
| Druid | 数据库连接池 | 1.2.x |
| Knife4j | API文档工具 | 4.x |
| JWT | 认证令牌 | - |
| Spring Boot Admin | 服务监控 | 3.x |
| MinIO | 对象存储 | 8.x |
| Lombok | 简化代码工具 | - |

### 前端技术

| 技术 | 说明 | 版本 |
|------|------|------|
| Vue | 前端框架 | 3.x |
| Vue Router | 路由框架 | 4.x |
| Pinia | 状态管理 | 3.x |
| Element Plus | 前端UI框架 | 2.x |
| Axios | HTTP请求框架 | 1.x |
| Vite | 构建工具 | 7.x |
| TypeScript | 类型Script | 5.x |

## 环境要求

| 工具 | 版本 |
|------|------|
| JDK | 17 |
| Maven | 3.8+ |
| Node.js | 20+ |
| MySQL | 8.0+ |
| Redis | 7.0+ |
| Nacos | 3.0+ |

## 快速开始

### 1. 启动依赖服务

```bash
# 启动MySQL（端口：3306）
# 启动Redis（端口：6379）
# 启动Nacos（端口：8848）
D:\Nacos\bin\startup.cmd -m standalone
```

### 2. 初始化数据库

执行 `document/sql/mall.sql` 脚本创建数据库和表结构。

### 3. 启动后端服务

```bash
# 方式一：使用启动脚本
start-admin.bat
start-gateway.bat

# 方式二：使用Maven命令
cd ysc-admin && mvn spring-boot:run
cd ysc-gateway && mvn spring-boot:run
```

### 4. 启动前端服务

```bash
cd ysc-admin-web-master
npm install
npm run dev
```

## 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| Nacos | 8848 | 注册中心/配置中心 |
| ysc-admin | 8081 | 后台管理服务 |
| ysc-gateway | 8201 | API网关 |
| ysc-search | 8083 | 搜索服务 |
| ysc-portal | 8085 | 移动端服务 |
| ysc-monitor | 8101 | 监控中心 |
| ysc-auth | 8087 | 认证服务 |
| ysc-admin-web | 5173 | 前端开发服务器 |

## 访问地址

- **前端页面**: http://localhost:5173/
- **后端API文档**: http://localhost:8081/swagger-ui.html
- **Nacos控制台**: http://localhost:8848/nacos
- **监控中心**: http://localhost:8101

## 配置说明

配置文件位于 `config/` 目录下，按服务分类：

- `config/admin/` - ysc-admin 服务配置
- `config/gateway/` - ysc-gateway 服务配置
- `config/portal/` - ysc-portal 服务配置
- `config/search/` - ysc-search 服务配置

## 功能模块

### 后台管理系统

- 商品管理（商品列表、商品分类、商品属性、品牌管理）
- 订单管理（订单列表、订单设置、退货申请处理）
- 用户管理（管理员管理、角色管理、权限管理）
- 营销管理（优惠券管理、秒杀活动、广告管理）
- 内容管理（首页专题、推荐商品、品牌推荐）
- AI智能客服

### 移动端商城

- 首页展示
- 商品搜索
- 购物车
- 订单管理
- 用户中心

## 开发规范

### 代码规范

- Java代码遵循阿里巴巴Java开发规范
- TypeScript代码遵循Vue官方风格指南
- 使用Lombok简化Java类编写
- 使用ESLint检查前端代码

### 提交规范

```
feat: 新增功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建/工具相关
```

## 许可证

[Apache License 2.0](LICENSE)