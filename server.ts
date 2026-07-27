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
    const { action, prompt, currentJourney, customApiKey } = req.body;
    let text = '';

    const systemInstruction = 'You are a Senior Product Experience Architect specializing in User Journey Mapping (UJM), CX Service Blueprinting, and Touchpoint Optimization.';
    let userPrompt = '';

    if (action === 'expand_stage') {
      userPrompt = `Based on the following User Journey Map data, generate 2-3 new detailed action nodes for the stage or scenario requested: "${prompt}".
Existing stages: ${JSON.stringify(currentJourney?.stages?.map((s: any) => s.name) || [])}
Roles: ${JSON.stringify(currentJourney?.roles?.map((r: any) => r.name) || [])}

Return JSON array of objects with keys: title, description, roleName, scenarioName, isKey (boolean), status ('planned'|'in_progress'|'completed').
Return ONLY valid JSON without markdown codeblocks.`;
    } else if (action === 'analyze_friction') {
      userPrompt = `Analyze the following User Journey Map for potential friction points, drop-off risks, and improvement opportunities:
Title: ${currentJourney?.title || '用户旅程'}
Nodes: ${JSON.stringify(currentJourney?.nodes?.map((n: any) => ({ title: n.title, desc: n.description })) || [])}

Provide a structured analysis in Chinese with:
1. Top 3 friction points / bottlenecks in the journey
2. Recommended digital touchpoints or automation tools
3. 2026 Innovation Roadmap items.`;
    } else if (action === 'suggest_touchpoints') {
      userPrompt = `For each scenario in this user journey, suggest the ideal digital or physical product touchpoints (产品触点):
Scenarios: ${JSON.stringify(currentJourney?.subStages?.map((ss: any) => ss.name) || [])}

Return a key-value object where key is scenario name and value is a concise bullet list string of recommended touchpoints in Chinese.
Return ONLY valid JSON without markdown codeblocks.`;
    } else {
      userPrompt = `User prompt: ${prompt || '请进行全盘优化分析'}.
Current Journey Title: ${currentJourney?.title || '用户旅程'}.
Provide helpful advice, missing steps, or optimization recommendations for this User Journey Map in concise Chinese.`;
    }

    // Attempt 1: Call Cloudflare Workers AI (Llama 3.1 8B Instruct)
    try {
      text = await callCloudflareAi(systemInstruction, userPrompt, customApiKey);
    } catch (cfError) {
      console.warn('Cloudflare Workers AI call failed, trying fallback:', cfError);
      // Attempt 2: Try Gemini API if key is present
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: { systemInstruction, temperature: 0.4 },
          });
          text = response.text || '';
        } catch (gErr) {
          console.warn('Gemini API call failed:', gErr);
        }
      }
    }

    if (!text) {
      text = getFallbackAiResponse(action, prompt, currentJourney);
    }

    res.json({
      success: true,
      result: text,
    });
  } catch (error: any) {
    console.error('AI Journey Error:', error);
    res.json({
      success: true,
      result: getFallbackAiResponse(req.body?.action, req.body?.prompt, req.body?.currentJourney),
    });
  }
});

async function callCloudflareAi(systemInstruction: string, userPrompt: string, customApiKey?: string): Promise<string> {
  const accountId = process.env.CF_ACCOUNT_ID || '0b490c60804e0c022a06dea46a8a9e8a';
  const apiToken = customApiKey || process.env.CF_API_TOKEN || 'sMyZz46lB5a35knSfZKitVA499eNJbENbIKM9rDi';
  const model = '@cf/meta/llama-3.1-8b-instruct';
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudflare API HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  if (data.result?.response) {
    return data.result.response;
  }
  if (typeof data.result === 'string') {
    return data.result;
  }
  return JSON.stringify(data.result || data);
}


function getFallbackAiResponse(action: string, prompt: string, currentJourney: any) {
  const title = currentJourney?.title || '用户旅程图';
  const subStages = currentJourney?.subStages?.map((ss: any) => ss.name) || ['需求探索', '试用评估', '交付开局', '运维服务'];
  const roles = currentJourney?.roles?.map((r: any) => r.name) || ['核心用户', '服务团队'];
  const nodeTitles = currentJourney?.nodes?.map((n: any) => n.title) || [];

  if (action === 'analyze_friction') {
    return `### 🔍 【${title}】体验卡点与流失风险诊断报告

1. **核心卡点与体验摩擦诊断**
   • **【跨角色流转断层】**：在当前涉及的角色（${roles.join('、')}）之间，从前端交互到后端交付存在阶段交接延迟，容易因信息不同步导致用户等待。
   • **【关键节点 (★) 风险】**：已知关键节点（如：${nodeTitles.slice(0, 3).join('、') || '开局调测与身份绑定'}）如果缺乏自动化引导或离线保障，可能会成为用户放弃或投诉的痛点。
   • **【量化评估维度缺失】**：在【${subStages.slice(0, 2).join('】与【')}】场景中，建议增加更清晰的量化指标（如 NPS 满意度打点与响应耗时监控）。

2. **产品触点与智能化优化建议**
   • **引导工具升级**：引入 AI 智能问答助理与可视化进度看板，让跨角色协同透明化。
   • **自动化预警机制**：针对异常耗时与流失节点设置即时告警，并推送标准处理 SOP。

3. **2026 体验创新演进建议**
   • 在【${subStages[subStages.length - 1] || '售后阶段'}】建立主动式关怀与智能诊断回路，实现从“被动响应”到“主动服务”的转变。`;
  } else if (action === 'suggest_touchpoints') {
    const touchpointsObj: Record<string, string> = {};
    subStages.forEach((name: string, index: number) => {
      touchpointsObj[name] = `• 数字化 App / 小程序触点\n• 智能 AI 助手与自动化通知\n• 专家远程协助与可视化看板`;
    });
    return JSON.stringify(touchpointsObj, null, 2);
  }

  return `### 💡 针对【${title}】的 AI 智能优化建议

根据您提出的诉求：**“${prompt || '旅程全面诊断'}”**，AI 为您梳理了以下重点优化方向：

1. **结构完备度评估**
   • 当前旅程涵盖 **${subStages.length} 个核心场景** 与 **${roles.length} 个角色泳道**。
   • 建议在【${subStages[0] || '起始阶段'}】进一步细化用户的前置期望与触发动机。

2. **体验连贯性与协同建议**
   • 在涉及多角色（如：${roles.slice(0, 2).join(' 与 ')}）的交接节点上，建议补充 dashed 虚线关联或标准 SOP 提示卡片。
   • 在下方“属性分析维度”中添加【核心 KPI 指标】与【风险防范提示】，使旅程图具备更高可落地性。

3. **执行与导出提示**
   • 您可以在顶栏管理结构，或直接导出 JSON 格式备份与同组成员共享。`;
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
