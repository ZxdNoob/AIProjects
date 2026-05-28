import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

// 获取路由基础路径，支持 GitHub Pages 子目录部署
const basename = import.meta.env.BASE_URL || '/';
import { Button, Card, Typography, ConfigProvider, Carousel } from "antd";
import zhCN from "antd/locale/zh_CN";
import { 
  PlayCircleOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  RocketOutlined
} from "@ant-design/icons";
import DicePage from "./pages/DicePage/DicePage";
import StatsPage from "./pages/StatsPage/StatsPage";
import VersionHistoryPage from "./pages/VersionHistoryPage/VersionHistoryPage";
import RoadmapPage from "./pages/RoadmapPage/RoadmapPage";
import DiceLogo from "./components/DiceLogo";
import "./App.less";

const { Title, Text } = Typography;

function HomeNav() {
  const navigate = useNavigate();
  const [slidesToShow, setSlidesToShow] = useState(3);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSlidesToShow(1);
      } else if (window.innerWidth <= 1200) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const features = [
    {
      icon: <PlayCircleOutlined />,
      title: "掷骰子",
      description: "智能加权随机算法，3D 动画效果",
      action: () => navigate("/dice"),
      primary: true,
    },
    {
      icon: <LineChartOutlined />,
      title: "统计分析",
      description: "查看点数统计和散点图分析",
      action: () => navigate("/stats"),
      primary: false,
    },
    {
      icon: <ClockCircleOutlined />,
      title: "版本历史",
      description: "查看项目更新记录和版本信息",
      action: () => navigate("/version-history"),
      primary: false,
    },
    {
      icon: <RocketOutlined />,
      title: "产品路线图",
      description: "规划未来功能需求和产品方向",
      action: () => navigate("/roadmap"),
      primary: false,
    },
  ];

  return (
    <div className="home-container">
      {/* 背景装饰 */}
      <div className="home-bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      {/* 主要内容 */}
      <div className="home-content">
        {/* 头部 Logo 和标题 */}
        <div className="home-header">
          <div className="home-logo-wrapper">
            <DiceLogo size={120} animated={true} />
            <div className="home-logo-glow"></div>
          </div>
          <Title level={1} className="home-title">
            一起掷骰子
          </Title>
          <Text className="home-subtitle">
            Let's Roll the Dice Together
          </Text>
          <div className="home-tagline">
            <ThunderboltOutlined /> 智能加权随机 · 精美 3D 动画 · 数据统计分析
          </div>
        </div>

        {/* 功能卡片轮播 */}
        <div className="home-features">
          <Carousel
            className="home-features-carousel"
            autoplay
            autoplaySpeed={3000}
            dots={true}
            dotPosition="bottom"
            slidesToShow={slidesToShow}
            slidesToScroll={1}
            infinite={true}
            arrows={false}
          >
            {features.map((feature, index) => (
              <div key={index} className="home-feature-slide">
                <Card
                  className={`home-feature-card ${feature.primary ? 'primary' : ''}`}
                  hoverable
                  onClick={feature.action}
                >
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon">{feature.icon}</div>
                  </div>
                  <Title level={4} className="feature-title">
                    {feature.title}
                  </Title>
                  <Text className="feature-description">
                    {feature.description}
                  </Text>
                  <Button
                    type={feature.primary ? "primary" : "default"}
                    size="large"
                    className="feature-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      feature.action();
                    }}
                  >
                    立即体验
                  </Button>
                </Card>
              </div>
            ))}
          </Carousel>
        </div>

        {/* 底部信息 */}
        <div className="home-footer">
          <Text type="secondary" className="home-footer-text">
            一个现代化的在线掷骰子应用
          </Text>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router basename={basename}>
        <Routes>
          <Route path="/" element={<HomeNav />} />
          <Route path="/dice" element={<DicePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/version-history" element={<VersionHistoryPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
