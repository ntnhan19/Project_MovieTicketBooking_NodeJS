import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Statistic, 
  Progress, 
  List, 
  Tag, 
  Skeleton, 
  Button, 
  Tooltip,
  Empty,
  Tabs,
  message 
} from 'antd';
import { 
  StarOutlined, 
  TrophyOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  GiftOutlined,
  HistoryOutlined,
  PlusOutlined,
  SwapOutlined
} from '@ant-design/icons';

// Mock API - thay thế bằng API thật sau
const loyaltyApi = {
  getUserPoints: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          currentPoints: 750,
          totalEarnedPoints: 1200,
          membershipLevel: 'Gold',
          pointsToNextLevel: 250,
          nextLevel: 'Platinum',
          pointsExpiringSoon: 100,
          expiryDate: '2025-06-30'
        });
      }, 1000);
    });
  },
  getPointsHistory: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, type: 'earned', points: 150, description: 'Đặt vé xem phim "Người Nhện 4"', date: '2025-04-15' },
          { id: 2, type: 'earned', points: 100, description: 'Đặt vé xem phim "Avengers 5"', date: '2025-03-25' },
          { id: 3, type: 'spent', points: 200, description: 'Đổi combo bắp nước miễn phí', date: '2025-03-10' },
          { id: 4, type: 'earned', points: 200, description: 'Đặt vé xem phim "Kẻ cắp mặt trăng 4"', date: '2025-02-20' },
          { id: 5, type: 'earned', points: 100, description: 'Đặt vé xem phim "Fast & Furious 10"', date: '2025-01-30' },
          { id: 6, type: 'spent', points: 100, description: 'Đổi voucher giảm giá bắp nước', date: '2025-01-15' },
        ]);
      }, 1000);
    });
  },
  getAvailableRewards: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Vé xem phim miễn phí', points: 500, remainingQuantity: 10, image: '/rewards/free-ticket.png' },
          { id: 2, name: 'Combo bắp nước trung', points: 300, remainingQuantity: 15, image: '/rewards/popcorn-medium.png' },
          { id: 3, name: 'Voucher giảm 50% bắp nước', points: 150, remainingQuantity: 20, image: '/rewards/popcorn-discount.png' },
          { id: 4, name: 'Nâng cấp ghế VIP', points: 200, remainingQuantity: 8, image: '/rewards/vip-seat.png' },
          { id: 5, name: 'Vé xem phim IMAX', points: 700, remainingQuantity: 5, image: '/rewards/imax-ticket.png' },
        ]);
      }, 1000);
    });
  }
};

