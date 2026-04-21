// Books — 10 screens for inventory / ledger / GST management.
// Reuses Treasury tokens + primitives from /components and /tokens.
const { useState: useStateB, useMemo: useMemoB } = React;

// ───────────── shared helpers ─────────────
const INR = (n) => '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const signedINR = (n) => (n < 0 ? '−' : '') + INR(n);

function ScreenHeader({ eyebrow, title, right, sub }) {
  return (
    <div style={{padding:'4px 14px 8px'}}>
      <div className="row between" style={{marginBottom:2}}>
        {eyebrow && <div className="t-xs t-subtle" style={{textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600}}>{eyebrow}</div>}
        {right}
      </div>
      <div className="t-display" style={{fontSize:'var(--t-2xl)',letterSpacing:'-0.02em'}}>{title}</div>
      {sub && <div className="t-sm t-muted" style={{marginTop:2}}>{sub}</div>}
    </div>
  );
}

// ═════════════════════════════════════════════
// 1. HOME / DASHBOARD
// ═════════════════════════════════════════════
function BooksHome({ onNav }) {
  const kpis = [
    { label: 'Sales · Apr', value: '₹12.4L', delta: 8.4, comparison: 'vs Mar', spark: [8,9,10,11,10,12,13,14], sparkColor: 'var(--c-chartA)' },
    { label: 'Receivables', value: '₹3.2L', delta: -2.1, comparison: '14 invoices', spark: [12,13,13,12,12,11,11,10], sparkColor: 'var(--c-warning)' },
    { label: 'Payables',    value: '₹1.8L', delta: 1.4, comparison: '6 bills due', spark: [10,11,11,12,12,11,12,13], sparkColor: 'var(--c-chartE)' },
    { label: 'Cash in hand',value: '₹8.6L', delta: 4.2, comparison: '3 accounts',  spark: [9,10,10,11,12,12,13,14], sparkColor: 'var(--c-success)' },
  ];

  const quickActions = [
    { id: 'invoice_new', label: 'New invoice', icon: <I.file size={18}/>, tone: 'chartA', nav: 'invoice_new' },
    { id: 'receipt', label: 'Record payment', icon: <I.coins size={18}/>, tone: 'chartB', nav: 'receipts' },
    { id: 'inventory', label: 'Stock', icon: <I.briefcase size={18}/>, tone: 'chartC', nav: 'inventory' },
    { id: 'gst', label: 'GST', icon: <I.shield size={18}/>, tone: 'chartE', nav: 'reports' },
  ];

  return (
    <div className="col" style={{padding:'4px 0 90px', gap:12}}>
      <ScreenHeader eyebrow="Quickstart · FY 2025-26" title="Good morning, Anand"
        sub="You have 3 invoices due today and 2 GST tasks pending"
        right={
          <div className="row gap-2">
            <button className="btn-icon"><I.bell size={16}/></button>
            <Avatar name="Anand Kumar" size="sm"/>
          </div>
        }/>

      {/* KPI grid */}
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:8,padding:'0 14px'}}>
        {kpis.map(k => <StatCard key={k.label} {...k}/>)}
      </div>

      {/* Quick actions */}
      <div style={{padding:'0 14px'}}>
        <div className="t-xs t-muted" style={{textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:600,marginBottom:8}}>Quick actions</div>
        <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
          {quickActions.map(a => (
            <button key={a.id} onClick={() => onNav(a.nav)} style={{
              border:'1px solid var(--c-border)',background:'var(--c-surface)',
              padding:12,borderRadius:'var(--r-lg)',display:'flex',flexDirection:'column',
              alignItems:'flex-start',gap:8,cursor:'pointer',textAlign:'left'
            }}>
              <div style={{width:32,height:32,borderRadius:'var(--r-md)',
                background:`color-mix(in srgb, var(--c-${a.tone}) 14%, transparent)`,
                color:`var(--c-${a.tone})`,display:'flex',alignItems:'center',justifyContent:'center'}}>{a.icon}</div>
              <div className="t-xs" style={{fontWeight:600,lineHeight:1.2}}>{a.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sales trend */}
      <Card padding={14} style={{margin:'0 14px'}}>
        <div className="row between" style={{marginBottom:8}}>
          <div>
            <div className="t-h3">Sales & purchases</div>
            <div className="t-xs t-muted">Last 30 days</div>
          </div>
          <Segmented options={[{value:'30',label:'30d'},{value:'90',label:'90d'},{value:'ytd',label:'YTD'}]} value="30" onChange={()=>{}}/>
        </div>
        <LineChart height={140} data={Array.from({length:30},(_,i)=>({
          x: i+1,
          sales: 30000 + Math.sin(i/3)*8000 + Math.random()*4000,
          purchases: 18000 + Math.sin(i/4+1)*5000 + Math.random()*3000,
        }))} series={[
          { key:'sales', color:'var(--c-chartA)', area:true },
          { key:'purchases', color:'var(--c-chartE)' }
        ]}/>
        <div className="row gap-3" style={{marginTop:6}}>
          <span className="t-xs row gap-1"><span className="dot" style={{background:'var(--c-chartA)'}}/>Sales ₹12.4L</span>
          <span className="t-xs row gap-1 t-muted"><span className="dot" style={{background:'var(--c-chartE)'}}/>Purchases ₹7.2L</span>
        </div>
      </Card>

      {/* GST alerts */}
      <Card padding={0} style={{margin:'0 14px'}}>
        <div style={{padding:'12px 14px',display:'flex',gap:10,alignItems:'center',background:'var(--c-warningSoft)',borderBottom:'1px solid var(--c-divider)'}}>
          <div style={{flexShrink:0}}><Illos.IlloShield size={44}/></div>
          <div style={{flex:1}}>
            <div className="t-sm" style={{fontWeight:600,color:'var(--c-warning)'}}>GSTR-3B due in 4 days</div>
            <div className="t-xs t-muted">April return · ₹44,208 tax liability</div>
          </div>
          <Button size="xs" onClick={() => onNav('reports')}>File</Button>
        </div>
        <div style={{padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div className="t-sm" style={{fontWeight:500}}>6 invoices in GSTR-2A mismatch</div>
            <div className="t-xs t-muted">₹18,402 ITC to reconcile</div>
          </div>
          <I.chevR size={14} style={{color:'var(--c-textSubtle)'}}/>
        </div>
      </Card>

      {/* Recent activity */}
      <div style={{padding:'0 14px'}}>
        <div className="row between" style={{marginBottom:8}}>
          <div className="t-xs t-muted" style={{textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:600}}>Recent activity</div>
          <button style={{border:0,background:'transparent',color:'var(--c-primary)',fontSize:'var(--t-xs)',fontWeight:600,cursor:'pointer'}}>See all</button>
        </div>
        <Card padding={0}>
          {[
            { t: 'Invoice INV-0412 · Sharma Traders', s: '₹24,800 · Paid', icon: <I.success size={14}/>, iconBg: 'var(--c-successSoft)', iconColor: 'var(--c-success)', time: '2h ago' },
            { t: 'Stock low · Basmati Rice 5kg', s: '4 units left · below reorder', icon: <I.alert size={14}/>, iconBg: 'var(--c-warningSoft)', iconColor: 'var(--c-warning)', time: '3h ago' },
            { t: 'Payment received · ₹12,400', s: 'Kirti Enterprises · UPI', icon: <I.arrowDR size={14}/>, iconBg: 'var(--c-successSoft)', iconColor: 'var(--c-success)', time: '5h ago' },
            { t: 'Bill added · Eastern Logistics', s: '₹4,820 · Due Apr 28', icon: <I.file size={14}/>, iconBg: 'var(--c-surfaceAlt)', iconColor: 'var(--c-textMuted)', time: 'Yesterday' },
          ].map((a, i, arr) => (
            <div key={i} className="list-row" style={{padding:'10px 14px',minHeight:'auto',borderBottom:i===arr.length-1?'none':'1px solid var(--c-divider)'}}>
              <div style={{width:32,height:32,borderRadius:'var(--r-md)',background:a.iconBg,color:a.iconColor,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{a.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="t-sm truncate" style={{fontWeight:500}}>{a.t}</div>
                <div className="t-xs t-muted truncate">{a.s}</div>
              </div>
              <div className="t-xs t-subtle">{a.time}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 2. INVENTORY LIST
// ═════════════════════════════════════════════
function BooksInventory({ onNav, onOpenProduct }) {
  const [search, setSearch] = useStateB('');
  const [group, setGroup] = useStateB('all');

  const products = [
    { sku: 'RC-BS5',  name: 'Basmati Rice 5kg',   hsn: '1006', stock: 4,   unit: 'bag',  price: 420, cost: 340, stockValue: 1680, low: true },
    { sku: 'FL-WH10', name: 'Wheat Flour 10kg',   hsn: '1101', stock: 28,  unit: 'bag',  price: 340, cost: 270, stockValue: 9520 },
    { sku: 'OL-SF1',  name: 'Sunflower Oil 1L',   hsn: '1512', stock: 142, unit: 'btl',  price: 148, cost: 118, stockValue: 21016 },
    { sku: 'SL-TA2',  name: 'Tata Salt 1kg',       hsn: '2501', stock: 64,  unit: 'pkt',  price: 28,  cost: 22,  stockValue: 1792 },
    { sku: 'SG-SH5',  name: 'Sugar 5kg',           hsn: '1701', stock: 12,  unit: 'bag',  price: 240, cost: 192, stockValue: 2880, low: true },
    { sku: 'DL-TR1',  name: 'Toor Dal 1kg',        hsn: '0713', stock: 86,  unit: 'pkt',  price: 160, cost: 128, stockValue: 13760 },
    { sku: 'CE-MR5',  name: 'Marie Biscuits ×12',  hsn: '1905', stock: 40,  unit: 'box',  price: 240, cost: 190, stockValue: 9600 },
    { sku: 'MK-AM1',  name: 'Amul Milk 1L',        hsn: '0401', stock: 0,   unit: 'btl',  price: 68,  cost: 58,  stockValue: 0, low: true },
  ];

  const filtered = products.filter(p => {
    if (group === 'low' && !p.low) return false;
    if (group === 'out' && p.stock > 0) return false;
    if (search && !(`${p.name} ${p.sku} ${p.hsn}`).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalValue = products.reduce((s, p) => s + p.stockValue, 0);
  const lowCount = products.filter(p => p.low).length;
  const outCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="col" style={{padding:'4px 0 90px',gap:10}}>
      <ScreenHeader eyebrow="Stock" title="Inventory"
        right={<div className="row gap-2"><button className="btn-icon"><I.upload size={16}/></button><button className="btn-icon"><I.plus size={16}/></button></div>}/>

      {/* Summary strip */}
      <div style={{padding:'0 14px'}}>
        <Card padding={0}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr'}}>
            <div style={{padding:'12px 14px'}}>
              <div className="t-xs t-muted">Stock value</div>
              <div className="t-h3 t-num" style={{marginTop:2}}>{INR(totalValue)}</div>
            </div>
            <div style={{padding:'12px 14px',borderLeft:'1px solid var(--c-divider)'}}>
              <div className="t-xs t-muted">Low stock</div>
              <div className="t-h3 t-num" style={{marginTop:2,color:'var(--c-warning)'}}>{lowCount}</div>
            </div>
            <div style={{padding:'12px 14px',borderLeft:'1px solid var(--c-divider)'}}>
              <div className="t-xs t-muted">Out of stock</div>
              <div className="t-h3 t-num" style={{marginTop:2,color:'var(--c-danger)'}}>{outCount}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search + filters */}
      <div style={{padding:'0 14px'}} className="col gap-2">
        <div className="row gap-2">
          <Input prefix={<I.search size={14}/>} placeholder="SKU, name, HSN code…" value={search} onChange={e=>setSearch(e.target.value)} clearable onClear={()=>setSearch('')}/>
          <button className="btn-icon"><I.sort size={16}/></button>
        </div>
        <div className="row gap-1" style={{overflowX:'auto'}}>
          {[['all','All · '+products.length],['low','Low stock · '+lowCount],['out','Out · '+outCount],['recent','Recently added']].map(([k,l]) => (
            <button key={k} onClick={()=>setGroup(k)} style={{
              border:'1px solid var(--c-border)',
              background: group === k ? 'var(--c-text)' : 'var(--c-surface)',
              color: group === k ? 'var(--c-textInverse)' : 'var(--c-text)',
              padding:'6px 12px',borderRadius:'var(--r-pill)',
              fontSize:'var(--t-xs)',fontWeight:500,cursor:'pointer',whiteSpace:'nowrap'
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{padding:'0 14px'}}>
        <Card padding={0}>
          {filtered.map((p, i) => {
            const stockColor = p.stock === 0 ? 'var(--c-danger)' : p.low ? 'var(--c-warning)' : 'var(--c-text)';
            return (
              <div key={p.sku} className="list-row" onClick={() => onOpenProduct(p)}
                style={{padding:'12px 14px',minHeight:'auto',gap:12,borderBottom:i===filtered.length-1?'none':'1px solid var(--c-divider)'}}>
                <div style={{width:40,height:40,borderRadius:'var(--r-md)',background:'var(--c-surfaceAlt)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'var(--c-textMuted)'}}>
                  <I.briefcase size={18}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="t-sm truncate" style={{fontWeight:500}}>{p.name}</div>
                  <div className="row gap-2" style={{marginTop:2}}>
                    <span className="t-xs t-mono t-subtle">{p.sku}</span>
                    <span className="t-xs t-muted">· HSN {p.hsn}</span>
                    <span className="t-xs t-muted">· {INR(p.price)}</span>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="t-sm t-num" style={{fontWeight:700,color:stockColor}}>{p.stock} <span className="t-xs" style={{color:'var(--c-textMuted)',fontWeight:400}}>{p.unit}</span></div>
                  {p.low ? <Badge tone={p.stock===0?'danger':'warning'} dot>{p.stock===0?'Out':'Low'}</Badge> : <div className="t-xs t-subtle t-num">{INR(p.stockValue)}</div>}
                </div>
              </div>
            );
          })}
        </Card>
        {filtered.length === 0 && (
          <Card padding={24} style={{textAlign:'center'}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:10}}><Illos.IlloEmpty size={100}/></div>
            <div className="t-h3">Nothing here</div>
            <div className="t-sm t-muted" style={{marginTop:4}}>Try a different search or filter.</div>
          </Card>
        )}
      </div>
    </div>
  );
}

window.BooksHome = BooksHome;
window.BooksInventory = BooksInventory;
window.BooksINR = INR;
window.BooksScreenHeader = ScreenHeader;
