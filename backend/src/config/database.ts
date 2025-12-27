/**
 * @file 数据库连接配置
 * @description 负责 MongoDB 数据库的连接、断开和事件监听
 * @author FrontendPrepHub Team
 */

// 导入 mongoose ODM（对象文档映射）库
import mongoose from 'mongoose';
// 导入应用配置
import { config } from './index';

/**
 * 连接 MongoDB 数据库
 * @async
 * @function connectDatabase
 * @description 建立与 MongoDB 数据库的连接，并设置连接事件监听器
 * @returns {Promise<void>} 无返回值的 Promise
 * @throws {Error} 如果连接失败，会终止进程
 * 
 * @example
 * // 在应用启动时调用
 * await connectDatabase();
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    /**
     * MongoDB 连接选项
     * @description Mongoose 6.0+ 版本已移除大部分旧选项，使用默认配置即可
     * 旧版本需要的选项（如 useNewUrlParser, useUnifiedTopology）已内置
     */
    const options: mongoose.ConnectOptions = {
      // MongoDB 连接选项（Mongoose 6.0+ 大多数选项已内置）
      // 如需自定义，可在此添加：
      // serverSelectionTimeoutMS: 5000, // 服务器选择超时时间
      // socketTimeoutMS: 45000,         // Socket 超时时间
    };

    // 使用 mongoose.connect() 建立数据库连接
    await mongoose.connect(config.mongodbUri, options);
    
    // 连接成功，输出成功信息
    console.log('✅ MongoDB 连接成功');
    
    /**
     * 监听数据库连接错误事件
     * @description 在连接建立后，如果发生错误会触发此事件
     */
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB 连接错误:', err);
    });

    /**
     * 监听数据库连接断开事件
     * @description 当连接断开时触发，可能由网络问题或数据库重启引起
     */
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB 连接断开');
    });

    /**
     * 监听数据库重新连接成功事件
     * @description 当 Mongoose 成功重新连接到数据库时触发
     */
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB 重新连接成功');
    });

  } catch (error) {
    // 连接失败，输出错误信息并终止进程
    console.error('❌ MongoDB 连接失败:', error);
    // 退出码 1 表示异常退出，让进程管理器（如 PM2）知道需要重启
    process.exit(1);
  }
};

/**
 * 关闭数据库连接
 * @async
 * @function disconnectDatabase
 * @description 优雅地关闭 MongoDB 连接，通常在应用关闭时调用
 * @returns {Promise<void>} 无返回值的 Promise
 * 
 * @example
 * // 在应用关闭前调用
 * await disconnectDatabase();
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    // 关闭所有连接
    await mongoose.connection.close();
    console.log('✅ MongoDB 连接已关闭');
  } catch (error) {
    console.error('❌ 关闭 MongoDB 连接失败:', error);
  }
};

// 默认导出连接函数
export default connectDatabase;
