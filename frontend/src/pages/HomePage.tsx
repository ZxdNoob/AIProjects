/**
 * 首页组件
 * 展示平台介绍、核心功能、定价方案等营销内容
 */

// 导入路由链接组件
import { Link } from 'react-router-dom';
// 导入图标组件
import {
  BookOpen,      // 书本图标（知识学习）
  Code2,         // 代码图标（编程）
  PlayCircle,    // 播放图标（算法动画）
  Cpu,           // CPU 图标（IDE）
  Trophy,        // 奖杯图标（成就）
  Users,         // 用户图标
  Target,        // 目标图标（个性化）
  Sparkles,      // 闪光图标（装饰）
  ArrowRight,    // 右箭头图标
  CheckCircle2,  // 勾选图标（功能列表）
} from 'lucide-react';

/**
 * 首页组件
 * 包含 Hero 区域、功能介绍、定价方案、CTA 等模块
 */
const HomePage: React.FC = () => {
  /**
   * 核心功能配置
   * 定义平台的四大核心功能
   */
  const features = [
    {
      icon: BookOpen,                                    // 图标组件
      title: '分级知识体系',                              // 功能标题
      description: '80+ 高频考点，从基础到原理层层递进，覆盖 JS/CSS/React/Vue 等核心领域',  // 功能描述
      color: 'from-blue-500 to-cyan-400',               // 渐变颜色
    },
    {
      icon: Code2,
      title: '在线编码调试',
      description: 'Monaco Editor 内核，支持多文件编辑、实时预览、断点调试，模拟真实开发体验',
      color: 'from-purple-500 to-pink-400',
    },
    {
      icon: PlayCircle,
      title: '算法动画演示',
      description: '30 道经典算法可视化，支持步骤控制、倍速播放，直观理解算法执行过程',
      color: 'from-orange-500 to-yellow-400',
    },
    {
      icon: Target,
      title: '个性化学习',
      description: '智能学习计划、错题本、进度跟踪，量身定制面试备战方案',
      color: 'from-green-500 to-emerald-400',
    },
  ];

  /**
   * 统计数据配置
   * 展示平台的核心数据指标
   */
  const stats = [
    { value: '80+', label: '知识考点' },   // 知识点数量
    { value: '50+', label: '编程题目' },   // 编程题数量
    { value: '30+', label: '算法动画' },   // 算法题数量
    { value: '10K+', label: '用户选择' },  // 用户数量
  ];

  /**
   * 定价方案配置
   * 定义免费版和会员版的功能差异
   */
  const plans = [
    {
      name: '免费版',           // 方案名称
      price: '0',              // 价格
      period: '永久免费',      // 计费周期
      features: [              // 包含的功能列表
        '基础层知识点学习',
        '15 道免费编程题',
        '10 道基础算法动画',
        '学习进度同步',
      ],
      buttonText: '立即开始',  // 按钮文字
      buttonLink: '/register', // 按钮链接
      popular: false,          // 是否推荐
    },
    {
      name: '会员版',
      price: '99',
      period: '/月',
      features: [
        '全部知识点无限访问',
        '50 道编程题 + 答案解析',
        '30 道算法动画 + 倍速播放',
        '云端代码备份',
        '个性化学习计划',
        '优先客服支持',
      ],
      buttonText: '开通会员',
      buttonLink: '/register',
      popular: true,           // 标记为推荐方案
    },
  ];

  return (
    // 页面容器：相对定位，溢出隐藏
    <div className="relative overflow-hidden">
      
      {/* ==================== Hero 区域 ==================== */}
      <section className="relative py-20 lg:py-32">
        {/* -------------------- 背景装饰 -------------------- */}
        <div className="absolute inset-0 overflow-hidden">
          {/* 左上角光晕 */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          {/* 右下角光晕 */}
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
          {/* 网格背景 */}
          <div className="absolute inset-0 bg-mesh-pattern opacity-20" />
        </div>

        {/* 内容容器 */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            
            {/* 顶部标签 */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 mb-8
                          bg-primary-500/10 border border-primary-500/30 rounded-full
                          animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300">前端面试必备神器</span>
            </div>

            {/* 主标题 */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              <span className="text-dark-100">让面试备战</span>
              <br />
              {/* 渐变文字效果 */}
              <span className="text-gradient">高效且有趣</span>
            </h1>

            {/* 副标题：功能概述 */}
            <p className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto mb-10
                        animate-slide-up animation-delay-100">
              知识学习 · 在线编码 · 算法动画 · 进度管理
              <br />
              一站式前端面试备战平台，助你斩获心仪 Offer
            </p>

            {/* CTA 按钮组 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4
                          animate-slide-up animation-delay-200">
              {/* 主按钮：注册 */}
              <Link to="/register" className="btn-primary btn-lg group">
                <span>免费开始学习</span>
                {/* 悬停时箭头右移 */}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              {/* 次按钮：浏览知识库 */}
              <Link to="/knowledge" className="btn-secondary btn-lg">
                浏览知识库
              </Link>
            </div>
          </div>

          {/* -------------------- 统计数据 -------------------- */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in animation-delay-300">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                {/* 数值：渐变色 */}
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                {/* 标签 */}
                <div className="text-dark-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 功能介绍区域 ==================== */}
      <section className="py-20 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 区域标题 */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-100 mb-4">
              核心功能
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              专为前端开发者打造的一站式面试备战解决方案
            </p>
          </div>

          {/* 功能卡片网格 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-hover group cursor-pointer"
                // 交错动画延迟
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* 图标容器：渐变背景 */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color}
                            flex items-center justify-center mb-6
                            group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                {/* 功能标题 */}
                <h3 className="text-xl font-semibold text-dark-100 mb-3">
                  {feature.title}
                </h3>
                {/* 功能描述 */}
                <p className="text-dark-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 定价方案区域 ==================== */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 区域标题 */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-100 mb-4">
              选择适合你的方案
            </h2>
            <p className="text-dark-400">
              免费开始，按需升级
            </p>
          </div>

          {/* 方案卡片网格 */}
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 transition-all
                  ${plan.popular
                    // 推荐方案：渐变背景 + 高亮边框 + 阴影
                    ? 'bg-gradient-to-br from-primary-900/50 to-accent-900/50 border-2 border-primary-500/50 shadow-2xl shadow-primary-500/20'
                    // 普通方案：深色背景
                    : 'bg-dark-800/50 border border-dark-700'
                  }`}
              >
                {/* 推荐标签 */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-primary-500 to-accent-500 
                                   text-white text-sm font-medium rounded-full">
                      推荐
                    </span>
                  </div>
                )}

                {/* 方案名称和价格 */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-dark-100 mb-4">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gradient">
                      ¥{plan.price}
                    </span>
                    <span className="text-dark-400 ml-2">{plan.period}</span>
                  </div>
                </div>

                {/* 功能列表 */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3 text-dark-300">
                      {/* 勾选图标 */}
                      <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 操作按钮 */}
                <Link
                  to={plan.buttonLink}
                  className={`block text-center py-3 rounded-lg font-medium transition-all
                    ${plan.popular
                      ? 'btn-primary'    // 推荐方案使用主按钮
                      : 'btn-secondary'  // 普通方案使用次按钮
                    }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 底部 CTA 区域 ==================== */}
      <section className="py-20 bg-gradient-to-r from-primary-900/30 to-accent-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 奖杯图标 */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 
                        flex items-center justify-center shadow-2xl shadow-primary-500/30">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          {/* 标题 */}
          <h2 className="text-3xl md:text-4xl font-bold text-dark-100 mb-4">
            准备好开始你的面试之旅了吗？
          </h2>
          {/* 描述 */}
          <p className="text-lg text-dark-400 mb-8">
            加入 10,000+ 前端开发者，一起高效备战面试
          </p>
          {/* CTA 按钮 */}
          <Link to="/register" className="btn-primary btn-lg inline-flex group">
            <span>立即免费注册</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};

// 导出首页组件
export default HomePage;