const LoyaltyCard = ({ user }) => {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    setLoading(true);
    try {
      const [userData, history, rewards] = await Promise.all([
        loyaltyApi.getUserPoints(),
        loyaltyApi.getPointsHistory(),
        loyaltyApi.getAvailableRewards()
      ]);
      
      setLoyaltyData(userData);
      setPointsHistory(history);
      setAvailableRewards(rewards);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      message.error('Không thể tải thông tin điểm thưởng. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đổi quà 
  const handleRedeemReward = (rewardId) => {
    message.info(`Đổi quà thành công với mã phần thưởng: ${rewardId}`);
    // Thêm xử lý đổi quà thực tế tại đây
  };

  // Render thẻ thành viên
  const renderMembershipCard = () => {
    if (!loyaltyData) return <Skeleton active />;

    const progressPercent = Math.floor((loyaltyData.currentPoints / (loyaltyData.currentPoints + loyaltyData.pointsToNextLevel)) * 100);

    return (
      <div className="membership-card bg-gradient-to-r from-primary to-primary-light rounded-lg p-6 text-white mb-6">
        <div className="flex flex-col sm:flex-row justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">Thẻ thành viên {user.fullName || user.name}</h3>
            <p className="text-white/80 mb-4">Mã thành viên: {user.membershipId || `M${user.id}${Math.floor(Math.random() * 1000)}`}</p>
            
            <div className="flex items-center">
              <TrophyOutlined className="text-yellow-300 mr-2" />
              <span className="text-lg">{loyaltyData.membershipLevel}</span>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Statistic 
              title={<span className="text-white/90">Điểm hiện tại</span>}
              value={loyaltyData.currentPoints}
              prefix={<StarOutlined />}
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span>Cấp tiếp theo: {loyaltyData.nextLevel}</span>
            <span>{loyaltyData.currentPoints}/{loyaltyData.currentPoints + loyaltyData.pointsToNextLevel}</span>
          </div>
          <Progress 
            percent={progressPercent} 
            status="active" 
            strokeColor="#ffffff" 
            trailColor="rgba(255, 255, 255, 0.3)"
            showInfo={false}
          />
          <div className="text-sm mt-1">
            Cần thêm <span className="font-bold">{loyaltyData.pointsToNextLevel}</span> điểm để lên cấp
          </div>
        </div>
        
        {loyaltyData.pointsExpiringSoon > 0 && (
          <div className="mt-4 flex items-center text-white/90 text-sm">
            <ClockCircleOutlined className="mr-1" />
            <span>{loyaltyData.pointsExpiringSoon} điểm sẽ hết hạn vào ngày {new Date(loyaltyData.expiryDate).toLocaleDateString('vi-VN')}</span>
          </div>
        )}
      </div>
    );
  };

  // Render lịch sử điểm
  const renderPointsHistory = () => {
    if (loading) return <Skeleton active paragraph={{ rows: 5 }} />;
    
    if (pointsHistory.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có lịch sử điểm thưởng"
        />
      );
    }

    return (
      <List
        dataSource={pointsHistory}
        renderItem={(item) => (
          <List.Item>
            <div className="w-full flex justify-between items-center">
              <div>
                <div className="font-medium">{item.description}</div>
                <div className="text-text-secondary text-sm">{new Date(item.date).toLocaleDateString('vi-VN')}</div>
              </div>
              <div>
                <Tag 
                  color={item.type === 'earned' ? 'green' : 'volcano'}
                  icon={item.type === 'earned' ? <PlusOutlined /> : <SwapOutlined />}
                >
                  {item.type === 'earned' ? '+' : '-'}{item.points} điểm
                </Tag>
              </div>
            </div>
          </List.Item>
        )}
        pagination={{
          pageSize: 5,
          size: 'small',
          hideOnSinglePage: true
        }}
      />
    );
  };

  // Render danh sách phần thưởng có thể đổi
  const renderAvailableRewards = () => {
    if (loading) return <Skeleton active paragraph={{ rows: 5 }} />;
    
    if (availableRewards.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Hiện tại không có phần thưởng nào"
        />
      );
    }

    return (
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
        dataSource={availableRewards}
        renderItem={(item) => (
          <List.Item>
            <Card 
              hoverable 
              className="reward-card content-card h-full flex flex-col"
              cover={
                <div className="bg-light-bg-secondary p-4 flex justify-center">
                  <img 
                    alt={item.name} 
                    src={item.image || `/api/placeholder/120/120?text=${encodeURIComponent(item.name)}`}
                    className="h-24 object-contain"
                  />
                </div>
              }
            >
              <div className="flex flex-col flex-grow">
                <Card.Meta
                  title={item.name}
                  description={
                    <div className="flex items-center">
                      <StarOutlined className="text-yellow-400 mr-1" />
                      <span>{item.points} điểm</span>
                    </div>
                  }
                />
                
                <div className="text-text-secondary text-sm mt-2">
                  Còn lại: {item.remainingQuantity} phần thưởng
                </div>
                
                <div className="mt-4 flex-grow flex items-end">
                  <Button 
                    type="primary" 
                    className="w-full btn-primary" 
                    icon={<GiftOutlined />}
                    disabled={!loyaltyData || loyaltyData.currentPoints < item.points}
                    onClick={() => handleRedeemReward(item.id)}
                  >
                    Đổi thưởng
                  </Button>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    );
  };

  // Tab items
  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <GiftOutlined /> Phần thưởng
        </span>
      ),
      children: renderAvailableRewards()
    },
    {
      key: '2',
      label: (
        <span>
          <HistoryOutlined /> Lịch sử điểm
        </span>
      ),
      children: renderPointsHistory()
    }
  ];

  return (
    <Card 
      title={
        <div className="flex items-center">
          <StarOutlined className="mr-2 text-primary" />
          <span>Điểm thưởng & Đặc quyền thành viên</span>
        </div>
      }
      extra={
        <Tooltip title="Làm mới">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchLoyaltyData}
            loading={loading}
          />
        </Tooltip>
      }
      className="content-card"
    >
      {renderMembershipCard()}
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabItems}
        className="loyalty-tabs"
      />
    </Card>
  );
};

// Thêm icon ReloadOutlined
const ReloadOutlined = () => (
  <span className="anticon">
    <svg viewBox="64 64 896 896" focusable="false" data-icon="reload" width="1em" height="1em" fill="currentColor">
      <path d="M909.1 209.3l-56.4 44.1C775.8 155.1 656.2 92 521.9 92 290 92 102.3 279.5 102 511.5 101.7 743.7 289.8 932 521.9 932c181.3 0 335.8-115 394.6-276.1 1.5-4.2-.7-8.9-4.9-10.3l-56.7-19.5a8 8 0 00-10.1 4.8c-1.8 5-3.8 10-5.9 14.9-17.3 41-42.1 77.8-73.7 109.4A344.77 344.77 0 01655.9 829c-42.3 17.9-87.4 27-133.8 27-46.5 0-91.5-9.1-133.8-27A341.5 341.5 0 01279 755.2a342.16 342.16 0 01-73.7-109.4c-17.9-42.4-27-87.4-27-133.9s9.1-91.5 27-133.9c17.3-41 42.1-77.8 73.7-109.4 31.6-31.6 68.4-56.4 109.3-73.8 42.3-17.9 87.4-27 133.8-27 46.5 0 91.5 9.1 133.8 27a341.5 341.5 0 01109.3 73.8c9.9 9.9 19.2 20.4 27.8 31.4l-60.2 47a8 8 0 003 14.1l175.6 43c5 1.2 9.9-2.6 9.9-7.7l.8-180.9c-.1-6.6-7.8-10.3-13-6.2z"></path>
    </svg>
  </span>
);

export default LoyaltyCard;