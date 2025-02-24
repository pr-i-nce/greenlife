import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserTie,
  FaStore,
  FaMoneyBill,
  FaBoxOpen,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaBars,
  FaEye,
  FaChartLine
} from 'react-icons/fa';
import AgentsTable from './Agent/AgentsTable';
import DistributorsTable from './Distributor/DistributorsTable';
import RegionalManagersTable from './RegionalManagers/RegionalManagersTable';
import SubRegionalManagersTable from './SubRegionManagers/SubRegionalManagersTable';
import ProductsTable from './Products/ProductTable';
import CommissionTable from './Commission/CommissionTable';
import RegionsTable from './Regions/RegionTable';
import SubRegionsTable from './SubRegion/SubregionTable';
import UserTable from './User/UserTable';
import GroupTable from './Groups/GroupTable';
import DashboardContent from './DashboardContent';
import SalesTable from './Sales/SalesTable';
import CommissionsTable from './Commissions/CommisionTable';
import PaidCommissionsTable from './Commissions/PaidCommissionsTable';
import '../styles/landingpage.css';

const mainMenuItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <FaChartLine />,
    subItems: [
      { key: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> }
    ]
  },
  {
    key: 'onboarding',
    label: 'Onboarding',
    icon: <FaUserTie />,
    subItems: [
      { key: 'agents', label: 'Agents', icon: <FaUserTie /> },
      { key: 'distributors', label: 'Dealers', icon: <FaStore /> }
    ]
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <FaBoxOpen />,
    subItems: [
      { key: 'regionalManagers', label: 'Regional Managers', icon: <FaUserTie /> },
      { key: 'subRegionalManagers', label: 'Sub Regional Managers', icon: <FaStore /> },
      { key: 'regions', label: 'Regions', icon: <FaMapMarkedAlt /> },
      { key: 'subRegions', label: 'Areas', icon: <FaMapMarkerAlt /> },
      { key: 'products', label: 'Products', icon: <FaBoxOpen /> },
      { key: 'commission', label: 'Commission Configuration', icon: <FaMoneyBill /> }
    ]
  },
  {
    key: 'sales',
    label: 'Sales',
    icon: <FaMoneyBill />,
    subItems: [
      { key: 'reports', label: 'Sales', icon: <FaChartLine /> }
    ]
  },
  {
    key: 'commissionMenu',
    label: 'Commission',
    icon: <FaMoneyBill />,
    subItems: [
      { key: 'commissionDisbursement', label: 'Commission Disbursement', icon: <FaMoneyBill /> },
      { key: 'paidCommissions', label: 'Paid Commissions', icon: <FaMoneyBill /> }
    ]
  },
  {
    key: 'accessManagement',
    label: 'Access Management',
    icon: <FaEye />,
    subItems: [
      { key: 'user', label: 'User', icon: <FaUserTie /> },
      { key: 'group', label: 'Group', icon: <FaStore /> }
    ]
  }
];

