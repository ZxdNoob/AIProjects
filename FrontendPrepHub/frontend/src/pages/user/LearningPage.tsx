import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { learningApi } from '@/services/api';
import {
  BookOpen,
  Code2,
  PlayCircle,
  Target,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const LearningPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progressRes, statsRes] = await Promise.all([
        learningApi.getProgress(),
        learningApi.getStats(),
      ]);

      if (progressRes.success) {
        setProgress(progressRes.data);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const overviewItems = [
    {
      icon: BookOpen,
      label: '知识点',
      completed: progress?.overview?.knowledge?.completed || 0,
      total: progress?.overview?.knowledge?.total || 0,
      percentage: progress?.overview?.knowledge?.percentage || '0',
      color: 'from-blue-500 to-cyan-400',
      link: '/knowledge',
    },
    {
      icon: Code2,
      label: '编程题',
      completed: progress?.overview?.problems?.completed || 0,
      total: progress?.overview?.problems?.total || 0,
      percentage: progress?.overview?.problems?.percentage || '0',
      color: 'from-purple-500 to-pink-400',
      link: '/problems',
    },
    {
      icon: PlayCircle,
      label: '算法题',
      completed: progress?.overview?.algorithms?.completed || 0,
      total: progress?.overview?.algorithms?.total || 0,
      percentage: progress?.overview?.algorithms?.percentage || '0',
      color: 'from-orange-500 to-yellow-400',
      link: '/algorithms',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-100">学习进度</h1>
          <p className="text-dark-400 mt-1">跟踪你的面试备战进度</p>
        </div>
        <Link to="/wrong-records" className="btn-secondary flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>错题本</span>
        </Link>
      </div>

      {/* 总体进度 */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {overviewItems.map((item) => (
          <Link key={item.label} to={item.link} className="card-hover">
            <div className="flex items-center space-x-4 mb-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color}
                          flex items-center justify-center`}
              >
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-dark-400 text-sm">{item.label}</p>
                <p className="text-2xl font-bold text-dark-100">
                  {item.completed}/{item.total}
                </p>
              </div>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${item.color}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <p className="text-right text-sm text-dark-400 mt-2">
              {item.percentage}%
            </p>
          </Link>
        ))}
      </div>

      {/* 学习统计 */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* 提交统计 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            <span>提交统计</span>
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-dark-900/50 rounded-lg">
              <p className="text-2xl font-bold text-dark-100">
                {stats?.submissions?.total || 0}
              </p>
              <p className="text-sm text-dark-400">总提交</p>
            </div>
            <div className="text-center p-4 bg-dark-900/50 rounded-lg">
              <p className="text-2xl font-bold text-success-500">
                {stats?.submissions?.accepted || 0}
              </p>
              <p className="text-sm text-dark-400">通过</p>
            </div>
            <div className="text-center p-4 bg-dark-900/50 rounded-lg">
              <p className="text-2xl font-bold text-primary-400">
                {stats?.submissions?.acceptRate || '0'}%
              </p>
              <p className="text-sm text-dark-400">通过率</p>
            </div>
          </div>
        </div>

        {/* 错题统计 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-warning-500" />
            <span>错题统计</span>
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-dark-900/50 rounded-lg">
              <p className="text-2xl font-bold text-dark-100">
                {stats?.wrongRecords?.total || 0}
              </p>
              <p className="text-sm text-dark-400">总错题</p>
            </div>
            <div className="text-center p-4 bg-dark-900/50 rounded-lg">
              <p className="text-2xl font-bold text-success-500">
                {stats?.wrongRecords?.resolved || 0}
              </p>
              <p className="text-sm text-dark-400">已解决</p>
            </div>
            <div className="text-center p-4 bg-dark-900/50 rounded-lg">
              <p className="text-2xl font-bold text-primary-400">
                {stats?.wrongRecords?.resolveRate || '0'}%
              </p>
              <p className="text-sm text-dark-400">解决率</p>
            </div>
          </div>
        </div>
      </div>

      {/* 学习计划 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5 text-accent-400" />
          <span>学习计划</span>
        </h3>
        {progress?.studyPlan?.targetDate ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-dark-900/50 rounded-lg">
              <Calendar className="w-5 h-5 text-dark-400" />
              <div>
                <p className="text-sm text-dark-400">目标面试时间</p>
                <p className="text-dark-100">
                  {new Date(progress.studyPlan.targetDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            {progress.studyPlan.dailyTasks?.length > 0 && (
              <div>
                <p className="text-sm text-dark-400 mb-2">每日任务</p>
                <ul className="space-y-2">
                  {progress.studyPlan.dailyTasks.map((task: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2 text-dark-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-4 text-dark-600" />
            <p className="text-dark-400 mb-4">还没有设置学习计划</p>
            <Link to="/profile" className="btn-primary">
              设置学习计划
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPage;

