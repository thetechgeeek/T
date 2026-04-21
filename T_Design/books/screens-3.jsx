// Books — Screens 7–10: Party detail, Reports, Receipts/Payments, Journal entry
const INR3 = window.BooksINR;
const ScreenHeader3 = window.BooksScreenHeader;

// ═════════════════════════════════════════════
// 7. PARTY (Customer/Vendor) DETAIL
// ═════════════════════════════════════════════
function BooksParty({ onBack }) {
  const [tab, setTab] = React.useState('statement');
  const party = {
    name: 'Sharma Traders', type: 'Customer · B2B',
    gstin: '27AABCS1234A1Z5', state: 'Maharashtra', phone: '+91 98765 43210',
    email: 'accounts@sharmatraders.in',
    outstanding: 62400, credit: 100000, paid: 284600,
  };

  const statement = [
    { d: 'Apr 28', t: 'Invoice INV-0415', dr: 48200, cr: 0,   bal: 62400 },
    { d: 'Apr 15', t: 'Payment · UPI',     dr: 0,     cr: 14200, bal: 14200 },
    { d: 'Apr 10', t: 'Invoice INV-0402', dr: 14200, cr: 0,   bal: 28400 },
    { d: 'Apr 02', t: 'Payment · NEFT',    dr: 0,     cr: 24800, bal: 14200 },
    { d: 'Mar 28', t: 'Invoice INV-0388', dr: 24800, cr: 0,   bal: 39000 },
  ];

  return (
    <div className="col" style={{padding:'4px 0 90px',gap:12}}>
      <div className="row between" style={{padding:'6px 14px'}}>
        <button className="btn-icon" onClick={onBack}><I.chevL size={16}/></button>
        <div className="row gap-2"><button className="btn-icon"><I.send size={16}/></button><button className="btn-icon"><I.more size={16}/></button></div>
      </div>

      {/* Header */}
      <div style={{padding:'0 14px'}}>
        <div className="row gap-3">
          <Avatar name={party.name} size="lg"/>
          <div style={{flex:1,minWidth:0}}>
            <div className="t-display" style={{fontSize:'var(--t-xl)',letterSpacing:'-0.02em'}}>{party.name}</div>
            <div className="t-xs t-muted">{party.type}</div>
            <div className="t-xs t-mono t-subtle" style={{marginTop:2}}>GSTIN {party.gstin}</div>
          </div>
        </div>
      </div>

      {/* Big outstanding */}
      <div style={{padding:'0 14px'}}>
        <Card padding={14}>
          <div className="t-xs t-muted">Outstanding balance</div>
          <div className="t-display t-num" style={{fontSize:'var(--t-3xl)',color:'var(--c-danger)',letterSpacing:'-0.03em',marginTop:2}}>{INR3(party.outstanding)}</div>
          <div className="row gap-2" style={{marginTop:2}}>
            <Badge tone="danger" dot>INV-0411 overdue 8 days</Badge>
          </div>
          <div style={{marginTop:12,height:6,background:'var(--c-surfaceAlt)',borderRadius:3,overflow:'hidden',display:'flex'}}>
            <div style={{width:`${party.outstanding/party.credit*100}%`,background:'var(--c-danger)'}}/>
          </div>
          <div className="row between" style={{marginTop:4}}>
            <div className="t-xs t-muted">Credit used</div>
            <div className="t-xs t-num t-muted">{INR3(party.outstanding)} / {INR3(party.credit)}</div>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="row gap-2" style={{padding:'0 14px'}}>
        <Button full variant="primary" iconLeft={<I.plus size={14}/>}>Invoice</Button>
        <Button full iconLeft={<I.coins size={14}/>}>Receive</Button>
        <Button full iconLeft={<I.send size={14}/>}>Remind</Button>
      </div>

      {/* Contact */}
      <div style={{padding:'0 14px'}}>
        <Card padding={0}>
          {[['Phone',party.phone,'phone'],['Email',party.email,'email'],['State',party.state+' (27)','state']].map(([k,v],i,arr)=>(
            <div key={k} className="row between" style={{padding:'10px 14px',borderBottom:i===arr.length-1?'none':'1px solid var(--c-divider)'}}>
              <div className="t-xs t-muted">{k}</div><div className="t-sm">{v}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* Tabs */}
      <div style={{padding:'0 14px'}}>
        <Segmented value={tab} onChange={setTab} options={[
          {value:'statement',label:'Statement'},
          {value:'invoices',label:'Invoices'},
          {value:'notes',label:'Notes'},
        ]}/>
      </div>

      {tab === 'statement' && (
        <Card padding={0} style={{margin:'0 14px'}}>
          <div style={{padding:'8px 14px',background:'var(--c-surfaceAlt)',borderBottom:'1px solid var(--c-divider)',display:'grid',gridTemplateColumns:'1fr 70px 70px 70px',gap:8}}>
            <div className="t-xs t-muted" style={{fontWeight:600}}>Date / Particulars</div>
            <div className="t-xs t-muted" style={{textAlign:'right',fontWeight:600}}>Debit</div>
            <div className="t-xs t-muted" style={{textAlign:'right',fontWeight:600}}>Credit</div>
            <div className="t-xs t-muted" style={{textAlign:'right',fontWeight:600}}>Balance</div>
          </div>
          {statement.map((s,i)=>(
            <div key={i} style={{padding:'10px 14px',borderBottom:i===statement.length-1?'none':'1px solid var(--c-divider)',display:'grid',gridTemplateColumns:'1fr 70px 70px 70px',gap:8,alignItems:'center'}}>
              <div>
                <div className="t-sm truncate" style={{fontWeight:500}}>{s.t}</div>
                <div className="t-xs t-subtle">{s.d}</div>
              </div>
              <div className="t-xs t-num" style={{textAlign:'right',color:s.dr?'var(--c-text)':'var(--c-textSubtle)'}}>{s.dr?INR3(s.dr):'—'}</div>
              <div className="t-xs t-num" style={{textAlign:'right',color:s.cr?'var(--c-success)':'var(--c-textSubtle)'}}>{s.cr?INR3(s.cr):'—'}</div>
              <div className="t-xs t-num" style={{textAlign:'right',fontWeight:600}}>{INR3(s.bal)}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════
// 8. REPORTS (P&L, Trial Balance, GST)
// ═════════════════════════════════════════════
function BooksReports() {
  const [rpt, setRpt] = React.useState('pnl');

  const pnl = {
    income: [
      ['Sales — Goods',1240000],
      ['Sales — Services',84000],
      ['Other income',12400],
    ],
    expenses: [
      ['Cost of goods sold',720000],
      ['Salaries & wages',186000],
      ['Rent',45000],
      ['Utilities',8400],
      ['Transport & logistics',32000],
      ['Marketing',14800],
      ['Other expenses',18200],
    ],
  };
  const totalIncome = pnl.income.reduce((s,[,v])=>s+v,0);
  const totalExp = pnl.expenses.reduce((s,[,v])=>s+v,0);
  const profit = totalIncome - totalExp;

  const tb = [
    ['Cash & Bank',860000,0],
    ['Accounts receivable',320000,0],
    ['Inventory',482000,0],
    ['Fixed assets',240000,0],
    ['Accounts payable',0,180000],
    ['GST payable',0,44208],
    ['Capital account',0,1250000],
    ['Retained earnings',0,427792],
  ];
  const tbDr = tb.reduce((s,r)=>s+r[1],0);
  const tbCr = tb.reduce((s,r)=>s+r[2],0);

  return (
    <div className="col" style={{padding:'4px 0 90px',gap:12}}>
      <ScreenHeader3 eyebrow="Financials" title="Reports" sub="FY 2025-26 · Apr 1 – Apr 30"
        right={<div className="row gap-2"><button className="btn-icon"><I.calendar size={16}/></button><button className="btn-icon"><I.download size={16}/></button></div>}/>

      {/* Report switcher */}
      <div style={{padding:'0 14px'}}>
        <div className="row gap-1" style={{overflowX:'auto'}}>
          {[['pnl','P&L'],['tb','Trial balance'],['gst','GST summary']].map(([k,l]) => (
            <button key={k} onClick={()=>setRpt(k)} style={{
              border:'1px solid var(--c-border)',
              background: rpt === k ? 'var(--c-text)' : 'var(--c-surface)',
              color: rpt === k ? 'var(--c-textInverse)' : 'var(--c-text)',
              padding:'6px 12px',borderRadius:'var(--r-pill)',
              fontSize:'var(--t-xs)',fontWeight:500,cursor:'pointer',whiteSpace:'nowrap'
            }}>{l}</button>
          ))}
        </div>
      </div>

      {rpt === 'pnl' && (
        <>
          <Card padding={14} style={{margin:'0 14px'}}>
            <div className="t-xs t-muted">Net profit · Apr</div>
            <div className="t-display t-num" style={{fontSize:'var(--t-3xl)',letterSpacing:'-0.03em',color:'var(--c-success)',marginTop:2}}>{INR3(profit)}</div>
            <div className="t-xs t-muted" style={{marginTop:2}}>Margin {Math.round(profit/totalIncome*100)}% · +4.2 pp vs Mar</div>

            {/* Bar comparison */}
            <div style={{marginTop:14}}>
              <div className="row between"><div className="t-xs t-muted">Income</div><div className="t-xs t-num">{INR3(totalIncome)}</div></div>
              <div style={{height:10,borderRadius:5,background:'var(--c-surfaceAlt)',overflow:'hidden',marginTop:4}}>
                <div style={{width:'100%',height:'100%',background:'var(--c-success)'}}/>
              </div>
              <div className="row between" style={{marginTop:8}}><div className="t-xs t-muted">Expenses</div><div className="t-xs t-num">{INR3(totalExp)}</div></div>
              <div style={{height:10,borderRadius:5,background:'var(--c-surfaceAlt)',overflow:'hidden',marginTop:4}}>
                <div style={{width:`${totalExp/totalIncome*100}%`,height:'100%',background:'var(--c-danger)'}}/>
              </div>
            </div>
          </Card>

          <Card padding={0} style={{margin:'0 14px'}}>
            <div style={{padding:'10px 14px',borderBottom:'1px solid var(--c-divider)',background:'var(--c-surfaceAlt)'}}>
              <div className="t-xs" style={{fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase'}}>Income</div>
            </div>
            {pnl.income.map(([k,v],i,arr)=>(
              <div key={k} className="row between" style={{padding:'10px 14px',borderBottom:i===arr.length-1?'none':'1px solid var(--c-divider)'}}>
                <div className="t-sm">{k}</div>
                <div className="t-sm t-num" style={{fontWeight:500}}>{INR3(v)}</div>
              </div>
            ))}
            <div className="row between" style={{padding:'10px 14px',borderTop:'2px solid var(--c-text)',background:'var(--c-surfaceAlt)'}}>
              <div className="t-sm" style={{fontWeight:700}}>Total income</div>
              <div className="t-sm t-num" style={{fontWeight:700}}>{INR3(totalIncome)}</div>
            </div>
          </Card>

          <Card padding={0} style={{margin:'0 14px'}}>
            <div style={{padding:'10px 14px',borderBottom:'1px solid var(--c-divider)',background:'var(--c-surfaceAlt)'}}>
              <div className="t-xs" style={{fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase'}}>Expenses</div>
            </div>
            {pnl.expenses.map(([k,v],i,arr)=>(
              <div key={k} className="row between" style={{padding:'10px 14px',borderBottom:i===arr.length-1?'none':'1px solid var(--c-divider)'}}>
                <div className="t-sm">{k}</div>
                <div className="t-sm t-num" style={{fontWeight:500}}>{INR3(v)}</div>
              </div>
            ))}
            <div className="row between" style={{padding:'10px 14px',borderTop:'2px solid var(--c-text)',background:'var(--c-surfaceAlt)'}}>
              <div className="t-sm" style={{fontWeight:700}}>Total expenses</div>
              <div className="t-sm t-num" style={{fontWeight:700}}>{INR3(totalExp)}</div>
            </div>
          </Card>
        </>
      )}

      {rpt === 'tb' && (
        <Card padding={0} style={{margin:'0 14px'}}>
          <div style={{padding:'8px 14px',background:'var(--c-surfaceAlt)',borderBottom:'1px solid var(--c-divider)',display:'grid',gridTemplateColumns:'1fr 90px 90px',gap:8}}>
            <div className="t-xs t-muted" style={{fontWeight:600}}>Account</div>
            <div className="t-xs t-muted" style={{textAlign:'right',fontWeight:600}}>Debit</div>
            <div className="t-xs t-muted" style={{textAlign:'right',fontWeight:600}}>Credit</div>
          </div>
          {tb.map(([k,dr,cr],i)=>(
            <div key={k} style={{padding:'10px 14px',borderBottom:'1px solid var(--c-divider)',display:'grid',gridTemplateColumns:'1fr 90px 90px',gap:8,alignItems:'center'}}>
              <div className="t-sm">{k}</div>
              <div className="t-sm t-num" style={{textAlign:'right',color:dr?'var(--c-text)':'var(--c-textSubtle)'}}>{dr?INR3(dr):'—'}</div>
              <div className="t-sm t-num" style={{textAlign:'right',color:cr?'var(--c-text)':'var(--c-textSubtle)'}}>{cr?INR3(cr):'—'}</div>
            </div>
          ))}
          <div style={{padding:'10px 14px',borderTop:'2px solid var(--c-text)',background:'var(--c-surfaceAlt)',display:'grid',gridTemplateColumns:'1fr 90px 90px',gap:8}}>
            <div className="t-sm" style={{fontWeight:700}}>Total</div>
            <div className="t-sm t-num" style={{textAlign:'right',fontWeight:700}}>{INR3(tbDr)}</div>
            <div className="t-sm t-num" style={{textAlign:'right',fontWeight:700}}>{INR3(tbCr)}</div>
          </div>
          {tbDr === tbCr && (
            <div className="row gap-2" style={{padding:'10px 14px',background:'var(--c-successSoft)',borderTop:'1px solid var(--c-divider)'}}>
              <I.success size={14} style={{color:'var(--c-success)'}}/>
              <div className="t-xs" style={{color:'var(--c-success)',fontWeight:600}}>Books balance — debits match credits</div>
            </div>
          )}
        </Card>
      )}

      {rpt === 'gst' && (
        <>
          <Card padding={14} style={{margin:'0 14px',background:'var(--c-warningSoft)',border:'1px solid color-mix(in srgb, var(--c-warning) 30%, transparent)'}}>
            <div className="row between">
              <div>
                <div className="t-xs" style={{color:'var(--c-warning)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>GSTR-3B · due May 20</div>
                <div className="t-display t-num" style={{fontSize:'var(--t-2xl)',marginTop:4}}>{INR3(44208)}</div>
                <div className="t-xs t-muted">Net tax liability</div>
              </div>
              <Illos.IlloShield size={56}/>
            </div>
            <Button full variant="primary" style={{marginTop:10}}>Review & file</Button>
          </Card>
          <Card padding={0} style={{margin:'0 14px'}}>
            {[['Output CGST',26204,'Collected on sales'],['Output SGST',26204,'Collected on sales'],['Output IGST',12480,'Inter-state sales'],['Input CGST',-11840,'Paid on purchases'],['Input SGST',-11840,'Paid on purchases'],['Input IGST',0,'No inter-state purchases']].map(([k,v,sub],i,arr)=>(
              <div key={k} className="row between" style={{padding:'10px 14px',borderBottom:i===arr.length-1?'none':'1px solid var(--c-divider)'}}>
                <div>
                  <div className="t-sm" style={{fontWeight:500}}>{k}</div>
                  <div className="t-xs t-subtle">{sub}</div>
                </div>
                <div className="t-sm t-num" style={{fontWeight:600,color:v<0?'var(--c-success)':'var(--c-text)'}}>{v<0?'−':''}{INR3(v)}</div>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════
// 9. RECEIPTS / PAYMENTS
// ═════════════════════════════════════════════
function BooksReceipts() {
  const [mode, setMode] = React.useState('receive');
  const [method, setMethod] = React.useState('upi');

  const recentInv = [
    { no: 'INV-0411', party: 'Eastern Retail', amount: 62400, date: 'Apr 20', overdue: 8 },
    { no: 'INV-0415', party: 'Sharma Traders', amount: 48200, date: 'Apr 28', overdue: 0 },
    { no: 'INV-0410', party: 'Priya Kirana',   amount: 8600,  date: 'Apr 18', overdue: 0 },
  ];

  return (
    <div className="col" style={{padding:'4px 0 90px',gap:12}}>
      <ScreenHeader3 title={mode==='receive'?'Record receipt':'Make payment'}
        right={<button className="btn-icon"><I.more size={16}/></button>}/>

      <div style={{padding:'0 14px'}}>
        <Segmented value={mode} onChange={setMode} options={[
          {value:'receive',label:'Receive'},{value:'pay',label:'Pay'}
        ]}/>
      </div>

      {/* Amount entry */}
      <div style={{padding:'0 14px'}}>
        <Card padding={20} style={{textAlign:'center'}}>
          <div className="t-xs t-muted" style={{textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600}}>{mode==='receive'?'Receiving':'Paying'}</div>
          <div style={{marginTop:10,display:'flex',alignItems:'baseline',justifyContent:'center',gap:4}}>
            <span style={{fontSize:28,color:'var(--c-textMuted)',fontWeight:400}}>₹</span>
            <span className="t-num" style={{fontSize:56,fontWeight:700,letterSpacing:'-0.04em',lineHeight:1,fontFamily:'var(--f-display)'}}>48,200</span>
          </div>
          <div className="t-xs t-muted" style={{marginTop:6}}>forty eight thousand two hundred only</div>
        </Card>
      </div>

      {/* Keypad */}
      <div style={{padding:'0 14px'}}>
        <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
          {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k=>(
            <button key={k} style={{padding:'12px 0',border:'1px solid var(--c-border)',background:'var(--c-surface)',borderRadius:'var(--r-md)',fontSize:'var(--t-lg)',fontWeight:500,cursor:'pointer',fontFamily:'var(--f-mono)'}}>{k}</button>
          ))}
        </div>
      </div>

      {/* Party + method */}
      <div style={{padding:'0 14px'}}>
        <Card padding={0}>
          <div className="list-row" style={{padding:'12px 14px',minHeight:'auto',gap:12}}>
            <Avatar name="Sharma Traders" size="sm"/>
            <div style={{flex:1,minWidth:0}}>
              <div className="t-xs t-muted">{mode==='receive'?'From':'To'}</div>
              <div className="t-sm" style={{fontWeight:500}}>Sharma Traders</div>
            </div>
            <I.chevR size={14} style={{color:'var(--c-textSubtle)'}}/>
          </div>
          <div style={{borderTop:'1px solid var(--c-divider)'}}>
            <div style={{padding:'10px 14px'}} className="row between">
              <div className="t-xs t-muted">Method</div>
              <div className="row gap-1">
                {[['upi','UPI'],['bank','Bank'],['cash','Cash'],['card','Card']].map(([k,l])=>(
                  <button key={k} onClick={()=>setMethod(k)} style={{
                    border:'1px solid var(--c-border)',
                    background: method === k ? 'var(--c-text)' : 'var(--c-surface)',
                    color: method === k ? 'var(--c-textInverse)' : 'var(--c-text)',
                    padding:'4px 10px',borderRadius:'var(--r-sm)',
                    fontSize:'var(--t-xs)',fontWeight:500,cursor:'pointer'
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div className="row between" style={{padding:'10px 14px',borderTop:'1px solid var(--c-divider)'}}>
              <div className="t-xs t-muted">Reference</div>
              <div className="t-sm t-mono">UPI/428401/xxx</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Apply against invoices */}
      <div style={{padding:'0 14px'}}>
        <div className="t-xs t-muted" style={{textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:600,marginBottom:6}}>Apply against</div>
        <Card padding={0}>
          {recentInv.map((inv,i,arr)=>(
            <div key={inv.no} className="list-row" style={{padding:'10px 14px',minHeight:'auto',gap:10,borderBottom:i===arr.length-1?'none':'1px solid var(--c-divider)'}}>
              <div style={{width:18,height:18,borderRadius:4,border:'1.5px solid var(--c-border)',background:i===0?'var(--c-primary)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {i===0 && <I.check size={10} style={{color:'#fff',strokeWidth:3}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div className="row gap-2">
                  <span className="t-sm t-mono" style={{fontWeight:500}}>{inv.no}</span>
                  {inv.overdue>0 && <Badge tone="danger" dot>{inv.overdue}d late</Badge>}
                </div>
                <div className="t-xs t-muted truncate">{inv.party} · {inv.date}</div>
              </div>
              <div className="t-sm t-num" style={{fontWeight:600}}>{INR3(inv.amount)}</div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{padding:'0 14px'}}>
        <Button full variant="primary" iconRight={<I.arrowR size={14}/>}>Record {mode==='receive'?'receipt':'payment'}</Button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 10. JOURNAL ENTRY / TRANSACTION DETAIL
// ═════════════════════════════════════════════
function BooksJournal({ onBack }) {
  const entry = {
    no: 'JV-00284', date: 'Apr 28, 2025', narration: 'Sales invoice INV-0415 to Sharma Traders',
    source: 'Auto-posted from invoice module',
    by: 'Priya Nair · bookkeeper',
    lines: [
      { acct: 'Sharma Traders', type: 'Debtors', dr: 48200, cr: 0 },
      { acct: 'Sales — Goods',   type: 'Income',  dr: 0,     cr: 42500 },
      { acct: 'CGST Payable',    type: 'Duties',  dr: 0,     cr: 2850 },
      { acct: 'SGST Payable',    type: 'Duties',  dr: 0,     cr: 2850 },
    ]
  };
  const totalDr = entry.lines.reduce((s,l)=>s+l.dr,0);
  const totalCr = entry.lines.reduce((s,l)=>s+l.cr,0);

  return (
    <div className="col" style={{padding:'4px 0 90px',gap:12}}>
      <div className="row between" style={{padding:'6px 14px'}}>
        <button className="btn-icon" onClick={onBack}><I.chevL size={16}/></button>
        <div className="t-xs t-mono t-muted">{entry.no}</div>
        <div className="row gap-2"><button className="btn-icon"><I.copy size={16}/></button><button className="btn-icon"><I.more size={16}/></button></div>
      </div>

      <ScreenHeader3 eyebrow={`Journal voucher · ${entry.date}`} title={entry.narration} sub={entry.source}/>

      {/* Status chip */}
      <div style={{padding:'0 14px'}}>
        <div className="row gap-2">
          <Badge tone="success" dot>Posted</Badge>
          <Badge tone="neutral">Auto-reconciled</Badge>
          <Badge tone="neutral">GST applied</Badge>
        </div>
      </div>

      {/* Journal table */}
      <div style={{padding:'0 14px'}}>
        <Card padding={0}>
          <div style={{padding:'8px 14px',background:'var(--c-surfaceAlt)',borderBottom:'1px solid var(--c-divider)',display:'grid',gridTemplateColumns:'1fr 70px 70px',gap:8}}>
            <div className="t-xs t-muted" style={{fontWeight:600}}>Account</div>
            <div className="t-xs t-muted" style={{textAlign:'right',fontWeight:600}}>Debit</div>
            <div className="t-xs t-muted" style={{textAlign:'right',fontWeight:600}}>Credit</div>
          </div>
          {entry.lines.map((l,i,arr)=>(
            <div key={i} style={{padding:'12px 14px',borderBottom:i===arr.length-1?'none':'1px solid var(--c-divider)',display:'grid',gridTemplateColumns:'1fr 70px 70px',gap:8,alignItems:'center'}}>
              <div>
                <div className="t-sm" style={{fontWeight:500}}>{l.acct}</div>
                <div className="t-xs t-subtle">{l.type}</div>
              </div>
              <div className="t-sm t-num" style={{textAlign:'right',color:l.dr?'var(--c-text)':'var(--c-textSubtle)',fontWeight:l.dr?600:400}}>{l.dr?INR3(l.dr):'—'}</div>
              <div className="t-sm t-num" style={{textAlign:'right',color:l.cr?'var(--c-text)':'var(--c-textSubtle)',fontWeight:l.cr?600:400}}>{l.cr?INR3(l.cr):'—'}</div>
            </div>
          ))}
          <div style={{padding:'10px 14px',borderTop:'2px solid var(--c-text)',background:'var(--c-surfaceAlt)',display:'grid',gridTemplateColumns:'1fr 70px 70px',gap:8}}>
            <div className="t-sm" style={{fontWeight:700}}>Total</div>
            <div className="t-sm t-num" style={{textAlign:'right',fontWeight:700}}>{INR3(totalDr)}</div>
            <div className="t-sm t-num" style={{textAlign:'right',fontWeight:700}}>{INR3(totalCr)}</div>
          </div>
          <div className="row gap-2" style={{padding:'10px 14px',background:'var(--c-successSoft)'}}>
            <I.success size={14} style={{color:'var(--c-success)'}}/>
            <div className="t-xs" style={{color:'var(--c-success)',fontWeight:600}}>Entry balances · ₹0 difference</div>
          </div>
        </Card>
      </div>

      {/* Linked docs */}
      <div style={{padding:'0 14px'}}>
        <div className="t-xs t-muted" style={{textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:600,marginBottom:6}}>Linked</div>
        <Card padding={0}>
          {[['file','Invoice INV-0415','PDF · 84 KB'],['user','Sharma Traders','Customer ledger'],['shield','GSTR-1 · Apr 2025','Included · B2B']].map(([icon,t,s],i,arr)=>(
            <div key={t} className="list-row" style={{padding:'10px 14px',minHeight:'auto',borderBottom:i===arr.length-1?'none':'1px solid var(--c-divider)'}}>
              <div style={{width:28,height:28,borderRadius:'var(--r-sm)',background:'var(--c-surfaceAlt)',color:'var(--c-textMuted)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {I[icon]({size:14})}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div className="t-sm truncate" style={{fontWeight:500}}>{t}</div>
                <div className="t-xs t-subtle">{s}</div>
              </div>
              <I.chevR size={14} style={{color:'var(--c-textSubtle)'}}/>
            </div>
          ))}
        </Card>
      </div>

      {/* Audit trail */}
      <div style={{padding:'0 14px'}}>
        <div className="t-xs t-muted" style={{textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:600,marginBottom:6}}>Audit trail</div>
        <Card padding={14}>
          {[
            ['Created',entry.by,'Apr 28 · 11:42 am'],
            ['Posted','System · auto','Apr 28 · 11:42 am'],
            ['GST allocated','System · auto','Apr 28 · 11:43 am'],
          ].map(([e,who,when],i,arr)=>(
            <div key={i} className="row gap-3" style={{paddingBottom:i===arr.length-1?0:10,marginBottom:i===arr.length-1?0:10,borderBottom:i===arr.length-1?'none':'1px solid var(--c-divider)'}}>
              <div style={{width:8,height:8,borderRadius:4,background:'var(--c-primary)',flexShrink:0,marginTop:6}}/>
              <div style={{flex:1,minWidth:0}}>
                <div className="t-sm" style={{fontWeight:500}}>{e}</div>
                <div className="t-xs t-muted">{who} · {when}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

window.BooksParty = BooksParty;
window.BooksReports = BooksReports;
window.BooksReceipts = BooksReceipts;
window.BooksJournal = BooksJournal;
