import { useState } from 'react'

// --- 主程式 (App) ---
function App() {
  // 狀態區
  const [token, setToken] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [email, setEmail] = useState('student@ncue.edu.tw')
  const [password, setPassword] = useState('mypassword')
  const [message, setMessage] = useState('') 
  const [clubData, setClubData] = useState(null)
  const [newClubName, setNewClubName] = useState('')

  // 1. 登入
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
        setToken(data.token)
        setCurrentUser(data.user)
        setMessage('')
        fetchClubData(data.token)
      } else { setMessage(`❌ ${data.message}`) }
    } catch (err) { setMessage('連線錯誤') }
  }

  // 1.5 (新功能) 註冊
  async function handleRegister() {
    setMessage('⏳ 註冊中...')
    try {
      // 這裡假設註冊新帳號都叫 "新同學"，您也可以多做一個輸入框讓 user 填名字
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: '新同學' })
      })
      const data = await res.json()
      if (data.success) {
        alert('註冊成功！請直接按下登入')
        setMessage('✅ 註冊成功，請登入')
      } else {
        setMessage(`❌ 註冊失敗：${data.message}`)
      }
    } catch (err) { setMessage('連線錯誤') }
  }

  // 2. 抓取資料
  async function fetchClubData(userToken) {
    try {
      const res = await fetch('/api/clubs/club-center', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${userToken || token}` }
      })
      const data = await res.json()
      setClubData(data)
    } catch (err) { alert('抓取資料失敗') }
  }

  // 3. 建立社團
  async function handleCreateClub() {
    if (!newClubName) return alert('請輸入社團名稱')
    try {
      await fetch('/api/clubs/create-club', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newClubName })
      })
      setNewClubName('')
      fetchClubData(token)
    } catch (err) {}
  }

  // 4. 登出
  function handleLogout() { setToken(null); setCurrentUser(null); setClubData(null); }

  // --- 畫面區 ---
  
  // (A) 沒登入：顯示登入/註冊頁
  if (!token) {
    return (
      <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <h1>🏫 社團管理系統</h1>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
          <h2>會員登入 / 註冊</h2>
          <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="密碼" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          
          {/* 按鈕區 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleLogin} style={{ flex: 1, padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>登入</button>
            <button onClick={handleRegister} style={{ flex: 1, padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>註冊</button>
          </div>
          
          <p style={{ color: message.includes('成功') ? 'green' : 'red', marginTop: '10px' }}>{message}</p>
        </div>
      </div>
    )
  }

  // (B) 已登入：顯示戰情中心
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#f4f7f6', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🚀 社團戰情中心</h1>
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
            <ClubCard 
              key={club.id} 
              club={club} 
              token={token} 
              currentUser={currentUser} 
              onRefresh={() => fetchClubData(token)} 
            />
          ))}
        </div>
      )}
    </div>
  )
}

// --- 子元件：社團卡片 ---
function ClubCard({ club, token, currentUser, onRefresh }) {
  const [actDate, setActDate] = useState('')
  const [actTitle, setActTitle] = useState('')
  const [expenseInputs, setExpenseInputs] = useState({})
  
  const myRole = club.members.find(m => m.userId === currentUser.id)?.role
  const isAdmin = myRole === 'admin'

  async function handleJoin() {
    const res = await fetch('/api/clubs/join-club', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ userId: currentUser.id, clubId: club.id })
    })
    const data = await res.json()
    if (data.success) { alert('🎉 加入成功'); onRefresh(); } else { alert(data.message); }
  }

  async function handleAddActivity() {
    if (!actDate || !actTitle) return alert('請輸入日期和標題')
    const res = await fetch('/api/clubs/create-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ clubId: club.id, title: actTitle, date: actDate, content: '' })
    })
    if ((await res.json()).success) { setActTitle(''); setActDate(''); onRefresh(); }
  }

  async function handleAddExpense(activityId) {
    const input = expenseInputs[activityId]
    if (!input || !input.item || !input.amount) return alert('請輸入項目和金額')
    const res = await fetch('/api/clubs/create-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ activityId, item: input.item, amount: input.amount })
    })
    if ((await res.json()).success) {
      setExpenseInputs({ ...expenseInputs, [activityId]: { item: '', amount: '' } })
      onRefresh()
    }
  }

  async function handleApprove(expenseId, action) {
    const res = await fetch('/api/clubs/approve-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ expenseId, action })
    })
    if ((await res.json()).success) onRefresh()
  }

  const handleExpChange = (actId, field, val) => {
    setExpenseInputs(prev => ({ ...prev, [actId]: { ...prev[actId], [field]: val } }))
  }

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', borderLeft: isAdmin ? '5px solid #ffc107' : '5px solid #007bff' }}>
      <div style={{position:'absolute', top:'10px', right:'10px', fontSize:'12px', color:'#888'}}>
        您的身分: {isAdmin ? <b style={{color:'#d63384'}}>👑 幹部</b> : '👤 社員'}
        {!myRole && <button onClick={handleJoin} style={{marginLeft:'5px', background:'#6f42c1', color:'white', border:'none', borderRadius:'10px', cursor:'pointer'}}>➕ 加入</button>}
      </div>
      <h2 style={{ color: '#333', marginTop: 0 }}>{club.name}</h2>
      <p style={{fontSize:'14px', color:'#666'}}>成員: {club.members.length} 人</p>
      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
        <b>📅 活動與經費：</b>
        {club.activities.length === 0 && <p style={{color:'#999', fontSize:'12px'}}>(暫無活動)</p>}
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
        <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '2px solid #eee', display: 'flex', gap: '5px' }}>
          <input type="date" value={actDate} onChange={e => setActDate(e.target.value)} style={{ border: '1px solid #ddd', borderRadius: '4px' }} />
          <input type="text" value={actTitle} onChange={e => setActTitle(e.target.value)} placeholder="新活動標題" style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', padding:'5px' }} />
          <button onClick={handleAddActivity} style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>發布</button>
        </div>
      </div>
    </div>
  )
}

export default App