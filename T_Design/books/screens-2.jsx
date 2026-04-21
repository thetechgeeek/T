// Books — Screens 3–6: Product detail, Low stock, Invoice list, Invoice create
const { useState: useStateB2, useMemo: useMemoB2 } = React;
const INR2 = window.BooksINR;
const ScreenHeader2 = window.BooksScreenHeader;

// ═════════════════════════════════════════════
// 3. PRODUCT DETAIL / STOCK ADJUSTMENT
// ═════════════════════════════════════════════
function BooksProduct({ product, onBack }) {
  const p = product || { sku: 'RC-BS5', name: 'Basmati Rice 5kg', hsn: '1006', stock: 4, unit: 'bag', price: 420, cost: 340, stockValue: 1680, low: true };
  const [tab, setTab] = useStateB2('overview');
  const [adjustOpen, setAdjustOpen] = useStateB2(false);

  const history = [
    { d: 'Apr 24', t: 'Sale · INV-0412', qty: -3, bal: 4 },
    { d: 'Apr 22', t: 'Purchase · GRN-018', qty: +20, bal: 7 },
    { d: 'Apr 19', t: 'Sale · INV-0408', qty: -2, bal: -13 },
    { d: 'Apr 18', t: 'Sale · INV-0407', qty: -5, bal: -11 },
    { d: 'Apr 15', t: 'Adjustment · Damage', qty: -1, bal: -6 },
    { d: 'Apr 12', t: 'Opening stock', qty: +15, bal: -5 },
  ];

  return (
    <div className="col" style={{padding:'4px 0 90px',gap:12}}>
      <div className="row between" style={{padding:'6px 14px'}}>
        <button className="btn-icon" onClick={onBack}><I.chevL size={16}/></button>
        <div className="row gap-2"><button className="btn-icon"><I.copy size={16}/></button><button className="btn-icon"><I.more size={16}/></button></div>
      </div>

      <div style={{padding:'0 14px'}}>
        <div className="row gap-3" style={{alignItems:'flex-start'}}>
          <div style={{width:72,height:72,borderRadius:'var(--r-lg)',background:'var(--c-surfaceAlt)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--c-textMuted)',flexShrink:0,border:'1px solid var(--c-border)'}}>
            <I.briefcase size={28}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div className="t-display" style={{fontSize:'var(--t-xl)',letterSpacing:'-0.02em'}}>{p.name}</div>
            <div className="row gap-2" style={{marginTop:4,flexWrap:'wrap'}}>
              <span className="t-xs t-mono t-subtle">{p.sku}</span>
              <Badge tone="neutral">HSN {p.hsn}</Badge>
              <Badge tone="neutral">GST 5%</Badge>
              {p.low && <Badge tone="warning" dot>Low</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Big stock number */}
      <div style={{padding:'0 14px'}}>
        <Card padding={14}>
          <div className="row between" style={{alignItems:'flex-end'}}>
            <div>
              <div className="t-xs t-muted">In stock</div>
              <div style={{fontSize:40,fontWeight:700,letterSpacing:'-0.03em',lineHeight:1,fontFamily:'var(--f-display)',color:p.stock===0?'var(--c-danger)':p.low?'var(--c-warning)':'var(--c-text)'}}>
                {p.stock}<span style={{fontSize:16,fontWeight:400,color:'var(--c-textMuted)',marginLeft:6}}>{p.unit}s</span>
              </div>
              <div className="t-xs t-muted" style={{marginTop:4}}>Value · {INR2(p.stockValue)}</div>
            </div>
            <Button size="sm" variant="primary" iconLeft={<I.plus size={14}/>} onClick={()=>setAdjustOpen(true)}>Adjust</Button>
          </div>
        </Card>
      </div>

      {/* Price/cost grid */}
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:8,padding:'0 14px'}}>
        <Card padding={12}>
          <div className="t-xs t-muted">Selling price</div>
          <div className="t-h3 t-num" style={{marginTop:2}}>{INR2(p.price)}</div>
          <div className="t-xs t-subtle">incl. 5% GST</div>
        </Card>
        <Card padding={12}>
          <div className="t-xs t-muted">Cost price</div>
          <div className="t-h3 t-num" style={{marginTop:2}}>{INR2(p.cost)}</div>
          <div className="t-xs t-subtle" style={{color:'var(--c-success)'}}>Margin {Math.round((p.price-p.cost)/p.price*100)}%</div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{padding:'0 14px'}}>
        <Segmented value={tab} onChange={setTab} options={[
          {value:'overview',label:'Overview'},
          {value:'history',label:'Movements'},
          {value:'info',label:'Info'},
        ]}/>
      </div>

      {tab === 'overview' && (
        <Card padding={14} style={{margin:'0 14px'}}>
          <div className="t-h3">Stock trend · 30 days</div>
          <LineChart height={120} data={Array.from({length:30},(_,i)=>({
            x: i+1, stock: Math.max(0, 20 - i*0.4 + Math.sin(i/2)*3 + Math.random()*2)
          }))} series={[{key:'stock',color:'var(--c-warning)',area:true}]}/>
          <div className="row between" style={{marginTop:10,padding:'10px 0 0',borderTop:'1px solid var(--c-divider)'}}>
            <div><div className="t-xs t-muted">Sold · 30d</div><div className="t-sm" style={{fontWeight:600}}>48 {p.unit}s</div></div>
            <div><div className="t-xs t-muted">Received · 30d</div><div className="t-sm" style={{fontWeight:600}}>40 {p.unit}s</div></div>
            <div><div className="t-xs t-muted">Reorder at</div><div className="t-sm" style={{fontWeight:600}}>10 {p.unit}s</div></div>
          </div>
        </Card>
      )}

      {tab === 'history' && (
        <Card padding={0} style={{margin:'0 14px'}}>
          {history.map((h, i) => (
            <div key={i} className="list-row" style={{padding:'10px 14px',minHeight:'auto',borderBottom:i===history.length-1?'none':'1px solid var(--c-divider)'}}>
              <div style={{width:28,height:28,borderRadius:'var(--r-sm)',background:h.qty>0?'var(--c-successSoft)':'var(--c-dangerSoft)',color:h.qty>0?'var(--c-success)':'var(--c-danger)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {h.qty>0?<I.arrowUR size={12}/>:<I.arrowDR size={12}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div className="t-sm truncate" style={{fontWeight:500}}>{h.t}</div>
                <div className="t-xs t-muted">{h.d}</div>
              </div>
              <div className="t-sm t-num" style={{fontWeight:600,color:h.qty>0?'var(--c-success)':'var(--c-text)'}}>{h.qty>0?'+':''}{h.qty}</div>
            </div>
          ))}
        </Card>
      )}

      {tab === 'info' && (
        <Card padding={0} style={{margin:'0 14px'}}>
          {[['SKU',p.sku],['Barcode','8901030577512'],['HSN code',p.hsn],['GST rate','5%'],['Category','Staples · Rice'],['Unit','Bag (5 kg)'],['Reorder level','10 bags'],['Default vendor','Punjab Agro Ltd.']].map(([k,v],i,arr)=>(
            <div key={k} className="row between" style={{padding:'10px 14px',borderBottom:i===arr.length-1?'none':'1px solid var(--c-divider)'}}>
              <div className="t-xs t-muted">{k}</div><div className="t-sm t-mono">{v}</div>
            </div>
          ))}
        </Card>
      )}

      {/* Adjust sheet */}
      {adjustOpen && (
        <>
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.4)',zIndex:40}} onClick={()=>setAdjustOpen(false)}/>
          <div style={{position:'absolute',left:0,right:0,bottom:0,zIndex:41,background:'var(--c-surface)',borderTopLeftRadius:'var(--r-xl)',borderTopRightRadius:'var(--r-xl)',padding:16,boxShadow:'0 -8px 30px rgba(0,0,0,0.2)'}}>
            <div style={{width:36,height:4,borderRadius:2,background:'var(--c-border)',margin:'0 auto 14px'}}/>
            <div className="t-h2" style={{marginBottom:12}}>Adjust stock</div>
            <div className="col gap-3">
              <div>
                <div className="t-xs t-muted" style={{marginBottom:4}}>Reason</div>
                <Segmented value="in" onChange={()=>{}} options={[
                  {value:'in',label:'Received'},{value:'out',label:'Sold'},{value:'dmg',label:'Damaged'},{value:'ret',label:'Return'}
                ]}/>
              </div>
              <div>
                <div className="t-xs t-muted" style={{marginBottom:4}}>Quantity</div>
                <div className="row gap-2">
                  <button className="btn-icon"><I.minus size={16}/></button>
                  <Input value="10" onChange={()=>{}} style={{textAlign:'center'}}/>
                  <button className="btn-icon"><I.plus size={16}/></button>
                </div>
              </div>
              <div>
                <div className="t-xs t-muted" style={{marginBottom:4}}>Note (optional)</div>
                <Input placeholder="Received from Punjab Agro against GRN-019"/>
              </div>
              <Button full variant="primary" onClick={()=>setAdjustOpen(false)}>Confirm adjustment</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════
// 4. LOW STOCK / REORDER
// ═════════════════════════════════════════════
function BooksLowStock({ onNav }) {
  const [selected, setSelected] = useStateB2(new Set(['RC-BS5','SG-SH5']));
  const items = [
    { sku: 'MK-AM1', name: 'Amul Milk 1L',    vendor: 'Amul Dairy', stock: 0, reorder: 40, suggest: 60, cost: 58,  urgency: 'critical' },
    { sku: 'RC-BS5', name: 'Basmati Rice 5kg', vendor: 'Punjab Agro', stock: 4, reorder: 10, suggest: 20, cost: 340, urgency: 'high' },
    { sku: 'SG-SH5', name: 'Sugar 5kg',        vendor: 'Shakti Sugars', stock: 12, reorder: 15, suggest: 25, cost: 192, urgency: 'medium' },
    { sku: 'TE-RD1', name: 'Red Label Tea 500g', vendor: 'Brooke Bond', stock: 8, reorder: 12, suggest: 20, cost: 220, urgency: 'medium' },
    { sku: 'BS-PG1', name: 'Parle-G Biscuit ×24', vendor: 'Parle Products', stock: 6, reorder: 10, suggest: 24, cost: 180, urgency: 'low' },
  ];

  const toggle = (sku) => {
    const n = new Set(selected);
    n.has(sku) ? n.delete(sku) : n.add(sku);
    setSelected(n);
  };

  const urgColor = { critical: 'var(--c-danger)', high: 'var(--c-warning)', medium: 'var(--c-chartE)', low: 'var(--c-textMuted)' };
  const selectedItems = items.filter(i => selected.has(i.sku));
  const total = selectedItems.reduce((s, i) => s + i.suggest * i.cost, 0);

  return (
    <div className="col" style={{padding:'4px 0 120px',gap:12}}>
      <ScreenHeader2 eyebrow="Reorder" title="Low stock" sub={`${items.length} items below reorder level`}
        right={<button className="btn-icon"><I.filter size={16}/></button>}/>

      <Card padding={12} style={{margin:'0 14px',background:'var(--c-warningSoft)',border:'1px solid color-mix(in srgb, var(--c-warning) 30%, transparent)'}}>
        <div className="row gap-3">
          <div style={{flexShrink:0}}><Illos.IlloShield size={40}/></div>
          <div style={{flex:1}}>
            <div className="t-sm" style={{fontWeight:600,color:'var(--c-warning)'}}>1 item out of stock</div>
            <div className="t-xs t-muted" style={{marginTop:2}}>Auto-generate purchase orders from selection below</div>
          </div>
        </div>
      </Card>

      <div style={{padding:'0 14px'}}>
        <Card padding={0}>
          {items.map((it, i) => (
            <div key={it.sku} className="list-row" onClick={() => toggle(it.sku)}
              style={{padding:'12px 14px',minHeight:'auto',gap:12,borderBottom:i===items.length-1?'none':'1px solid var(--c-divider)',cursor:'pointer'}}>
              <div style={{width:20,height:20,borderRadius:4,border:'1.5px solid var(--c-border)',background:selected.has(it.sku)?'var(--c-primary)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {selected.has(it.sku) && <I.check size={12} style={{color:'#fff',strokeWidth:3}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div className="row gap-2">
                  <div className="t-sm truncate" style={{fontWeight:500}}>{it.name}</div>
                  <span className="dot" style={{background:urgColor[it.urgency]}}/>
                </div>
                <div className="row gap-2" style={{marginTop:2}}>
                  <span className="t-xs t-muted truncate">{it.vendor}</span>
                  <span className="t-xs t-subtle">· Reorder at {it.reorder}</span>
                </div>
                {/* progress */}
                <div style={{marginTop:6,height:4,background:'var(--c-surfaceAlt)',borderRadius:2,overflow:'hidden'}}>
                  <div style={{width:`${Math.min(100, it.stock/it.reorder*100)}%`,height:'100%',background:urgColor[it.urgency]}}/>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div className="t-sm t-num" style={{fontWeight:700,color:urgColor[it.urgency]}}>{it.stock}</div>
                <div className="t-xs t-subtle">Order {it.suggest}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Sticky action bar */}
      {selected.size > 0 && (
        <div style={{position:'absolute',bottom:70,left:14,right:14,background:'var(--c-text)',color:'var(--c-textInverse)',borderRadius:'var(--r-lg)',padding:'12px 14px',display:'flex',alignItems:'center',gap:12,boxShadow:'0 8px 24px rgba(0,0,0,0.2)'}}>
          <div style={{flex:1}}>
            <div className="t-xs" style={{opacity:0.7}}>{selected.size} items · {selectedItems.reduce((s,i)=>s+i.suggest,0)} units</div>
            <div className="t-sm t-num" style={{fontWeight:700,marginTop:2}}>{INR2(total)}</div>
          </div>
          <button style={{background:'var(--c-textInverse)',color:'var(--c-text)',border:0,padding:'8px 14px',borderRadius:'var(--r-md)',fontWeight:600,fontSize:'var(--t-sm)',cursor:'pointer'}}>Create PO →</button>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════
// 5. INVOICE LIST
// ═════════════════════════════════════════════
function BooksInvoiceList({ onNav }) {
  const [tab, setTab] = useStateB2('all');
  const invoices = [
    { no: 'INV-0415', party: 'Sharma Traders',    date: 'Apr 28', due: 'May 12', amount: 48200, status: 'sent', gst: 'B2B' },
    { no: 'INV-0414', party: 'Kirti Enterprises',  date: 'Apr 27', due: 'May 11', amount: 12400, status: 'paid', gst: 'B2B' },
    { no: 'INV-0413', party: 'Walk-in customer',   date: 'Apr 26', due: 'Apr 26', amount: 820,   status: 'paid', gst: 'B2C' },
    { no: 'INV-0412', party: 'Ganesh Provisions',  date: 'Apr 25', due: 'May 9',  amount: 24800, status: 'paid', gst: 'B2B' },
    { no: 'INV-0411', party: 'Eastern Retail',     date: 'Apr 20', due: 'Apr 25', amount: 62400, status: 'overdue', gst: 'B2B' },
    { no: 'INV-0410', party: 'Priya Kirana',       date: 'Apr 18', due: 'May 2',  amount: 8600,  status: 'sent', gst: 'B2B' },
    { no: 'INV-0409', party: 'Mithilesh Stores',   date: 'Apr 15', due: 'Apr 22', amount: 18200, status: 'overdue', gst: 'B2B' },
    { no: 'INV-0408', party: 'Amit Mart',          date: 'Apr 12', due: 'Apr 26', amount: 4200,  status: 'draft', gst: 'B2B' },
  ];
  const filtered = invoices.filter(i => tab === 'all' || i.status === tab);
  const toneMap = { paid:'success', sent:'primary', overdue:'danger', draft:'neutral' };
  const labelMap = { paid:'Paid', sent:'Awaiting', overdue:'Overdue', draft:'Draft' };

  const totals = {
    outstanding: invoices.filter(i => ['sent','overdue'].includes(i.status)).reduce((s,i)=>s+i.amount,0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((s,i)=>s+i.amount,0),
  };

  return (
    <div className="col" style={{padding:'4px 0 90px',gap:12}}>
      <ScreenHeader2 eyebrow="Sales" title="Invoices"
        right={<div className="row gap-2"><button className="btn-icon"><I.search size={16}/></button><button className="btn-icon" onClick={()=>onNav('invoice_new')}><I.plus size={16}/></button></div>}/>

      {/* Outstanding hero */}
      <div style={{padding:'0 14px'}}>
        <Card padding={14} style={{background:'linear-gradient(135deg, color-mix(in srgb, var(--c-primary) 10%, var(--c-surface)), var(--c-surface))',border:'1px solid color-mix(in srgb, var(--c-primary) 20%, var(--c-border))'}}>
          <div className="t-xs t-muted">Total outstanding</div>
          <div className="t-display t-num" style={{fontSize:'var(--t-3xl)',letterSpacing:'-0.03em',marginTop:2}}>{INR2(totals.outstanding)}</div>
          <div className="row between" style={{marginTop:10}}>
            <div><div className="t-xs t-muted">Overdue</div><div className="t-sm t-num" style={{fontWeight:600,color:'var(--c-danger)'}}>{INR2(totals.overdue)}</div></div>
            <div><div className="t-xs t-muted">Awaiting</div><div className="t-sm t-num" style={{fontWeight:600}}>{INR2(totals.outstanding-totals.overdue)}</div></div>
            <Button size="sm">Remind all</Button>
          </div>
        </Card>
      </div>

      {/* Status tabs */}
      <div style={{padding:'0 14px'}}>
        <div className="row gap-1" style={{overflowX:'auto'}}>
          {[['all','All · '+invoices.length],['overdue','Overdue · 2'],['sent','Awaiting · 2'],['paid','Paid · 3'],['draft','Draft · 1']].map(([k,l]) => (
            <button key={k} onClick={()=>setTab(k)} style={{
              border:'1px solid var(--c-border)',
              background: tab === k ? 'var(--c-text)' : 'var(--c-surface)',
              color: tab === k ? 'var(--c-textInverse)' : 'var(--c-text)',
              padding:'6px 12px',borderRadius:'var(--r-pill)',
              fontSize:'var(--t-xs)',fontWeight:500,cursor:'pointer',whiteSpace:'nowrap'
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{padding:'0 14px'}}>
        <Card padding={0}>
          {filtered.map((inv, i) => (
            <div key={inv.no} className="list-row" style={{padding:'12px 14px',minHeight:'auto',gap:12,borderBottom:i===filtered.length-1?'none':'1px solid var(--c-divider)'}}>
              <Avatar name={inv.party} size="sm"/>
              <div style={{flex:1,minWidth:0}}>
                <div className="row gap-2">
                  <div className="t-sm truncate" style={{fontWeight:500}}>{inv.party}</div>
                </div>
                <div className="row gap-2" style={{marginTop:2}}>
                  <span className="t-xs t-mono t-subtle">{inv.no}</span>
                  <span className="t-xs t-muted">· {inv.date}</span>
                  {inv.status === 'overdue' && <span className="t-xs" style={{color:'var(--c-danger)',fontWeight:500}}>· Due {inv.due}</span>}
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div className="t-sm t-num" style={{fontWeight:700}}>{INR2(inv.amount)}</div>
                <Badge tone={toneMap[inv.status]} dot>{labelMap[inv.status]}</Badge>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 6. INVOICE CREATE
// ═════════════════════════════════════════════
function BooksInvoiceNew({ onBack }) {
  const [lines, setLines] = useStateB2([
    { id: 1, item: 'Basmati Rice 5kg', hsn: '1006', qty: 10, rate: 420, gst: 5 },
    { id: 2, item: 'Sunflower Oil 1L', hsn: '1512', qty: 12, rate: 148, gst: 5 },
  ]);

  const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const cgst = lines.reduce((s, l) => s + (l.qty * l.rate * l.gst / 2 / 100), 0);
  const sgst = cgst;
  const total = subtotal + cgst + sgst;

  return (
    <div className="col" style={{padding:'4px 0 90px',gap:12}}>
      <div className="row between" style={{padding:'6px 14px'}}>
        <button className="btn-icon" onClick={onBack}><I.chevL size={16}/></button>
        <div className="t-xs t-muted t-mono">INV-0416 · DRAFT</div>
        <button className="btn-icon"><I.more size={16}/></button>
      </div>

      <ScreenHeader2 title="New invoice" sub="Auto-numbered, GST-compliant"/>

      {/* Party */}
      <div style={{padding:'0 14px'}}>
        <Card padding={0}>
          <div className="list-row" style={{padding:'12px 14px',minHeight:'auto',gap:12}}>
            <Avatar name="Sharma Traders" size="sm"/>
            <div style={{flex:1,minWidth:0}}>
              <div className="t-sm" style={{fontWeight:500}}>Sharma Traders</div>
              <div className="t-xs t-mono t-subtle">GSTIN 27AABCS1234A1Z5 · Maharashtra</div>
            </div>
            <I.chevR size={14} style={{color:'var(--c-textSubtle)'}}/>
          </div>
          <div style={{borderTop:'1px solid var(--c-divider)',display:'grid',gridTemplateColumns:'1fr 1fr'}}>
            <div style={{padding:'10px 14px',borderRight:'1px solid var(--c-divider)'}}>
              <div className="t-xs t-muted">Invoice date</div>
              <div className="t-sm" style={{fontWeight:500,marginTop:2}}>Apr 28, 2025</div>
            </div>
            <div style={{padding:'10px 14px'}}>
              <div className="t-xs t-muted">Due date</div>
              <div className="t-sm" style={{fontWeight:500,marginTop:2,color:'var(--c-primary)'}}>May 12, 2025</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Line items */}
      <div style={{padding:'0 14px'}}>
        <div className="row between" style={{marginBottom:8}}>
          <div className="t-xs t-muted" style={{textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:600}}>Items · {lines.length}</div>
          <button style={{border:0,background:'transparent',color:'var(--c-primary)',fontSize:'var(--t-xs)',fontWeight:600,cursor:'pointer'}}>+ Scan / Add</button>
        </div>
        <Card padding={0}>
          {lines.map((l, i) => (
            <div key={l.id} style={{padding:'12px 14px',borderBottom:i===lines.length-1?'none':'1px solid var(--c-divider)'}}>
              <div className="row between">
                <div style={{flex:1,minWidth:0}}>
                  <div className="t-sm truncate" style={{fontWeight:500}}>{l.item}</div>
                  <div className="row gap-2" style={{marginTop:2}}>
                    <span className="t-xs t-muted">HSN {l.hsn}</span>
                    <span className="t-xs t-muted">· GST {l.gst}%</span>
                  </div>
                </div>
                <div className="t-sm t-num" style={{fontWeight:600}}>{INR2(l.qty*l.rate)}</div>
              </div>
              <div className="row gap-2" style={{marginTop:8}}>
                <div style={{display:'flex',alignItems:'center',gap:4,border:'1px solid var(--c-border)',borderRadius:'var(--r-sm)',padding:'2px'}}>
                  <button className="btn-icon" style={{width:24,height:24,border:0}}><I.minus size={12}/></button>
                  <div className="t-sm t-num" style={{minWidth:24,textAlign:'center',fontWeight:600}}>{l.qty}</div>
                  <button className="btn-icon" style={{width:24,height:24,border:0}}><I.plus size={12}/></button>
                </div>
                <div className="t-xs t-muted">× {INR2(l.rate)}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Totals */}
      <div style={{padding:'0 14px'}}>
        <Card padding={14}>
          {[['Subtotal',subtotal,false],['CGST @ 2.5%',cgst,true],['SGST @ 2.5%',sgst,true]].map(([k,v,sub])=>(
            <div key={k} className="row between" style={{marginBottom:6}}>
              <div className="t-sm t-muted">{k}</div>
              <div className="t-sm t-num" style={{color:sub?'var(--c-textMuted)':'inherit'}}>{INR2(v)}</div>
            </div>
          ))}
          <div className="row between" style={{marginTop:10,paddingTop:10,borderTop:'1px solid var(--c-divider)'}}>
            <div className="t-sm" style={{fontWeight:600}}>Total</div>
            <div className="t-num" style={{fontSize:24,fontWeight:700,letterSpacing:'-0.02em',fontFamily:'var(--f-display)'}}>{INR2(total)}</div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="row gap-2" style={{padding:'0 14px'}}>
        <Button full>Save draft</Button>
        <Button full variant="primary" iconRight={<I.send size={14}/>}>Send invoice</Button>
      </div>
    </div>
  );
}

window.BooksProduct = BooksProduct;
window.BooksLowStock = BooksLowStock;
window.BooksInvoiceList = BooksInvoiceList;
window.BooksInvoiceNew = BooksInvoiceNew;
