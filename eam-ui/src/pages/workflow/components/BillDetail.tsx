import React, { useEffect, useState } from 'react';
import { Descriptions, Skeleton, Tag } from 'antd';
import { getAsset, Asset } from '../../../api/asset';

interface BillDetailProps {
    assetId: number;
    billType: string;
    reason: string;
}

const BillDetail: React.FC<BillDetailProps> = ({ assetId, billType, reason }) => {
    const [asset, setAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (assetId) {
            setLoading(true);
            getAsset(assetId).then(res => {
                setAsset(res.data);
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [assetId]);

    if (loading) return <Skeleton active />;

    return (
        <div style={{ marginBottom: 24 }}>
            <Descriptions title="申请详情" bordered column={1} size="small">
                <Descriptions.Item label="单据类型">
                    <Tag color="blue">{billType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="申请原因">{reason}</Descriptions.Item>
            </Descriptions>

            {asset && (
                <Descriptions title="关联资产信息" bordered column={2} size="small" style={{ marginTop: 16 }}>
                    <Descriptions.Item label="资产名称">{asset.assetName}</Descriptions.Item>
                    <Descriptions.Item label="资产编号">{asset.assetCode}</Descriptions.Item>
                    <Descriptions.Item label="规格型号">{asset.spec || '-'}</Descriptions.Item>
                    <Descriptions.Item label="当前状态">
                        <Tag color={asset.status === '0' ? 'green' : 'orange'}>
                            {asset.status === '0' ? '闲置' : '在用'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="存放地点">{asset.location}</Descriptions.Item>
                    <Descriptions.Item label="SN码">{asset.snCode || '-'}</Descriptions.Item>
                </Descriptions>
            )}
        </div>
    );
};

export default BillDetail;
