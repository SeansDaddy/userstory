import { JourneyMapData } from '../types';

export function exportToJson(data: JourneyMapData) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.title || 'user_journey_map'}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCsv(data: JourneyMapData) {
  const rows: string[][] = [];
  rows.push(['阶段', '场景/子阶段', '角色/泳道', '卡片标题', '描述', '关键触点(★)', '状态', '满意度/情绪']);

  data.nodes.forEach((node) => {
    const subStage = data.subStages.find((s) => s.id === node.subStageId);
    const stage = subStage ? data.stages.find((st) => st.id === subStage.stageId) : undefined;
    const role = data.roles.find((r) => r.id === node.roleId);

    rows.push([
      stage?.name || '',
      subStage?.name || '',
      role?.name || '',
      `"${(node.title || '').replace(/"/g, '""')}"`,
      `"${(node.description || '').replace(/"/g, '""')}"`,
      node.isKey ? '是' : '否',
      node.status || 'planned',
      node.emotion ? `${node.emotion}/5` : '-',
    ]);
  });

  const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.title || 'user_journey'}_nodes.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromJsonFile(file: File): Promise<JourneyMapData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.stages || !parsed.roles || !parsed.nodes) {
          throw new Error('无效的用户旅程图数据格式');
        }
        resolve(parsed as JourneyMapData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}
