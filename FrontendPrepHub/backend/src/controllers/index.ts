/**
 * @file 控制器统一导出文件
 * @description 集中导出所有控制器模块，方便在路由中引用
 * @author FrontendPrepHub Team
 * 
 * @example
 * // 在路由文件中导入控制器
 * import { authController, problemController } from '../controllers';
 */

/**
 * 认证控制器
 * @description 处理用户注册、登录、个人资料等认证相关操作
 */
export { default as authController } from './authController';

/**
 * 知识点控制器
 * @description 处理知识点的增删改查、收藏、标记薄弱项等操作
 */
export { default as knowledgeController } from './knowledgeController';

/**
 * 编程题控制器
 * @description 处理编程题的列表、详情、提交代码、查看解答等操作
 */
export { default as problemController } from './problemController';

/**
 * 算法题控制器
 * @description 处理算法题的列表、详情、动画数据、提交代码等操作
 */
export { default as algorithmController } from './algorithmController';

/**
 * 管理员控制器
 * @description 处理用户管理、内容管理、平台统计等管理后台操作
 */
export { default as adminController } from './adminController';

/**
 * 用户代码控制器
 * @description 处理用户保存的代码项目的增删改查和执行
 */
export { default as userCodeController } from './userCodeController';

/**
 * 学习管理控制器
 * @description 处理学习进度、错题本、学习计划等学习相关操作
 */
export { default as learningController } from './learningController';
