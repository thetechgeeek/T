// Screen: Ledger — dense transactions list with filters + search + empty-state aware.
const { useState: useStateL, useMemo: useMemoL } = React;

function ScreenLedger() {
  const [search, setSearch] = useStateL('');
  const [filter, setFilter] = useStateL('all');
  const [selected, setSelected] = useStateL(new Set());
  const [showFilters, setShowFilters] = useStateL(false);
  const [dateRange, setDateRange] = useStateL('last7');
  const [status, setStatus] = useStateL(['posted','pending']);

  const txAll = useMemoL(() => [
    { id: 'T-2041', date: 'Apr 20', time: '09:41', desc: 'Buy NVDA · 20 sh', acct: 'Fund A · USD', amt: -17782.40, status: 'posted', type: 'trade' },
    { id: 'T-2040', date: 'Apr 20', time: '09:32', desc: 'Sell UNH · 40 sh', acct: 'Fund A · USD', amt: 20964.00, status: 'posted', type: 'trade' },
    { id: 'T-2039', date: 'Apr 20', time: '08:04', desc: 'MSFT dividend', acct: 'Fund A · USD', amt: 504.12, status: 'posted', type: 'dividend' },
    { id: 'T-2038', date: 'Apr 19', time: '16:58', desc: 'Wire to Custody HSBC', acct: 'Operating · USD', amt: -250000.00, status: 'pending', type: 'transfer' },
    { id: 'T-2037', date: 'Apr 19', time: '14:22', desc: 'FX EUR/USD 500K', acct: 'Fund B · EUR', amt: -543120.00, status: 'posted', type: 'fx' },
    { id: 'T-2036', date: 'Apr 19', time: '11:05', desc: 'Mgmt fee — April', acct: 'Operating · USD', amt: -12400.00, status: 'posted', type: 'fee' },
    { id: 'T-2035', date: 'Apr 18', time: '15:48', desc: 'Buy TLT · 500 sh', acct: 'Fund A · USD', amt: -45260.00, status: 'posted', type: 'trade' },
    { id: 'T-2034', date: 'Apr 18', time: '10:12', desc: 'Cap call — LP Horizon', acct: 'Fund C · USD', amt: 1500000.00, status: 'posted', type: 'transfer' },
    { id: 'T-2033', date: 'Apr 18', time: '09:00', desc: 'AMZN dividend', acct: 'Fund A · USD', amt: 120.00, status: 'posted', type: 'dividend' },
    { id: 'T-2032', date: 'Apr 17', time: '16:30', desc: 'Subscription — Bloomberg', acct: 'Operating · USD', amt: -2400.00, status: 'posted', type: 'fee' },
    { id: 'T-2031', date: 'Apr 17', time: '13:14', desc: 'Sell JPM · 50 sh', acct: 'Fund A · USD', amt: 9922.00, status: 'failed', type: 'trade' },
    { id: 'T-2030', date: 'Apr 17', time: '11:44', desc: 'Wire from LP Aurora', acct: 'Fund C · USD', amt: 750000.00, status: 'posted', type: 'transfer' },
  ], []);

  const filtered = txAll.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (search && !`${t.desc} ${t.id}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (!status.includes(t.status) && status.length > 0) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, t) => {
    (acc[t.date] ||= []).push(t);
    return acc;
  }, {});

  const dayTotals = Object.fromEntries(
    Object.entries(grouped).map(([d, ts]) => [d, ts.reduce((s, t) => s + t.amt, 0)])
  );

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const fmt = (n) => {
    const s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (n < 0 ? '−$' : '+$') + s;
  };

  const typeIcon = (t) => ({
    trade: <I.trend size={14}/>, dividend: <I.coins size={14}/>,
    transfer: <I.swap size={14}/>, fx: <I.globe size={14}/>, fee: <I.file size={14}/>
  })[t];

  const statusBadge = (s) => ({
    posted: <Badge tone="success" dot>Posted</Badge>,
    pending: <Badge tone="warning" dot>Pending</Badge>,
    failed: <Badge tone="danger" dot>Failed</Badge>,
  })[s];

  return (
    <div className="col" style={{ padding: '8px 0 120px', gap: 10 }}>
      {/* Search + filter bar */}
      <div style={{ padding: '0 14px' }}>
        <div className="row gap-2">
          <Input prefix={<I.search size={14}/>} placeholder="Search transactions, IDs…" value={search}
            onChange={e => setSearch(e.target.value)} clearable onClear={() => setSearch('')}/>
          <button className="btn-icon" onClick={() => setShowFilters(true)}><I.filter size={16}/></button>
        </div>
      </div>

      {/* Quick filter chips */}
      <div style={{ padding: '0 14px', overflowX: 'auto' }}>
        <div className="row gap-2" style={{ width: 'max-content' }}>
          {[
            { k: 'all', l: 'All' },
            { k: 'trade', l: 'Trades' },
            { k: 'transfer', l: 'Transfers' },
            { k: 'fx', l: 'FX' },
            { k: 'dividend', l: 'Dividends' },
            { k: 'fee', l: 'Fees' },
          ].map(c => (
            <button key={c.k} onClick={() => setFilter(c.k)}
              style={{
                border: '1px solid var(--c-border)',
                background: filter === c.k ? 'var(--c-text)' : 'var(--c-surface)',
                color: filter === c.k ? 'var(--c-textInverse)' : 'var(--c-text)',
                padding: '6px 12px', borderRadius: 'var(--r-pill)',
                fontSize: 'var(--t-xs)', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap'
              }}>{c.l}</button>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div style={{ padding: '0 14px' }}>
        <Card padding={12}>
          <div className="row between">
            <div>
              <div className="t-xs t-muted">Period net · {filtered.length} transactions</div>
              <div className="t-h2 t-num" style={{marginTop:2}}>
                {(() => {
                  const sum = filtered.reduce((s, t) => s + t.amt, 0);
                  return (sum < 0 ? '−$' : '+$') + Math.abs(sum).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
                })()}
              </div>
            </div>
            <div className="col gap-1" style={{alignItems:'flex-end'}}>
              <div className="t-xs t-muted">Range</div>
              <button className="row gap-1" style={{border:0,background:'transparent',fontSize:'var(--t-sm)',fontWeight:600,color:'var(--c-text)',cursor:'pointer',padding:0}}>
                Last 7 days <I.chevD size={12}/>
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Selection toolbar */}
      {selected.size > 0 && (
        <div style={{ padding: '0 14px' }}>
          <Card padding={8} style={{
            background: 'var(--c-primarySoft)', borderColor: 'var(--c-primary)',
            display: 'flex', alignItems: 'center', gap: 8, color: 'var(--c-text)'
          }}>
            <span className="t-sm" style={{fontWeight:600, flex:1}}>{selected.size} selected</span>
            <Button size="xs" variant="secondary" iconLeft={<I.download size={12}/>}>Export</Button>
            <Button size="xs" iconLeft={<I.check size={12}/>}>Reconcile</Button>
            <button className="btn-icon" data-variant="ghost" onClick={() => setSelected(new Set())} style={{width:28,height:28}}>
              <I.close size={14}/>
            </button>
          </Card>
        </div>
      )}

      {/* Grouped list */}
      {filtered.length === 0 ? (
        <Card padding={24} style={{margin:'0 14px',textAlign:'center'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:10}}><Illos.IlloEmpty size={110}/></div>
          <div className="t-h3">No transactions match</div>
          <div className="t-sm t-muted" style={{marginTop:4,marginBottom:12}}>Try clearing filters or adjusting the date range.</div>
          <Button variant="secondary" size="sm" onClick={() => { setSearch(''); setFilter('all'); }}>Clear filters</Button>
        </Card>
      ) : Object.entries(grouped).map(([date, ts]) => (
        <div key={date} className="col" style={{padding: '0 14px'}}>
          <div className="row between" style={{padding:'4px 2px 6px'}}>
            <div className="t-xs" style={{textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600,color:'var(--c-textMuted)'}}>{date}</div>
            <div className="t-xs t-num t-muted" style={{fontWeight:500}}>
              Net: {dayTotals[date] >= 0 ? '+' : '−'}${Math.abs(dayTotals[date]).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
            </div>
          </div>
          <Card padding={0}>
            {ts.map((t, i) => (
              <div key={t.id} className="list-row" onClick={() => toggle(t.id)}
                style={{padding:'10px 12px', minHeight:'auto', gap: 10,
                  background: selected.has(t.id) ? 'var(--c-primarySoft)' : undefined,
                  borderBottom: i === ts.length - 1 ? 'none' : '1px solid var(--c-divider)'
                }}>
                <div style={{width:32,height:32,borderRadius:'var(--r-md)',background:'var(--c-surfaceAlt)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--c-textMuted)',flexShrink:0}}>
                  {typeIcon(t.type)}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="row gap-2">
                    <div className="t-sm truncate" style={{fontWeight:500}}>{t.desc}</div>
                  </div>
                  <div className="row gap-2" style={{marginTop:2}}>
                    <span className="t-xs t-subtle t-mono">{t.id}</span>
                    <span className="t-xs t-muted">·</span>
                    <span className="t-xs t-muted truncate">{t.acct}</span>
                    <span className="t-xs t-muted">·</span>
                    <span className="t-xs t-subtle">{t.time}</span>
                  </div>
                </div>
                <div className="col" style={{alignItems:'flex-end', gap:3}}>
                  <div className={t.amt >= 0 ? 'pos t-sm t-num' : 't-sm t-num'}
                    style={{fontWeight:600, color: t.amt < 0 ? 'var(--c-text)' : undefined}}>
                    {fmt(t.amt)}
                  </div>
                  {statusBadge(t.status)}
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}

      {/* Filter sheet */}
      <Sheet open={showFilters} onClose={() => setShowFilters(false)} title="Filters"
        actions={<>
          <Button variant="secondary" full onClick={() => { setStatus(['posted','pending','failed']); setDateRange('last7'); }}>Reset</Button>
          <Button full onClick={() => setShowFilters(false)}>Apply</Button>
        </>}>
        <div className="col gap-4" style={{paddingTop:4}}>
          <Field label="Date range">
            <Segmented options={[
              {value:'today',label:'Today'},{value:'last7',label:'7d'},{value:'last30',label:'30d'},{value:'ytd',label:'YTD'},{value:'custom',label:'Custom'}
            ]} value={dateRange} onChange={setDateRange}/>
          </Field>
          <Field label="Status">
            <div className="col gap-2">
              {[['posted','Posted'],['pending','Pending'],['failed','Failed']].map(([k,l]) => (
                <label key={k} className="row gap-2" style={{cursor:'pointer'}}>
                  <Checkbox checked={status.includes(k)} onChange={v => {
                    setStatus(v ? [...status, k] : status.filter(s => s !== k));
                  }}/>
                  <span className="t-sm">{l}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Amount">
            <div className="row gap-2">
              <Input placeholder="Min" prefix={<span style={{fontSize:12}}>$</span>}/>
              <Input placeholder="Max" prefix={<span style={{fontSize:12}}>$</span>}/>
            </div>
          </Field>
          <Field label="Account">
            <div className="col gap-1">
              {['Fund A · USD','Fund B · EUR','Fund C · USD','Operating · USD'].map(a => (
                <label key={a} className="row gap-2" style={{padding:'6px 0',cursor:'pointer'}}>
                  <Checkbox defaultChecked/><span className="t-sm">{a}</span>
                </label>
              ))}
            </div>
          </Field>
        </div>
      </Sheet>
    </div>
  );
}

window.ScreenLedger = ScreenLedger;
