/**
 * @file 后端服务入口文件
 * @description Express 应用的主入口，负责初始化服务器、配置中间件和启动应用
 * @author FrontendPrepHub Team
 */

// 导入 Express 框架核心模块
import express from 'express';
// 导入 CORS 中间件，用于处理跨域请求
import cors from 'cors';
// 导入 Helmet 中间件，用于设置安全相关的 HTTP 响应头
import helmet from 'helmet';
// 导入 Morgan 中间件，用于 HTTP 请求日志记录
import morgan from 'morgan';
// 导入应用配置对象
import { config } from './config';
// 导入数据库连接函数
import { connectDatabase } from './config/database';
// 导入所有 API 路由
import routes from './routes';
// 导入错误处理中间件
import { notFoundHandler, errorHandler } from './middleware';

/**
 * 创建 Express 应用实例
 * @description Express() 返回一个函数，该函数可以处理 HTTP 请求
 */
const app = express();

/**
 * ==================== 中间件配置 ====================
 * 中间件按顺序执行，顺序很重要
 */

/**
 * 安全头设置中间件
 * @description Helmet 通过设置各种 HTTP 头来保护应用免受常见的 Web 漏洞攻击
 * 例如：XSS 防护、点击劫持防护、MIME 类型嗅探防护等
 */
app.use(helmet());

/**
 * CORS（跨源资源共享）配置
 * @description 允许前端应用从不同的源（域名/端口）访问后端 API
 * @param origin - 允许的前端源地址
 * @param credentials - 是否允许发送 Cookie 凭证
 * @param methods - 允许的 HTTP 请求方法
 * @param allowedHeaders - 允许的请求头
 */
app.use(cors({
  origin: config.cors.origin,        // 从配置中读取允许的前端地址
  credentials: config.cors.credentials, // 允许携带凭证（如 Cookie）
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // 允许的 HTTP 方法
  allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
}));

/**
 * 请求日志中间件
 * @description 根据运行环境选择不同的日志格式
 * - 开发环境：使用 'dev' 格式，输出彩色简洁日志
 * - 生产环境：使用 'combined' 格式，输出标准 Apache 日志格式
 */
if (config.nodeEnv === 'development') {
  app.use(morgan('dev')); // 开发模式：GET /api/users 200 5.234 ms
} else {
  app.use(morgan('combined')); // 生产模式：包含完整请求信息
}

/**
 * JSON 请求体解析中间件
 * @description 解析请求体中的 JSON 数据，将其转换为 JavaScript 对象
 * @param limit - 限制请求体大小为 10MB，防止大文件攻击
 */
app.use(express.json({ limit: '10mb' }));

/**
 * URL 编码请求体解析中间件
 * @description 解析 application/x-www-form-urlencoded 格式的表单数据
 * @param extended - true 表示使用 qs 库解析，支持嵌套对象
 * @param limit - 限制请求体大小为 10MB
 */
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * ==================== API 路由配置 ====================
 * 所有 API 路由都以 /api 为前缀
 */
app.use('/api', routes);

/**
 * ==================== 错误处理中间件 ====================
 * 错误处理中间件必须放在路由之后
 */

/**
 * 404 未找到路由处理
 * @description 当请求的路由不存在时，返回 404 错误响应
 */
app.use(notFoundHandler);

/**
 * 全局错误处理中间件
 * @description 捕获所有未处理的错误，返回统一格式的错误响应
 */
app.use(errorHandler);

/**
 * 启动服务器的异步函数
 * @async
 * @description 连接数据库并启动 HTTP 服务器
 * @throws {Error} 如果数据库连接或服务器启动失败
 */
const startServer = async () => {
  try {
    // 步骤1：连接 MongoDB 数据库
    await connectDatabase();

    // 步骤2：启动 HTTP 服务器，监听指定端口
    app.listen(config.port, () => {
      // 在控制台输出启动成功信息（ASCII 艺术边框）
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 FrontendPrepHub API Server                            ║
║                                                            ║
║   Environment: ${config.nodeEnv.padEnd(40)}║
║   Port: ${config.port.toString().padEnd(47)}║
║   API Base URL: http://localhost:${config.port}/api               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    // 启动失败时输出错误信息并退出进程
    console.error('❌ 服务器启动失败:', error);
    process.exit(1); // 退出码 1 表示异常退出
  }
};

/**
 * ==================== 进程信号处理 ====================
 * 优雅退出：在收到终止信号时正确关闭服务器
 */

/**
 * SIGTERM 信号处理
 * @description SIGTERM 是标准的终止信号，通常由进程管理器发送
 * 例如：docker stop、systemctl stop、kill PID
 */
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，准备关闭服务器...');
  process.exit(0); // 退出码 0 表示正常退出
});

/**
 * SIGINT 信号处理
 * @description SIGINT 是中断信号，通常由用户按 Ctrl+C 触发
 */
process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，准备关闭服务器...');
  process.exit(0); // 退出码 0 表示正常退出
});

// 启动服务器
startServer();

/**
 * 导出 Express 应用实例
 * @description 导出 app 实例供测试或其他模块使用
 */
export default app;
