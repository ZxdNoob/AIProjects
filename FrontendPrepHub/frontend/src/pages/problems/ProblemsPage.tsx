import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemApi } from '@/services/api';
import { Problem, ProblemDifficulty } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { Code2, Search, Lock, CheckCircle, XCircle } from 'lucide-react';

const ProblemsPage: React.FC = () => {
  const { isMember } = useAuthStore();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchProblems();
  }, [selectedDifficulty, selectedCategory, searchTerm]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await problemApi.getList({
        difficulty: selectedDifficulty || undefined,
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
        limit: 50,
      });
      if (response.success && response.data) {
        setProblems(response.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyBadge = (difficulty: ProblemDifficulty) => {
    const styles = {
      [ProblemDifficulty.EASY]: 'badge-success',
      [ProblemDifficulty.MEDIUM]: 'badge-warning',
      [ProblemDifficulty.HARD]: 'badge-danger',
    };
    const labels = {
      [ProblemDifficulty.EASY]: '简单',
      [ProblemDifficulty.MEDIUM]: '中等',
      [ProblemDifficulty.HARD]: '困难',
    };
    return <span className={styles[difficulty]}>{labels[difficulty]}</span>;
  };

  const isLocked = (problem: Problem) => {
    if (isMember()) return false;
    return !problem.isFree;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页头 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-100 mb-2">编程题库</h1>
        <p className="text-dark-400">
          50 道高频手写题，覆盖面试常考场景
        </p>
      </div>

      {/* 筛选 */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索题目..."
            className="input pl-12"
          />
        </div>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="input w-full md:w-40"
        >
          <option value="">全部难度</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input w-full md:w-48"
        >
          <option value="">全部分类</option>
          <option value="数组操作">数组操作</option>
          <option value="字符串处理">字符串处理</option>
          <option value="Promise/异步">Promise/异步</option>
          <option value="函数实现">函数实现</option>
          <option value="对象操作">对象操作</option>
        </select>
      </div>

      {/* 题目列表 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="loader" />
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-20">
          <Code2 className="w-16 h-16 mx-auto mb-4 text-dark-600" />
          <p className="text-dark-400">暂无相关题目</p>
        </div>
      ) : (
        <div className="space-y-3">
          {problems.map((problem, index) => (
            <Link
              key={problem._id}
              to={isLocked(problem) ? '#' : `/problems/${problem._id}`}
              className={`card flex items-center justify-between
                        hover:border-primary-500/50 transition-all
                        ${isLocked(problem) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <span className="text-dark-500 w-8">{index + 1}</span>
                <div>
                  <h3 className="text-dark-100 font-medium">
                    {problem.title}
                  </h3>
                  <div className="flex items-center space-x-3 mt-1">
                    {getDifficultyBadge(problem.difficulty)}
                    <span className="text-xs text-dark-500">{problem.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* 通过率 */}
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-dark-400">
                    通过率 {problem.acceptRate || '0.0'}%
                  </p>
                  <p className="text-xs text-dark-500">
                    {problem.acceptCount}/{problem.submitCount} 次提交
                  </p>
                </div>

                {/* 状态图标 */}
                {isLocked(problem) ? (
                  <Lock className="w-5 h-5 text-dark-500" />
                ) : problem.isFree ? (
                  <span className="badge-primary text-xs">免费</span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProblemsPage;

