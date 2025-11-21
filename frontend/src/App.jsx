import { useState } from 'react'

// --- 主程式 (App) ---
function App() {
  const [token, setToken] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('') 
  const [clubData, setClubData] = useState(null)
  const [newClubName, setNewClubName] = useState('')
  const [showLogin, setShowLogin] = useState(false)

  // --- 資料區：從 PDF 整理出來的行事曆與目標 ---
  
  // 1. 年度目標 (根據 114學年度社團年度目標.pdf)
  const annualGoals = [
    {
      level: '近程目標',
      title: '招募新生 ‧ 建立默契',
      desc: '主攻九月社團博覽會與迎新茶會，幹部間建立「職責分明、守時、主動、大局觀」的默契。',
      color: '#4caf50' // 綠色
    },
    {
      level: '中程目標',
      title: '凝聚感情 ‧ 扎根基本',
      desc: '每週兩次社課扎根基本功。舉辦萬聖趴、聖誕趴凝聚感情。邀請學長姐指導與聯歡。',
      color: '#ff9800' // 橘色
    },
    {
      level: '遠程目標',
      title: '第 55 屆成果發表會',
      desc: '全力籌備成發，支援校內外與全國民俗舞蹈社的大型活動，宣傳白沙世界民俗舞蹈社。',
      color: '#f44336' // 紅色
    }
  ]

  // 2. 行事曆資料 (根據 113下 & 114上 行事曆.pdf 整理)
  // 格式：YYYY-MM-DD
  const allEvents = [
    { date: '2025-02-10', title: '寒訓開始 (9:00-17:00)', type: 'training' },
    { date: '2025-02-24', title: '期初社員大會', type: 'meeting' },
    { date: '2025-03-22', title: '社遊 / 幹部訓練', type: 'activity' },
    { date: '2025-04-07', title: '校際交流日', type: 'activity' },
    { date: '2025-05-05', title: '成發驗舞 (總彩排)', type: 'training' },
    { date: '2025-06-01', title: '第 55 屆成果發表會', type: 'important' }, // 重要！
    { date: '2025-06-23', title: '期末社員大會', type: 'meeting' },
    { date: '2025-09-10', title: '社團博覽會 (社博)', type: 'important' },
    { date: '2025-09-22', title: '迎新茶會 (7-9pm)', type: 'activity' },
    { date: '2025-10-25', title: '校慶表演', type: 'performance' },
    { date: '2025-12-25', title: '聖誕趴 & 期末社大', type: 'activity' }
  ]

  // 過濾邏輯：只顯示「今天以後」的活動 (假設今天是 2025/01/01 方便演示)
  // 在真實運作時，它會自動抓電腦的當前時間
  const today = new Date().toISOString().split('T')[0]
  const upcomingEvents = allEvents
    .filter(e => e.date >= today) 
    .sort((a, b) => new Date(a.date) - new Date(b.date)) // 按日期排序

  // --- 動作區 (API) ---
  async function handleLogin() {
    setMessage('⏳ 驗證中...')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.success) {
        setToken(data.token); setCurrentUser(data.user); setMessage(''); fetchClubData(data.token);
      } else { setMessage(`❌ ${data.message}`) }
    } catch (err) { setMessage('連線錯誤') }
  }

  async function handleRegister() {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: '新同學' })
      })
      const data = await res.json()
      if (data.success) { alert('註冊成功！'); setMessage('✅ 註冊成功，請登入') } 
      else { setMessage(`❌ ${data.message}`) }
    } catch (err) {}
  }

  async function fetchClubData(userToken) {
    try {
      const res = await fetch('/api/clubs/club-center', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${userToken || token}` }
      })
      setClubData(await res.json())
    } catch (err) {}
  }

  async function handleCreateClub() {
    if (!newClubName) return
    await fetch('/api/clubs/create-club', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newClubName })
    })
    setNewClubName(''); fetchClubData(token);
  }

  function handleLogout() { setToken(null); setCurrentUser(null); setClubData(null); setShowLogin(false); }

  // --- 畫面區 ---

  // (A) 未登入：顯示「社團官網 (目標 + 行事曆)」
  if (!token) {
    return (
      <div style={{ fontFamily: '"Microsoft JhengHei", sans-serif', color: '#333', background: '#fff' }}>
        
        {/* 1. 導航列 */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#6f42c1', display: 'flex', alignItems: 'center', gap: '10px' }}>
            💃 白沙世界民俗舞蹈社
          </div>
          <button onClick={() => setShowLogin(true)} style={{ padding: '8px 20px', background: '#6f42c1', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
            社員登入 / 註冊
          </button>
        </nav>

        {/* 2. 主視覺 */}
        <header style={{ background: 'linear-gradient(135deg, #5b247a 0%, #1bcedf 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '42px', marginBottom: '10px', letterSpacing: '2px' }}>歷史在走，我們仍留</h1>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '30px' }}>傳承自民國 60 年的熱情，邀你一起在舞台發光</p>
        </header>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          
          {/* 3. 左欄：年度目標 */}
          <div>
            <h2 style={{ color: '#333', borderLeft: '5px solid #6f42c1', paddingLeft: '10px', marginBottom: '20px' }}>🎯 114 學年度 目標展望</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {annualGoals.map((goal, index) => (
                <div key={index} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', borderLeft: `5px solid ${goal.color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 5px 0', color: goal.color }}>{goal.level}：{goal.title}</h3>
                  <p style={{ margin: 0, color: '#555', lineHeight: '1.6', fontSize: '15px' }}>{goal.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. 右欄：近期行事曆 */}
          <div>
            <h2 style={{ color: '#333', borderLeft: '5px solid #1bcedf', paddingLeft: '10px', marginBottom: '20px' }}>📅 近期活動行事曆</h2>
            <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              
              {upcomingEvents.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>目前沒有即將到來的活動</p>
              ) : (
                upcomingEvents.map((evt, index) => (
                  <div key={index} style={{ display: 'flex', padding: '15px', borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
                    {/* 日期方塊 */}
                    <div style={{ background: evt.type === 'important' ? '#ffebee' : '#e3f2fd', color: evt.type === 'important' ? '#d32f2f' : '#1976d2', padding: '10px', borderRadius: '8px', textAlign: 'center', minWidth: '60px', marginRight: '15px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{evt.date.split('-')[1]}月</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{evt.date.split('-')[2]}</div>
                    </div>
                    {/* 活動內容 */}
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                        {evt.title}
                        {evt.type === 'important' && <span style={{ marginLeft: '10px', fontSize: '12px', background: '#d32f2f', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>重要</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                        {evt.date} (週{new Date(evt.date).getDay() === 0 ? '日' : new Date(evt.date).getDay() === 6 ? '六' : ['一','二','三','四','五'][new Date(evt.date).getDay()-1]})
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p style={{ textAlign: 'right', fontSize: '12px', color: '#999', marginTop: '10px' }}>* 僅顯示未來活動，完整行程請見社團群組</p>
          </div>

        </div>

        {/* 頁尾 */}
        <footer style={{ background: '#333', color: 'white', padding: '20px', textAlign: 'center', fontSize: '14px' }}>
          <p>白沙世界民俗舞蹈社 © 2025 | 社長：林佳蓁 | 公關：蕭珮庭</p>
        </footer>

        {/* 登入彈窗 */}
        {showLogin && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '380px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <button onClick={() => setShowLogin(false)} style={{ position: 'absolute', top: '10px', right: '10px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color:'#999' }}>✕</button>
              <h2 style={{ textAlign: 'center', marginBottom: '20px', color:'#333' }}>會員登入</h2>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: '12px', marginBottom: '15px', border:'1px solid #ddd', borderRadius:'6px', boxSizing:'border-box' }} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="密碼" style={{ width: '100%', padding: '12px', marginBottom: '20px', border:'1px solid #ddd', borderRadius:'6px', boxSizing:'border-box' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleLogin} style={{ flex: 1, padding: '12px', background: '#6f42c1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold' }}>登入</button>
                <button onClick={handleRegister} style={{ flex: 1, padding: '12px', background: '#eee', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold' }}>註冊</button>
              </div>
              <p style={{ color: message.includes('成功') ? 'green' : 'red', marginTop: '15px', textAlign: 'center', fontSize:'14px' }}>{message}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // (B) 已登入 (戰情中心) - 保持原樣
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#f4f7f6', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{color: '#6f42c1'}}>💃 社團戰情中心</h1>
        <div><span style={{ marginRight: '10px' }}>Hi, {currentUser?.name}</span><button onClick={handleLogout} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor:'pointer' }}>登出</button></div>
      </div>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <h3>➕ 建立新社團：</h3>
        <input type="text" value={newClubName} onChange={(e) => setNewClubName(e.target.value)} placeholder="例如：登山社" style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <button onClick={handleCreateClub} style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor:'pointer' }}>建立</button>
      </div>
      {!clubData ? <p>⏳ 載入中...</p> : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {clubData.clubs.map(club => (
            <ClubCard key={club.id} club={club} token={token} currentUser={currentUser} onRefresh={() => fetchClubData(token)} />
          ))}
        </div>
      )}
    </div>
  )
}

// --- 子元件 ClubCard (請保持原本的，不用動) ---
function ClubCard({ club, token, currentUser, onRefresh }) {
  const [actDate, setActDate] = useState('')
  const [actTitle, setActTitle] = useState('')
  const [expenseInputs, setExpenseInputs] = useState({})
  const myRole = club.members.find(m => m.userId === currentUser.id)?.role
  const isAdmin = myRole === 'admin'

  async function handleJoin() {
    const res = await fetch('/api/clubs/join-club', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ userId: currentUser.id, clubId: club.id }) })
    const data = await res.json(); if (data.success) { alert('🎉 加入成功'); onRefresh(); } else { alert(data.message); }
  }
  async function handleAddActivity() {
    if (!actDate || !actTitle) return alert('請輸入日期和標題')
    const res = await fetch('/api/clubs/create-activity', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ clubId: club.id, title: actTitle, date: actDate, content: '' }) })
    if ((await res.json()).success) { setActTitle(''); setActDate(''); onRefresh(); }
  }
  async function handleAddExpense(activityId) {
    const input = expenseInputs[activityId]; if (!input || !input.item || !input.amount) return alert('請輸入項目和金額')
    const res = await fetch('/api/clubs/create-expense', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ activityId, item: input.item, amount: input.amount }) })
    if ((await res.json()).success) { setExpenseInputs({ ...expenseInputs, [activityId]: { item: '', amount: '' } }); onRefresh() }
  }
  async function handleApprove(expenseId, action) {
    const res = await fetch('/api/clubs/approve-expense', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ expenseId, action }) })
    if ((await res.json()).success) onRefresh()
  }
  const handleExpChange = (actId, field, val) => { setExpenseInputs(prev => ({ ...prev, [actId]: { ...prev[actId], [field]: val } })) }

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', borderLeft: isAdmin ? '5px solid #ffc107' : '5px solid #007bff' }}>
      <div style={{position:'absolute', top:'10px', right:'10px', fontSize:'12px', color:'#888'}}>身分: {isAdmin ? <b style={{color:'#d63384'}}>👑 幹部</b> : '👤 社員'} {!myRole && <button onClick={handleJoin} style={{marginLeft:'5px', background:'#6f42c1', color:'white', border:'none', borderRadius:'10px', cursor:'pointer'}}>➕ 加入</button>}</div>
      <h2 style={{ color: '#333', marginTop: 0 }}>{club.name}</h2><p style={{fontSize:'14px', color:'#666'}}>成員: {club.members.length} 人</p>
      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
        <b>📅 活動與經費：</b> {club.activities.length === 0 && <p style={{color:'#999', fontSize:'12px'}}>(暫無活動)</p>}
        {club.activities.map(act => (
          <div key={act.id} style={{ marginBottom: '15px', borderBottom: '1px dashed #ccc', paddingBottom: '10px' }}>
            <div style={{fontWeight:'bold', color:'#0056b3'}}>{act.date} - {act.title}</div>
            <div style={{ marginLeft: '15px', fontSize: '14px' }}>
              {act.expenses.map(exp => (
                <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin:'5px 0' }}>
                  <span>💵 {exp.item} (${exp.amount}) <span style={{ marginLeft: '5px', fontSize:'12px', fontWeight:'bold', color: exp.status === 'approved' ? 'green' : exp.status === 'rejected' ? 'red' : 'orange' }}>{exp.status === 'pending' ? '(審核中)' : exp.status === 'approved' ? '(已核准)' : '(已駁回)'}</span></span>
                  {isAdmin && exp.status === 'pending' && (<div><button onClick={() => handleApprove(exp.id, 'approved')} style={{marginRight:'5px', cursor:'pointer'}}>✅</button><button onClick={() => handleApprove(exp.id, 'rejected')} style={{cursor:'pointer'}}>❌</button></div>)}
                </div>
              ))}
              <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
                <input type="text" placeholder="項目" style={{width:'80px', padding:'2px'}} value={expenseInputs[act.id]?.item || ''} onChange={e => handleExpChange(act.id, 'item', e.target.value)} />
                <input type="number" placeholder="$" style={{width:'50px', padding:'2px'}} value={expenseInputs[act.id]?.amount || ''} onChange={e => handleExpChange(act.id, 'amount', e.target.value)} />
                <button onClick={() => handleAddExpense(act.id)} style={{fontSize:'12px', cursor:'pointer', background:'#ffc107', border:'none', borderRadius:'3px'}}>申請</button>
              </div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '2px solid #eee', display: 'flex', gap: '5px' }}><input type="date" value={actDate} onChange={e => setActDate(e.target.value)} style={{ border: '1px solid #ddd', borderRadius: '4px' }} /><input type="text" value={actTitle} onChange={e => setActTitle(e.target.value)} placeholder="新活動標題" style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', padding:'5px' }} /><button onClick={handleAddActivity} style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>發布</button></div>
      </div>
    </div>
  )
}

export default App