import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Tag,
  Empty,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  UnorderedListOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import DiceLogo from '../../components/DiceLogo';
import HomeButton from '../../components/HomeButton';
import EllipsisTooltip from '../../components/EllipsisTooltip';
import {
  getRoadmap,
  addRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem as apiDeleteRoadmapItem,
} from '../../services/api';
import './RoadmapPage.less';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface RoadmapItem {
  id: number;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  target_date: string | null;
  sort_order: number;
}

const statusConfig = {
  planned: { label: '规划中', color: 'default', icon: <UnorderedListOutlined /> },
  'in-progress': { label: '进行中', color: 'processing', icon: <SyncOutlined spin /> },
  completed: { label: '已完成', color: 'success', icon: <CheckCircleOutlined /> },
};

const priorityConfig = {
  high: { label: '高', color: 'red' },
  medium: { label: '中', color: 'orange' },
  low: { label: '低', color: 'blue' },
};

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getRoadmap();
      console.log('路线图需求数据:', data);
      setItems(data.items || []);
    } catch (err: any) {
      console.error('获取路线图需求失败:', err);
      setError(`获取路线图需求失败: ${err.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (item: RoadmapItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      targetDate: item.target_date ? dayjs(item.target_date) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const data = await apiDeleteRoadmapItem(id);
      if (!data.success) {
        message.error('删除失败');
        return;
      }
      message.success('删除成功');
      loadData();
    } catch (err) {
      console.error('删除失败:', err);
      message.error('删除失败，请重试');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        description: values.description || '',
        status: values.status || 'planned',
        priority: values.priority || 'medium',
        targetDate: values.targetDate ? values.targetDate.format('YYYY-MM-DD HH:mm:ss') : undefined,
        sortOrder: 0,
      };

      let data;
      if (editingItem) {
        data = await updateRoadmapItem(editingItem.id, payload);
      } else {
        data = await addRoadmapItem(payload);
      }

      if (!data.success) {
        message.error('操作失败');
        return;
      }

      message.success(editingItem ? '更新成功' : '添加成功');
      setIsModalVisible(false);
      // 移除这里的表单重置，将在 afterClose 回调中处理
      setEditingItem(null);
      loadData();
    } catch (err) {
      console.error('保存失败:', err);
      message.error('保存失败，请重试');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    // 移除这里的表单重置，将在 afterClose 回调中处理
    setEditingItem(null);
  };

  // 弹框完全关闭后的回调，用于重置表单
  const handleModalAfterClose = () => {
    form.resetFields();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    // 数据库存储的是东八区时间，格式为 "YYYY-MM-DD HH:MM:SS"
    // 如果时间字符串没有时区信息，需要明确指定为东八区时间
    let dateStr = String(dateString);
    // 如果是 "YYYY-MM-DD HH:MM:SS" 格式且没有时区信息，添加东八区时区
    if (dateStr.includes(' ') && !dateStr.includes('T') && !dateStr.includes('+') && !dateStr.includes('Z')) {
      dateStr = dateStr.replace(' ', 'T') + '+08:00';
    }
    const date = dayjs(dateStr);
    if (!date.isValid()) return dateString;
    // 使用东八区时间格式化
    return date.format('YYYY-MM-DD HH:mm:ss');
  };

  const getItemsByStatus = (status: 'planned' | 'in-progress' | 'completed') => {
    return items.filter((item) => item.status === status);
  };

  const renderItemCard = (item: RoadmapItem) => {
    const statusInfo = statusConfig[item.status];
    const priorityInfo = priorityConfig[item.priority];
    const isOverdue =
      item.target_date &&
      item.status !== 'completed' &&
      dayjs(item.target_date).isBefore(dayjs(), 'day');

    return (
      <Card
        key={item.id}
        className="roadmap-item-card"
        hoverable
        actions={[
          <Tooltip title="编辑">
            <EditOutlined
              key="edit"
              onClick={() => handleEdit(item)}
              className="roadmap-action-icon"
            />
          </Tooltip>,
          <Popconfirm
            title="确定要删除这个需求吗？"
            onConfirm={() => handleDelete(item.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <DeleteOutlined key="delete" className="roadmap-action-icon delete" />
            </Tooltip>
          </Popconfirm>,
        ]}
      >
        <div className="roadmap-item-content">
          <div className="roadmap-item-header">
            <Title level={5} className="roadmap-item-title">
              <EllipsisTooltip lines={2}>
                {item.title}
              </EllipsisTooltip>
            </Title>
            <Space>
              <Tag color={priorityInfo.color} icon={<FlagOutlined />}>
                {priorityInfo.label}
              </Tag>
              <Tag color={statusInfo.color} icon={statusInfo.icon}>
                {statusInfo.label}
              </Tag>
            </Space>
          </div>
          {item.description && (
            <Text className="roadmap-item-description" ellipsis={{ rows: 3, expandable: false }}>
              {item.description}
            </Text>
          )}
          <div className="roadmap-item-footer">
            <Space size="small" className="roadmap-item-meta">
              {item.target_date && (
                <Tooltip title={isOverdue ? '已逾期' : '预计完成时间'}>
                  <Text
                    type="secondary"
                    className={isOverdue ? 'roadmap-overdue' : ''}
                    style={{ fontSize: '12px' }}
                  >
                    <ClockCircleOutlined /> {formatDate(item.target_date)}
                  </Text>
                </Tooltip>
              )}
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <FieldTimeOutlined /> 创建于 {formatDate(item.created_at)}
              </Text>
              {item.updated_at && item.updated_at !== item.created_at && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <SyncOutlined /> 更新于 {formatDate(item.updated_at)}
                </Text>
              )}
            </Space>
          </div>
        </div>
      </Card>
    );
  };

  const plannedItems = getItemsByStatus('planned');
  const inProgressItems = getItemsByStatus('in-progress');
  const completedItems = getItemsByStatus('completed');

  return (
    <div className="roadmap-bg">
      <div className="roadmap-card">
        <div className="roadmap-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DiceLogo size={48} />
            <Title
              level={2}
              style={{
                margin: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              产品路线图
            </Title>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <HomeButton />
            <Button
              icon={<ReloadOutlined />}
              type="text"
              size="large"
              className="roadmap-refresh-btn"
              onClick={loadData}
              loading={loading}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              className="roadmap-add-btn"
              onClick={handleAdd}
            >
              新增需求
            </Button>
          </div>
        </div>

        <div className="roadmap-content">
          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                background: '#fff2f0',
                border: '1px solid #ffccc7',
                borderRadius: 8,
                color: '#ff4d4f',
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">加载中...</Text>
            </div>
          ) : items.length === 0 ? (
            <Empty
              description="暂无需求规划"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: 60 }}
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                添加第一个需求
              </Button>
            </Empty>
          ) : (
            <div className="roadmap-kanban">
              {/* 规划中 */}
              <div className="roadmap-column">
                <div className="roadmap-column-header">
                  <Badge count={plannedItems.length} showZero>
                    <Title level={4} className="roadmap-column-title">
                      <UnorderedListOutlined /> 规划中
                    </Title>
                  </Badge>
                </div>
                <div className="roadmap-column-content">
                  {plannedItems.length === 0 ? (
                    <Empty
                      description="暂无规划中的需求"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : (
                    plannedItems.map((item) => renderItemCard(item))
                  )}
                </div>
              </div>

              {/* 进行中 */}
              <div className="roadmap-column">
                <div className="roadmap-column-header">
                  <Badge count={inProgressItems.length} showZero>
                    <Title level={4} className="roadmap-column-title">
                      <SyncOutlined /> 进行中
                    </Title>
                  </Badge>
                </div>
                <div className="roadmap-column-content">
                  {inProgressItems.length === 0 ? (
                    <Empty
                      description="暂无进行中的需求"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : (
                    inProgressItems.map((item) => renderItemCard(item))
                  )}
                </div>
              </div>

              {/* 已完成 */}
              <div className="roadmap-column">
                <div className="roadmap-column-header">
                  <Badge count={completedItems.length} showZero>
                    <Title level={4} className="roadmap-column-title">
                      <CheckCircleOutlined /> 已完成
                    </Title>
                  </Badge>
                </div>
                <div className="roadmap-column-content">
                  {completedItems.length === 0 ? (
                    <Empty
                      description="暂无已完成的需求"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : (
                    completedItems.map((item) => renderItemCard(item))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 添加/编辑需求模态框 */}
      <Modal
        title={editingItem ? '编辑需求' : '新增需求'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        afterClose={handleModalAfterClose}
        okText="确定"
        cancelText="取消"
        width={600}
        className="roadmap-modal"
      >
        <Form form={form} layout="vertical" className="roadmap-form">
          <Form.Item
            name="title"
            label="需求标题"
            rules={[{ required: true, message: '请输入需求标题' }]}
          >
            <Input placeholder="请输入需求标题" maxLength={100} showCount />
          </Form.Item>
          <Form.Item name="description" label="需求描述">
            <TextArea
              placeholder="请输入需求描述（可选）"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue="planned"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="planned">规划中</Option>
              <Option value="in-progress">进行中</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="priority"
            label="优先级"
            initialValue="medium"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="请选择优先级">
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
          </Form.Item>
          <Form.Item name="targetDate" label="预计完成时间">
            <DatePicker
              style={{ width: '100%' }}
              placeholder="请选择预计完成时间（可选）"
              showTime
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

