import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../styles/dashboardcontent.css';

const Dashboard = () => {
  const userName = 'Wanjiku';
  const brandName = 'GreenLife';
  const statCards = [
    { label: 'Daily Sales', value: 'KES 154,000', change: '+5%' },
    { label: 'Monthly Sales', value: 'KES 4,120,000', change: '+12%' },
    { label: 'Total Customers', value: '8,760', change: '+2%' },
    { label: 'Yearly Growth', value: '28%', change: '+4%' },
  ];
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Monthly Sales (KES)',
        data: [3000000, 3200000, 3500000, 4000000, 4120000, 3800000, 4100000, 4300000],
        borderColor: '#2B9843',
        backgroundColor: 'rgba(43,152,67,0.15)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Monthly Sales Trend',
        color: '#444',
        font: { size: 16 },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#666' } },
      y: {
        grid: { color: '#eee' },
        ticks: {
          callback: (value) => `KES ${(value / 1000).toLocaleString()}k`,
          color: '#666',
        },
      },
    },
  };
  const barChartData = {
    labels: ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru'],
    datasets: [
      {
        label: 'Region Sales (KES)',
        data: [1200000, 800000, 600000, 400000, 300000],
        backgroundColor: '#21B98F',
        borderRadius: 6,
      },
    ],
  };
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Regional Sales',
        color: '#444',
        font: { size: 16 },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#666' } },
      y: {
        grid: { color: '#eee' },
        ticks: {
          callback: (value) => `KES ${(value / 1000).toLocaleString()}k`,
          color: '#666',
        },
      },
    },
  };
  const topAgents = [
    { name: 'Kamau', sales: 900000, commission: 'KES 45,000', region: 'Nairobi' },
    { name: 'Achieng', sales: 750000, commission: 'KES 37,500', region: 'Kisumu' },
    { name: 'Njeri', sales: 680000, commission: 'KES 34,000', region: 'Nakuru' },
    { name: 'Otieno', sales: 650000, commission: 'KES 32,500', region: 'Mombasa' },
    { name: 'Muthoni', sales: 600000, commission: 'KES 30,000', region: 'Eldoret' },
  ];

  return (
    <div className="kenya-dashboard-container">
      <div className="welcome-section">
        <h1>Welcome Back!</h1>
        <p>Here’s your latest sales overview.</p>
      </div>
      <div className="stat-cards">
        {statCards.map((card, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" />
            <div className="stat-info">
              <h3>{card.value}</h3>
              <p>{card.label}</p>
            </div>
            <span className="stat-change">{card.change}</span>
          </div>
        ))}
      </div>
      <div className="charts-row">
        <div className="chart-box">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
        <div className="chart-box">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>
      <div className="agents-table">
        <h2>Top Performing Agents</h2>
        <table>
          <thead>
            <tr>
              <th>Agent</th>
              <th>Sales (KES)</th>
              <th>Commission</th>
              <th>Region</th>
            </tr>
          </thead>
          <tbody>
            {topAgents.map((agent, i) => (
              <tr key={i}>
                <td data-label="Agent">{agent.name}</td>
                <td data-label="Sales (KES)">{agent.sales.toLocaleString()}</td>
                <td data-label="Commission">{agent.commission}</td>
                <td data-label="Region">{agent.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
