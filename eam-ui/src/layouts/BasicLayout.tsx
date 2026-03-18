import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, DashboardOutlined, PartitionOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const BasicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    const menuItems = [
        { key: '/', icon: <DashboardOutlined />, label: <Link to="/">首页</Link> },
        {
            key: '/asset',
            icon: <PartitionOutlined />,
            label: '资产管理',
            children: [
                { key: '/asset/ledger', label: <Link to="/asset/ledger">资产台账</Link> },
                { key: '/asset/category', label: <Link to="/asset/category">资产分类</Link> },
            ],
        },
        {
            key: '/workflow',
            icon: <PartitionOutlined />,
            label: '流程管理',
            children: [
                { key: '/workflow/request', label: <Link to="/workflow/request">我的申请</Link> },
                { key: '/workflow/tasks', label: <Link to="/workflow/tasks">我的待办</Link> },
                { key: '/workflow/definition', label: <Link to="/workflow/definition">流程引擎</Link> },
                { key: '/workflow/config', label: <Link to="/workflow/config">流程配置</Link> },
            ],
        },
        {
            key: '/system',
            icon: <UserOutlined />,
            label: '系统管理',
            children: [
                { key: '/system/user', label: <Link to="/system/user">用户管理</Link> },
                { key: '/system/dept', label: <Link to="/system/dept">部门管理</Link> },
            ],
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                EAM 企业资产管理系统
            </Header>
            <Layout>
                <Sider width={200} theme="light">
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        style={{ height: '100%', borderRight: 0 }}
                        items={menuItems}
                    />
                </Sider>
                <Layout style={{ padding: '24px' }}>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            background: '#fff',
                        }}
                    >
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default BasicLayout;
