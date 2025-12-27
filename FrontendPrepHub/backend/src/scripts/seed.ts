/**
 * 数据库种子脚本
 * 用于初始化数据库的测试数据
 */

// 导入 mongoose 数据库驱动
import mongoose from 'mongoose';
// 导入应用配置和常量枚举
import { config, UserRole, KnowledgeLevel, ProblemDifficulty, AlgorithmCategory } from '../config';
// 导入数据模型
import { User, Knowledge, Problem, Algorithm } from '../models';

/**
 * 数据库初始化脚本
 * 运行命令: npm run seed
 * 功能: 清空数据库并插入初始测试数据
 */

// ============================================================
// 知识点数据定义
// ============================================================

/**
 * 初始知识点数据数组
 * 包含前端面试常见的知识点
 */
const knowledgeData = [
  // -------------------- JavaScript 基础 --------------------
  {
    // 知识点标题
    title: 'JavaScript 原型链',
    // 所属分类
    category: 'JavaScript基础',
    // 难度级别：基础
    level: KnowledgeLevel.BASIC,
    // 相关标签，用于搜索和筛选
    tags: ['原型', '继承', '面试高频'],
    // 知识点内容对象
    content: {
      // 简短摘要，用于列表展示
      summary: '原型链是 JavaScript 实现继承的核心机制，每个对象都有一个 __proto__ 属性指向其原型对象。',
      // 详细内容，支持 Markdown 格式
      detail: `## 原型链概念

JavaScript 中每个对象都有一个内部属性 [[Prototype]]（可通过 __proto__ 访问），指向它的原型对象。当访问对象的某个属性时，如果对象本身没有这个属性，就会沿着原型链向上查找。

## 核心概念

1. **prototype**: 函数特有的属性，指向原型对象
2. **__proto__**: 对象的内部属性，指向创建该对象的构造函数的 prototype
3. **constructor**: 原型对象上的属性，指向构造函数

## 原型链示例

\`\`\`javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log('Hello, ' + this.name);
};

const person = new Person('Alice');
person.sayHello(); // Hello, Alice

// 原型链关系
person.__proto__ === Person.prototype // true
Person.prototype.__proto__ === Object.prototype // true
Object.prototype.__proto__ === null // true
\`\`\``,
      // 面试问题
      interviewQuestion: '请解释 JavaScript 中的原型链是什么？prototype 和 __proto__ 有什么区别？',
      // 标准答案
      standardAnswer: '原型链是 JavaScript 实现继承的机制。每个对象都有 __proto__ 指向其原型，形成链式结构。prototype 是函数特有的属性，指向原型对象；__proto__ 是所有对象都有的属性，指向创建该对象的构造函数的 prototype。',
      // 常见错误
      commonMistakes: [
        '混淆 prototype 和 __proto__',
        '不理解原型链的终点是 null',
        '忘记 constructor 属性的作用'
      ],
      // 扩展知识
      extensions: [
        'ES6 class 语法糖的原型链实现',
        'Object.create() 的原型链应用',
        '性能：避免过长的原型链查找'
      ]
    },
    // 来源公司
    company: '字节跳动',
    // 面试职位
    position: '前端开发',
    // 排序顺序
    order: 1
  },
  {
    // 闭包知识点
    title: '闭包（Closure）',
    category: 'JavaScript基础',
    level: KnowledgeLevel.BASIC,
    tags: ['闭包', '作用域', '面试高频'],
    content: {
      summary: '闭包是指能够访问自由变量的函数，由函数和其相关的引用环境组合而成。',
      detail: `## 闭包定义

闭包是 JavaScript 中的重要概念，它允许函数访问并操作函数外部的变量。

## 闭包的形成条件

1. 函数嵌套
2. 内部函数引用外部函数的变量
3. 内部函数被返回或传递到外部

## 经典示例

\`\`\`javascript
function createCounter() {
  let count = 0;
  return {
    increment: function() { return ++count; },
    decrement: function() { return --count; },
    getCount: function() { return count; }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount();  // 2
\`\`\``,
      interviewQuestion: '什么是闭包？闭包有哪些应用场景？会造成什么问题？',
      standardAnswer: '闭包是能够访问自由变量的函数。应用场景包括：数据私有化、函数柯里化、模块化等。可能造成内存泄漏问题，因为闭包会保持对外部变量的引用。',
      commonMistakes: [
        '循环中使用闭包的变量引用问题',
        '不理解闭包导致的内存泄漏',
        '过度使用闭包影响性能'
      ],
      extensions: [
        '使用 let 解决循环闭包问题',
        '闭包与垃圾回收机制',
        '模块模式的闭包应用'
      ]
    },
    company: '阿里巴巴',
    position: '前端开发',
    order: 2
  },
  {
    // Promise 与异步编程知识点
    title: 'Promise 与异步编程',
    category: 'JavaScript基础',
    level: KnowledgeLevel.BASIC,
    tags: ['Promise', '异步', 'async/await', '面试高频'],
    content: {
      summary: 'Promise 是处理异步操作的对象，代表一个异步操作的最终完成或失败。',
      detail: `## Promise 基础

Promise 有三种状态：pending（进行中）、fulfilled（已成功）、rejected（已失败）。

## Promise 使用

\`\`\`javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('成功');
    // 或 reject('失败');
  }, 1000);
});

promise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('完成'));
\`\`\`

## async/await

\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
\`\`\``,
      interviewQuestion: '请解释 Promise 的三种状态及其转换规则？如何实现一个简单的 Promise？',
      standardAnswer: 'Promise 有 pending、fulfilled、rejected 三种状态。状态只能从 pending 转换到 fulfilled 或 rejected，且不可逆。实现需要包含 then、catch、finally 方法，以及状态管理和回调队列。',
      commonMistakes: [
        '忘记 return Promise',
        '不处理 rejected 状态',
        'async 函数总是返回 Promise'
      ],
      extensions: [
        'Promise.all/race/allSettled/any 的区别',
        '手写 Promise 实现',
        '并发控制与请求队列'
      ]
    },
    company: '腾讯',
    position: '前端开发',
    order: 3
  },
  {
    // 事件循环知识点（中级难度）
    title: '事件循环（Event Loop）',
    category: 'JavaScript基础',
    level: KnowledgeLevel.INTERMEDIATE,
    tags: ['事件循环', '宏任务', '微任务', '面试高频'],
    content: {
      summary: '事件循环是 JavaScript 处理异步操作的机制，通过任务队列实现非阻塞执行。',
      detail: `## 事件循环机制

JavaScript 是单线程语言，通过事件循环实现异步操作。

## 任务队列

1. **宏任务（MacroTask）**: setTimeout, setInterval, I/O, UI rendering
2. **微任务（MicroTask）**: Promise.then, MutationObserver, queueMicrotask

## 执行顺序

1. 执行同步代码（调用栈）
2. 调用栈清空后，检查微任务队列
3. 执行所有微任务
4. 执行一个宏任务
5. 重复步骤 2-4

\`\`\`javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// 输出: 1, 4, 3, 2
\`\`\``,
      interviewQuestion: '请解释 JavaScript 的事件循环机制？宏任务和微任务的区别是什么？',
      standardAnswer: '事件循环是 JS 处理异步的机制。执行栈清空后先执行所有微任务，再执行一个宏任务，循环往复。微任务优先级高于宏任务，常见微任务有 Promise.then，宏任务有 setTimeout。',
      commonMistakes: [
        '不理解微任务优先级高于宏任务',
        '混淆 Node.js 和浏览器的事件循环差异',
        '不理解 requestAnimationFrame 的执行时机'
      ],
      extensions: [
        'Node.js 事件循环的六个阶段',
        '浏览器渲染与事件循环的关系',
        'Vue nextTick 的实现原理'
      ]
    },
    company: '美团',
    position: '前端开发',
    order: 4
  },
  // -------------------- CSS 相关 --------------------
  {
    // CSS Flexbox 布局知识点
    title: 'CSS Flexbox 布局',
    category: 'CSS3',
    level: KnowledgeLevel.BASIC,
    tags: ['Flex', '布局', 'CSS'],
    content: {
      summary: 'Flexbox 是一维布局模型，用于在容器中对齐和分配空间给项目。',
      detail: `## Flexbox 基础

Flex 布局由容器（flex container）和项目（flex item）组成。

## 容器属性

- \`display: flex\` 开启 Flex 布局
- \`flex-direction\`: 主轴方向
- \`justify-content\`: 主轴对齐
- \`align-items\`: 交叉轴对齐
- \`flex-wrap\`: 换行

## 项目属性

- \`flex-grow\`: 放大比例
- \`flex-shrink\`: 缩小比例
- \`flex-basis\`: 初始大小
- \`flex\`: 简写 (grow shrink basis)`,
      interviewQuestion: '请解释 Flexbox 的主要属性及其作用？flex: 1 表示什么？',
      standardAnswer: 'Flexbox 通过容器和项目属性控制布局。flex: 1 等于 flex: 1 1 0%，表示项目可以等比例放大缩小，初始大小为 0。',
      commonMistakes: [
        '混淆主轴和交叉轴',
        '不理解 flex-shrink 的计算方式',
        'flex-basis 与 width 的优先级'
      ],
      extensions: [
        'Flex 与 Grid 布局的选择',
        '圣杯布局的 Flex 实现',
        '响应式设计中的 Flex 应用'
      ]
    },
    company: '京东',
    position: '前端开发',
    order: 10
  },
  // -------------------- React 相关 --------------------
  {
    // React Hooks 知识点（中级难度）
    title: 'React Hooks 原理',
    category: 'React',
    level: KnowledgeLevel.INTERMEDIATE,
    tags: ['React', 'Hooks', '状态管理'],
    content: {
      summary: 'React Hooks 是 React 16.8 引入的特性，允许在函数组件中使用状态和生命周期。',
      detail: `## Hooks 概述

Hooks 让你在不编写 class 的情况下使用 state 和其他 React 特性。

## 常用 Hooks

1. **useState**: 状态管理
2. **useEffect**: 副作用处理
3. **useContext**: Context 消费
4. **useRef**: 引用管理
5. **useMemo/useCallback**: 性能优化

## Hooks 规则

1. 只在最顶层使用 Hooks
2. 只在 React 函数中调用 Hooks`,
      interviewQuestion: '请解释 React Hooks 的工作原理？为什么不能在条件语句中使用 Hooks？',
      standardAnswer: 'Hooks 基于调用顺序在链表中存储状态。每次渲染按顺序读取，如果在条件语句中使用会导致顺序不一致，造成状态错乱。',
      commonMistakes: [
        '在循环或条件中使用 Hooks',
        'useEffect 依赖项遗漏',
        '闭包陷阱导致的旧值问题'
      ],
      extensions: [
        '自定义 Hooks 的最佳实践',
        'useEffect 与 useLayoutEffect 的区别',
        'Hooks 在 SSR 中的注意事项'
      ]
    },
    company: '字节跳动',
    position: '资深前端',
    order: 20
  },
  // -------------------- 高级知识点 --------------------
  {
    // React Fiber 架构（高级难度）
    title: 'React Fiber 架构',
    category: 'React',
    level: KnowledgeLevel.ADVANCED,
    tags: ['React', 'Fiber', '源码', '架构'],
    content: {
      summary: 'Fiber 是 React 16 引入的新协调引擎，实现了增量渲染和可中断的更新。',
      detail: `## Fiber 架构

Fiber 将渲染工作分解成小单元，可以暂停、中断和恢复，实现时间切片和优先级调度。

## 核心概念

1. **Fiber 节点**: 虚拟 DOM 的增强版，包含更多信息
2. **双缓冲**: current 树和 workInProgress 树
3. **优先级调度**: 不同任务有不同优先级

## 工作流程

1. **调度阶段（Scheduler）**: 调度任务优先级
2. **协调阶段（Reconciler）**: 计算变更，可中断
3. **提交阶段（Commit）**: 应用 DOM 变更，不可中断`,
      interviewQuestion: '请解释 React Fiber 架构的核心原理？它解决了什么问题？',
      standardAnswer: 'Fiber 通过将渲染工作分片、实现优先级调度来解决大组件树更新时的卡顿问题。使用双缓冲和可中断的协调过程，保证高优先级任务（如用户输入）能够及时响应。',
      commonMistakes: [
        '混淆协调阶段和提交阶段',
        '不理解时间切片的工作原理',
        '忽略优先级调度的实际应用'
      ],
      extensions: [
        'Concurrent Mode 的新特性',
        'Suspense 的实现原理',
        '自定义 Scheduler 的应用'
      ]
    },
    company: '字节跳动',
    position: '资深前端',
    order: 30
  }
];

