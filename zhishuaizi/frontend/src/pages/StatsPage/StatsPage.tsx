import React from 'react';
import { Card, Typography, Table, Button } from 'antd';
import { RollbackOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import DiceLogo from '../../components/DiceLogo';
import HomeButton from '../../components/HomeButton';
import './StatsPage.less';

const { Title } = Typography;

interface HistoryRecord {
  point: number;
  timestamp: string;
}

export default function StatsPage() {
  const [stats, setStats] = React.useState<{ point: number; count: number }[]>([]);
  const [history, setHistory] = React.useState<HistoryRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = React.useCallback(() => {
    setLoading(true);
    setError(null);
    
    // 获取统计数据
    fetch('http://localhost:3001/api/stats')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('统计数据:', data);
        setStats(data.stats || []);
      })
      .catch(err => {
        console.error('获取统计数据失败:', err);
        setError(`获取统计数据失败: ${err.message}`);
      });
    
    // 获取历史记录
    fetch('http://localhost:3001/api/history')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('历史记录API响应:', data);
        const historyData = Array.isArray(data.history) ? data.history : [];
        console.log('历史记录数量:', historyData.length);
        if (historyData.length > 0) {
          console.log('第一条历史记录:', historyData[0]);
        }
        setHistory(historyData);
        setLoading(false);
      })
      .catch(err => {
        console.error('获取历史记录失败:', err);
        setError(`获取历史记录失败: ${err.message}`);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // 准备散点图数据
  const scatterData = history
    .filter(record => record && record.timestamp && record.point) // 过滤掉无效记录
    .map((record, index) => {
      // 处理时间戳
      // SQLite存储的东八区时间格式为 "YYYY-MM-DD HH:MM:SS"
      // 需要转换为JavaScript Date能识别的格式，并明确指定为东八区时间
      let timestamp = String(record.timestamp);
      
      // 如果格式是 "YYYY-MM-DD HH:MM:SS"，添加时区信息转换为ISO格式
      // 由于数据库存储的是东八区时间，我们需要告诉JavaScript这是东八区时间
      if (timestamp.includes(' ') && !timestamp.includes('T')) {
        timestamp = timestamp.replace(' ', 'T') + '+08:00'; // 添加东八区时区
      }
      
      // 尝试解析时间戳
      let timeValue = new Date(timestamp).getTime();
      
      // 如果解析失败，尝试直接作为数字处理（可能是Unix时间戳）
      if (isNaN(timeValue) && !isNaN(Number(timestamp))) {
        timeValue = Number(timestamp);
      }
      
      // 如果仍然无效，记录警告并跳过
      if (isNaN(timeValue)) {
        console.warn('无法解析时间戳:', record.timestamp);
        return null;
      }
      
      return [timeValue, record.point]; // X轴：时间戳（毫秒），Y轴：点数
    })
    .filter(item => item !== null) as number[][];
  
  console.log('散点图数据点数量:', scatterData.length, '原始历史记录数量:', history.length);

  // 当数据点数量超过一定阈值时，显示缩放条（建议阈值：30个数据点以上）
  const showDataZoom = scatterData.length > 30;

  // ECharts 配置
  const scatterOption: EChartsOption = {
    title: {
      text: '掷骰子时间分布',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const [timestamp, point] = params.value;
        const date = new Date(timestamp);
        // 使用东八区时区显示时间
        const timeStr = date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Shanghai', // 明确指定东八区时区
        });
        return `点数: ${point}<br/>时间: ${timeStr}`;
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: showDataZoom ? '25%' : '20%', // 数据量大时留出更多空间给缩放条和标题
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'time',
      name: '时间',
      nameLocation: 'end', // 将标题放在轴的末端（右侧），避免与刻度值重叠
      nameGap: showDataZoom ? 10 : 8, // 标题与轴线的距离
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold', // 加粗字体
        padding: [4, 0, 0, 0], // 减少上边距，让标题更靠近轴线
      },
      axisLabel: {
        formatter: (value: number) => {
          const date = new Date(value);
          // 使用东八区时区显示时间
          return date.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Shanghai', // 明确指定东八区时区
          });
        },
        rotate: 45,
        margin: 12, // 增加刻度标签与轴线的距离
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          opacity: 0.3,
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '点数',
      nameLocation: 'middle',
      nameGap: 20, // Y轴标题与轴线的距离
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold', // 加粗字体
        padding: [0, 4, 0, 0], // 右边距
      },
      min: 0.5,
      max: 6.5,
      interval: 1,
      boundaryGap: false,
      axisLabel: {
        show: true,
        formatter: (value: number) => {
          // 将刻度值四舍五入到最近的整数
          const intValue = Math.round(value);
          // 只显示1-6范围内的整数
          if (intValue >= 1 && intValue <= 6) {
            return String(intValue);
          }
          // 其他值返回空字符串，ECharts会跳过显示
          return '';
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          opacity: 0.3,
        },
      },
    },
    // 数据区域缩放组件（当数据点超过30个时显示）
    dataZoom: showDataZoom ? [
      {
        type: 'slider', // 滑动条型数据区域缩放组件
        show: true,
        xAxisIndex: [0], // 只对X轴（时间轴）进行缩放
        start: 0, // 初始显示范围的起始百分比
        end: 100, // 初始显示范围的结束百分比
        bottom: 10, // 距离容器底部的距离
        height: 30, // 组件高度
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23.1h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%', // 控制手柄的大小
        handleStyle: {
          color: '#1890ff',
          borderColor: '#1890ff',
        },
        textStyle: {
          color: '#666',
          fontSize: 12,
        },
        borderColor: '#e0e0e0',
        fillerColor: 'rgba(24, 144, 255, 0.2)', // 选中区域的填充颜色
        dataBackground: {
          lineStyle: {
            color: '#1890ff',
            opacity: 0.5,
          },
          areaStyle: {
            color: '#e6f7ff',
          },
        },
        selectedDataBackground: {
          lineStyle: {
            color: '#1890ff',
            opacity: 0.8,
          },
          areaStyle: {
            color: '#bae7ff',
          },
        },
      },
      {
        type: 'inside', // 内置型数据区域缩放组件
        xAxisIndex: [0], // 只对X轴（时间轴）进行缩放
        start: 0,
        end: 100,
        zoomOnMouseWheel: true, // 支持鼠标滚轮缩放
        moveOnMouseMove: true, // 支持鼠标拖拽移动
        moveOnMouseWheel: false, // 禁用鼠标滚轮移动
      },
    ] : [],
    series: [
      {
        name: '掷骰子记录',
        type: 'scatter',
        data: scatterData,
        symbolSize: 12,
        itemStyle: {
          color: '#1890ff',
          opacity: 0.7,
        },
        emphasis: {
          itemStyle: {
            color: '#0050b3',
            opacity: 1,
            borderColor: '#fff',
            borderWidth: 2,
          },
        },
      },
    ],
  };

  return (
    <div className="stats-pc-bg">
      <Card className="stats-pc-card" bordered={false}>
        <div className="stats-pc-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DiceLogo size={48} />
            <Title level={2} style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              一起掷骰子 - 统计
            </Title>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <HomeButton />
            <Button
              icon={<RollbackOutlined />}
              type="text"
              size="large"
              className="stats-pc-back-btn"
              onClick={() => navigate('/dice')}
            >
              返回掷骰子
            </Button>
          </div>
        </div>
        
        {/* 左右布局：左边散点图，右边统计表格 */}
        <div className="stats-pc-content-layout">
          {/* 左侧：散点图 */}
          <div className="stats-pc-chart-container">
            <div className="stats-pc-chart">
              {loading ? (
                <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                  <div>加载中...</div>
                  <Button 
                    icon={<ReloadOutlined />} 
                    size="middle" 
                    onClick={loadData}
                    className="stats-pc-refresh-btn"
                  >
                    刷新
                  </Button>
                </div>
              ) : error ? (
                <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#ff4d4f' }}>
                  <div>{error}</div>
                  <Button 
                    icon={<ReloadOutlined />} 
                    size="middle" 
                    onClick={loadData}
                    className="stats-pc-refresh-btn stats-pc-retry-btn"
                  >
                    重试
                  </Button>
                </div>
              ) : history.length > 0 ? (
                <>
                  <ReactECharts option={scatterOption} style={{ height: '400px', width: '100%' }} />
                  <div style={{ marginTop: 8, textAlign: 'center', color: '#999', fontSize: 12 }}>
                    共 {history.length} 条历史记录，显示 {scatterData.length} 个数据点
                  </div>
                </>
              ) : (
                <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#999' }}>
                  <div>暂无历史记录，请先掷骰子</div>
                  <Button 
                    icon={<ReloadOutlined />} 
                    size="middle" 
                    onClick={loadData}
                    className="stats-pc-refresh-btn"
                  >
                    刷新
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：统计表格 */}
          <div className="stats-pc-table-container">
            <div className="stats-pc-table-wrapper">
              <Table
                dataSource={stats.map(s => ({ ...s, key: s.point }))}
                columns={[
                  { title: '点数', dataIndex: 'point', key: 'point', align: 'center' },
                  { title: '出现次数', dataIndex: 'count', key: 'count', align: 'center' },
                ]}
                pagination={false}
                size="middle"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 