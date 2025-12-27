import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { problemApi } from '@/services/api';
import { Problem, ProblemDifficulty } from '@/types';
import {
  ArrowLeft,
  Play,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const ProblemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'javascript' | 'typescript'>('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProblem();
    }
  }, [id]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await problemApi.getDetail(id!);
      if (response.success && response.data) {
        setProblem(response.data);
        setCode(response.data.codeTemplate[language]);
      }
    } catch (error: any) {
      if (error.code === 'MEMBER_REQUIRED') {
        navigate('/forbidden');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    
    try {
      setSubmitting(true);
      setResult(null);
      const response = await problemApi.submit(id!, code, language);
      if (response.success) {
        setResult(response.data);
      }
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLanguageChange = (newLang: 'javascript' | 'typescript') => {
    setLanguage(newLang);
    if (problem) {
      setCode(problem.codeTemplate[newLang]);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-20">
        <p className="text-dark-400">题目不存在</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* 顶栏 */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-dark-800 bg-dark-900/50">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-dark-400" />
          </button>
          <div className="flex items-center space-x-3">
            {getDifficultyBadge(problem.difficulty)}
            <h1 className="text-dark-100 font-medium">{problem.title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className="input py-1.5 text-sm w-32"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
          </select>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary btn-sm flex items-center space-x-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>提交</span>
          </button>
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：题目描述 */}
        <div className="w-1/2 border-r border-dark-800 overflow-y-auto p-6">
          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br />') }} />

            {/* 示例 */}
            {problem.examples.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-dark-100">示例</h3>
                {problem.examples.map((example, index) => (
                  <div key={index} className="mt-4 p-4 bg-dark-800 rounded-lg">
                    <p className="text-sm text-dark-400">
                      <strong>输入：</strong> {example.input}
                    </p>
                    <p className="text-sm text-dark-400 mt-2">
                      <strong>输出：</strong> {example.output}
                    </p>
                    {example.explanation && (
                      <p className="text-sm text-dark-500 mt-2">
                        <strong>解释：</strong> {example.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 约束 */}
            {problem.constraints.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-dark-100">约束条件</h3>
                <ul className="mt-2 space-y-1">
                  {problem.constraints.map((constraint, index) => (
                    <li key={index} className="text-sm text-dark-400">
                      • {constraint}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 提示 */}
            {problem.hints.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-dark-100">提示</h3>
                <ul className="mt-2 space-y-1">
                  {problem.hints.map((hint, index) => (
                    <li key={index} className="text-sm text-dark-400">
                      💡 {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 题解 */}
            {problem.solution.code && (
              <div className="mt-6">
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center space-x-2 text-primary-400 hover:text-primary-300"
                >
                  <span>查看题解</span>
                  {showSolution ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showSolution && (
                  <div className="mt-4 p-4 bg-dark-800 rounded-lg">
                    <pre className="text-sm text-dark-300 overflow-x-auto">
                      {problem.solution.code}
                    </pre>
                    {problem.solution.explanation && (
                      <p className="mt-4 text-sm text-dark-400">
                        {problem.solution.explanation}
                      </p>
                    )}
                    <div className="mt-4 flex space-x-4 text-xs text-dark-500">
                      <span>时间复杂度: {problem.solution.timeComplexity}</span>
                      <span>空间复杂度: {problem.solution.spaceComplexity}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右侧：代码编辑器 */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
              }}
            />
          </div>

          {/* 运行结果 */}
          {result && (
            <div className="h-48 border-t border-dark-800 p-4 overflow-y-auto bg-dark-900">
              <div className="flex items-center space-x-2 mb-4">
                {result.status === 'accepted' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-success-500" />
                    <span className="text-success-500 font-medium">通过</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-danger-500" />
                    <span className="text-danger-500 font-medium">未通过</span>
                  </>
                )}
                <span className="text-dark-500">
                  ({result.passedCount}/{result.totalCount} 个测试用例通过)
                </span>
              </div>

              {result.testResults?.map((tr: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg mb-2 ${
                    tr.passed ? 'bg-success-500/10' : 'bg-danger-500/10'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {tr.passed ? (
                      <CheckCircle className="w-4 h-4 text-success-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-danger-500" />
                    )}
                    <span className="text-sm text-dark-300">测试用例 {index + 1}</span>
                  </div>
                  {!tr.passed && (
                    <div className="text-xs text-dark-400 mt-2 space-y-1">
                      <p>输入: {tr.input}</p>
                      <p>期望: {tr.expectedOutput}</p>
                      <p>实际: {tr.actualOutput}</p>
                      {tr.error && <p className="text-danger-500">错误: {tr.error}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;

