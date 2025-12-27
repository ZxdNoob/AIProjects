import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { Users, BookOpen, Code2, PlayCircle, TrendingUp, Loader2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  const overviewCards = [
    {
      icon: Users,
      label: '用户总数',
      value: stats?.overview?.userCount || 0,
      subValue: `今日新增 ${stats?.overview?.todayUserCount || 0}`,
      color: 'from-blue-500 to-cyan-400',
    },
    {
      icon: Users,
      label: '会员用户',
      value: stats?.overview?.memberCount || 0,
      subValue: '活跃会员',
      color: 'from-purple-500 to-pink-400',
    },
    {
      icon: BookOpen,
      label: '知识点',
      value: stats?.overview?.knowledgeCount || 0,
      subValue: '已发布',
      color: 'from-green-500 to-emerald-400',
    },
    {
      icon: Code2,
      label: '编程题',
      value: stats?.overview?.problemCount || 0,
      subValue: '已发布',
      color: 'from-orange-500 to-yellow-400',
    },
    {
      icon: PlayCircle,
      label: '算法题',
      value: stats?.overview?.algorithmCount || 0,
      subValue: '已发布',
      color: 'from-red-500 to-pink-400',
    },
    {
      icon: TrendingUp,
      label: '提交总数',
      value: stats?.overview?.submissionCount || 0,
      subValue: `今日 ${stats?.overview?.todaySubmissionCount || 0}`,
      color: 'from-indigo-500 to-purple-400',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-100">仪表盘</h1>

      {/* 概览卡片 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {overviewCards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color}
                          flex items-center justify-center`}
              >
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-dark-400 text-sm">{card.label}</p>
                <p className="text-2xl font-bold text-dark-100">{card.value}</p>
                <p className="text-xs text-dark-500">{card.subValue}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 热门知识点 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">热门知识点</h3>
          <div className="space-y-3">
            {stats?.hotKnowledge?.slice(0, 5).map((item: any, index: number) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 bg-dark-900/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-300 
                                 text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-dark-200">{item.title}</span>
                </div>
                <span className="text-dark-500 text-sm">{item.viewCount} 次浏览</span>
              </div>
            ))}
          </div>
        </div>

        {/* 热门编程题 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">热门编程题</h3>
          <div className="space-y-3">
            {stats?.hotProblems?.slice(0, 5).map((item: any, index: number) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 bg-dark-900/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-accent-500/20 text-accent-300 
                                 text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-dark-200">{item.title}</span>
                </div>
                <span className="text-dark-500 text-sm">{item.submitCount} 次提交</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 注册趋势 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-100 mb-4">最近7天注册趋势</h3>
        <div className="h-40 flex items-end justify-between gap-2">
          {stats?.registrationTrend?.map((item: any) => {
            const maxCount = Math.max(...(stats?.registrationTrend?.map((i: any) => i.count) || [1]));
            const height = (item.count / maxCount) * 100;
            return (
              <div key={item._id} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t"
                  style={{ height: `${Math.max(height, 5)}%` }}
                />
                <span className="text-xs text-dark-500 mt-2">{item._id.slice(5)}</span>
                <span className="text-xs text-dark-400">{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

