import React from 'react';
import { Card, Table, Tag, Descriptions, Alert, Typography, Space, Divider } from 'antd';
import { ApartmentOutlined, UserOutlined, TeamOutlined, BranchesOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const BILL_TYPE_CONFIG = [
    {
        billType: '领用',
        processKey: 'AssetBorrowProcess',
        bpmnFile: 'AssetBorrowProcess.bpmn20.xml',
        steps: ['部门长审批', '中心主任审批', '资产管理员确认'],
        resultListener: 'assetStateExecutionListener',
        description: '资产领用申请，审批通过后资产状态变为「在用(1)」',
        statusOnApprove: '在用 (1)',
    },
    {
        billType: '退库',
        processKey: 'AssetReturnProcess',
        bpmnFile: 'AssetReturnProcess.bpmn20.xml',
        steps: ['部门长审批', '中心主任审批', '资产管理员确认'],
        resultListener: 'assetStateExecutionListener',
        description: '资产退库/归还申请，审批通过后资产状态变为「闲置(0)」',
        statusOnApprove: '闲置 (0)',
    },
    {
        billType: '报修',
        processKey: 'AssetRepairProcess',
        bpmnFile: 'AssetRepairProcess.bpmn20.xml',
        steps: ['部门长审批', '资产管理员受理'],
        resultListener: 'assetRepairExecutionListener',
        description: '资产故障报修申请，审批通过后资产状态变为「维修中(2)」',
        statusOnApprove: '维修中 (2)',
    },
    {
        billType: '报废',
        processKey: 'AssetScrapProcess',
        bpmnFile: 'AssetScrapProcess.bpmn20.xml',
        steps: ['部门长审批', '中心主任审批', '资产管理员执行'],
        resultListener: 'assetScrapExecutionListener',
        description: '资产报废申请，审批通过后资产状态变为「已报废(3)」',
        statusOnApprove: '已报废 (3)',
    },
];

const APPROVAL_ROUTING: Array<{ role: string; source: string; field: string; icon: React.ReactNode }> = [
    {
        role: '部门长',
        source: 'SysDept',
        field: 'leader_id',
        icon: <UserOutlined />,
    },
    {
        role: '中心主任',
        source: 'SysDept (递归向上查找)',
        field: 'director_id',
        icon: <TeamOutlined />,
    },
];

const ASSET_STATUS_MAP = [
    { code: 0, label: '闲置', color: 'default', trigger: '退库审批通过' },
    { code: 1, label: '在用', color: 'blue', trigger: '领用审批通过' },
    { code: 2, label: '维修中', color: 'orange', trigger: '报修审批通过' },
    { code: 3, label: '已报废', color: 'red', trigger: '报废审批通过 / 驳回不变更' },
];

const WorkflowConfig: React.FC = () => {
    const billColumns = [
        { title: '业务类型', dataIndex: 'billType', key: 'billType', render: (v: string) => <Tag color="purple">{v}</Tag> },
        { title: '流程Key', dataIndex: 'processKey', key: 'processKey', render: (v: string) => <Text code>{v}</Text> },
        {
            title: '审批链路',
            dataIndex: 'steps',
            key: 'steps',
            render: (steps: string[]) => (
                <Space size={4}>
                    {steps.map((s, i) => (
                        <React.Fragment key={s}>
                            <Tag>{s}</Tag>
                            {i < steps.length - 1 && <span style={{ color: '#999' }}>→</span>}
                        </React.Fragment>
                    ))}
                </Space>
            ),
        },
        {
            title: '通过后资产状态',
            dataIndex: 'statusOnApprove',
            key: 'statusOnApprove',
            render: (v: string) => <Tag color="geekblue">{v}</Tag>,
        },
        { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true },
    ];

    const statusColumns = [
        { title: '状态码', dataIndex: 'code', key: 'code', width: 80 },
        {
            title: '含义',
            dataIndex: 'label',
            key: 'label',
            render: (label: string, r: any) => <Tag color={r.color}>{label}</Tag>,
        },
        { title: '触发场景', dataIndex: 'trigger', key: 'trigger' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Alert
                type="info"
                showIcon
                message="此页面为只读配置展示，修改流程寻址规则需要调整后端 DeptRoutingService，修改流程图需要在「流程引擎管理」中重新部署 BPMN 文件。"
            />

            <Card
                title={<Space><BranchesOutlined /> 业务类型 → 流程配置映射</Space>}
                size="small"
            >
                <Table
                    dataSource={BILL_TYPE_CONFIG}
                    columns={billColumns}
                    rowKey="billType"
                    pagination={false}
                    size="small"
                />
            </Card>

            <Card
                title={<Space><ApartmentOutlined /> 动态审批寻址规则（DeptRoutingService）</Space>}
                size="small"
            >
                <Alert
                    type="warning"
                    style={{ marginBottom: 12 }}
                    message="审批人基于申请人所属部门动态寻址，规则如下："
                />
                <Descriptions bordered column={1} size="small">
                    {APPROVAL_ROUTING.map(item => (
                        <Descriptions.Item
                            key={item.role}
                            label={<Space>{item.icon}<b>{item.role}</b></Space>}
                        >
                            查询表 <Text code>sys_dept</Text> 中字段 <Text code>{item.field}</Text>
                            <Text type="secondary" style={{ marginLeft: 8 }}>（{item.source}）</Text>
                        </Descriptions.Item>
                    ))}
                    <Descriptions.Item label={<Space><UserOutlined /><b>资产管理员</b></Space>}>
                        固定分配给角色 <Text code>ROLE_ASSET_ADMIN</Text> 对应用户
                        <Text type="secondary" style={{ marginLeft: 8 }}>（配置于 BPMN 的固定 assignee）</Text>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card
                title={<Space><ApartmentOutlined /> 资产状态自动机</Space>}
                size="small"
            >
                <Table
                    dataSource={ASSET_STATUS_MAP}
                    columns={statusColumns}
                    rowKey="code"
                    pagination={false}
                    size="small"
                />
                <Divider style={{ margin: '12px 0' }} />
                <Text type="secondary">
                    驳回场景：<Text code>AssetRejectExecutionListener</Text> 将单据 auditStatus 标记为 3（已驳回），
                    资产状态保持不变（不回滚）。
                </Text>
            </Card>
        </div>
    );
};

export default WorkflowConfig;
