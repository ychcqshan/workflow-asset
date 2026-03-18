import React, { useEffect, useRef, useState } from 'react';
import Modeler from 'bpmn-js/lib/Modeler';
import { Button, Space, message, Drawer } from 'antd';
import { SaveOutlined, CloudUploadOutlined } from '@ant-design/icons';

// 引入 bpmn-js 核心样式
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

// 引入属性面板模块与样式
import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel';
import CamundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';

const INITIAL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  xmlns:flowable="http://flowable.org/bpmn"
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn" 
                  exporter="Camunda Modeler" 
                  exporterVersion="4.6.0">
  <bpmn:process id="Process_${Date.now()}" name="新流程" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="开始"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${Date.now()}">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

interface BpmnModelerProps {
    xml?: string;
    onSave?: (xml: string) => void;
    onDeploy?: (file: File) => void;
    visible: boolean;
    onClose: () => void;
}

const BpmnModeler: React.FC<BpmnModelerProps> = ({ xml, onSave, onDeploy, visible, onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const propertiesRef = useRef<HTMLDivElement>(null);
    const modelerRef = useRef<any | null>(null);
    const [localXml] = useState(xml || INITIAL_XML);

    useEffect(() => {
        // 如果不可见，直接销毁，释放内存并避免重复渲染
        if (!visible) {
            if (modelerRef.current) {
                modelerRef.current.destroy();
                modelerRef.current = null;
            }
            return;
        }

        // 打开 visible 后且 modeler 未被初始化
        if (containerRef.current && propertiesRef.current && !modelerRef.current) {
            modelerRef.current = new Modeler({
                container: containerRef.current,
                keyboard: { bindTo: window }, // 启用快捷键
                additionalModules: [
                    BpmnPropertiesPanelModule,
                    BpmnPropertiesProviderModule,
                    CamundaPlatformPropertiesProviderModule
                ],
                moddleExtensions: {
                    camunda: CamundaModdleDescriptor
                },
                propertiesPanel: {
                    parent: propertiesRef.current
                }
            });

            // 导入 XML
            modelerRef.current.importXML(xml || localXml).catch((err: any) => {
                console.error(err);
                message.error('加载流程图失败');
            });
        }

        return () => {
            if (modelerRef.current) {
                modelerRef.current.destroy();
                modelerRef.current = null;
            }
        };
    }, [visible, xml, localXml]);

    const handleDownloadXml = async () => {
        if (!modelerRef.current) return;
        try {
            const { xml: updatedXml } = await modelerRef.current.saveXML({ format: true });
            if (onSave && updatedXml) {
                onSave(updatedXml);
            }
            // 触发下载
            const blob = new Blob([updatedXml || ''], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'process.bpmn20.xml';
            a.click();
            URL.revokeObjectURL(url);
            message.success('导出成功');
        } catch (err) {
            message.error('导出失败');
        }
    };

    const handleDeploy = async () => {
        if (!modelerRef.current) return;
        try {
            const { xml: updatedXml } = await modelerRef.current.saveXML({ format: true });
            if (!updatedXml) throw new Error('XML 为空');

            // 构造 File 对象
            const file = new File([updatedXml], 'process.bpmn20.xml', { type: 'application/xml' });
            if (onDeploy) {
                onDeploy(file);
            }
        } catch (err) {
            message.error('部署失败');
        }
    };

    return (
        <Drawer
            title="在线 BPMN 流程建模"
            width="100%"
            height="100%"
            placement="bottom"
            open={visible}
            onClose={onClose}
            style={{ padding: 0 }}
            extra={
                <Space>
                    <Button icon={<SaveOutlined />} onClick={handleDownloadXml}>导出 XML</Button>
                    <Button icon={<CloudUploadOutlined />} type="primary" onClick={handleDeploy}>部署到引擎</Button>
                </Space>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%' }}>
                {/* 绘图区 */}
                <div 
                    ref={containerRef} 
                    style={{ flex: 1, height: '100%', position: 'relative', borderRight: '1px solid #f0f0f0' }} 
                />
                
                {/* 属性面板区 */}
                <div 
                    ref={propertiesRef} 
                    style={{ 
                        width: '380px', 
                        height: '100%', 
                        overflowY: 'auto', 
                        backgroundColor: '#fafafa' 
                    }} 
                />
            </div>
        </Drawer>
    );
};

export default BpmnModeler;

