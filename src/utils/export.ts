import { toPng } from 'html-to-image';
import { JourneyMapData } from '../types';

export function triggerDownload(href: string, filename: string) {
  try {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 500);
  } catch (e) {
    console.error('Trigger download error:', e);
    openDataUrlInNewWindow(href, filename);
  }
}

export function openDataUrlInNewWindow(dataUrl: string, filename: string) {
  try {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; min-h: 100vh; margin: 0; }
              .card { background: #1e293b; border: 1px solid #334155; padding: 2rem; border-radius: 1rem; max-width: 800px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
              a.btn { display: inline-block; background: #3b82f6; color: white; font-weight: bold; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; margin-top: 1rem; }
              img { max-width: 100%; border-radius: 0.5rem; border: 1px solid #334155; margin-top: 1rem; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>${filename}</h2>
              <p>请右键下方图像/资源选择“另存为...”，或点击下方链接保存：</p>
              <a class="btn" href="${dataUrl}" download="${filename}">点击保存文件 (${filename})</a>
              ${dataUrl.startsWith('data:image') ? `<br/><img src="${dataUrl}" />` : ''}
            </div>
          </body>
        </html>
      `);
      win.document.close();
    }
  } catch (err) {
    console.error('Failed to open data URL window:', err);
  }
}

export async function generateJourneyPngDataUrl(elementId: string = 'journey-export-canvas'): Promise<string | null> {
  const element = document.getElementById(elementId) || document.querySelector('.journey-canvas-area') || document.querySelector('main') || document.body;
  if (!element) {
    return null;
  }

  try {
    const dataUrl = await toPng(element as HTMLElement, {
      cacheBust: true,
      backgroundColor: '#0f172a', // Slate 900 background for visual style
      pixelRatio: 2,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('no-export')) {
          return false;
        }
        return true;
      },
    });
    return dataUrl;
  } catch (err) {
    console.warn('First PNG generate attempt with background failed, retrying simple...', err);
    try {
      // Retry without special color
      return await toPng(element as HTMLElement, { pixelRatio: 1.5 });
    } catch (retryErr) {
      console.error('Failed to generate PNG data url:', retryErr);
      return null;
    }
  }
}

export function getJsonDataUrl(data: JourneyMapData): string {
  const jsonString = JSON.stringify(data, null, 2);
  return 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonString);
}

export function getCsvDataUrl(data: JourneyMapData): string {
  const csvContent = getCsvContent(data);
  return 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
}

export async function exportToPng(elementId: string = 'journey-export-canvas', title?: string) {
  const dataUrl = await generateJourneyPngDataUrl(elementId);
  if (!dataUrl) {
    alert('未能识别到当前图表画布，请切换至矩阵视图或流程看板视图后再试。');
    return false;
  }

  const fileName = `${(title || '用户旅程图').replace(/[/\\?%*:|"<>]/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
  triggerDownload(dataUrl, fileName);
  return true;
}

export function exportToJson(data: JourneyMapData) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const fileName = `${(data.title || 'user_journey_map').replace(/[/\\?%*:|"<>]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    triggerDownload(url, fileName);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch (e) {
    console.error('Export JSON error:', e);
    return false;
  }
}

export function getCsvContent(data: JourneyMapData): string {
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

  return '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
}

export function exportToCsv(data: JourneyMapData) {
  try {
    const csvContent = getCsvContent(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const fileName = `${(data.title || 'user_journey').replace(/[/\\?%*:|"<>]/g, '_')}_nodes.csv`;
    triggerDownload(url, fileName);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch (e) {
    console.error('Export CSV error:', e);
    return false;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
  } catch (e) {
    console.error('Copy to clipboard failed:', e);
    return false;
  }
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


