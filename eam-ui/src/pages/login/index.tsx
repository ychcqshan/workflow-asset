import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '../../api/request';
import { useUserStore } from '../../store/userStore';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const setToken = useUserStore((state) => state.setToken);

    const onFinish = async (values: any) => {
        try {
            const res: any = await request.post('/login', values);
            setToken(res.data.token);
            message.success('登录成功');
            navigate('/');
        } catch (error: any) {
            message.error(error.message || '登录失败');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
            <Card title="EAM 企业资产管理系统" style={{ width: 400 }}>
                <Form name="login" onFinish={onFinish}>
                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                        <Input prefix={<UserOutlined />} placeholder="用户名" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                        <Input prefix={<LockOutlined />} type="password" placeholder="密码" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
