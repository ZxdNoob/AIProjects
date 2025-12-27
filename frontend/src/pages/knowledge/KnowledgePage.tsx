import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { knowledgeApi } from '@/services/api';
import { Knowledge, KnowledgeLevel } from '@/types';
import { BookOpen, Search, Filter, ChevronRight, Eye, Star, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const KnowledgePage: React.FC = () => {
  const { isMember } = useAuthStore();
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedLevel, searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await knowledgeApi.getList({
        category: selectedCategory || undefined,
        level: selectedLevel || undefined,
        search: searchTerm || undefined,
        limit: 50,
      });
      if (response.success && response.data) {
        setKnowledgeList(response.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await knowledgeApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const getLevelBadge = (level: KnowledgeLevel) => {
    const styles = {
      [KnowledgeLevel.BASIC]: 'badge-success',
      [KnowledgeLevel.INTERMEDIATE]: 'badge-warning',
      [KnowledgeLevel.ADVANCED]: 'badge-danger',
    };
    const labels = {
      [KnowledgeLevel.BASIC]: '基础',
      [KnowledgeLevel.INTERMEDIATE]: '进阶',
      [KnowledgeLevel.ADVANCED]: '原理',
    };
    return (
      <span className={styles[level]}>
        {labels[level]}
      </span>
    );
  };

  const isLocked = (level: KnowledgeLevel) => {
    if (isMember()) return false;
    return level === KnowledgeLevel.ADVANCED;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页头 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-100 mb-2">知识学习</h1>
        <p className="text-dark-400">
          系统化的前端知识体系，覆盖面试高频考点
        </p>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索知识点..."
            className="input pl-12"
          />
        </div>

        {/* 分类筛选 */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input w-full md:w-48"
        >
          <option value="">全部分类</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name} ({cat.count})
            </option>
          ))}
        </select>

        {/* 难度筛选 */}
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="input w-full md:w-40"
        >
          <option value="">全部难度</option>
          <option value="basic">基础</option>
          <option value="intermediate">进阶</option>
          <option value="advanced">原理</option>
        </select>
      </div>

      {/* 知识点列表 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="loader" />
        </div>
      ) : knowledgeList.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-dark-600" />
          <p className="text-dark-400">暂无相关知识点</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {knowledgeList.map((item) => (
            <Link
              key={item._id}
              to={isLocked(item.level) ? '#' : `/knowledge/${item._id}`}
              className={`card-hover group ${isLocked(item.level) ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getLevelBadge(item.level)}
                  <span className="text-xs text-dark-500">{item.category}</span>
                </div>
                {isLocked(item.level) && (
                  <Lock className="w-4 h-4 text-dark-500" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-dark-100 mb-2 
                           group-hover:text-primary-300 transition-colors">
                {item.title}
              </h3>

              <p className="text-dark-400 text-sm mb-4 line-clamp-2">
                {item.content.summary}
              </p>

              <div className="flex items-center justify-between text-xs text-dark-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{item.viewCount}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{item.favoriteCount}</span>
                  </span>
                </div>
                {item.company && (
                  <span className="text-primary-400">{item.company}</span>
                )}
              </div>

              {/* 标签 */}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.tags.slice(0, 3).map((tag) => (
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

export default KnowledgePage;