// ============================================================
// 编程题数据定义
// ============================================================

/**
 * 初始编程题数据数组
 * 包含前端面试常见的编程题目
 */
const problemData = [
  {
    // 题目标题
    title: '实现防抖函数（debounce）',
    // 难度：简单
    difficulty: ProblemDifficulty.EASY,
    // 题目分类
    category: '函数实现',
    // 相关标签
    tags: ['防抖', '节流', '性能优化', '面试高频'],
    // 题目描述（Markdown 格式）
    description: `## 题目描述

实现一个防抖函数 \`debounce\`，在事件被触发后等待指定时间再执行回调，如果在等待期间事件再次被触发，则重新计时。

## 函数签名

\`\`\`javascript
function debounce(fn, delay) {
  // 实现代码
}
\`\`\`

## 要求

1. 返回一个新函数，该函数在被调用后延迟 delay 毫秒执行 fn
2. 如果在 delay 时间内再次调用，则重新计时
3. 正确处理 this 指向和参数传递`,
    // 示例数组
    examples: [
      {
        // 输入示例
        input: 'debounce(() => console.log("clicked"), 300)',
        // 输出说明
        output: '连续点击时只在最后一次点击后 300ms 执行',
        // 详细解释
        explanation: '多次快速点击按钮，只会在停止点击 300ms 后执行一次回调'
      }
    ],
    // 约束条件
    constraints: [
      'delay 为正整数',
      '需要正确处理 this 上下文',
      '需要正确传递参数'
    ],
    // 提示信息
    hints: [
      '使用 setTimeout 和 clearTimeout',
      '使用闭包保存定时器引用',
      '使用 apply 或 call 处理 this 和参数'
    ],
    // 代码模板（支持多语言）
    codeTemplate: {
      // JavaScript 模板
      javascript: `/**
 * 实现防抖函数
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} - 防抖后的函数
 */
function debounce(fn, delay) {
  // 在这里实现你的代码
  
}

// 测试代码
const debouncedFn = debounce((x) => console.log(x), 300);
`,
      // TypeScript 模板
      typescript: `/**
 * 实现防抖函数
 * @param fn - 需要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  // 在这里实现你的代码
  
}
`
    },
    // 测试用例
    testCases: [
      {
        // 测试输入
        input: '{ fn: (x) => x * 2, delay: 100, calls: [1, 2, 3], interval: 50 }',
        // 期望输出
        expectedOutput: '6',
        // 测试描述
        description: '连续调用，只执行最后一次'
      },
      {
        input: '{ fn: (a, b) => a + b, delay: 100, calls: [[1, 2]], interval: 0 }',
        expectedOutput: '3',
        description: '正确传递多个参数'
      }
    ],
    // 参考答案
    solution: {
      // 答案代码
      code: `function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer);
    }
    
    // 设置新的定时器
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}`,
      // 解题思路
      explanation: `1. 使用闭包保存 timer 变量
2. 每次调用时先清除之前的定时器
3. 设置新的定时器，在 delay 后执行
4. 使用 apply 保持正确的 this 上下文和参数`,
      // 时间复杂度
      timeComplexity: 'O(1)',
      // 空间复杂度
      spaceComplexity: 'O(1)'
    },
    // 是否免费：true 表示所有用户可见
    isFree: true,
    // 排序顺序
    order: 1
  },
  {
    // 节流函数题目
    title: '实现节流函数（throttle）',
    difficulty: ProblemDifficulty.EASY,
    category: '函数实现',
    tags: ['节流', '防抖', '性能优化', '面试高频'],
    description: `## 题目描述

实现一个节流函数 \`throttle\`，在指定时间间隔内只执行一次函数。

## 函数签名

\`\`\`javascript
function throttle(fn, interval) {
  // 实现代码
}
\`\`\``,
    examples: [
      {
        input: 'throttle(() => console.log("scroll"), 100)',
        output: '滚动时每 100ms 最多执行一次'
      }
    ],
    constraints: ['interval 为正整数'],
    hints: ['记录上次执行时间', '比较当前时间与上次执行时间'],
    codeTemplate: {
      javascript: `function throttle(fn, interval) {
  // 在这里实现你的代码
  
}`,
      typescript: `function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  // 在这里实现你的代码
  
}`
    },
    testCases: [
      {
        input: '{ fn: () => 1, interval: 100, calls: 5, totalTime: 250 }',
        expectedOutput: '3',
        description: '250ms 内调用 5 次，间隔 100ms，执行 3 次'
      }
    ],
    solution: {
      code: `function throttle(fn, interval) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastTime >= interval) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}`,
      explanation: '记录上次执行时间，只有间隔超过 interval 才执行',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)'
    },
    isFree: true,
    order: 2
  },
  {
    // 深拷贝题目（中等难度）
    title: '实现深拷贝（deepClone）',
    difficulty: ProblemDifficulty.MEDIUM,
    category: '对象操作',
    tags: ['深拷贝', '递归', '面试高频'],
    description: `## 题目描述

实现一个深拷贝函数，能够正确处理各种数据类型。

## 要求

1. 支持基本类型、对象、数组
2. 处理循环引用
3. 处理特殊对象（Date、RegExp、Map、Set）`,
    examples: [
      {
        input: '{ a: 1, b: { c: 2 } }',
        output: '完全独立的副本',
        explanation: '修改副本不影响原对象'
      }
    ],
    constraints: ['正确处理循环引用', '支持常见数据类型'],
    hints: ['使用 WeakMap 处理循环引用', '递归处理嵌套对象'],
    codeTemplate: {
      javascript: `function deepClone(obj, hash = new WeakMap()) {
  // 在这里实现你的代码
  
}`,
      typescript: `function deepClone<T>(obj: T, hash = new WeakMap()): T {
  // 在这里实现你的代码
  
}`
    },
    testCases: [
      {
        input: '{ a: 1, b: [1, 2, 3] }',
        expectedOutput: '{ a: 1, b: [1, 2, 3] }',
        description: '基本对象和数组'
      }
    ],
    solution: {
      code: `function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  const clone = Array.isArray(obj) ? [] : {};
  hash.set(obj, clone);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], hash);
    }
  }
  
  return clone;
}`,
      explanation: '使用 WeakMap 解决循环引用，递归处理嵌套结构',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    // 非免费内容，需要会员权限
    isFree: false,
    order: 10
  },
  {
    // Promise.all 实现题目（中等难度）
    title: '实现 Promise.all',
    difficulty: ProblemDifficulty.MEDIUM,
    category: 'Promise/异步',
    tags: ['Promise', '异步', '面试高频'],
    description: `## 题目描述

实现 Promise.all 方法，接收一个 Promise 数组，返回一个新的 Promise。

## 要求

1. 所有 Promise 成功时返回结果数组
2. 任一 Promise 失败时立即 reject
3. 保持结果顺序与输入顺序一致`,
    examples: [
      {
        input: 'Promise.all([p1, p2, p3])',
        output: '[result1, result2, result3]'
      }
    ],
    constraints: ['正确处理空数组', '保持结果顺序'],
    hints: ['使用计数器跟踪完成数量', '使用索引保证顺序'],
    codeTemplate: {
      javascript: `function promiseAll(promises) {
  // 在这里实现你的代码
  
}`,
      typescript: `function promiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  // 在这里实现你的代码
  
}`
    },
    testCases: [
      {
        input: '[Promise.resolve(1), Promise.resolve(2)]',
        expectedOutput: '[1, 2]',
        description: '全部成功'
      }
    ],
    solution: {
      code: `function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!promises.length) {
      resolve([]);
      return;
    }
    
    const results = [];
    let count = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          count++;
          
          if (count === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
}`,
      explanation: '使用计数器跟踪完成的 Promise 数量，使用索引保证结果顺序',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    isFree: false,
    order: 11
  }
];

// ============================================================
// 算法题数据定义
// ============================================================

/**
 * 初始算法题数据数组
 * 包含常见的算法题目和动画演示配置
 */
const algorithmData = [
  {
    // 算法题目标题
    title: '冒泡排序',
    // 算法分类：基础算法
    category: AlgorithmCategory.BASIC,
    // 相关标签
    tags: ['排序', '基础算法'],
    // 算法描述（Markdown 格式）
    description: `## 算法描述

冒泡排序是一种简单的排序算法，重复遍历数组，比较相邻元素并交换。

## 算法步骤

1. 比较相邻的两个元素，如果前者大于后者则交换
2. 对每一对相邻元素做同样的工作
3. 重复以上步骤，每轮将最大元素"冒泡"到末尾`,
    // 代码模板
    codeTemplate: {
      javascript: `function bubbleSort(arr) {
  // 在这里实现冒泡排序
  
}`,
      typescript: `function bubbleSort(arr: number[]): number[] {
  // 在这里实现冒泡排序
  
}`
    },
    // 参考答案
    solution: {
      code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      explanation: '双层循环，外层控制轮数，内层进行相邻比较和交换',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    // 动画配置
    animation: {
      // 动画类型：数组可视化
      type: 'array' as const,
      // 默认数据
      defaultData: '[64, 34, 25, 12, 22, 11, 90]',
      // 动画步骤数组
      steps: [
        {
          // 步骤编号
          stepNumber: 1,
          // 步骤描述
          description: '比较 64 和 34，64 > 34，交换',
          // 代码高亮范围
          codeHighlight: { startLine: 4, endLine: 6 },
          // 当前数据状态
          dataState: '[34, 64, 25, 12, 22, 11, 90]'
        },
        {
          stepNumber: 2,
          description: '比较 64 和 25，64 > 25，交换',
          codeHighlight: { startLine: 4, endLine: 6 },
          dataState: '[34, 25, 64, 12, 22, 11, 90]'
        },
        {
          stepNumber: 3,
          description: '继续比较和交换...',
          codeHighlight: { startLine: 4, endLine: 6 },
          dataState: '[34, 25, 12, 22, 11, 64, 90]'
        }
      ]
    },
    // 测试用例
    testCases: [
      { input: '[64, 34, 25, 12, 22, 11, 90]', expectedOutput: '[11, 12, 22, 25, 34, 64, 90]' },
      { input: '[5, 1, 4, 2, 8]', expectedOutput: '[1, 2, 4, 5, 8]' }
    ],
    // 是否免费
    isFree: true,
    // 排序顺序
    order: 1
  },
  {
    // 两数之和算法题
    title: '两数之和',
    category: AlgorithmCategory.BASIC,
    tags: ['数组', '哈希表', 'LeetCode'],
    description: `## 算法描述

给定一个整数数组和一个目标值，找出数组中和为目标值的两个数的索引。

## 要求

- 假设每种输入只有一个答案
- 不能重复使用同一个元素`,
    codeTemplate: {
      javascript: `function twoSum(nums, target) {
  // 在这里实现
  
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  // 在这里实现
  
}`
    },
    solution: {
      code: `function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`,
      explanation: '使用哈希表存储已遍历的值及其索引，查找补数',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    animation: {
      type: 'array' as const,
      defaultData: '{ nums: [2, 7, 11, 15], target: 9 }',
      steps: [
        {
          stepNumber: 1,
          description: '遍历 2，补数 7 不在 Map 中，存入 Map',
          codeHighlight: { startLine: 4, endLine: 10 },
          dataState: 'Map: {2: 0}'
        },
        {
          stepNumber: 2,
          description: '遍历 7，补数 2 在 Map 中，返回 [0, 1]',
          codeHighlight: { startLine: 6, endLine: 8 },
          dataState: '找到答案: [0, 1]'
        }
      ]
    },
    testCases: [
      { input: '{ nums: [2, 7, 11, 15], target: 9 }', expectedOutput: '[0, 1]' },
      { input: '{ nums: [3, 2, 4], target: 6 }', expectedOutput: '[1, 2]' }
    ],
    isFree: true,
    order: 2
  },
  {
    // 快速排序算法（中级难度）
    title: '快速排序',
    category: AlgorithmCategory.INTERMEDIATE,
    tags: ['排序', '分治', '递归'],
    description: `## 算法描述

快速排序使用分治策略，选择一个基准元素将数组分为两部分，递归排序。

## 算法步骤

1. 选择基准元素（pivot）
2. 将小于 pivot 的放左边，大于的放右边
3. 递归处理左右两部分`,
    codeTemplate: {
      javascript: `function quickSort(arr) {
  // 在这里实现快速排序
  
}`,
      typescript: `function quickSort(arr: number[]): number[] {
  // 在这里实现快速排序
  
}`
    },
    solution: {
      code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}`,
      explanation: '选择中间元素作为基准，分别筛选出小于、等于、大于基准的元素，递归排序',
      timeComplexity: 'O(n log n) 平均，O(n²) 最坏',
      spaceComplexity: 'O(log n)'
    },
    animation: {
      type: 'array' as const,
      defaultData: '[64, 34, 25, 12, 22, 11, 90]',
      steps: [
        {
          stepNumber: 1,
          description: '选择 12 作为基准',
          codeHighlight: { startLine: 4, endLine: 4 },
          dataState: 'pivot: 12'
        },
        {
          stepNumber: 2,
          description: '分区：左 [11]，中 [12]，右 [64, 34, 25, 22, 90]',
          codeHighlight: { startLine: 5, endLine: 7 },
          dataState: '[11] [12] [64, 34, 25, 22, 90]'
        }
      ]
    },
    testCases: [
      { input: '[64, 34, 25, 12, 22, 11, 90]', expectedOutput: '[11, 12, 22, 25, 34, 64, 90]' }
    ],
    // 非免费内容
    isFree: false,
    order: 10
  },
  {
    // 二叉树层序遍历（中级难度）
    title: '二叉树层序遍历',
    category: AlgorithmCategory.INTERMEDIATE,
    tags: ['二叉树', 'BFS', '队列'],
    description: `## 算法描述

层序遍历（广度优先遍历）按层次从上到下、从左到右遍历二叉树。

## 实现方式

使用队列实现 BFS`,
    codeTemplate: {
      javascript: `function levelOrder(root) {
  // 在这里实现层序遍历
  
}`,
      typescript: `function levelOrder(root: TreeNode | null): number[][] {
  // 在这里实现层序遍历
  
}`
    },
    solution: {
      code: `function levelOrder(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length) {
    const level = [];
    const size = queue.length;
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(level);
  }
  
  return result;
}`,
      explanation: '使用队列存储每层节点，逐层处理',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    animation: {
      // 动画类型：树形结构可视化
      type: 'tree' as const,
      defaultData: '{ val: 3, left: { val: 9 }, right: { val: 20, left: { val: 15 }, right: { val: 7 } } }',
      steps: [
        {
          stepNumber: 1,
          description: '访问根节点 3',
          codeHighlight: { startLine: 6, endLine: 8 },
          dataState: 'queue: [3], result: []'
        },
        {
          stepNumber: 2,
          description: '处理第一层，访问 3',
          codeHighlight: { startLine: 10, endLine: 15 },
          dataState: 'queue: [9, 20], result: [[3]]'
        },
        {
          stepNumber: 3,
          description: '处理第二层，访问 9, 20',
          codeHighlight: { startLine: 10, endLine: 15 },
          dataState: 'queue: [15, 7], result: [[3], [9, 20]]'
        }
      ]
    },
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]' }
    ],
    isFree: false,
    order: 11
  }
];

// ============================================================
// 数据库初始化函数
// ============================================================

/**
 * 执行数据库初始化
 * 清空现有数据并插入测试数据
 */
async function seed() {
  try {
    // 输出开始信息
    console.log('🌱 开始初始化数据库...\n');

    // 连接 MongoDB 数据库
    await mongoose.connect(config.mongodbUri);
    // 连接成功提示
    console.log('✅ 数据库连接成功\n');

    // -------------------- 清空现有数据 --------------------
    console.log('🗑️  清空现有数据...');
    // 并行删除所有集合的数据
    await Promise.all([
      User.deleteMany({}),      // 清空用户表
      Knowledge.deleteMany({}), // 清空知识点表
      Problem.deleteMany({}),   // 清空编程题表
      Algorithm.deleteMany({}), // 清空算法题表
    ]);
    console.log('✅ 数据清空完成\n');

    // -------------------- 创建管理员账号 --------------------
    console.log('👤 创建管理员账号...');
    // 创建超级管理员用户
    const admin = await User.create({
      // 使用配置文件中的管理员邮箱
      email: config.admin.email,
      // 使用配置文件中的管理员密码
      password: config.admin.password,
      // 管理员昵称
      nickname: '超级管理员',
      // 设置为管理员角色
      role: UserRole.ADMIN,
      // 初始化学习进度
      learningProgress: {
        completedKnowledge: [],  // 已完成的知识点
        completedProblems: [],   // 已完成的编程题
        completedAlgorithms: [], // 已完成的算法题
      },
      // 初始化收藏
      favorites: {
        knowledge: [],  // 收藏的知识点
        problems: [],   // 收藏的编程题
        algorithms: [], // 收藏的算法题
      },
      // 初始化薄弱点
      weakPoints: [],
    });
    // 输出创建成功信息
    console.log(`✅ 管理员账号创建成功: ${admin.email}\n`);

    // -------------------- 创建测试用户 --------------------
    console.log('👥 创建测试用户...');
    // 创建普通测试用户
    const testUser = await User.create({
      email: 'user@test.com',
      password: 'Test@123456',
      nickname: '测试用户',
      // 普通用户角色
      role: UserRole.USER,
      learningProgress: {
        completedKnowledge: [],
        completedProblems: [],
        completedAlgorithms: [],
      },
      favorites: {
        knowledge: [],
        problems: [],
        algorithms: [],
      },
      weakPoints: [],
    });
    console.log(`✅ 测试用户创建成功: ${testUser.email}\n`);

    // -------------------- 创建测试会员 --------------------
    // 计算会员过期时间（一个月后）
    const memberExpireAt = new Date();
    memberExpireAt.setMonth(memberExpireAt.getMonth() + 1);
    
    // 创建会员用户
    const testMember = await User.create({
      email: 'member@test.com',
      password: 'Test@123456',
      nickname: '测试会员',
      // 会员角色
      role: UserRole.MEMBER,
      // 设置会员过期时间
      memberExpireAt,
      learningProgress: {
        completedKnowledge: [],
        completedProblems: [],
        completedAlgorithms: [],
      },
      favorites: {
        knowledge: [],
        problems: [],
        algorithms: [],
      },
      weakPoints: [],
    });
    console.log(`✅ 测试会员创建成功: ${testMember.email}\n`);

    // -------------------- 插入知识点数据 --------------------
    console.log('📚 插入知识点数据...');
    // 批量插入知识点
    const knowledge = await Knowledge.insertMany(knowledgeData);
    // 输出插入数量
    console.log(`✅ 成功插入 ${knowledge.length} 个知识点\n`);

    // -------------------- 插入编程题数据 --------------------
    console.log('💻 插入编程题数据...');
    // 批量插入编程题
    const problems = await Problem.insertMany(problemData);
    console.log(`✅ 成功插入 ${problems.length} 道编程题\n`);

    // -------------------- 插入算法题数据 --------------------
    console.log('🧮 插入算法题数据...');
    // 批量插入算法题
    const algorithms = await Algorithm.insertMany(algorithmData);
    console.log(`✅ 成功插入 ${algorithms.length} 道算法题\n`);

    // -------------------- 输出完成信息 --------------------
    // 打印分隔线
    console.log('═'.repeat(50));
    console.log('🎉 数据库初始化完成！');
    console.log('═'.repeat(50));
    // 打印测试账号信息
    console.log('\n📋 账号信息:');
    console.log(`   管理员: ${config.admin.email} / ${config.admin.password}`);
    console.log('   普通用户: user@test.com / Test@123456');
    console.log('   会员用户: member@test.com / Test@123456');
    console.log('\n');

  } catch (error) {
    // 捕获并输出错误信息
    console.error('❌ 初始化失败:', error);
  } finally {
    // 无论成功失败，最后都关闭数据库连接
    await mongoose.connection.close();
    // 退出进程
    process.exit(0);
  }
}

// 执行初始化函数
seed();
