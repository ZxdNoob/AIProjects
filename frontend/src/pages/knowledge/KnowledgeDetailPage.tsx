import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { knowledgeApi } from '@/services/api';
import { Knowledge, KnowledgeLevel } from '@/types';
import { useAuthStore } from '@/store/authStore';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  ArrowLeft,
  Star,
  StarOff,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
  BookOpen,
} from 'lucide-react';

const KnowledgeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isMember } = useAuthStore();

  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isMarkedWeak, setIsMarkedWeak] = useState(false);

  useEffect(() => {
    if (id) {
      fetchKnowledge();
    }
  }, [id]);

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await knowledgeApi.getDetail(id!);
      if (response.success && response.data) {
        setKnowledge(response.data);
      }
    } catch (err: any) {
      if (err.code === 'MEMBER_REQUIRED') {
        setError('此内容需要会员权限');
      } else {
        setError(err.message || '加载失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    try {
      const response = await knowledgeApi.favorite(id!);
      if (response.success) {
        setIsFavorited(response.data?.favorited || false);
      }
    } catch (error) {
      console.error('收藏失败:', error);
    }
  };

  const handleMarkWeak = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    try {
      const response = await knowledgeApi.markWeakPoint(id!);
      if (response.success) {
        setIsMarkedWeak(response.data?.marked || false);
      }
    } catch (error) {
      console.error('标记失败:', error);
    }
  };

  const handleComplete = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    try {
      await knowledgeApi.complete(id!);
    } catch (error) {
      console.error('标记完成失败:', error);
    }
  };

  const getLevelBadge = (level: KnowledgeLevel) => {
    const styles = {
      [KnowledgeLevel.BASIC]: 'badge-success',
      [KnowledgeLevel.INTERMEDIATE]: 'badge-warning',
      [KnowledgeLevel.ADVANCED]: 'badge-danger',
    };
    const labels = {
      [KnowledgeLevel.BASIC]: '基础层',
      [KnowledgeLevel.INTERMEDIATE]: '进阶层',
      [KnowledgeLevel.ADVANCED]: '原理层',
    };
    return <span className={styles[level]}>{labels[level]}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Lock className="w-16 h-16 mx-auto mb-4 text-dark-500" />
        <h2 className="text-2xl font-bold text-dark-100 mb-2">{error}</h2>
        <p className="text-dark-400 mb-6">
          开通会员即可解锁全部高级内容
        </p>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          返回
        </button>
      </div>
    );
  }

  if (!knowledge) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-dark-500" />
        <h2 className="text-2xl font-bold text-dark-100">知识点不存在</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-dark-400 hover:text-dark-100 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回列表</span>
      </button>

      {/* 头部 */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          {getLevelBadge(knowledge.level)}
          <span className="text-dark-500">{knowledge.category}</span>
        </div>
        <h1 className="text-3xl font-bold text-dark-100 mb-4">
          {knowledge.title}
        </h1>
        <p className="text-dark-400 text-lg">{knowledge.content.summary}</p>

        {/* 操作按钮 */}
        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={handleFavorite}
            className="btn-ghost flex items-center space-x-2"
          >
            {isFavorited ? (
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="w-5 h-5" />
            )}
            <span>{isFavorited ? '已收藏' : '收藏'}</span>
          </button>
          <button
            onClick={handleMarkWeak}
            className="btn-ghost flex items-center space-x-2"
          >
            <AlertTriangle
              className={`w-5 h-5 ${isMarkedWeak ? 'text-warning-500' : ''}`}
            />
            <span>{isMarkedWeak ? '已标记薄弱' : '标记薄弱'}</span>
          </button>
          <button
            onClick={handleComplete}
            className="btn-ghost flex items-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>标记已学</span>
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="space-y-8">
        {/* 详细内容 */}
        <section className="card">
          <h2 className="text-xl font-semibold text-dark-100 mb-4">详细内容</h2>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {knowledge.content.detail}
            </ReactMarkdown>
          </div>
        </section>

        {/* 面试问答 */}
        {knowledge.content.interviewQuestion && (
          <section className="card bg-primary-500/5 border-primary-500/20">
            <h2 className="text-xl font-semibold text-dark-100 mb-4">
              💬 面试问答
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-dark-300 font-medium mb-2">提问方式：</p>
                <p className="text-dark-400">{knowledge.content.interviewQuestion}</p>
              </div>
              <div>
                <p className="text-dark-300 font-medium mb-2">标准答案：</p>
                <p className="text-dark-400">{knowledge.content.standardAnswer}</p>
              </div>
            </div>
          </section>
        )}

        {/* 易错点 */}
        {knowledge.content.commonMistakes.length > 0 && (
          <section className="card bg-danger-500/5 border-danger-500/20">
            <h2 className="text-xl font-semibold text-dark-100 mb-4">
              ⚠️ 易错点
            </h2>
            <ul className="space-y-2">
              {knowledge.content.commonMistakes.map((mistake, index) => (
                <li key={index} className="flex items-start space-x-2 text-dark-400">
                  <span className="text-danger-500">•</span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 拓展延伸 */}
        {knowledge.content.extensions.length > 0 && (
          <section className="card bg-accent-500/5 border-accent-500/20">
            <h2 className="text-xl font-semibold text-dark-100 mb-4">
              📚 拓展延伸
            </h2>
            <ul className="space-y-2">
              {knowledge.content.extensions.map((ext, index) => (
                <li key={index} className="flex items-start space-x-2 text-dark-400">
                  <span className="text-accent-500">•</span>
                  <span>{ext}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 标签 */}
        {knowledge.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {knowledge.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-dark-800 text-dark-400 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeDetailPage;

