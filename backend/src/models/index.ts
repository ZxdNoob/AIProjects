/**
 * @file 数据模型统一导出文件
 * @description 集中导出所有 Mongoose 模型和接口，方便其他模块引用
 * @author FrontendPrepHub Team
 * 
 * @example
 * // 在其他文件中导入模型
 * import { User, Problem, IUser, IProblem } from './models';
 */

/**
 * 用户模型
 * @description 处理用户认证、权限、学习进度等
 */
export { User, IUser } from './User';

/**
 * 知识点模型
 * @description 管理知识点内容、分类、层级等
 */
export { Knowledge, IKnowledge } from './Knowledge';

/**
 * 编程题模型
 * @description 管理编程题内容、测试用例、解答等
 * @exports ITestCase - 测试用例接口
 */
export { Problem, IProblem, ITestCase } from './Problem';

/**
 * 算法题模型
 * @description 管理算法题内容、动画配置等
 * @exports IAnimationStep - 动画步骤接口
 */
export { Algorithm, IAlgorithm, IAnimationStep } from './Algorithm';

/**
 * 提交记录模型
 * @description 记录用户的代码提交和执行结果
 */
export { Submission, ISubmission } from './Submission';

/**
 * 错题记录模型
 * @description 管理用户的错题本功能
 */
export { WrongRecord, IWrongRecord } from './WrongRecord';

/**
 * 用户代码模型
 * @description 管理用户保存的代码项目
 * @exports ICodeFile - 代码文件接口
 */
export { UserCode, IUserCode, ICodeFile } from './UserCode';
