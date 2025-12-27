/**
 * PostCSS 配置文件
 * PostCSS 是一个用 JavaScript 转换 CSS 的工具
 * 它被用于处理 Tailwind CSS 和添加浏览器前缀
 */

export default {
  // ==================== 插件配置 ====================
  plugins: {
    /**
     * Tailwind CSS 插件
     * 处理 Tailwind 的指令（@tailwind, @apply 等）
     * 生成最终的 CSS 类
     */
    tailwindcss: {},
    
    /**
     * Autoprefixer 插件
     * 自动添加浏览器厂商前缀（-webkit-, -moz- 等）
     * 确保 CSS 在不同浏览器中的兼容性
     * 例如：
     *   transform → -webkit-transform, transform
     *   display: flex → display: -webkit-flex, display: flex
     */
    autoprefixer: {},
  },
}
