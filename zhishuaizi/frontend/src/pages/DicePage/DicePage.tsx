import { useState } from 'react';
import { Button, Card, Typography, Space } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Dice3D from './components/Dice3D';
import DiceReadyIcon from './components/DiceReadyIcon';
import DiceLogo from '../../components/DiceLogo';
import HomeButton from '../../components/HomeButton';
import ApiStatusPill from '../../components/ApiStatusPill';
import { rollDice as apiRollDice } from '../../services/api';
import './components/Dice3D.less';
import './DicePage.less';

const { Title } = Typography;

export default function DicePage() {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [hasRolled, setHasRolled] = useState(false);
  const [rollingPoint, setRollingPoint] = useState(1); // 动画期间骰子显示的点数
  const [displayNumber, setDisplayNumber] = useState<number | null>(null); // 显示的数字（用于动画）
  const navigate = useNavigate();

  const rollDice = async () => {
    setRolling(true);
    setHasRolled(true);
    setResult(null);
    
    // 动画期间骰子点数和显示数字都随机变化
    let rollingTimer = setInterval(() => {
      const randomPoint = Math.floor(Math.random() * 6) + 1;
      setRollingPoint(randomPoint);
      setDisplayNumber(randomPoint);
    }, 80);

    // 获取最终结果
    setTimeout(async () => {
      try {
        const data = await apiRollDice();
        setResult(data.point);
        setRolling(false);
        
        // 继续数字动画直到骰子完全停止
        setTimeout(() => {
          clearInterval(rollingTimer);
          setDisplayNumber(data.point);
        }, 800); // 骰子CSS过渡时间 0.8s = 800ms
      } catch (error) {
        console.error('掷骰子失败:', error);
        setRolling(false);
        clearInterval(rollingTimer);
      }
    }, 800);
  };

  return (
    <div className="dice-pc-bg">
      <Card className="dice-pc-card" variant="outlined">
        <div className="dice-pc-header">
          <div className="dice-pc-header-title">
            <DiceLogo size={56} />
            <Title level={2} className="dice-pc-title">
              掷骰子
            </Title>
          </div>
          <div className="dice-pc-header-actions">
            <ApiStatusPill />
            <HomeButton />
            <Button
              icon={<BarChartOutlined />}
              type="text"
              size="large"
              className="dice-pc-stats-btn"
              onClick={() => navigate('/stats')}
            >
              统计
            </Button>
          </div>
        </div>
        <div className="dice-pc-center">
          {rolling ? (
            <Dice3D point={rollingPoint} rolling={true} />
          ) : hasRolled && result !== null ? (
            <Dice3D point={result} rolling={false} />
          ) : (
            <DiceReadyIcon size={220} />
          )}
        </div>
        <div className="dice-pc-result">
          {hasRolled ? (
            <>
              <span>掷出的点数：</span>
              <span className={`dice-pc-point ${rolling ? 'rolling-number' : ''}`}>
                {displayNumber !== null && displayNumber !== undefined ? displayNumber : '?'}
              </span>
            </>
          ) : (
            <span className="dice-pc-hint">点击下方按钮开始掷骰子</span>
          )}
        </div>
        <Space style={{ width: '100%', justifyContent: 'center', marginTop: 40 }}>
          <Button
            type="primary"
            size="large"
            className="dice-pc-btn"
            onClick={rollDice}
            loading={rolling}
          >
            {rolling ? '掷骰子中...' : '掷骰子'}
          </Button>
        </Space>
      </Card>
    </div>
  );
} 