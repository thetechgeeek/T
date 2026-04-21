// Screen: Portfolio dashboard — dense Bloomberg-adjacent home screen.
const { useState: useStateP, useEffect: useEffectP } = React;

function ScreenPortfolio() {
  const [range, setRange] = useStateP('1D');
  const [reveal, setReveal] = useStateP(true);
  const [tab, setTab] = useStateP('holdings');
  const [sheet, setSheet] = useStateP(null);

  // Generate plausible timeseries
  const series = useMemo(() => {
    const out = [];
    let v = 12_400_000;
    for (let i = 0; i < 48; i++) {
      v += (Math.sin(i / 4) * 80000) + (Math.random() - 0.48) * 60000;
      out.push({ x: i, portfolio: v, benchmark: v * (0.98 + Math.sin(i/9)*0.02) });
    }
    return out;
  }, []);

  const stats = [
    { label: 'NAV', value: '$12.48M', delta: 1.42, comparison: 'vs open', spark: [10,11,11,12,13,12,13,14], sparkColor: 'var(--c-success)' },
    { label: 'P&L', value: '+$174.2K', delta: 2.18, comparison: 'today', spark: [8,9,7,10,11,12,13,14], sparkColor: 'var(--c-success)' },
    { label: 'Cash', value: '$2.3M', delta: -0.12, comparison: 'allocation 18%', spark: [14,13,13,12,12,13,12,12], sparkColor: 'var(--c-textMuted)' },
    { label: 'Exposure', value: '82.4%', delta: 0.36, comparison: 'equities 64%', spark: [12,13,13,14,13,14,15,15], sparkColor: 'var(--c-chartE)' },
  ];

  const holdings = [
    { ticker: 'AAPL', name: 'Apple Inc.', qty: '1,240', price: '187.42', value: '232,400', delta: 1.82, spark: [9,11,10,12,13,12,14,15], sector: 'Tech' },
    { ticker: 'MSFT', name: 'Microsoft', qty: '680', price: '413.08', value: '280,895', delta: 0.94, spark: [10,11,11,12,13,13,14,14], sector: 'Tech' },
    { ticker: 'NVDA', name: 'NVIDIA', qty: '420', price: '889.12', value: '373,430', delta: 3.41, spark: [8,9,10,11,12,13,14,16], sector: 'Tech' },
    { ticker: 'JPM',  name: 'JP Morgan', qty: '2,100', price: '198.44', value: '416,724', delta: -0.28, spark: [12,12,11,12,12,11,11,11], sector: 'Finance' },
    { ticker: 'BRK.B',name: 'Berkshire Hathaway', qty: '340', price: '411.83', value: '140,022', delta: 0.12, spark: [10,10,11,11,11,12,12,12], sector: 'Finance' },
    { ticker: 'GS',   name: 'Goldman Sachs', qty: '280', price: '461.88', value: '129,326', delta: -1.24, spark: [13,12,12,11,11,10,10,10], sector: 'Finance' },
    { ticker: 'XOM',  name: 'Exxon Mobil', qty: '1,800', price: '112.36', value: '202,248', delta: 0.64, spark: [11,11,12,11,12,12,13,13], sector: 'Energy' },
    { ticker: 'UNH',  name: 'UnitedHealth', qty: '160', price: '524.10', value: '83,856', delta: -2.18, spark: [14,13,13,12,11,11,10,9], sector: 'Health' },
  ];

  const alloc = [
    { label: 'Equities',   value: 64, color: 'var(--c-chartA)' },
    { label: 'Bonds',      value: 18, color: 'var(--c-chartB)' },
    { label: 'Cash',       value: 12, color: 'var(--c-chartC)' },
    { label: 'Alternatives', value: 6, color: 'var(--c-chartE)' },
  ];

  const ranges = ['1D','1W','1M','3M','YTD','1Y','ALL'];

  return (
    <div className="col" style={{ padding: '8px 0 80px', gap: 10 }}>
      {/* Hero: NAV + chart */}
      <div style={{ padding: '4px 14px 0' }}>
        <div className="row between" style={{ marginBottom: 6 }}>
          <div className="col">
            <div className="t-xs t-subtle" style={{textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:500}}>Total NAV · Fund A</div>
            <div className="row gap-2" style={{marginTop:2}}>
              <div className="t-display t-num" style={{fontSize:'var(--t-3xl)'}}>
                {reveal ? '$12,482,104' : '$••••••••'}
              </div>
              <button className="btn-icon" data-variant="ghost" style={{width:30,height:30}} onClick={() => setReveal(!reveal)}>
                {reveal ? <I.eye size={14}/> : <I.eyeOff size={14}/>}
              </button>
            </div>
            <div className="row gap-2" style={{marginTop:2}}>
              <span className="pos t-num" style={{fontWeight:600,fontSize:'var(--t-sm)'}}>+$174,204  (+1.42%)</span>
              <span className="t-xs t-subtle">today</span>
            </div>
          </div>
          <Badge tone="success" dot>Live</Badge>
        </div>
      </div>

      {/* Main chart card */}
      <Card padding={12} style={{ margin: '0 14px' }}>
        <div className="row between" style={{marginBottom:8}}>
          <div className="row gap-2">
            <span className="t-xs" style={{display:'flex',alignItems:'center',gap:4}}><span className="dot" style={{background:'var(--c-chartA)'}}/>Portfolio</span>
            <span className="t-xs t-muted" style={{display:'flex',alignItems:'center',gap:4}}><span className="dot" style={{background:'var(--c-chartB)'}}/>S&P 500</span>
          </div>
          <div className="seg">
            {ranges.map(r => <button key={r} data-active={range === r ? '1':'0'} onClick={() => setRange(r)}>{r}</button>)}
          </div>
        </div>
        <LineChart data={series} height={150}
          series={[
            { key: 'portfolio', color: 'var(--c-chartA)', area: true },
            { key: 'benchmark', color: 'var(--c-chartB)', muted: true },
          ]}
          annotations={[{ value: 12_400_000, label: 'Open' }]}
        />
      </Card>

      {/* Stat grid */}
      <div className="grid" style={{ margin: '0 14px', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Allocation donut + legend */}
      <Card padding={14} style={{ margin: '0 14px' }}>
        <div className="row between" style={{marginBottom:10}}>
          <div>
            <div className="t-h3">Allocation</div>
            <div className="t-xs t-muted">By asset class · updated 2m ago</div>
          </div>
          <button className="btn-icon" data-variant="ghost"><I.more size={16}/></button>
        </div>
        <div className="row gap-4">
          <DonutChart data={alloc} size={96} inner={32}/>
          <div className="col gap-2" style={{flex:1}}>
            {alloc.map(a => (
              <div key={a.label} className="row between">
                <div className="row gap-2"><span className="dot" style={{background:a.color, width:8, height:8}}/><span className="t-sm">{a.label}</span></div>
                <span className="t-sm t-num" style={{fontWeight:600}}>{a.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tabs: holdings / activity / watchlist */}
      <div style={{ padding: '0 14px' }}>
        <Tabs bar items={[
          { value: 'holdings', label: 'Holdings', badge: '8' },
          { value: 'activity', label: 'Activity' },
          { value: 'watch',    label: 'Watchlist' },
        ]} value={tab} onChange={setTab} />
      </div>

      {tab === 'holdings' && (
        <Card padding={0} style={{ margin: '0 14px' }}>
          <div className="row between" style={{padding: '10px 12px', borderBottom: '1px solid var(--c-divider)'}}>
            <div className="t-xs t-muted" style={{letterSpacing:'0.04em'}}>SYMBOL · QTY</div>
            <div className="t-xs t-muted" style={{letterSpacing:'0.04em'}}>VALUE · 1D</div>
          </div>
          {holdings.map(h => (
            <div key={h.ticker} className="list-row" onClick={() => setSheet(h)}
              style={{padding: '10px 12px', minHeight: 'auto'}}>
              <div style={{flex:1, minWidth:0}}>
                <div className="row gap-2">
                  <span className="t-mono" style={{fontWeight:700,fontSize:'var(--t-sm)'}}>{h.ticker}</span>
                  <span className="badge" style={{fontSize:10,padding:'1px 5px'}}>{h.sector}</span>
                </div>
                <div className="t-xs t-muted truncate">{h.name} · {h.qty} sh @ ${h.price}</div>
              </div>
              <div style={{color: h.delta >= 0 ? 'var(--c-success)' : 'var(--c-danger)', marginRight: 8}}>
                <Sparkline data={h.spark} width={44} height={18}/>
              </div>
              <div style={{textAlign:'right',minWidth:80}}>
                <div className="t-sm t-num" style={{fontWeight:600}}>${h.value}</div>
                <div className={h.delta >= 0 ? 'pos t-xs t-num' : 'neg t-xs t-num'} style={{fontWeight:500}}>
                  {h.delta >= 0 ? '+' : ''}{h.delta.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {tab === 'activity' && (
        <Card padding={0} style={{ margin: '0 14px' }}>
          {[
            { t: 'Buy · NVDA', s: '09:42 · Market · 20 sh', v: '-$17,782', tone: 'default' },
            { t: 'Sell · UNH', s: '09:31 · Limit · 40 sh', v: '+$20,964', tone: 'success' },
            { t: 'Dividend · MSFT', s: '08:00 · Cash', v: '+$504', tone: 'info' },
            { t: 'Buy · JPM', s: '07:58 · VWAP · 100 sh', v: '-$19,844', tone: 'default' },
            { t: 'Rebalance', s: '07:30 · Automated', v: '—', tone: 'info' },
          ].map((a, i) => (
            <div key={i} className="list-row" style={{padding: '10px 12px', minHeight: 'auto'}}>
              <div style={{width:28,height:28,borderRadius:8,background:'var(--c-surfaceAlt)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--c-textMuted)'}}><I.swap size={14}/></div>
              <div style={{flex:1,minWidth:0}}>
                <div className="t-sm" style={{fontWeight:500}}>{a.t}</div>
                <div className="t-xs t-muted">{a.s}</div>
              </div>
              <div className="t-sm t-num" style={{fontWeight:600}}>{a.v}</div>
            </div>
          ))}
        </Card>
      )}

      {tab === 'watch' && (
        <Card padding={20} style={{ margin: '0 14px', textAlign: 'center' }}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:10}}><Illos.IlloEmpty size={96}/></div>
          <div className="t-h3">No symbols yet</div>
          <div className="t-sm t-muted" style={{marginTop:4,marginBottom:12}}>Track assets without holding them.</div>
          <Button variant="secondary" size="sm" iconLeft={<I.plus size={14}/>}>Add symbol</Button>
        </Card>
      )}

      {/* Sheet: holding detail */}
      <Sheet open={!!sheet} onClose={() => setSheet(null)} title={sheet?.ticker}
        actions={sheet && <>
          <Button variant="secondary" full>Sell</Button>
          <Button full>Buy more</Button>
        </>}>
        {sheet && (
          <div className="col gap-3" style={{paddingTop:4}}>
            <div className="t-muted t-sm">{sheet.name}</div>
            <div className="row gap-2">
              <div className="t-h1 t-num">${sheet.price}</div>
              <span className={sheet.delta >= 0 ? 'pos' : 'neg'} style={{fontWeight:600}}>
                {sheet.delta >= 0 ? '+' : ''}{sheet.delta.toFixed(2)}%
              </span>
            </div>
            <div style={{color: sheet.delta >= 0 ? 'var(--c-success)' : 'var(--c-danger)', margin: '4px 0'}}>
              <Sparkline data={sheet.spark} width={320} height={60} filled/>
            </div>
            <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:8}}>
              <Card padding={10}><div className="t-xs t-muted">Position</div><div className="t-sm t-num" style={{fontWeight:600,marginTop:2}}>{sheet.qty} sh</div></Card>
              <Card padding={10}><div className="t-xs t-muted">Market value</div><div className="t-sm t-num" style={{fontWeight:600,marginTop:2}}>${sheet.value}</div></Card>
              <Card padding={10}><div className="t-xs t-muted">Sector</div><div className="t-sm" style={{fontWeight:600,marginTop:2}}>{sheet.sector}</div></Card>
              <Card padding={10}><div className="t-xs t-muted">Day range</div><div className="t-sm t-num" style={{fontWeight:600,marginTop:2}}>—</div></Card>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

window.ScreenPortfolio = ScreenPortfolio;