function LandingPage() {
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState('Dashboard');
  const [activeSubItem, setActiveSubItem] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Set the dashboard dropdown open by default
  const [openDropdowns, setOpenDropdowns] = useState({ dashboard: true });

  const handleSignOut = () => {
    navigate('/');
  };

  // This function handles main menu clicks by opening its dropdown
  // and selecting the first submenu.
  const handleMainMenuClick = (mainItem) => {
    if (mainItem.subItems && mainItem.subItems.length > 0) {
      // Open only this main menu's dropdown
      setOpenDropdowns({ [mainItem.key]: true });
      // Select and display the first submenu item
      handleSubItemClick(mainItem.key, mainItem.subItems[0].key);
    } else {
      setOpenDropdowns({ [mainItem.key]: true });
      handleSubItemClick(mainItem.key, mainItem.key);
    }
  };

  const handleSubItemClick = (mainKey, subKey) => {
    if (mainKey === 'dashboard') {
      setActiveComponent('Dashboard');
    } else if (mainKey === 'commissionMenu') {
      if (subKey === 'commissionDisbursement') setActiveComponent('CommissionDisbursement');
      else if (subKey === 'paidCommissions') setActiveComponent('PaidCommissions');
    } else if (mainKey === 'onboarding') {
      if (subKey === 'agents') setActiveComponent('AgentsTable');
      else if (subKey === 'distributors') setActiveComponent('DistributorsTable');
    } else if (mainKey === 'settings') {
      if (subKey === 'products') setActiveComponent('ProductsTable');
      else if (subKey === 'regionalManagers') setActiveComponent('RegionalManagersTable');
      else if (subKey === 'subRegionalManagers') setActiveComponent('SubRegionalManagersTable');
      else if (subKey === 'commission') setActiveComponent('CommissionTable');
      else if (subKey === 'regions') setActiveComponent('RegionsTable');
      else if (subKey === 'subRegions') setActiveComponent('SubRegionsTable');
    } else if (mainKey === 'sales') {
      if (subKey === 'reports') setActiveComponent('SalesReports');
    } else if (mainKey === 'accessManagement') {
      if (subKey === 'user') setActiveComponent('UserTable');
      else if (subKey === 'group') setActiveComponent('GroupTable');
    }
    setActiveSubItem(subKey);
    // Ensure only this dropdown remains open
    setOpenDropdowns({ [mainKey]: true });
    if (window.innerWidth < 780) {
      setSidebarOpen(false);
    }
  };

  const renderMainContent = () => {
    switch (activeComponent) {
      case 'AgentsTable':
        return <AgentsTable />;
      case 'DistributorsTable':
        return <DistributorsTable />;
      case 'RegionalManagersTable':
        return <RegionalManagersTable />;
      case 'SubRegionalManagersTable':
        return <SubRegionalManagersTable />;
      case 'ProductsTable':
        return <ProductsTable />;
      case 'CommissionTable':
        return <CommissionTable />;
      case 'CommissionDisbursement':
        return <CommissionsTable />;
      case 'PaidCommissions':
        return <PaidCommissionsTable />;
      case 'RegionsTable':
        return <RegionsTable />;
      case 'SubRegionsTable':
        return <SubRegionsTable />;
      case 'UserTable':
        return <UserTable />;
      case 'GroupTable':
        return <GroupTable />;
      case 'SalesReports':
        return <SalesTable />;
      case 'Dashboard':
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="landing-page">
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Sidebar Navigation"
            >
              <FaBars />
            </button>
            <h1 className="logo">GreenLife</h1>
          </div>
          <div className="header-right">
            <nav className="top-nav" aria-label="Main Navigation">
              <button type="button" className="sign-out-button" onClick={handleSignOut}>
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>
      <div className="main-container">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Sidebar Navigation">
          {mainMenuItems.map(mainItem => (
            <div key={mainItem.key} className="menu-section">
              {mainItem.subItems ? (
                <>
                  <div
                    className="menu-title"
                    onClick={() => handleMainMenuClick(mainItem)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="menu-icon">{mainItem.icon}</span>
                    <span className="menu-label">{mainItem.label}</span>
                  </div>
                  {openDropdowns[mainItem.key] && (
                    <ul className="sub-menu">
                      {mainItem.subItems.map(subItem => (
                        <li key={subItem.key} className="sub-menu-item">
                          <button
                            type="button"
                            className={`action-button ${activeSubItem === subItem.key ? 'active' : ''}`}
                            onClick={() => handleSubItemClick(mainItem.key, subItem.key)}
                          >
                            <span className="action-icon">{subItem.icon}</span>
                            <span className="action-label">{subItem.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className={`action-button ${activeSubItem === mainItem.key ? 'active' : ''}`}
                  onClick={() => handleSubItemClick(mainItem.key, mainItem.key)}
                >
                  <span className="action-icon">{mainItem.icon}</span>
                  <span className="action-label">{mainItem.label}</span>
                </button>
              )}
            </div>
          ))}
        </aside>
        <main className="content" aria-label="Main Content">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}

export default LandingPage;
