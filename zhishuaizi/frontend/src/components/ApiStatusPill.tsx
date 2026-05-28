import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Space, Tooltip, Typography } from 'antd';
import { CloudServerOutlined, DisconnectOutlined, ReloadOutlined } from '@ant-design/icons';
import { getApiMode, onApiModeChange, resetApiMode, setMockMode } from '../services/api';
import type { ApiMode } from '../services/types';

const { Text } = Typography;

function modeMeta(mode: ApiMode): { label: string; color: 'success' | 'warning' | 'default'; icon: JSX.Element } {
  if (mode === 'real') return { label: '已连接后端', color: 'success', icon: <CloudServerOutlined /> };
  if (mode === 'mock') return { label: 'Mock 模式', color: 'warning', icon: <DisconnectOutlined /> };
  return { label: '检测中', color: 'default', icon: <ReloadOutlined /> };
}

export default function ApiStatusPill() {
  const [mode, setMode] = useState<ApiMode>(getApiMode());

  useEffect(() => onApiModeChange(setMode), []);

  const meta = useMemo(() => modeMeta(mode), [mode]);

  return (
    <Space size="small">
      <Tooltip
        title={
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>数据源状态</div>
            <div style={{ marginBottom: 8 }}>
              当前：<b>{meta.label}</b>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button size="small" icon={<ReloadOutlined />} onClick={() => resetApiMode()}>
                重新检测
              </Button>
              {mode !== 'mock' ? (
                <Button size="small" icon={<DisconnectOutlined />} onClick={() => setMockMode(true)}>
                  切到 Mock
                </Button>
              ) : (
                <Button size="small" icon={<CloudServerOutlined />} onClick={() => setMockMode(false)}>
                  尝试连接
                </Button>
              )}
            </div>
          </div>
        }
      >
        <Badge status={meta.color} />
      </Tooltip>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {meta.icon} {meta.label}
      </Text>
    </Space>
  );
}

