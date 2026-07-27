/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { JourneyMapData, JourneyNode, ActiveView, Connection } from './types';
import { solarPVJourneyData, evJourneyData } from './data/solarPVJourney';
import { Header } from './components/Header';
import { JourneyMatrix } from './components/JourneyMatrix';
import { FlowBoardView } from './components/FlowBoardView';
import { EmotionCurveView } from './components/EmotionCurveView';
import { TableView } from './components/TableView';
import { NodeEditorModal } from './components/NodeEditorModal';
import { StructureManagerModal } from './components/StructureManagerModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { exportToJson, exportToCsv, importFromJsonFile } from './utils/export';

const STORAGE_KEY = 'ujm_editor_data_v2';

export default function App() {
  // Main journey state
  const [journeyData, setJourneyData] = useState<JourneyMapData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse localStorage journey data:', e);
    }
    return solarPVJourneyData;
  });

  // Undo/Redo history stack
  const [history, setHistory] = useState<JourneyMapData[]>([journeyData]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Active view mode
  const [activeView, setActiveView] = useState<ActiveView>('matrix');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showConnections, setShowConnections] = useState<boolean>(true);

  // Modals & Drawers
  const [editingNode, setEditingNode] = useState<Partial<JourneyNode> | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState<boolean>(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(journeyData));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [journeyData]);

  // Update journey data with history push
  const updateJourney = (newData: JourneyMapData) => {
    setJourneyData(newData);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setJourneyData(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setJourneyData(next);
    }
  };

  // Preset loader
  const handleLoadPreset = (presetKey: string) => {
    if (presetKey === 'solar') {
      updateJourney(solarPVJourneyData);
    } else if (presetKey === 'ev') {
      updateJourney(evJourneyData);
    } else if (presetKey === 'blank') {
      updateJourney({
        id: `blank_${Date.now()}`,
        title: '自定义用户旅程图',
        description: '可以在此新增阶段、泳道角色与节点卡片',
        version: '1.0',
        updatedAt: new Date().toISOString().split('T')[0],
        stages: [
          { id: 'stg_1', name: '探索阶段', color: '#3b82f6', order: 1 },
          { id: 'stg_2', name: '使用阶段', color: '#10b981', order: 2 },
        ],
        subStages: [
          { id: 'sstg_1_1', stageId: 'stg_1', name: '了解产品', isKey: false, order: 1 },
          { id: 'sstg_2_1', stageId: 'stg_2', name: '★极速开局', isKey: true, order: 2 },
        ],
        roles: [
          { id: 'r_1', name: '核心用户', category: 'customer', color: '#2563eb', order: 1 },
          { id: 'r_2', name: '服务人员', category: 'partner', color: '#059669', order: 2 },
        ],
        nodes: [
          {
            id: 'n_b_1',
            subStageId: 'sstg_1_1',
            roleId: 'r_1',
            title: '示例步骤 1',
            description: '双击卡片以编辑信息',
            status: 'completed',
          },
        ],
        connections: [],
        attributeRows: [
          {
            id: 'attr_1',
            name: '触点',
            type: 'touchpoint',
            order: 1,
            values: { sstg_1_1: '手机 App' },
          },
        ],
      });
    }
  };

  // Node CRUD
  const handleSaveNode = (savedNode: JourneyNode) => {
    const exists = journeyData.nodes.some((n) => n.id === savedNode.id);
    let updatedNodes: JourneyNode[];

    if (exists) {
      updatedNodes = journeyData.nodes.map((n) => (n.id === savedNode.id ? savedNode : n));
    } else {
      updatedNodes = [...journeyData.nodes, savedNode];
    }

    updateJourney({
      ...journeyData,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = journeyData.nodes.filter((n) => n.id !== nodeId);
    const updatedConnections = journeyData.connections.filter(
      (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
    );

    updateJourney({
      ...journeyData,
      nodes: updatedNodes,
      connections: updatedConnections,
    });
  };

  const handleQuickAddCellNode = (subStageId: string, roleId: string) => {
    const newNode: Partial<JourneyNode> = {
      subStageId,
      roleId,
      title: '新操作节点',
      description: '点击填写详细业务内容...',
      status: 'completed',
    };
    setEditingNode(newNode);
    setIsNodeModalOpen(true);
  };

  // Connection management
  const handleAddConnection = (
    sourceId: string,
    targetId: string,
    label?: string,
    style: 'solid' | 'dashed' = 'solid'
  ) => {
    if (sourceId === targetId) return;

    const newConn: Connection = {
      id: `c_${Date.now()}`,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      label: label || '',
      style,
    };

    updateJourney({
      ...journeyData,
      connections: [...journeyData.connections, newConn],
    });
  };

  const handleDeleteConnection = (connId: string) => {
    updateJourney({
      ...journeyData,
      connections: journeyData.connections.filter((c) => c.id !== connId),
    });
  };

  const handleToggleConnectionStyle = (connId: string) => {
    updateJourney({
      ...journeyData,
      connections: journeyData.connections.map((c) => {
        if (c.id === connId) {
          return {
            ...c,
            style: c.style === 'solid' ? 'dashed' : 'solid',
          };
        }
        return c;
      }),
    });
  };

  // Attribute Rows inline update
  const handleUpdateAttributeCell = (rowId: string, subStageId: string, value: string) => {
    updateJourney({
      ...journeyData,
      attributeRows: journeyData.attributeRows.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            values: {
              ...row.values,
              [subStageId]: value,
            },
          };
        }
        return row;
      }),
    });
  };

  const handleAddAttributeRow = (name?: string, iconName?: string) => {
    const rowName = name || '新增属性维度';
    const newRow = {
      id: `attr_${Date.now()}`,
      name: rowName,
      iconName: iconName || 'Smartphone',
      type: 'text' as const,
      order: journeyData.attributeRows.length + 1,
      values: {},
    };

    updateJourney({
      ...journeyData,
      attributeRows: [...journeyData.attributeRows, newRow],
    });
  };

  const handleDeleteAttributeRow = (rowId: string) => {
    updateJourney({
      ...journeyData,
      attributeRows: journeyData.attributeRows.filter((r) => r.id !== rowId),
    });
  };

  const handleUpdateAttributeRow = (rowId: string, name: string, iconName?: string) => {
    updateJourney({
      ...journeyData,
      attributeRows: journeyData.attributeRows.map((r) =>
        r.id === rowId ? { ...r, name, iconName: iconName || r.iconName } : r
      ),
    });
  };

  // JSON Import
  const handleImportJson = async (file: File) => {
    try {
      const imported = await importFromJsonFile(file);
      updateJourney(imported);
      alert('成功导入用户旅程图！');
    } catch (err: any) {
      alert(`导入失败: ${err.message || '格式错误'}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        title={journeyData.title}
        setTitle={(t) => updateJourney({ ...journeyData, title: t })}
        description={journeyData.description}
        setDescription={(d) => updateJourney({ ...journeyData, description: d })}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAddCard={() => {
          setEditingNode({});
          setIsNodeModalOpen(true);
        }}
        onOpenStructureModal={() => setIsStructureModalOpen(true)}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        onLoadPreset={handleLoadPreset}
        onExportJson={() => exportToJson(journeyData)}
        onExportCsv={() => exportToCsv(journeyData)}
        onExportImage={() => exportToJson(journeyData)}
        onImportJson={handleImportJson}
        onResetDefault={() => updateJourney(solarPVJourneyData)}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        showConnections={showConnections}
        setShowConnections={setShowConnections}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'matrix' && (
          <JourneyMatrix
            data={journeyData}
            onEditNode={(node) => {
              setEditingNode(node);
              setIsNodeModalOpen(true);
            }}
            onQuickAddCellNode={handleQuickAddCellNode}
            onUpdateAttributeCell={handleUpdateAttributeCell}
            onAddAttributeRow={handleAddAttributeRow}
            onDeleteAttributeRow={handleDeleteAttributeRow}
            onUpdateAttributeRow={handleUpdateAttributeRow}
            onAddConnection={handleAddConnection}
            onDeleteConnection={handleDeleteConnection}
            onToggleConnectionStyle={handleToggleConnectionStyle}
            showConnections={showConnections}
            zoomLevel={zoomLevel}
          />
        )}

        {activeView === 'flow' && (
          <FlowBoardView
            data={journeyData}
            onEditNode={(node) => {
              setEditingNode(node);
              setIsNodeModalOpen(true);
            }}
          />
        )}

        {activeView === 'emotion' && <EmotionCurveView data={journeyData} />}

        {activeView === 'table' && (
          <TableView
            data={journeyData}
            onEditNode={(node) => {
              setEditingNode(node);
              setIsNodeModalOpen(true);
            }}
            onDeleteNode={handleDeleteNode}
            onOpenAddCard={() => {
              setEditingNode({});
              setIsNodeModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Modal & Drawer dialogs */}
      <NodeEditorModal
        isOpen={isNodeModalOpen}
        onClose={() => {
          setIsNodeModalOpen(false);
          setEditingNode(null);
        }}
        node={editingNode}
        data={journeyData}
        onSaveNode={handleSaveNode}
        onDeleteNode={handleDeleteNode}
        onAddConnection={handleAddConnection}
        onDeleteConnection={handleDeleteConnection}
      />

      <StructureManagerModal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
        data={journeyData}
        onUpdateStructure={(updated) => updateJourney(updated)}
      />

      <AIAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        data={journeyData}
      />
    </div>
  );
}
