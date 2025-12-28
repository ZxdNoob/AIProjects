import React from 'react';
import { Card, Typography, Button, Tag, Empty, Collapse, Space, Pagination, Switch } from 'antd';
import { RollbackOutlined, ReloadOutlined, CalendarOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DiceLogo from '../../components/DiceLogo';
import HomeButton from '../../components/HomeButton';
import { getVersionHistory } from '../../services/api';
import './VersionHistoryPage.less';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface VersionRecord {
  id: number;
  version: string;
  description: string;
  change_type: string;
  release_date: string;
  created_at: string;
}

export default function VersionHistoryPage() {
  const [history, setHistory] = React.useState<VersionRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [accordionMode, setAccordionMode] = React.useState(true); // true: 一次只展开一个, false: 可展开多个
  const [activeKeys, setActiveKeys] = React.useState<React.Key[]>([]);
  const navigate = useNavigate();

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getVersionHistory();
      console.log('版本历史数据:', data);
      setHistory(data.history || []);
    } catch (err: any) {
      console.error('获取版本历史失败:', err);
      setError(`获取版本历史失败: ${err.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // 当数据或每页条数变化时，检查当前页是否有效
  React.useEffect(() => {
    if (history.length > 0) {
      const totalPages = Math.ceil(history.length / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
      }
    }
  }, [history.length, pageSize]);

  // 当切换页面时，清理不在当前页的展开状态
  React.useEffect(() => {
    if (history.length > 0) {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const currentPageData = history.slice(start, end);
      const currentPageKeys = currentPageData.map((record, index) => record.id || index);
      setActiveKeys((prevKeys) => prevKeys.filter((key) => currentPageKeys.includes(key)));
    }
  }, [currentPage, pageSize, history]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const getChangeTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      major: { color: 'red', text: '重大更新' },
      minor: { color: 'blue', text: '功能更新' },
      patch: { color: 'green', text: '修复更新' },
    };
    const config = typeMap[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 渲染版本面板标题
  const renderPanelHeader = (record: VersionRecord) => {
    return (
      <div className="version-panel-header">
        <Space size="middle" wrap>
          <Text strong className="version-number">
            v{record.version}
          </Text>
          {getChangeTypeTag(record.change_type)}
          <Space size="small" className="version-date">
            <CalendarOutlined />
            <Text type="secondary">{formatDate(record.release_date)}</Text>
          </Space>
        </Space>
      </div>
    );
  };

  // 计算当前页显示的数据
  const getCurrentPageData = () => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return history.slice(start, end);
  };

  // 处理分页变化
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // 改变每页条数时重置到第一页
    }
  };

  // 处理展开/收起变化
  const handleCollapseChange = (keys: React.Key | React.Key[]) => {
    if (accordionMode) {
      // accordion 模式：keys 是单个 key 或 undefined
      setActiveKeys(keys ? [keys as React.Key] : []);
    } else {
      // 多选模式：keys 是数组
      setActiveKeys(keys as React.Key[]);
    }
  };

  // 切换展开模式
  const handleModeToggle = (checked: boolean) => {
    setAccordionMode(checked);
    // 切换模式时清空展开状态
    setActiveKeys([]);
  };

  // 处理刷新操作
  const handleRefresh = () => {
    setCurrentPage(1); // 重置页码为第一页
    setActiveKeys([]); // 清空展开状态
    loadData(); // 重新加载数据
  };

  const currentPageData = getCurrentPageData();
  const total = history.length;

  return (
    <div className="version-history-bg">
      <div className="version-history-card">
        <div className="version-history-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DiceLogo size={48} />
            <Title level={2} style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              一起掷骰子 - 版本历史
            </Title>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <HomeButton />
            <Button
              icon={<ReloadOutlined />}
              type="text"
              size="large"
              className="version-history-refresh-btn"
              onClick={handleRefresh}
              loading={loading}
            >
              刷新
            </Button>
            <Button
              icon={<RollbackOutlined />}
              type="text"
              size="large"
              className="version-history-back-btn"
              onClick={() => navigate('/dice')}
            >
              返回掷骰子
            </Button>
          </div>
        </div>

        <div className="version-history-content">
          {error && (
            <div style={{ marginBottom: 16, padding: 12, background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, color: '#ff4d4f' }}>
              {error}
            </div>
          )}
          {loading ? (
            <div className="version-history-empty-state">
              <Text type="secondary">加载中...</Text>
            </div>
          ) : history.length === 0 ? (
            <div className="version-history-empty-state">
              <Empty description="暂无版本历史记录" />
            </div>
          ) : (
            <div className="version-history-accordion-wrapper">
              <div className="version-history-summary">
                <Space>
                  <Text type="secondary">共 {total} 个版本</Text>
                  <div className="version-mode-switch">
                    <Space size="small">
                      <UnorderedListOutlined style={{ color: accordionMode ? '#667eea' : '#999' }} />
                      <Switch
                        checked={accordionMode}
                        onChange={handleModeToggle}
                        checkedChildren="单个"
                        unCheckedChildren="多个"
                        size="small"
                      />
                      <AppstoreOutlined style={{ color: !accordionMode ? '#667eea' : '#999' }} />
                    </Space>
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                      {accordionMode ? '一次只展开一个' : '可同时展开多个'}
                    </Text>
                  </div>
                </Space>
              </div>
              <Collapse
                accordion={accordionMode}
                activeKey={accordionMode ? (activeKeys[0] || undefined) : activeKeys}
                onChange={handleCollapseChange}
                expandIconPosition="end"
                className="version-history-accordion"
                items={currentPageData.map((record, index) => ({
                  key: record.id || index,
                  label: renderPanelHeader(record),
                  children: (
                    <div className="version-panel-content">
                      <Text className="version-description">
                        {record.description || '暂无更新说明'}
                      </Text>
                    </div>
                  ),
                }))}
              />
              <div className="version-history-pagination">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={total}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
                  pageSizeOptions={['5', '10', '20', '50']}
                  onChange={handlePageChange}
                  onShowSizeChange={handlePageChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

