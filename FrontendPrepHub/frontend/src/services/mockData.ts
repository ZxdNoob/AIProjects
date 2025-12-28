/**
 * Mock 数据模块
 * 当后端服务不可用时，提供模拟数据用于 GitHub Pages 预览
 */

import { User, Knowledge, Problem, Algorithm, UserRole } from '@/types';

// ============================================================
// Mock 用户数据
// ============================================================

export const mockUsers: User[] = [
  {
    _id: 'mock-user-1',
    email: 'demo@example.com',
    nickname: '演示用户',
    role: UserRole.MEMBER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock-admin-1',
    email: 'admin@example.com',
    nickname: '管理员',
    role: UserRole.ADMIN,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================
// Mock 知识点数据
// ============================================================

export const mockKnowledge: Knowledge[] = [
  {
    _id: 'k1',
    title: 'JavaScript 闭包详解',
    category: 'JavaScript',
    level: 'intermediate',
    content: `
# 闭包 (Closure)

闭包是 JavaScript 中一个重要的概念，指的是函数能够访问其词法作用域中的变量，即使函数在其词法作用域之外执行。

## 基本概念

\`\`\`javascript
function outer() {
  let count = 0;
  return function inner() {
    count++;
    return count;
  };
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
\`\`\`

## 常见应用场景

1. **数据私有化**
2. **函数工厂**
3. **模块模式**
4. **回调函数**

## 面试要点

- 闭包的定义和原理
- 闭包的内存管理
- 闭包的实际应用
    `,
    tags: ['闭包', '作用域', '高频考点'],
    companies: ['字节跳动', '阿里巴巴', '腾讯'],
    isFree: true,
    viewCount: 1234,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'k2',
    title: 'React Hooks 原理与实践',
    category: 'React',
    level: 'advanced',
    content: `
# React Hooks 深入理解

## useState 原理

useState 使用链表结构存储状态，每次渲染时按顺序读取。

## useEffect 执行时机

- 首次渲染后执行
- 依赖项变化后执行
- 组件卸载时执行清理函数

## 自定义 Hook

\`\`\`typescript
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  return { count, increment, decrement };
}
\`\`\`
    `,
    tags: ['React', 'Hooks', '原理'],
    companies: ['美团', '快手', '滴滴'],
    isFree: true,
    viewCount: 2156,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'k3',
    title: 'CSS Flexbox 布局完全指南',
    category: 'CSS',
    level: 'basic',
    content: `
# Flexbox 布局

## 容器属性

- \`display: flex\`
- \`flex-direction\`
- \`justify-content\`
- \`align-items\`
- \`flex-wrap\`

## 项目属性

- \`flex-grow\`
- \`flex-shrink\`
- \`flex-basis\`
- \`order\`
- \`align-self\`
    `,
    tags: ['CSS', '布局', 'Flexbox'],
    companies: ['百度', '网易', '小米'],
    isFree: true,
    viewCount: 876,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'k4',
    title: 'TypeScript 泛型高级用法',
    category: 'TypeScript',
    level: 'advanced',
    content: `
# TypeScript 泛型

## 基础泛型

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}
\`\`\`

## 泛型约束

\`\`\`typescript
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}
\`\`\`

## 条件类型

\`\`\`typescript
type NonNullable<T> = T extends null | undefined ? never : T;
\`\`\`
    `,
    tags: ['TypeScript', '泛型', '类型系统'],
    companies: ['字节跳动', '微软', '阿里巴巴'],
    isFree: false,
    viewCount: 654,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================
// Mock 编程题数据
// ============================================================

export const mockProblems: Problem[] = [
  {
    _id: 'p1',
    title: '实现 debounce 防抖函数',
    difficulty: 'medium',
    category: '手写题',
    description: `
实现一个 debounce 防抖函数，要求：

1. 在指定时间内只执行一次
2. 支持立即执行选项
3. 返回函数执行结果

## 示例

\`\`\`javascript
const debouncedFn = debounce(fn, 300);
debouncedFn(); // 300ms 后执行
debouncedFn(); // 重新计时
\`\`\`
    `,
    template: `function debounce(fn, delay, immediate = false) {
  // 在此实现
}`,
    solution: `function debounce(fn, delay, immediate = false) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    if (immediate && !timer) {
      fn.apply(this, args);
    }
    timer = setTimeout(() => {
      if (!immediate) fn.apply(this, args);
      timer = null;
    }, delay);
  };
}`,
    testCases: [
      { input: '基础测试', expected: 'pass' },
    ],
    tags: ['防抖', '手写题', '高频'],
    isFree: true,
    submitCount: 1245,
    acceptCount: 892,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p2',
    title: '实现 Promise.all',
    difficulty: 'medium',
    category: '手写题',
    description: `
实现 Promise.all 方法，要求：

1. 接收一个 Promise 数组
2. 所有 Promise 成功时返回结果数组
3. 任一 Promise 失败时立即 reject
    `,
    template: `function promiseAll(promises) {
  // 在此实现
}`,
    solution: `function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let count = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        value => {
          results[i] = value;
          if (++count === promises.length) {
            resolve(results);
          }
        },
        reject
      );
    });
  });
}`,
    testCases: [],
    tags: ['Promise', '手写题'],
    isFree: true,
    submitCount: 987,
    acceptCount: 654,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p3',
    title: '实现深拷贝函数',
    difficulty: 'hard',
    category: '手写题',
    description: `
实现一个深拷贝函数，要求：

1. 支持基本类型和引用类型
2. 处理循环引用
3. 支持 Date、RegExp、Map、Set 等特殊对象
    `,
    template: `function deepClone(obj, map = new WeakMap()) {
  // 在此实现
}`,
    solution: `function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (map.has(obj)) return map.get(obj);
  
  let clone;
  if (obj instanceof Date) clone = new Date(obj);
  else if (obj instanceof RegExp) clone = new RegExp(obj);
  else if (obj instanceof Map) {
    clone = new Map();
    map.set(obj, clone);
    obj.forEach((v, k) => clone.set(deepClone(k, map), deepClone(v, map)));
    return clone;
  } else if (obj instanceof Set) {
    clone = new Set();
    map.set(obj, clone);
    obj.forEach(v => clone.add(deepClone(v, map)));
    return clone;
  } else {
    clone = Array.isArray(obj) ? [] : {};
  }
  
  map.set(obj, clone);
  Object.keys(obj).forEach(key => {
    clone[key] = deepClone(obj[key], map);
  });
  return clone;
}`,
    testCases: [],
    tags: ['深拷贝', '手写题', '高频'],
    isFree: false,
    submitCount: 756,
    acceptCount: 423,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================
// Mock 算法题数据
// ============================================================

export const mockAlgorithms: Algorithm[] = [
  {
    _id: 'a1',
    title: '冒泡排序',
    category: '排序算法',
    description: `
# 冒泡排序

通过重复遍历要排序的列表，比较相邻元素并交换位置。

## 时间复杂度
- 最好：O(n)
- 最坏：O(n²)
- 平均：O(n²)

## 空间复杂度
O(1)
    `,
    animationType: 'array',
    defaultInput: '[5, 3, 8, 4, 2]',
    solution: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    tags: ['排序', '基础'],
    isFree: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'a2',
    title: '快速排序',
    category: '排序算法',
    description: `
# 快速排序

分治法的典型应用，选择基准元素，将数组分为两部分。

## 时间复杂度
- 最好：O(n log n)
- 最坏：O(n²)
- 平均：O(n log n)
    `,
    animationType: 'array',
    defaultInput: '[5, 3, 8, 4, 2, 7, 1, 6]',
    solution: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
}`,
    tags: ['排序', '分治', '高频'],
    isFree: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'a3',
    title: '二分查找',
    category: '查找算法',
    description: `
# 二分查找

在有序数组中查找目标值的高效算法。

## 时间复杂度
O(log n)

## 空间复杂度
O(1)
    `,
    animationType: 'array',
    defaultInput: '[1, 3, 5, 7, 9, 11, 13], target: 7',
    solution: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    tags: ['查找', '二分', '高频'],
    isFree: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================
// Mock 学习进度数据
// ============================================================

export const mockLearningProgress = {
  overview: {
    knowledge: { completed: 12, total: 80, percentage: '15%' },
    problems: { completed: 8, total: 50, percentage: '16%' },
    algorithms: { completed: 5, total: 30, percentage: '17%' },
  },
  categoryProgress: [
    { category: 'JavaScript', completed: 5, total: 20 },
    { category: 'React', completed: 3, total: 15 },
    { category: 'CSS', completed: 2, total: 10 },
    { category: 'TypeScript', completed: 2, total: 15 },
  ],
  studyPlan: {
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    targetLevel: 'intermediate',
    dailyTasks: ['完成 2 个知识点', '做 1 道编程题', '复习错题'],
  },
  recentActivity: [
    { type: 'knowledge', title: 'JavaScript 闭包详解', date: new Date().toISOString() },
    { type: 'problem', title: '实现 debounce', date: new Date().toISOString() },
  ],
};

// ============================================================
// Mock API 响应生成器
// ============================================================

export function createMockResponse<T>(data: T, message = 'success') {
  return {
    success: true,
    message,
    data,
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  page = 1,
  limit = 10
) {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedItems = items.slice(start, end);
  
  return {
    success: true,
    message: 'success',
    data: {
      items: paginatedItems,
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

