import { useState } from 'react'

// --- 主程式 ---
function App() {
  const [token, setToken] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [email, setEmail] = useState('student@ncue.edu.tw')
  const [password, setPassword] = useState('mypassword')
  const [message, setMessage] = useState('') 
  const [clubData, setClubData] = useState(null)
  const [newGroup, setNewGroup] = useState({ name: '', description: '', location: '' })

  // --- API 動作 ---
  async function handleLogin() {
    setMessage('⏳ 驗證中...')
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (data.success) { setToken(data.token); setCurrentUser(data.user); setMessage(''); fetchClubData(data.token); } 
      else { setMessage(`❌ ${data.message}`) }
    } catch (err) { setMessage('連線錯誤') }
  }

  async function handleRegister() {
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name: '新同學' }) })
      const data = await res.json(); if(data.success){ alert('註冊成功'); setMessage('✅ 註冊成功，請登入'); } else { setMessage(`❌ ${data.message}`); }
    } catch (err) {}
  }

  async function fetchClubData(userToken) {
    try {
      const res = await fetch('/api/clubs/club-center', { method: 'GET', headers: { 'Authorization': `Bearer ${userToken || token}` } })
      setClubData(await res.json())
    } catch (err) {}
  }

  async function handleCreateGroup() {
    if (!newGroup.name) return alert('請輸入舞碼名稱')
    await fetch('/api/clubs/create-club', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newGroup)
    })
    setNewGroup({ name: '', description: '', location: '' }); 
    fetchClubData(token);
  }

  function handleLogout() { setToken(null); setCurrentUser(null); setClubData(null); }

  // --- (A) 未登入介面 (這裡簡化顯示，實際會是漂亮的官網) ---
  if (!token) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f0f2f5', flexDirection:'column' }}>
        <h1 style={{color:'#6f42c1', marginBottom:'20px'}}>💃 白沙民舞社系統</h1>
        <div style={{background:'white', padding:'30px', borderRadius:'10px', boxShadow:'0 4px 10px rgba(0,0,0,0.1)', width:'300px'}}>
          <h3 style={{textAlign:'center', marginTop:0}}>會員登入</h3>
          <input type="text" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}}/>
          <input type="password" placeholder="密碼" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}}/>
          <div style={{display:'flex', gap:'10px'}}>
            <button onClick={handleLogin} style={{flex:1, padding:'10px', background:'#6f42c1', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>登入</button>
            <button onClick={handleRegister} style={{flex:1, padding:'10px', background:'#eee', color:'#333', border:'none', borderRadius:'5px', cursor:'pointer'}}>註冊</button>
          </div>
          <p style={{color:'red', textAlign:'center', fontSize:'14px'}}>{message}</p>
        </div>
      </div>
    )
  }

  // --- (B) 登入後：舞團排練中心 ---
  return (
    <div style={{ fontFamily: '"Microsoft JhengHei", sans-serif', background: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'15px'}}>
          <div style={{ width:'40px', height:'40px', background:'#6f42c1', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold', fontSize:'20px' }}>舞</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', color: '#333' }}>舞團排練與行政中心</h1>
            <span style={{ fontSize: '12px', color: '#888' }}>NCUE Folk Dance Management</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
          <span style={{ color: '#555', fontWeight:'500' }}>👤 {currentUser?.name}</span>
          <button onClick={handleLogout} style={{ padding: '8px 20px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '20px', cursor:'pointer', fontWeight:'bold' }}>登出</button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* 建立群組區塊 */}
        <div style={{ background: 'linear-gradient(135deg, #6f42c1 0%, #8e44ad 100%)', padding: '30px', borderRadius: '15px', color: 'white', marginBottom: '40px', boxShadow: '0 10px 20px rgba(111, 66, 193, 0.2)' }}>
          <h2 style={{ margin: '0 0 20px 0', display:'flex', alignItems:'center', gap:'10px' }}>➕ 建立新的表演舞碼群組</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '15px' }}>
            <input type="text" placeholder="舞碼名稱 (如: 扇舞組)" value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: 'none' }} />
            <input type="text" placeholder="介紹 (如: 全國賽比賽舞碼)" value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: 'none' }} />
            <input type="text" placeholder="排練地點 (如: 體育館)" value={newGroup.location} onChange={e => setNewGroup({...newGroup, location: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: 'none' }} />
            <button onClick={handleCreateGroup} style={{ padding: '12px 30px', background: '#00e676', color: '#004d40', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow:'0 4px 0 #00a854' }}>建立</button>
          </div>
        </div>

        {/* 群組列表 */}
        {!clubData ? <p style={{textAlign:'center', color:'#888'}}>⏳ 讀取資料中...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
            {clubData.clubs.map(group => (
              <GroupCard key={group.id} group={group} token={token} currentUser={currentUser} onRefresh={() => fetchClubData(token)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// --- 子元件：GroupCard ---
function GroupCard({ group, token, currentUser, onRefresh }) {
  const [actDate, setActDate] = useState('')
  const [actTitle, setActTitle] = useState('')
  const [actType, setActType] = useState('rehearsal')
  const [expenseInputs, setExpenseInputs] = useState({})
  
  const myRole = group.members.find(m => m.userId === currentUser.id)?.role
  const isAdmin = myRole === 'admin'

  async function handleJoin() {
    const res = await fetch('/api/clubs/join-club', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ userId: currentUser.id, clubId: group.id }) })
    if ((await res.json()).success) { alert('加入成功'); onRefresh(); }
  }
  
  async function handleAddActivity() {
    if (!actDate || !actTitle) return alert('請填寫完整')
    const res = await fetch('/api/clubs/create-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ clubId: group.id, title: actTitle, date: actDate, type: actType })
    })
    if ((await res.json()).success) { setActTitle(''); setActDate(''); onRefresh(); }
  }

  async function handleAddExpense(aid) {
    const input = expenseInputs[aid]; if(!input?.item) return;
    await fetch('/api/clubs/create-expense', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization':`Bearer ${token}`}, body: JSON.stringify({ activityId: aid, item: input.item, amount: input.amount }) });
    setExpenseInputs({...expenseInputs, [aid]:{item:'',amount:''}}); onRefresh();
  }
  async function handleApprove(eid, action) {
    await fetch('/api/clubs/approve-expense', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization':`Bearer ${token}`}, body: JSON.stringify({ expenseId: eid, action }) });
    onRefresh();
  }
  const handleExpChange = (aid, f, v) => setExpenseInputs(p => ({...p, [aid]: {...p[aid], [f]:v}}))

  return (
    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)', overflow: 'hidden', borderTop: `5px solid ${isAdmin ? '#ff9800' : '#6f42c1'}` }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #eee', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          {!myRole ? <button onClick={handleJoin} style={{ padding: '6px 12px', background: '#6f42c1', color: 'white', border: 'none', borderRadius: '6px', cursor:'pointer' }}>+ 加入</button> : 
           <span style={{ padding: '4px 10px', background: isAdmin ? '#fff3e0' : '#f3e5f5', color: isAdmin ? '#e65100' : '#7b1fa2', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{isAdmin ? '👑 負責人' : '💃 舞者'}</span>}
        </div>
        <h2 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '22px' }}>{group.name}</h2>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>📍 {group.location || '地點未定'} | 👥 {group.members.length} 人</p>
        {group.description && <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#888', fontStyle: 'italic' }}>"{group.description}"</p>}
      </div>
      <div style={{ padding: '20px', background: '#fafafa', minHeight: '200px' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#555', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Schedule & Budget</h4>
        {group.activities.length === 0 ? <p style={{textAlign:'center', color:'#ccc', fontSize:'14px'}}>暫無日程</p> : group.activities.map(act => (
          <div key={act.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.03)', borderLeft: act.type === 'show' ? '4px solid #e91e63' : '4px solid #2196f3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div><span style={{ fontSize: '12px', color: act.type === 'show' ? '#e91e63' : '#2196f3', fontWeight: 'bold', marginRight: '8px' }}>{act.type === 'show' ? '🎪 演出' : '🩰 排練'}</span><span style={{ fontWeight: 'bold', color: '#333' }}>{act.title}</span></div>
              <span style={{ fontSize: '13px', color: '#999' }}>{act.date}</span>
            </div>
            <div style={{ fontSize: '13px', paddingLeft: '10px', borderLeft: '2px solid #eee' }}>
              {act.expenses.map(exp => (
                <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0', color: '#555' }}>
                  <span>{exp.item} (${exp.amount})</span>
                  <span style={{ fontWeight: 'bold', color: exp.status==='approved'?'green':exp.status==='rejected'?'red':'orange' }}>{exp.status === 'pending' && isAdmin ? (<><button onClick={()=>handleApprove(exp.id, 'approved')} style={{border:'none', background:'none', cursor:'pointer'}}>✅</button><button onClick={()=>handleApprove(exp.id, 'rejected')} style={{border:'none', background:'none', cursor:'pointer'}}>❌</button></>) : (exp.status==='pending'?'審核中':exp.status==='approved'?'已核准':'已駁回')}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}><input placeholder="項目" value={expenseInputs[act.id]?.item||''} onChange={e=>handleExpChange(act.id,'item',e.target.value)} style={{width:'60px', padding:'3px', border:'1px solid #ddd', borderRadius:'4px'}}/><input placeholder="$" value={expenseInputs[act.id]?.amount||''} onChange={e=>handleExpChange(act.id,'amount',e.target.value)} style={{width:'40px', padding:'3px', border:'1px solid #ddd', borderRadius:'4px'}}/><button onClick={()=>handleAddExpense(act.id)} style={{background:'#ff9800', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'12px'}}>申請</button></div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #ddd' }}>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
            <select value={actType} onChange={e=>setActType(e.target.value)} style={{padding:'5px', border:'1px solid #ddd', borderRadius:'4px', background:'white'}}><option value="rehearsal">排練</option><option value="show">演出</option></select>
            <input type="date" value={actDate} onChange={e=>setActDate(e.target.value)} style={{padding:'5px', border:'1px solid #ddd', borderRadius:'4px'}} />
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <input type="text" placeholder="日程標題" value={actTitle} onChange={e=>setActTitle(e.target.value)} style={{flex:1, padding:'5px', border:'1px solid #ddd', borderRadius:'4px'}} /><button onClick={handleAddActivity} style={{background:'#2196f3', color:'white', border:'none', borderRadius:'4px', padding:'5px 10px', cursor:'pointer'}}>新增</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App