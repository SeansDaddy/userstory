import React, { useState, useCallback, useRef, useEffect } from 'react'
import './App.css'

const COLORS = ['#e74c3c','#f39c12','#2ecc71','#3498db','#9b59b6','#1abc9c']

const INITIAL_DATA = {
  phases: ['感知', '售前咨询', '购买', '安装', '使用', '维护'],
  personas: ['安装商', '分销商', '华为团队'],
  nodes: [
    { id: 1, phase: '感知', role: '安装商', title: '展会/同行推荐', desc: '华为品牌圈内有影响力', emotion: 'green', x: 140, y: 80 },
    { id: 2, phase: '售前咨询', role: '安装商', title: '方案设计工具不够灵活', desc: '无法手动调整倾角', emotion: 'yellow', x: 380, y: 80 },
    { id: 3, phase: '安装', role: '安装商', title: 'APP调试步骤繁琐', desc: '新手需培训半小时', emotion: 'red', x: 860, y: 80 },
    { id: 4, phase: '使用', role: '安装商', title: '数据大屏直观', desc: '电站总览数据全面', emotion: 'green', x: 1100, y: 80 },
    { id: 5, phase: '感知', role: '分销商', title: '品牌拉力强', desc: '客户主动找华为产品', emotion: 'green', x: 140, y: 200 },
    { id: 6, phase: '售前咨询', role: '分销商', title: '产品资料分散', desc: '技术参数查找费时', emotion: 'red', x: 380, y: 200 },
    { id: 7, phase: '购买', role: '分销商', title: '库存查看体验差', desc: '多个系统数据延迟', emotion: 'red', x: 620, y: 200 },
    { id: 8, phase: '使用', role: '分销商', title: '多电站管理方便', desc: '一个账号管理几十个电站', emotion: 'green', x: 1100, y: 200 },
    { id: 9, phase: '安装', role: '华为团队', title: '安装数据回传滞后', desc: '上线率统计延迟', emotion: 'yellow', x: 860, y: 320 },
    { id: 10, phase: '使用', role: '华为团队', title: '平台能力领先', desc: '对比竞品优势明显', emotion: 'green', x: 1100, y: 320 },
    { id: 11, phase: '维护', role: '华为团队', title: '远程运维覆盖面不足', desc: '老设备不支持远程诊断', emotion: 'red', x: 1340, y: 320 },
    { id: 12, phase: '感知', role: '安装商', title: '广告投放', desc: '线上广告+行业媒体', emotion: 'green', x: 140, y: 440 },
  ],
  connections: [
    { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
    { from: 5, to: 6 }, { from: 6, to: 7 }, { from: 7, to: 8 },
    { from: 9, to: 10 }, { from: 10, to: 11 },
  ]
}

const LANE_W = 220
const LANE_G = 15
const START_X = 120

export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('journeyData')
      if (saved) return JSON.parse(saved)
    } catch {}
    return INITIAL_DATA
  })
  const [connectMode, setConnectMode] = useState(false)
  const [connectFrom, setConnectFrom] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ phase: data.phases[0], role: data.personas[0], title: '', desc: '', emotion: 'green' })

  const canvasRef = useRef(null)
  let nextId = useRef(data.nodes.length > 0 ? Math.max(...data.nodes.map(n=>n.id)) + 1 : 1)
  const dragRef = useRef(null)

  // auto-save
  useEffect(() => {
    localStorage.setItem('journeyData', JSON.stringify(data))
  }, [data])

  const saveData = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return next
    })
  }, [])

  // drag
  const handleMouseDown = useCallback((e, id) => {
    if (connectMode) return
    e.preventDefault()
    const el = document.getElementById('node-' + id)
    if (!el) return
    const rect = el.getBoundingClientRect()
    const canvas = canvasRef.current
    if (!canvas) return
    const canvasRect = canvas.getBoundingClientRect()
    dragRef.current = {
      id,
      offX: e.clientX - rect.left,
      offY: e.clientY - rect.top,
      canvasLeft: canvasRect.left,
      canvasTop: canvasRect.top,
      scrollLeft: canvas.scrollLeft,
      scrollTop: canvas.scrollTop
    }
  }, [connectMode])

  useEffect(() => {
    const handleMove = (e) => {
      if (!dragRef.current) return
      const d = dragRef.current
      const x = e.clientX - d.canvasLeft + d.scrollLeft - d.offX
      const y = e.clientY - d.canvasTop + d.scrollTop - d.offY
      setData(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === d.id ? { ...n, x, y } : n)
      }))
    }
    const handleUp = () => { dragRef.current = null }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [setData])

  // connect
  const handleConnect = useCallback((id) => {
    if (!connectMode) return
    if (!connectFrom) {
      setConnectFrom(id)
    } else if (connectFrom !== id) {
      saveData(prev => ({
        ...prev,
        connections: [...prev.connections, { from: connectFrom, to: id }]
      }))
      setConnectFrom(null)
      setConnectMode(false)
    }
  }, [connectMode, connectFrom, saveData])

  // modal
  const openAdd = useCallback((phase, role) => {
    setEditingId(null)
    setForm({ phase: phase || data.phases[0], role: role || data.personas[0], title: '', desc: '', emotion: 'green' })
    setShowModal(true)
  }, [data])
  const openEdit = useCallback((n) => {
    setEditingId(n.id)
    setForm({ phase: n.phase, role: n.role, title: n.title, desc: n.desc || '', emotion: n.emotion })
    setShowModal(true)
  }, [])
  const saveNode = useCallback(() => {
    if (!form.title.trim()) { alert('请输入标题'); return }
    if (editingId) {
      saveData(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === editingId ? { ...n, ...form } : n)
      }))
    } else {
      const pi = data.phases.indexOf(form.phase)
      const sameRoleNodes = data.nodes.filter(n => n.role === form.role)
      const maxY = sameRoleNodes.length > 0 ? Math.max(...sameRoleNodes.map(n => n.y)) : 80
      saveData(prev => ({
        ...prev,
        nodes: [...prev.nodes, {
          id: nextId.current++,
          ...form,
          x: START_X + pi * (LANE_W + LANE_G) + 15,
          y: maxY + 60
        }]
      }))
    }
    setShowModal(false)
  }, [form, editingId, data, saveData])
  const deleteNode = useCallback((id) => {
    if (!confirm('确定删除？')) return
    saveData(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== id),
      connections: prev.connections.filter(c => c.from !== id && c.to !== id)
    }))
  }, [saveData])

  // add lane/persona
  const addLane = useCallback(() => {
    const name = prompt('新阶段名称：')
    if (name?.trim()) saveData(prev => ({ ...prev, phases: [...prev.phases, name.trim()] }))
  }, [saveData])
  const addPersona = useCallback(() => {
    const name = prompt('新角色名称：')
    if (name?.trim()) saveData(prev => ({ ...prev, personas: [...prev.personas, name.trim()] }))
  }, [saveData])

  // export
  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'user-journey.json'; a.click()
    URL.revokeObjectURL(url)
  }, [data])

  const exportImage = useCallback(() => {
    const svg = document.getElementById('connections-svg')
    if (!svg) { alert('没有内容可导出'); return }
    const canvas = canvasRef.current
    if (!canvas) return
    // Use a simplified approach - tell user to screenshot
    alert('请截图保存，或点击「导出JSON」保存数据')
  }, [])

  // connections lines
  const renderConnections = () => {
    return data.connections.map((c, i) => {
      const fn = data.nodes.find(n => n.id === c.from)
      const tn = data.nodes.find(n => n.id === c.to)
      if (!fn || !tn) return null
      const fx = fn.x + 100, fy = fn.y + 30
      const tx = tn.x + 100, ty = tn.y
      const angle = Math.atan2(ty - fy, tx - fx)
      const al = 8
      return (
        <g key={i}>
          <line x1={fx} y1={fy} x2={tx} y2={ty} stroke="#b2bec3" strokeWidth={2} strokeDasharray="5,3" />
          <path d={`M${tx - al * Math.cos(angle - 0.4)},${ty - al * Math.sin(angle - 0.4)} L${tx},${ty} L${tx - al * Math.cos(angle + 0.4)},${ty - al * Math.sin(angle + 0.4)}`} fill="#b2bec3" />
        </g>
      )
    })
  }

  const pi = (phase) => data.phases.indexOf(phase)

  const emotionIcon = (e) => e === 'green' ? '✅' : e === 'yellow' ? '⚠️' : '❌'

  return (
    <div className="app">
      {/* Toolbar */}
      <div className="toolbar">
        <h1>🦐 <span>用户旅程</span> 流程图</h1>
        <button className="btn-primary" onClick={() => openAdd()}>➕ 添加节点</button>
        <button className="btn-accent" onClick={() => { setConnectMode(!connectMode); setConnectFrom(null) }}>
          🔗 {connectMode ? '取消连线' : '连线模式'}
        </button>
        <div className="sep" />
        <button className="btn-primary" onClick={addLane}>📐 添加阶段</button>
        <button className="btn-primary" onClick={addPersona}>👤 添加角色</button>
        <div className="sep" />
        <button className="btn-green" onClick={exportJSON}>💾 导出JSON</button>
        <button className="btn-blue" onClick={exportImage}>🖼️ 导出图片</button>
        <span className="hint">拖拽移动 · 点击连线后点两个节点建立关联</span>
      </div>

      {/* Canvas */}
      <div className="canvas" ref={canvasRef} id="canvas-scroll">
        <div className="canvas-inner" style={{ width: 3000, height: 3000, position: 'relative' }}>
          {/* Lanes */}
          {data.phases.map((p, i) => (
            <div key={p} className="lane" style={{ left: START_X + i * (LANE_W + LANE_G) }}>
              <div className="lane-header" style={{ background: COLORS[i % COLORS.length] }}>📌 {p}</div>
            </div>
          ))}

          {/* Persona labels - computed from nodes */}
          {[...new Set(data.nodes.map(n => n.role))].map((role, idx) => (
            <div key={role} className="persona-label" style={{ top: 80 + idx * 140 }}>
              {role}
            </div>
          ))}

          {/* Connections SVG */}
          <svg id="connections-svg" style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:1 }}>
            {renderConnections()}
          </svg>

          {/* Nodes */}
          {data.nodes.map(n => (
            <div
              key={n.id}
              id={'node-' + n.id}
              className={`node ${connectFrom === n.id ? 'connecting' : ''}`}
              style={{ left: n.x, top: n.y }}
              onMouseDown={(e) => handleMouseDown(e, n.id)}
              onClick={() => handleConnect(n.id)}
            >
              <div className="tag" style={{ background: COLORS[Math.max(0, pi(n.phase)) % COLORS.length] }}>
                {n.phase}
              </div>
              <div className="node-title">
                {emotionIcon(n.emotion)} {n.title}
              </div>
              <div className="node-desc">{n.desc}</div>
              <div className="node-role">👤 {n.role}</div>
              <div className="node-actions">
                <button className="btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(n) }}>✏️ 编辑</button>
                <button className="btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); deleteNode(n.id) }}>🗑️ 删除</button>
              </div>
            </div>
          ))}

          {/* Empty hint */}
          {data.nodes.length === 0 && (
            <div className="empty-hint">
              <div className="big-icon">📋</div>
              <p>点击「添加节点」创建用户旅程</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        {data.phases.map((p, i) => (
          <div key={p} className="legend-row">
            <div className="color-box" style={{ background: COLORS[i % COLORS.length] }} />
            {p}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? '编辑节点' : '添加节点'}</h2>
            <label>阶段</label>
            <select value={form.phase} onChange={e => setForm(f => ({...f, phase: e.target.value}))}>
              {data.phases.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <label>角色</label>
            <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
              {data.personas.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <label>标题</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="节点标题" />
            <label>描述</label>
            <textarea value={form.desc} onChange={e => setForm(f => ({...f, desc: e.target.value}))} placeholder="详细描述" rows={3} />
            <label>情感状态</label>
            <select value={form.emotion} onChange={e => setForm(f => ({...f, emotion: e.target.value}))}>
              <option value="green">😊 满意</option>
              <option value="yellow">🤔 待改进</option>
              <option value="red">😡 痛点</option>
            </select>
            <div className="modal-btns">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn-ok" onClick={saveNode}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
