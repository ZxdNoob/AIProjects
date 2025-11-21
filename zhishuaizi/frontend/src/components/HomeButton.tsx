import React from 'react';
import { Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './HomeButton.less';

interface HomeButtonProps {
  className?: string;
  size?: 'small' | 'middle' | 'large';
}

/**
 * 返回首页按钮组件
 * 统一的返回首页入口，具有优雅的设计和交互效果
 */
export default function HomeButton({ className = '', size = 'large' }: HomeButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      icon={<HomeOutlined />}
      type="text"
      size={size}
      className={`home-button ${className}`}
      onClick={() => navigate('/')}
    >
      首页
    </Button>
  );
}

