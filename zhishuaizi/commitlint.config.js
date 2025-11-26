/**
 * Commitlint 配置
 * 遵循 Conventional Commits 规范
 * 参考项目 .cursorrules 中的提交规范
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 bug
        'docs',     // 文档更新
        'style',    // 代码格式调整
        'refactor', // 代码重构
        'perf',     // 性能优化
        'test',     // 测试
        'build',    // 构建系统
        'ci',       // CI 配置
        'chore',    // 其他更改
        'revert',   // 回滚
      ],
    ],
    // 类型不能为空
    'type-empty': [2, 'never'],
    // 类型大小写
    'type-case': [2, 'always', 'lower-case'],
    // 主题不能为空
    'subject-empty': [2, 'never'],
    // 主题大小写：不限制（允许中文和英文）
    'subject-case': [0],
    // 主题长度：不限制
    'subject-max-length': [0],
    // 主题结尾不能有句号
    'subject-full-stop': [2, 'never', '.'],
    // 范围大小写：不限制
    'scope-case': [0],
    // 范围可以为空
    'scope-empty': [0],
    // Header 长度：不限制
    'header-max-length': [0],
    // Body 和 Footer 不强制
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
  },
  // 自定义解析器，支持 emoji（emoji 在 type 之前）
  parserPreset: {
    parserOpts: {
      // 匹配格式: [emoji] type(scope): subject 或 type(scope): subject
      headerPattern: /^(?:(.*?)\s+)?(\w+)(?:\((.*)\))?:\s+(.*)$/,
      headerCorrespondence: ['emoji', 'type', 'scope', 'subject'],
    },
  },
};

