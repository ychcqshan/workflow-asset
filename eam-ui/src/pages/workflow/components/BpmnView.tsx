import React, { useEffect, useRef, useState } from 'react';
import BpmnViewer from 'bpmn-js/lib/Viewer';
import { Button, Space, Tooltip, Spin } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, ExpandOutlined, ReloadOutlined } from '@ant-design/icons';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

interface BpmnViewProps {
    xml?: string;
    loading?: boolean;
    activeNodes?: string[];
    height?: string | number;
}

const BpmnView: React.FC<BpmnViewProps> = ({ xml, loading: propLoading, activeNodes, height = '500px' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<BpmnViewer | null>(null);
    const [rendering, setRendering] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        // 初始化 Viewer
        viewerRef.current = new BpmnViewer({
            container: containerRef.current
        });

        // 监听容器大小变化
        const resizeObserver = new ResizeObserver(() => {
            if (viewerRef.current) {
                const canvas: any = viewerRef.current.get('canvas');
                canvas.resized();
                canvas.zoom('fit-viewport'); // 强制居中
            }
        });
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (viewerRef.current) {
                viewerRef.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (xml && viewerRef.current) {
            setRendering(true);
            viewerRef.current.importXML(xml).then(() => {
                setRendering(false);
                const canvas: any = viewerRef.current?.get('canvas');
                canvas.zoom('fit-viewport');

                // 移除所有旧的高亮节点样式，避免残留
                // BpmnViewer 没有 clearMarkers 方法，可以直接遍历处理，或者在 importXML 时它会自动重置。
                
                // 高亮当前活跃节点
                if (activeNodes && activeNodes.length > 0) {
                    activeNodes.forEach(nodeId => {
                        canvas.addMarker(nodeId, 'highlight-node');
                    });
                }
            }).catch(err => {
                setRendering(false);
                console.error('Error rendering BPMN', err);
            });
        }
    }, [xml, activeNodes]);

    // 工具栏操作方法
    const handleZoomIn = () => {
        const canvas: any = viewerRef.current?.get('canvas');
        if (canvas) canvas.zoom(canvas.zoom() * 1.2);
    };

    const handleZoomOut = () => {
        const canvas: any = viewerRef.current?.get('canvas');
        if (canvas) canvas.zoom(canvas.zoom() * 0.8);
    };

    const handleZoomFit = () => {
        const canvas: any = viewerRef.current?.get('canvas');
        if (canvas) canvas.zoom('fit-viewport');
    };

    const handleZoomReset = () => {
        const canvas: any = viewerRef.current?.get('canvas');
        if (canvas) canvas.zoom(1.0);
    };

    const isLoading = propLoading || rendering;

    return (
        <div style={{ position: 'relative', width: '100%', height, border: '1px solid #f0f0f0', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
            <Spin spinning={isLoading} tip="加载流程图...">
                <div ref={containerRef} style={{ width: '100%', height }} />
            </Spin>

            {/* 工具栏 */}
            {!isLoading && xml && (
                <div style={{ position: 'absolute', right: 16, top: 16, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <Space size={4}>
                        <Tooltip title="放大">
                            <Button type="text" size="small" icon={<ZoomInOutlined />} onClick={handleZoomIn} />
                        </Tooltip>
                        <Tooltip title="缩小">
                            <Button type="text" size="small" icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
                        </Tooltip>
                        <Tooltip title="最适大小">
                            <Button type="text" size="small" icon={<ExpandOutlined />} onClick={handleZoomFit} />
                        </Tooltip>
                        <Tooltip title="重置">
                            <Button type="text" size="small" icon={<ReloadOutlined />} onClick={handleZoomReset} />
                        </Tooltip>
                    </Space>
                </div>
            )}

            <style>{`
                .highlight-node:not(.djs-connection) .djs-visual > :nth-child(1) {
                    fill: #e6f7ff !important;
                    stroke: #1890ff !important;
                    stroke-width: 3px !important;
                    filter: drop-shadow(0 0 4px rgba(24, 144, 255, 0.5)) !important;
                }
                .highlight-node .djs-label {
                    fill: #1890ff !important;
                    font-weight: bold !important;
                }
                .djs-container {
                    background: radial-gradient(circle, #f0f0f0 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    );
};

export default BpmnView;
