import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { algorithmApi } from '@/services/api';
import { Algorithm, AlgorithmCategory } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { PlayCircle, Search, Lock, Eye } from 'lucide-react';

const AlgorithmsPage: React.FC = () => {
  const { isMember } = useAuthStore();
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchAlgorithms();
  }, [selectedCategory, searchTerm]);

  const fetchAlgorithms = async () => {
    try {
      setLoading(true);
      const response = await algorithmApi.getList({
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
        limit: 50,
      });
      if (response.success && response.data) {
        setAlgorithms(response.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch algorithms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: AlgorithmCategory) => {
    const styles = {
      [AlgorithmCategory.BASIC]: 'badge-success',
      [AlgorithmCategory.INTERMEDIATE]: 'badge-warning',
      [AlgorithmCategory.ADVANCED]: 'badge-danger',
    };
    const labels = {
      [AlgorithmCategory.BASIC]: '基础',
      [AlgorithmCategory.INTERMEDIATE]: '进阶',
      [AlgorithmCategory.ADVANCED]: '高级',
    };
    return <span className={styles[category]}>{labels[category]}</span>;
  };

  const isLocked = (algorithm: Algorithm) => {
    if (isMember()) return false;
    return !algorithm.isFree;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页头 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-100 mb-2">算法动画</h1>
        <p className="text-dark-400">
          30 道经典算法可视化演示，直观理解算法执行过程
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
            placeholder="搜索算法..."
            className="input pl-12"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input w-full md:w-40"
        >
          <option value="">全部难度</option>
          <option value="basic">基础</option>
          <option value="intermediate">进阶</option>
          <option value="advanced">高级</option>
        </select>
      </div>

      {/* 算法列表 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="loader" />
        </div>
      ) : algorithms.length === 0 ? (
        <div className="text-center py-20">
          <PlayCircle className="w-16 h-16 mx-auto mb-4 text-dark-600" />
          <p className="text-dark-400">暂无相关算法</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {algorithms.map((algorithm) => (
            <Link
              key={algorithm._id}
              to={isLocked(algorithm) ? '#' : `/algorithms/${algorithm._id}`}
              className={`card-hover group ${isLocked(algorithm) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {/* 动画类型图标 */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-400
                            flex items-center justify-center mb-4 
                            group-hover:scale-110 transition-transform">
                <PlayCircle className="w-6 h-6 text-white" />
              </div>

              <div className="flex items-center justify-between mb-2">
                {getCategoryBadge(algorithm.category)}
                {isLocked(algorithm) && <Lock className="w-4 h-4 text-dark-500" />}
              </div>

              <h3 className="text-lg font-semibold text-dark-100 mb-2 
                           group-hover:text-primary-300 transition-colors">
                {algorithm.title}
              </h3>

              <p className="text-dark-400 text-sm mb-4 line-clamp-2">
                {algorithm.description.slice(0, 100)}...
              </p>

              <div className="flex items-center justify-between text-xs text-dark-500">
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{algorithm.viewCount}</span>
                </span>
                <span className="badge bg-dark-700 text-dark-400">
                  {algorithm.animation.type}
                </span>
              </div>

              {/* 标签 */}
              {algorithm.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {algorithm.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-dark-700 text-dark-400 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlgorithmsPage;

