import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { learningApi } from '@/services/api';
import { WrongRecord } from '@/types';
import { AlertCircle, CheckCircle, RefreshCw, Loader2, Code2, PlayCircle } from 'lucide-react';

const WrongRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<WrongRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'problem' | 'algorithm'>('all');
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [filter, showResolved]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await learningApi.getWrongRecords({
        type: filter === 'all' ? undefined : filter,
        isResolved: showResolved ? undefined : false,
        limit: 50,
      });
      if (response.success && response.data) {
        setRecords(response.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch wrong records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await learningApi.resolveWrongRecord(id);
      fetchRecords();
    } catch (error) {
      console.error('Failed to resolve:', error);
    }
  };

  const handleReview = async (id: string) => {
    try {
      await learningApi.reviewWrongRecord(id);
      fetchRecords();
    } catch (error) {
      console.error('Failed to review:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-100">错题本</h1>
          <p className="text-dark-400 mt-1">记录和复习你的错题</p>
        </div>
      </div>

      {/* 筛选 */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center space-x-2">
          {['all', 'problem', 'algorithm'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-4 py-2 rounded-lg transition-colors
                ${filter === type
                  ? 'bg-primary-500/20 text-primary-300'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                }`}
            >
              {type === 'all' ? '全部' : type === 'problem' ? '编程题' : '算法题'}
            </button>
          ))}
        </div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500"
          />
          <span className="text-dark-400 text-sm">显示已解决</span>
        </label>
      </div>

      {/* 错题列表 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success-500" />
          <h3 className="text-xl font-semibold text-dark-100 mb-2">
            太棒了！没有错题
          </h3>
          <p className="text-dark-400">继续保持，加油练习！</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record._id}
              className={`card flex items-start justify-between
                ${record.isResolved ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center
                    ${record.type === 'problem'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-orange-500/20 text-orange-400'
                    }`}
                >
                  {record.type === 'problem' ? (
                    <Code2 className="w-5 h-5" />
                  ) : (
                    <PlayCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <Link
                    to={`/${record.type === 'problem' ? 'problems' : 'algorithms'}/${
                      record.problemId || record.algorithmId
                    }`}
                    className="text-dark-100 font-medium hover:text-primary-300 transition-colors"
                  >
                    {(record as any).problem?.title ||
                      (record as any).algorithm?.title ||
                      '未知题目'}
                  </Link>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-dark-500">
                    <span>错误 {record.wrongCount} 次</span>
                    <span>复习 {record.reviewCount} 次</span>
                    <span>
                      最后错误: {new Date(record.lastWrongAt).toLocaleDateString()}
                    </span>
                  </div>
                  {record.notes && (
                    <p className="text-sm text-dark-400 mt-2 p-2 bg-dark-900/50 rounded">
                      📝 {record.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!record.isResolved && (
                  <>
                    <button
                      onClick={() => handleReview(record._id)}
                      className="btn-ghost btn-sm flex items-center space-x-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>复习</span>
                    </button>
                    <button
                      onClick={() => handleResolve(record._id)}
                      className="btn-ghost btn-sm flex items-center space-x-1 text-success-500"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>已解决</span>
                    </button>
                  </>
                )}
                {record.isResolved && (
                  <span className="badge-success">已解决</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WrongRecordsPage;

