// Screen: Approvals — queue + detail with confirmation flow
const { useState: useStateA } = React;

function ScreenApprovals() {
  const [tab, setTab] = useStateA('pending');
  const [selected, setSelected] = useStateA(null);
  const [confirmOpen, setConfirmOpen] = useStateA(false);
  const [confirmText, setConfirmText] = useStateA('');
  const [toasts, setToasts] = useStateA([]);

  const items = [
    { id: 'A-1184', title: 'Wire transfer — Custody HSBC', amt: 250000, who: 'Ayesha Khan', role: 'Treasury', when: '2m ago', priority: 'high', category: 'Wire', entity: 'CUSTODY-HSBC' },
    { id: 'A-1183', title: 'Rebalance Fund A', amt: 1240000, who: 'Marcus Wei', role: 'Portfolio Mgr', when: '14m', priority: 'med', category: 'Rebalance', entity: 'FUND-A' },
    { id: 'A-1182', title: 'Vendor payment — Bloomberg', amt: 24000, who: 'Leah Ortiz', role: 'Finance Ops', when: '32m', priority: 'low', category: 'Vendor', entity: 'VENDOR-BLP' },
    { id: 'A-1181', title: 'FX hedge — EUR 500K', amt: 543120, who: 'Marcus Wei', role: 'Portfolio Mgr', when: '1h', priority: 'med', category: 'FX', entity: 'FUND-B' },
    { id: 'A-1180', title: 'Onboarding — LP Aurora', amt: 0, who: 'Priya Menon', role: 'Ops', when: '2h', priority: 'low', category: 'KYC', entity: 'LP-AURORA' },
  ];

  const approved = [
    { id: 'A-1179', title: 'Wire to Vanguard', amt: 180000, when: 'Yesterday', who: 'Leah Ortiz' },
    { id: 'A-1178', title: 'Cap call — LP Horizon', amt: 1500000, when: 'Yesterday', who: 'Priya Menon' },
  ];

  const list = tab === 'pending' ? items : approved;
  const fmt = (n) => '$' + n.toLocaleString('en-US');
  const pBadge = (p) => ({ high: <Badge tone="danger" dot>High</Badge>, med: <Badge tone="warning" dot>Medium</Badge>, low: <Badge dot>Low</Badge> })[p];

  const pushToast = (t) => {
    const id = Date.now();
    setToasts(ts => [...ts, { ...t, id }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 3500);
  };

  return (
    <div className="col" style={{ padding: '8px 0 90px', gap: 10, position: 'relative' }}>
      <div style={{ padding: '0 14px' }}>
        <Tabs bar items={[
          { value: 'pending', label: 'Pending', badge: items.length },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
        ]} value={tab} onChange={setTab}/>
      </div>

      {/* Summary banner */}
      {tab === 'pending' && (
        <div style={{ padding: '0 14px' }}>
          <Card padding={12} style={{display:'flex',gap:12,alignItems:'center'}}>
            <div style={{flexShrink:0}}><Illos.IlloApproval size={56}/></div>
            <div style={{flex:1}}>
              <div className="t-sm" style={{fontWeight:600}}>{items.length} items awaiting you</div>
              <div className="t-xs t-muted">Total exposure ${(items.reduce((s, i) => s + i.amt, 0)/1e6).toFixed(2)}M · 1 high priority</div>
            </div>
            <Button size="sm" variant="secondary">Batch</Button>
          </Card>
        </div>
      )}

      {tab === 'rejected' && (
        <Card padding={24} style={{margin:'0 14px',textAlign:'center'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:10}}><Illos.IlloEmpty size={110}/></div>
          <div className="t-h3">Nothing rejected</div>
          <div className="t-sm t-muted" style={{marginTop:4}}>Rejected approvals from the last 90 days appear here.</div>
        </Card>
      )}

      {tab !== 'rejected' && list.map(item => (
        <div key={item.id} style={{ padding: '0 14px' }}>
          <Card padding={0} onClick={() => setSelected(item)}>
            <div style={{padding:'12px 14px'}}>
              <div className="row between" style={{marginBottom:6}}>
                <div className="row gap-2">
                  <span className="t-xs t-mono t-subtle">{item.id}</span>
                  {item.category && <span className="badge" style={{fontSize:10,padding:'1px 6px'}}>{item.category}</span>}
                  {item.priority && pBadge(item.priority)}
                </div>
                <I.chevR size={14} style={{color:'var(--c-textSubtle)'}}/>
              </div>
              <div className="t-body" style={{fontWeight:600, letterSpacing:'-0.005em'}}>{item.title}</div>
              {item.amt > 0 && <div className="t-h2 t-num" style={{marginTop:4}}>{fmt(item.amt)}</div>}
              <div className="divider" style={{margin:'10px -14px 10px', width:'calc(100% + 28px)'}}/>
              <div className="row between">
                <div className="row gap-2">
                  <Avatar name={item.who} size="sm"/>
                  <div>
                    <div className="t-xs" style={{fontWeight:500}}>{item.who}</div>
                    <div className="t-xs t-subtle">{item.role} · {item.when}</div>
                  </div>
                </div>
                {tab === 'pending' && (
                  <div className="row gap-1">
                    <Button size="xs" variant="ghost" onClick={(e) => { e.stopPropagation(); pushToast({tone:'danger',title:`${item.id} rejected`}); }}>Reject</Button>
                    <Button size="xs" onClick={(e) => { e.stopPropagation(); setSelected(item); setConfirmOpen(true); }}>Approve</Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      ))}

      {/* Detail sheet */}
      <Sheet open={!!selected && !confirmOpen} onClose={() => setSelected(null)}
        title={selected?.id}
        actions={selected && tab === 'pending' && <>
          <Button variant="secondary" full onClick={() => { pushToast({tone:'danger',title:`${selected.id} rejected`}); setSelected(null); }}>Reject</Button>
          <Button full onClick={() => setConfirmOpen(true)}>Approve</Button>
        </>}>
        {selected && (
          <div className="col gap-3">
            <div className="t-h2" style={{letterSpacing:'-0.015em'}}>{selected.title}</div>
            {selected.amt > 0 && <div className="t-display t-num" style={{fontSize:'var(--t-2xl)'}}>{fmt(selected.amt)}</div>}
            <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:8}}>
              <Card padding={10}><div className="t-xs t-muted">Requested by</div><div className="t-sm" style={{fontWeight:600,marginTop:2}}>{selected.who}</div></Card>
              <Card padding={10}><div className="t-xs t-muted">Category</div><div className="t-sm" style={{fontWeight:600,marginTop:2}}>{selected.category}</div></Card>
              <Card padding={10}><div className="t-xs t-muted">Entity</div><div className="t-sm t-mono" style={{fontWeight:600,marginTop:2}}>{selected.entity}</div></Card>
              <Card padding={10}><div className="t-xs t-muted">Priority</div><div style={{marginTop:4}}>{pBadge(selected.priority || 'low')}</div></Card>
            </div>

            <div className="col gap-2" style={{marginTop:4}}>
              <div className="t-xs" style={{textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--c-textMuted)',fontWeight:600}}>Approval chain</div>
              <Card padding={0}>
                {[
                  { who: 'System', status: 'Validated', when: '09:40', tone: 'success' },
                  { who: 'Ayesha Khan', status: 'Submitted', when: '09:41', tone: 'success' },
                  { who: 'You', status: 'Pending review', when: '—', tone: 'warning' },
                  { who: 'CFO — Evan Park', status: 'Awaiting', when: '—', tone: 'default' },
                ].map((s, i, a) => (
                  <div key={i} className="row gap-3" style={{padding:'10px 12px',borderBottom:i === a.length-1 ? 'none' : '1px solid var(--c-divider)'}}>
                    <div style={{width:24,height:24,borderRadius:999,
                      background: s.tone === 'success' ? 'var(--c-successSoft)' : s.tone === 'warning' ? 'var(--c-warningSoft)' : 'var(--c-surfaceAlt)',
                      color: s.tone === 'success' ? 'var(--c-success)' : s.tone === 'warning' ? 'var(--c-warning)' : 'var(--c-textMuted)',
                      display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {s.tone === 'success' ? <I.check size={14}/> : s.tone === 'warning' ? <I.clock size={14}/> : <I.user size={12}/>}
                    </div>
                    <div style={{flex:1}}>
                      <div className="t-sm" style={{fontWeight:500}}>{s.who}</div>
                      <div className="t-xs t-muted">{s.status}</div>
                    </div>
                    <div className="t-xs t-subtle t-mono">{s.when}</div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}
      </Sheet>

      {/* Hard confirmation */}
      <Sheet open={confirmOpen} onClose={() => { setConfirmOpen(false); setConfirmText(''); }} title="Confirm approval"
        actions={<>
          <Button variant="secondary" full onClick={() => { setConfirmOpen(false); setConfirmText(''); }}>Cancel</Button>
          <Button variant="danger" full disabled={confirmText !== selected?.id}
            onClick={() => { pushToast({tone:'success',title:`${selected.id} approved`, body:`${fmt(selected.amt)} released`}); setConfirmOpen(false); setConfirmText(''); setSelected(null); }}>
            Approve
          </Button>
        </>}>
        <div className="col gap-3">
          <div className="card" style={{padding:12, background:'var(--c-warningSoft)', borderColor:'transparent'}}>
            <div className="row gap-2" style={{color:'var(--c-warning)',fontWeight:600,fontSize:'var(--t-sm)'}}>
              <I.alert size={16}/>Irreversible action
            </div>
            <div className="t-xs t-muted" style={{marginTop:4}}>
              Approving releases funds immediately. The counter-party cannot reverse this from the app.
            </div>
          </div>
          <Field label={`Type ${selected?.id} to confirm`}>
            <Input placeholder={selected?.id} value={confirmText} onChange={e => setConfirmText(e.target.value)}/>
          </Field>
          {selected && (
            <div className="col gap-1 t-sm">
              <div className="row between"><span className="t-muted">Amount</span><span className="t-num" style={{fontWeight:600}}>{fmt(selected.amt)}</span></div>
              <div className="row between"><span className="t-muted">Recipient</span><span className="t-mono">{selected.entity}</span></div>
              <div className="row between"><span className="t-muted">Initiated by</span><span>{selected.who}</span></div>
            </div>
          )}
        </div>
      </Sheet>

      {/* Toasts */}
      <div style={{position:'absolute',bottom:90,left:14,right:14,display:'flex',flexDirection:'column',gap:6,zIndex:50,pointerEvents:'none'}}>
        {toasts.map(t => (
          <div key={t.id} style={{pointerEvents:'auto'}}><Toast tone={t.tone} title={t.title} onClose={() => setToasts(ts => ts.filter(x => x.id !== t.id))}>{t.body}</Toast></div>
        ))}
      </div>
    </div>
  );
}

window.ScreenApprovals = ScreenApprovals;
