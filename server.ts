import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Journey Assistant API
app.post('/api/ai-journey', async (req, res) => {
  try {
    const { action, prompt, currentJourney } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback mock responses if API Key is not configured
      return res.json({
        success: true,
        fallback: true,
        result: getFallbackAiResponse(action, prompt, currentJourney),
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let systemInstruction = 'You are a Senior Product Experience Architect specializing in User Journey Mapping (UJM), CX Service Blueprinting, and Touchpoint Optimization.';
    let userPrompt = '';

    if (action === 'expand_stage') {
      userPrompt = `Based on the following User Journey Map data, generate 2-3 new detailed action nodes for the stage or scenario requested: "${prompt}".
Existing stages: ${JSON.stringify(currentJourney.stages.map((s: any) => s.name))}
Roles: ${JSON.stringify(currentJourney.roles.map((r: any) => r.name))}

Return JSON array of objects with keys: title, description, roleName, scenarioName, isKey (boolean), status ('planned'|'in_progress'|'completed').
Return ONLY valid JSON without markdown codeblocks.`;
    } else if (action === 'analyze_friction') {
      userPrompt = `Analyze the following User Journey Map for potential friction points, drop-off risks, and improvement opportunities:
Title: ${currentJourney.title}
Nodes: ${JSON.stringify(currentJourney.nodes.map((n: any) => ({ title: n.title, desc: n.description })))}

Provide a structured analysis with:
1. Top 3 friction points / bottlenecks in the journey
2. Recommended digital touchpoints or automation tools
3. 2026 Innovation Roadmap items.
Keep answers concise, clear, in Chinese language.`;
    } else if (action === 'suggest_touchpoints') {
      userPrompt = `For each scenario in this user journey, suggest the ideal digital or physical product touchpoints (产品触点):
Scenarios: ${JSON.stringify(currentJourney.subStages.map((ss: any) => ss.name))}

Return a key-value object where key is scenario name and value is a concise bullet list string of recommended touchpoints in Chinese.
Return ONLY valid JSON without markdown codeblocks.`;
    } else {
      userPrompt = `User prompt: ${prompt}.
Current Journey Title: ${currentJourney.title}.
Provide helpful advice, missing steps, or optimization recommendations for this User Journey Map in concise Chinese.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const text = response.text || '';
    res.json({
      success: true,
      result: text,
    });
  } catch (error: any) {
    console.error('AI Journey Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI Processing failed',
      result: getFallbackAiResponse(req.body.action, req.body.prompt, req.body.currentJourney),
    });
  }
});

function getFallbackAiResponse(action: string, prompt: string, currentJourney: any) {
  if (action === 'analyze_friction') {
    return `### 🔍 用户旅程体验与卡点诊断报告

1. **核心卡点诊断**
   • **【售前方案设计与响应时效】**：从“需求咨询”到“在线方案设计/工勘”存在跨角色交接（业主-安装商），可能因现场勘测预约不便导致用户流失。
   • **【预算确认与定价透明度】**：业主在“评估预算”阶段关注投资回报率（ROI），缺少标准化自动化算力工具易产生信任摩擦。
   • **【开局调测与APP绑定】**：安装商“开局调测”与业主“APP安装”为关键节点（★），扫码绑定过程若网络不佳可能阻碍顺利交付。

2. **产品触点与数字化建议**
   • **建议新增智能工具**：引入 3D 屋顶一键 AI 排布算力、蓝牙近场无网调测、智能 ROI 精算引擎。
   • **增加自动化连线**：建立华为远程专家指导到安装商开局调测的二线响应机制。

3. **规划落地建议**
   • 在“安装/调测”阶段强化智能诊断与 AR 施工指导，降低对安装人员熟练度的依赖。`;
  } else if (action === 'suggest_touchpoints') {
    return JSON.stringify({
      "宣传推广": "官网品牌彩页、展会互动屏、行业公众号",
      "了解产品": "在线体验中心、培训大学 App、三维选配器",
      "需求咨询": "工勘小程序、在线智能客服",
      "★方案设计": "Smart Design 智能设计工具 (3D光照仿真)",
      "评估预算": "ROI 电量收益智能精算器",
      "★调测": "SmartPV / FusionSolar 调试工具与云端诊断"
    });
  }
  return `根据您输入的【${prompt || '旅程优化'}】，已为您梳理以下优化建议：
1. 建议在关键触点 (★) 增加情感满意度评分打点；
2. 建议补全角色间的跨部门连线与交付流向；
3. 可以导出为高清晰度图片或 JSON 数据备份。`;
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`User Journey Editor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
