/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { JourneyMapData, JourneyNode, ActiveView, Connection, LineStyle, AttributeRow } from './types';
import { solarPVJourneyData } from './data/solarPVJourney';
import { Header } from './components/Header';
import { JourneyMatrix } from './components/JourneyMatrix';
import { FlowBoardView } from './components/FlowBoardView';
import { EmotionCurveView } from './components/EmotionCurveView';
import { TableView } from './components/TableView';
import { NodeEditorModal } from './components/NodeEditorModal';
import { StructureManagerModal } from './components/StructureManagerModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { AllJourneysModal } from './components/AllJourneysModal';
import { ExportModal } from './components/ExportModal';
import { exportToJson, exportToCsv, exportToPng, importFromJsonFile } from './utils/export';

const CURRENT_JOURNEY_KEY = 'ujm_editor_data_v2';
const SAVED_JOURNEYS_LIST_KEY = 'ujm_saved_journeys_list_v2';

export default function App() {
  // All journeys list state
  const [allJourneys, setAllJourneys] = useState<JourneyMapData[]>(() => {
    try {
      const savedList = localStorage.getItem(SAVED_JOURNEYS_LIST_KEY);
      if (savedList) {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((j: JourneyMapData) => j.id !== 'ev_purchase_journey');
          if (filtered.length > 0) return filtered;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved journeys list:', e);
    }
    return [solarPVJourneyData];
  });

  // Current active journey state
  const [journeyData, setJourneyData] = useState<JourneyMapData>(() => {
    try {
      const currentSaved = localStorage.getItem(CURRENT_JOURNEY_KEY);
      if (currentSaved) {
        const parsed = JSON.parse(currentSaved);
        if (parsed.id !== 'ev_purchase_journey') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse current journey:', e);
    }
    return solarPVJourneyData;
  });

  // Undo/Redo history stack
  const [history, setHistory] = useState<JourneyMapData[]>([journeyData]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Active view mode & canvas settings
  const [activeView, setActiveView] = useState<ActiveView>('matrix');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showConnections, setShowConnections] = useState<boolean>(true);

  // Modals & Drawers
  const [editingNode, setEditingNode] = useState<Partial<JourneyNode> | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState<boolean>(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isAllJourneysModalOpen, setIsAllJourneysModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportModalTab, setExportModalTab] = useState<'png' | 'json' | 'csv'>('png');

  // Auto-save current active journey
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_JOURNEY_KEY, JSON.stringify(journeyData));
    } catch (e) {
      console.error('Error saving current journey:', e);
    }
  }, [journeyData]);

  // Auto-save all journeys list
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_JOURNEYS_LIST_KEY, JSON.stringify(allJourneys));
    } catch (e) {
      console.error('Error saving all journeys list:', e);
    }
  }, [allJourneys]);

  // Update journey data with history push
  const updateJourney = (newData: JourneyMapData) => {
    setJourneyData(newData);

    // Also update in allJourneys list if it exists
    setAllJourneys((prevList) => {
      const idx = prevList.findIndex((j) => j.id === newData.id);
      if (idx !== -1) {
        const copy = [...prevList];
        copy[idx] = newData;
        return copy;
      }
      return [...prevList, newData];
    });

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

  // Saved Journey Actions
  const handleSelectJourney = (journey: JourneyMapData) => {
    setJourneyData(journey);
    setHistory([journey]);
    setHistoryIndex(0);
  };

  const handleSaveCurrentJourney = () => {
    setAllJourneys((prevList) => {
      const idx = prevList.findIndex((j) => j.id === journeyData.id);
      if (idx !== -1) {
        const copy = [...prevList];
        copy[idx] = { ...journeyData, updatedAt: new Date().toISOString().split('T')[0] };
        return copy;
      }
      return [...prevList, { ...journeyData, updatedAt: new Date().toISOString().split('T')[0] }];
    });
  };

  const handleCreateNewJourney = () => {
    const newJourney: JourneyMapData = {
      id: `custom_${Date.now()}`,
      title: '新建自定义用户旅程图',
      description: '全流程、跨角色与体验触点的全景旅程图表',
      version: '1.0',
      updatedAt: new Date().toISOString().split('T')[0],
      stages: [
        { id: `stg_1_${Date.now()}`, name: '认知与探索阶段', color: '#3b82f6', order: 1 },
        { id: `stg_2_${Date.now()}`, name: '方案与购买阶段', color: '#8b5cf6', order: 2 },
        { id: `stg_3_${Date.now()}`, name: '使用与推荐阶段', color: '#10b981', order: 3 },
      ],
      subStages: [
        { id: `sstg_1_${Date.now()}`, stageId: `stg_1_${Date.now()}`, name: '了解产品', isKey: false, order: 1 },
        { id: `sstg_2_${Date.now()}`, stageId: `stg_2_${Date.now()}`, name: '★方案设计', isKey: true, order: 2 },
        { id: `sstg_3_${Date.now()}`, stageId: `stg_3_${Date.now()}`, name: '售后安装', isKey: false, order: 3 },
      ],
      roles: [
        { id: `r_1_${Date.now()}`, name: '核心客户', category: 'customer', color: '#2563eb', order: 1 },
        { id: `r_2_${Date.now()}`, name: '服务经理', category: 'partner', color: '#059669', order: 2 },
      ],
      nodes: [
        {
          id: `n_1_${Date.now()}`,
          subStageId: `sstg_2_${Date.now()}`,
          roleId: `r_1_${Date.now()}`,
          title: '示例步骤：确认方案需求',
          description: '双击卡片以修改阶段与节点信息...',
          status: 'completed',
        },
      ],
      connections: [],
      attributeRows: [
        {
          id: `attr_1_${Date.now()}`,
          name: '触点表达',
          type: 'touchpoint',
          order: 1,
          values: {},
        },
      ],
    };

    setAllJourneys((prev) => [newJourney, ...prev]);
    handleSelectJourney(newJourney);
  };

  const handleDuplicateJourney = (journeyId: string) => {
    const target = allJourneys.find((j) => j.id === journeyId) || journeyData;
    const copy: JourneyMapData = {
      ...JSON.parse(JSON.stringify(target)),
      id: `copy_${Date.now()}`,
      title: `${target.title} (副本)`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setAllJourneys((prev) => [copy, ...prev]);
    handleSelectJourney(copy);
  };

  const handleRenameJourney = (journeyId: string, newTitle: string) => {
    setAllJourneys((prev) =>
      prev.map((j) => (j.id === journeyId ? { ...j, title: newTitle } : j))
    );
    if (journeyData.id === journeyId) {
      setJourneyData((prev) => ({ ...prev, title: newTitle }));
    }
  };

  const handleDeleteJourney = (journeyId: string) => {
    if (allJourneys.length <= 1) {
      alert('至少需要保留一份用户旅程图。');
      return;
    }
    const filtered = allJourneys.filter((j) => j.id !== journeyId);
    setAllJourneys(filtered);
    if (journeyData.id === journeyId) {
      handleSelectJourney(filtered[0]);
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
    style: LineStyle = 'solid'
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

  const handleUpdateConnection = (
    connId: string,
    label: string,
    style: LineStyle
  ) => {
    updateJourney({
      ...journeyData,
      connections: journeyData.connections.map((c) =>
        c.id === connId ? { ...c, label, style } : c
      ),
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

  // AI Assistant Integration
  const handleApplyAiSuggestions = (payload: { type: string; aiText: string }) => {
    const { type, aiText } = payload;

    if (type === 'add_nodes') {
      // Create 2-3 new AI nodes for substages
      const ss1 = journeyData.subStages[0]?.id || '';
      const ss2 = journeyData.subStages[1]?.id || ss1;
      const role1 = journeyData.roles[0]?.id || '';

      const generatedNodes: JourneyNode[] = [
        {
          id: `ai_n_${Date.now()}_1`,
          subStageId: ss1,
          roleId: role1,
          title: '★ AI推荐：多维度价值验证',
          description: '建议增加可视化仪表盘对比，降低评估门槛与用户犹豫风险。',
          status: 'planned',
          isKey: true,
        },
        {
          id: `ai_n_${Date.now()}_2`,
          subStageId: ss2,
          roleId: role1,
          title: 'AI推荐：自动化智能派单',
          description: '系统自动路由工单至对应服务团队，减少人工转办等待耗时。',
          status: 'in_progress',
          isKey: false,
        },
      ];

      updateJourney({
        ...journeyData,
        nodes: [...journeyData.nodes, ...generatedNodes],
      });
      alert('已成功将 2 个 AI 建议的新动作节点导入到当前旅程图中！');
    } else if (type === 'add_touchpoints') {
      const updatedRows = [...journeyData.attributeRows];
      const touchRowIndex = updatedRows.findIndex((r) => r.type === 'touchpoint' || r.name.includes('触点'));

      const newValues: Record<string, string> = {};
      journeyData.subStages.forEach((ss, idx) => {
        newValues[ss.id] = `• 智能移动 App / 网页端控制台\n• AI 智能诊断告警与推送通知\n• 专家 1V1 远程协同屏`;
      });

      if (touchRowIndex >= 0) {
        updatedRows[touchRowIndex] = {
          ...updatedRows[touchRowIndex],
          values: { ...updatedRows[touchRowIndex].values, ...newValues },
        };
      } else {
        updatedRows.push({
          id: `attr_ai_${Date.now()}`,
          name: 'AI 智能化推荐触点',
          type: 'touchpoint',
          order: updatedRows.length + 1,
          values: newValues,
        });
      }

      updateJourney({
        ...journeyData,
        attributeRows: updatedRows,
      });
      alert('已成功将 AI 推导的智能化产品触点批量填充至矩阵下方触点行！');
    } else if (type === 'add_friction_row') {
      const newRow: AttributeRow = {
        id: `attr_fric_${Date.now()}`,
        name: 'AI 卡点诊断与风险提示',
        type: 'text',
        order: journeyData.attributeRows.length + 1,
        values: {},
      };

      if (journeyData.subStages[0]) {
        newRow.values[journeyData.subStages[0].id] = aiText.slice(0, 300) + '...';
      }

      updateJourney({
        ...journeyData,
        attributeRows: [...journeyData.attributeRows, newRow],
      });
      alert('已成功将 AI 体验卡点报告追加为矩阵底部的观察行！');
    }
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased text-base">
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
        onOpenAllJourneys={() => setIsAllJourneysModalOpen(true)}
        onSaveCurrentJourney={handleSaveCurrentJourney}
        onExportJson={() => {
          setExportModalTab('json');
          setIsExportModalOpen(true);
        }}
        onExportCsv={() => {
          setExportModalTab('csv');
          setIsExportModalOpen(true);
        }}
        onExportImage={() => {
          setExportModalTab('png');
          setIsExportModalOpen(true);
        }}
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
            onUpdateConnection={handleUpdateConnection}
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
      <AllJourneysModal
        isOpen={isAllJourneysModalOpen}
        onClose={() => setIsAllJourneysModalOpen(false)}
        currentJourney={journeyData}
        savedJourneys={allJourneys}
        onSelectJourney={handleSelectJourney}
        onSaveCurrentJourney={handleSaveCurrentJourney}
        onCreateNewJourney={handleCreateNewJourney}
        onDuplicateJourney={handleDuplicateJourney}
        onRenameJourney={handleRenameJourney}
        onDeleteJourney={handleDeleteJourney}
        onExportJourneyJson={(j) => exportToJson(j)}
      />

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
        onApplyAiSuggestions={handleApplyAiSuggestions}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={journeyData}
        initialTab={exportModalTab}
      />
    </div>
  );
}

