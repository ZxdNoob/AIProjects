import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { algorithmApi } from '@/services/api';
import { Algorithm, AnimationStep } from '@/types';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RefreshCw,
  Loader2,
} from 'lucide-react';

const AlgorithmDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [animationData, setAnimationData] = useState<{
    type: string;
    defaultData: string;
    steps: AnimationStep[];
  } | null>(null);

  // 动画控制状态
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);

  useEffect(() => {
    if (id) {
      fetchAlgorithm();
    }
  }, [id]);

  useEffect(() => {
    if (animationData && canvasRef.current) {
      renderAnimation();
    }
  }, [currentStep, animationData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && animationData && currentStep < animationData.steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= animationData.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, animationData]);

  const fetchAlgorithm = async () => {
    try {
      setLoading(true);
      const [detailRes, animRes] = await Promise.all([
        algorithmApi.getDetail(id!),
        algorithmApi.getAnimation(id!),
      ]);

      if (detailRes.success && detailRes.data) {
        setAlgorithm(detailRes.data);
        setCode(detailRes.data.codeTemplate.javascript);
      }

      if (animRes.success && animRes.data) {
        setAnimationData(animRes.data);
      }
    } catch (error: any) {
      if (error.code === 'MEMBER_REQUIRED') {
        navigate('/forbidden');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas || !animationData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const step = animationData.steps[currentStep];
    if (!step) return;

    try {
      const data = JSON.parse(step.dataState);

      if (animationData.type === 'array' && Array.isArray(data)) {
        // 绘制数组动画
        const barWidth = Math.min(60, (canvas.width - 100) / data.length);
        const maxHeight = canvas.height - 100;
        const maxValue = Math.max(...data);

        data.forEach((value: number, index: number) => {
          const barHeight = (value / maxValue) * maxHeight;
          const x = 50 + index * (barWidth + 10);
          const y = canvas.height - 50 - barHeight;

          // 渐变色
          const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, '#3b82f6');
          gradient.addColorStop(1, '#8b5cf6');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth, barHeight);

          // 数值标签
          ctx.fillStyle = '#e2e8f0';
          ctx.font = '14px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText(String(value), x + barWidth / 2, y - 10);
        });
      }

      // 绘制步骤描述
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px Noto Sans SC';
      ctx.textAlign = 'left';
      ctx.fillText(`步骤 ${currentStep + 1}: ${step.description}`, 20, 30);
    } catch (e) {
      console.error('Parse animation data error:', e);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (animationData) {
      setCurrentStep((prev) => Math.min(animationData.steps.length - 1, prev + 1));
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!algorithm) {
    return (
      <div className="text-center py-20">
        <p className="text-dark-400">算法不存在</p>
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
          <h1 className="text-dark-100 font-medium">{algorithm.title}</h1>
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：动画区 */}
        <div className="w-1/2 border-r border-dark-800 flex flex-col">
          {/* Canvas */}
          <div className="flex-1 p-4">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full h-full bg-dark-900 rounded-lg"
            />
          </div>

          {/* 控制栏 */}
          <div className="h-20 px-6 border-t border-dark-800 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReset}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-dark-400" />
              </button>
              <button
                onClick={handlePrevStep}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <SkipBack className="w-5 h-5 text-dark-400" />
              </button>
              <button
                onClick={handlePlayPause}
                className="p-3 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>
              <button
                onClick={handleNextStep}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <SkipForward className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            {/* 进度 */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-dark-400">
                {currentStep + 1} / {animationData?.steps.length || 0}
              </span>
              <select
                value={playSpeed}
                onChange={(e) => setPlaySpeed(Number(e.target.value))}
                className="input py-1 text-sm w-20"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>

          {/* 步骤说明 */}
          {animationData?.steps[currentStep] && (
            <div className="p-4 border-t border-dark-800 bg-dark-900/50">
              <p className="text-dark-300">
                {animationData.steps[currentStep].description}
              </p>
              {animationData.steps[currentStep].timeComplexity && (
                <p className="text-xs text-dark-500 mt-2">
                  当前步骤时间复杂度: {animationData.steps[currentStep].timeComplexity}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 右侧：代码编辑器 */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-1">
            <Editor
              height="100%"
              language="javascript"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                readOnly: true,
              }}
            />
          </div>

          {/* 解析 */}
          {algorithm.solution.explanation && (
            <div className="h-40 border-t border-dark-800 p-4 overflow-y-auto bg-dark-900">
              <h3 className="text-sm font-medium text-dark-200 mb-2">算法解析</h3>
              <p className="text-sm text-dark-400">{algorithm.solution.explanation}</p>
              <div className="mt-4 flex space-x-4 text-xs text-dark-500">
                <span>时间复杂度: {algorithm.solution.timeComplexity}</span>
                <span>空间复杂度: {algorithm.solution.spaceComplexity}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlgorithmDetailPage;

