// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import { Film, Ticket, Users, Eye, Edit, Trash } from 'lucide-react';

const iconMap = {
    film: <Film size={30} />,
    ticket: <Ticket size={30} />,
    users: <Users size={30} />,
    dollar: <span style={{ fontSize: 30 }}>$</span>,
  };

  const Dashboard = () => {
    const [stats] = useState([
      { title: 'Tổng số phim', value: 24, trend: '+12%', icon: 'film' },
      { title: 'Lượt đặt vé', value: 156, trend: '+8%', icon: 'ticket' },
      { title: 'Doanh thu', value: '5.230.000 VND', trend: '+15%', icon: 'dollar' },
      { title: 'Người dùng hoạt động', value: '1.254', trend: '+5%', icon: 'users' },
    ]);

    const [recentMovies] = useState([
        { id: 1, title: 'Inception', bookings: 120, revenue: '1.200.000 VND', status: 'Đang chiếu' },
        { id: 2, title: 'The Dark Knight', bookings: 150, revenue: '1.500.000 VND', status: 'Đang chiếu' },
        { id: 3, title: 'Interstellar', bookings: 80, revenue: '800.000 VND', status: 'Đang chiếu' },
        { id: 4, title: 'Tenet', bookings: 60, revenue: '600.000 VND', status: 'Sắp chiếu' },
      ]);

      return (
        <div className="dashboard-container">
          <div className="page-header">
            <h1>Bảng điều khiển</h1>
            <p>Tổng quan hệ thống đặt vé xem phim</p>
          </div>
    
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="stats-card">
                {iconMap[stat.icon] || null}
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
                <span className="trend">{stat.trend}</span>
              </div>
            ))}
          </div>
    
          <div className="recent-movies">
            <h2>Phim gần đây</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên phim</TableCell>
                  <TableCell>Lượt đặt vé</TableCell>
                  <TableCell>Doanh thu</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentMovies.map((movie) => (
                  <TableRow key={movie.id}>
                    <TableCell>{movie.title}</TableCell>
                    <TableCell>{movie.bookings}</TableCell>
                    <TableCell>{movie.revenue}</TableCell>
                    <TableCell className={movie.status === 'Đang chiếu' ? 'status-active' : 'status-inactive'}>
                      {movie.status}
                    </TableCell>
                    <TableCell>
                      <Button size="small"><Eye size={18} /></Button>
                      <Button size="small"><Edit size={18} /></Button>
                      <Button size="small"><Trash size={18} /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    };
    
    export default Dashboard;