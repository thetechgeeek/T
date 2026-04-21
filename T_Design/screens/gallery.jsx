// Gallery screen — catalog of every component, grouped by section.
const { useState: useStateG } = React;

function Section({ title, sub, children }) {
  return (
    <div className="col gap-2" style={{padding:'0 14px'}}>
      <div className="col" style={{gap:0}}>
        <div className="t-h3">{title}</div>
        {sub && <div className="t-xs t-muted">{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{padding:'10px 0',borderBottom:'1px solid var(--c-divider)'}}>
      <div className="t-xs t-muted" style={{marginBottom:8,textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:500}}>{label}</div>
      <div className="row gap-2" style={{flexWrap:'wrap'}}>{children}</div>
    </div>
  );
}

function ScreenGallery() {
  const [tab, setTab] = useStateG('inputs');
  const [val, setVal] = useStateG('Initial');
  const [on, setOn] = useStateG(true);
  const [checked, setChecked] = useStateG(true);
  const [seg, setSeg] = useStateG('b');
  const [range, setRange] = useStateG(40);
  const [otp, setOtp] = useStateG(['5','8','','','','']);
  const [datesOpen, setDatesOpen] = useStateG(false);

  return (
    <div className="col" style={{ padding: '8px 0 90px', gap: 14 }}>
      <div style={{padding:'0 14px'}}>
        <Tabs bar value={tab} onChange={setTab} items={[
          {value:'inputs',label:'Inputs'},
          {value:'actions',label:'Actions'},
          {value:'feedback',label:'Feedback'},
          {value:'data',label:'Data'},
          {value:'overlays',label:'Overlays'},
        ]}/>
      </div>

      {tab === 'inputs' && <>
        <Section title="Text fields" sub="Prefix, suffix, clear, states">
          <Card>
            <div className="col gap-3">
              <Field label="Full name"><Input placeholder="Ayesha Khan" value={val} onChange={e=>setVal(e.target.value)} clearable onClear={()=>setVal('')}/></Field>
              <Field label="Email" hint="We'll send a verification link"><Input prefix={<I.user size={14}/>} placeholder="you@fund.com"/></Field>
              <Field label="Password"><Input type="password" suffix={<I.eye size={14}/>} defaultValue="••••••••"/></Field>
              <Field label="Amount" error="Must be less than available cash"><Input prefix={<span style={{fontSize:12}}>$</span>} defaultValue="1,240,000" error/></Field>
              <Field label="Notes"><textarea className="textarea" placeholder="Add context for approvers…" rows="3"/></Field>
              <Input disabled placeholder="Disabled input"/>
              <Input readOnly defaultValue="Read-only value"/>
            </div>
          </Card>
        </Section>

        <Section title="Selection">
          <Card>
            <div className="col gap-3">
              <Field label="Account">
                <div className="input-wrap">
                  <select className="select"><option>Fund A · USD</option><option>Fund B · EUR</option></select>
                  <span className="adorn-r"><I.chevD size={14}/></span>
                </div>
              </Field>
              <Field label="Currencies">
                <div className="row gap-1" style={{flexWrap:'wrap',padding:'6px',border:'1px solid var(--c-border)',borderRadius:'var(--r-md)',background:'var(--c-surface)'}}>
                  {['USD','EUR','GBP','JPY'].map(t => (
                    <span key={t} className="badge" data-tone="primary" style={{gap:6}}>
                      {t} <I.close size={10}/>
                    </span>
                  ))}
                  <input style={{border:0,outline:0,flex:1,minWidth:60,background:'transparent',color:'var(--c-text)'}} placeholder="Add…"/>
                </div>
              </Field>
              <Row label="Checkboxes">
                <label className="row gap-2"><Checkbox checked={checked} onChange={setChecked}/><span className="t-sm">Subscribe</span></label>
                <label className="row gap-2"><Checkbox indeterminate/><span className="t-sm">Mixed</span></label>
                <label className="row gap-2"><Checkbox disabled/><span className="t-sm t-muted">Disabled</span></label>
              </Row>
              <Row label="Radios">
                <label className="row gap-2"><Radio name="r" checked onChange={()=>{}}/><span className="t-sm">Weekly</span></label>
                <label className="row gap-2"><Radio name="r"/><span className="t-sm">Monthly</span></label>
              </Row>
              <Row label="Switches">
                <Switch on={on} onChange={setOn}/>
                <Switch on={false} onChange={()=>{}}/>
                <Switch on={true} disabled/>
              </Row>
              <Row label="Segmented">
                <Segmented options={[{value:'a',label:'Day'},{value:'b',label:'Week'},{value:'c',label:'Month'}]} value={seg} onChange={setSeg}/>
              </Row>
            </div>
          </Card>
        </Section>

        <Section title="Specialty">
          <Card>
            <div className="col gap-3">
              <Field label="OTP code">
                <div className="row gap-2">
                  {otp.map((d, i) => (
                    <input key={i} value={d} maxLength={1} onChange={e=>{
                      const n = [...otp]; n[i] = e.target.value; setOtp(n);
                    }} style={{
                      width:40,height:48,textAlign:'center',fontSize:'var(--t-lg)',fontWeight:600,
                      border:'1px solid var(--c-border)',borderRadius:'var(--r-md)',background:'var(--c-surface)',color:'var(--c-text)',
                      outline: d ? '2px solid var(--c-primary)' : 'none'
                    }}/>
                  ))}
                </div>
              </Field>
              <Field label={`Slider · ${range}`}>
                <div className="row gap-2">
                  <input type="range" min="0" max="100" value={range} onChange={e=>setRange(+e.target.value)} style={{flex:1,accentColor:'var(--c-primary)'}}/>
                  <span className="t-sm t-num" style={{fontWeight:600,minWidth:36,textAlign:'right'}}>{range}%</span>
                </div>
              </Field>
              <Field label="Numeric stepper">
                <div className="row">
                  <button className="btn-icon" style={{borderRadius:'var(--r-md) 0 0 var(--r-md)'}}><I.minus size={14}/></button>
                  <input className="input" style={{borderRadius:0,textAlign:'center',borderLeft:'none',borderRight:'none',fontVariantNumeric:'tabular-nums'}} defaultValue="12"/>
                  <button className="btn-icon" style={{borderRadius:'0 var(--r-md) var(--r-md) 0'}}><I.plus size={14}/></button>
                </div>
              </Field>
              <Field label="Date">
                <button className="input row between" style={{cursor:'pointer',textAlign:'left'}} onClick={()=>setDatesOpen(true)}>
                  <span>Apr 20, 2026</span><I.calendar size={14} style={{color:'var(--c-textMuted)'}}/>
                </button>
              </Field>
              <Field label="Upload" hint="PDF, CSV · max 10 MB">
                <div style={{border:'1.5px dashed var(--c-border)',borderRadius:'var(--r-md)',padding:18,textAlign:'center',background:'var(--c-surfaceAlt)'}}>
                  <I.upload size={22} style={{color:'var(--c-textMuted)'}}/>
                  <div className="t-sm" style={{marginTop:6,fontWeight:500}}>Drop files or tap to browse</div>
                </div>
              </Field>
              <Card padding={10} style={{background:'var(--c-surfaceAlt)'}}>
                <div className="row gap-2">
                  <div style={{width:32,height:32,background:'var(--c-surface)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--c-textMuted)'}}><I.file size={14}/></div>
                  <div style={{flex:1}}>
                    <div className="t-sm" style={{fontWeight:500}}>Q1-statement.pdf</div>
                    <div className="t-xs t-muted">2.4 MB · 64%</div>
                    <div className="progress" style={{marginTop:4}}><div className="bar" style={{width:'64%'}}/></div>
                  </div>
                  <button className="btn-icon" data-variant="ghost" style={{width:28,height:28}}><I.close size={12}/></button>
                </div>
              </Card>
            </div>
          </Card>
        </Section>
      </>}

      {tab === 'actions' && <>
        <Section title="Buttons" sub="Primary · Secondary · Ghost · Danger">
          <Card>
            <div className="col gap-3">
              <Row label="Primary">
                <Button size="xs">XS</Button><Button size="sm">Small</Button>
                <Button>Default</Button><Button size="lg">Large</Button>
              </Row>
              <Row label="Variants">
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Delete</Button>
                <Button loading>Saving</Button>
              </Row>
              <Row label="With icons">
                <Button iconLeft={<I.plus size={14}/>}>New</Button>
                <Button variant="secondary" iconLeft={<I.download size={14}/>}>Export</Button>
                <Button variant="secondary" iconRight={<I.arrowR size={14}/>}>Continue</Button>
                <button className="btn-icon"><I.settings size={16}/></button>
              </Row>
              <Row label="Full width">
                <div style={{width:'100%'}}>
                  <Button full iconLeft={<I.check size={14}/>}>Submit approval</Button>
                </div>
              </Row>
              <Row label="Split">
                <div className="row" style={{boxShadow:'var(--shadow)',borderRadius:'var(--r-md)'}}>
                  <Button style={{borderRadius:'var(--r-md) 0 0 var(--r-md)',borderRight:'1px solid rgba(255,255,255,0.2)'}}>Approve</Button>
                  <Button style={{borderRadius:'0 var(--r-md) var(--r-md) 0',padding:'0 8px'}}><I.chevD size={14}/></Button>
                </div>
              </Row>
            </div>
          </Card>
        </Section>
      </>}

      {tab === 'feedback' && <>
        <Section title="Toasts & Alerts">
          <div className="col gap-2">
            <Toast tone="info" title="Syncing in the background">Market data refreshed just now.</Toast>
            <Toast tone="success" title="Trade executed">20 NVDA @ $889.12</Toast>
            <Toast tone="warning" title="Approaching risk limit" onClose={()=>{}}>Portfolio volatility over 7 day threshold.</Toast>
            <Toast tone="danger" title="Wire failed" action={<Button size="xs" variant="ghost" style={{color:'var(--c-danger)'}}>Retry</Button>}>Counter-party returned ERR-0x7F.</Toast>
          </div>
        </Section>
        <Section title="Progress">
          <Card>
            <div className="col gap-3">
              <Field label="Linear determinate · 64%"><Progress value={64}/></Field>
              <Field label="Linear indeterminate"><Progress indeterminate/></Field>
              <Row label="Circular">
                <CircularProgress value={35}/>
                <CircularProgress value={72}/>
                <CircularProgress indeterminate/>
              </Row>
            </div>
          </Card>
        </Section>
        <Section title="Badges & status">
          <Card>
            <Row label="Tones">
              <Badge>Default</Badge>
              <Badge tone="primary" dot>Primary</Badge>
              <Badge tone="success" dot>Posted</Badge>
              <Badge tone="warning" dot>Pending</Badge>
              <Badge tone="danger" dot>Failed</Badge>
              <Badge tone="info">Beta</Badge>
            </Row>
            <Row label="Counts">
              <div className="row gap-3">
                <div style={{position:'relative'}}>
                  <I.bell size={20}/>
                  <span style={{position:'absolute',top:-4,right:-6,background:'var(--c-danger)',color:'#fff',fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:999}}>12</span>
                </div>
                <div style={{position:'relative'}}>
                  <I.inbox size={20}/>
                  <span style={{position:'absolute',top:-4,right:-6,background:'var(--c-primary)',color:'#fff',fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:999}}>99+</span>
                </div>
              </div>
            </Row>
          </Card>
        </Section>
        <Section title="Skeletons">
          <Card>
            <div className="col gap-2">
              <Skel h={18} w="40%"/>
              <Skel h={12} w="80%"/>
              <Skel h={12} w="60%"/>
              <div className="row gap-3" style={{marginTop:6}}>
                <Skel h={44} w={44} r={999}/>
                <div className="col gap-2" style={{flex:1}}>
                  <Skel h={12} w="40%"/><Skel h={10} w="70%"/>
                </div>
              </div>
            </div>
          </Card>
        </Section>
        <Section title="Empty states">
          <Card padding={20} style={{textAlign:'center'}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:10}}><Illos.IlloOffline size={100}/></div>
            <div className="t-h3">You're offline</div>
            <div className="t-sm t-muted" style={{margin:'4px 0 12px'}}>We'll retry when you're back on.</div>
            <Button variant="secondary" size="sm" iconLeft={<I.refresh size={14}/>}>Retry</Button>
          </Card>
        </Section>
      </>}

      {tab === 'data' && <>
        <Section title="Stat cards">
          <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:8}}>
            <StatCard label="AUM" value="$12.4M" delta={1.42} comparison="vs last close" spark={[8,9,8,10,11,10,12,13]}/>
            <StatCard label="Accrued" value="$3,204" delta={-0.28} comparison="24h" spark={[11,10,11,10,9,10,10,9]} sparkColor="var(--c-danger)"/>
            <StatCard label="Latency" value="42ms" loading/>
            <StatCard label="Errors" value="—" error/>
          </div>
        </Section>
        <Section title="Charts">
          <Card>
            <div className="t-sm" style={{fontWeight:600,marginBottom:8}}>Daily P&L · last 12 days</div>
            <BarChart height={110} keyName="d" valueName="v" data={[
              {d:'08',v:12},{d:'09',v:-4},{d:'10',v:18},{d:'11',v:22},{d:'12',v:-8},
              {d:'13',v:14},{d:'14',v:7},{d:'15',v:-12},{d:'16',v:19},{d:'17',v:24},
              {d:'18',v:9},{d:'19',v:17},
            ]}/>
          </Card>
          <Card>
            <div className="t-sm" style={{fontWeight:600,marginBottom:8}}>Asset mix</div>
            <div className="row gap-4">
              <DonutChart size={100} inner={32} data={[
                {label:'Eq',value:64},{label:'Bond',value:18},{label:'Cash',value:12},{label:'Alt',value:6}
              ]}/>
              <div className="col gap-1" style={{flex:1}}>
                {[['Equities',64,'var(--c-chartA)'],['Bonds',18,'var(--c-chartB)'],['Cash',12,'var(--c-chartC)'],['Alt',6,'var(--c-chartE)']].map(([l,v,c]) => (
                  <div key={l} className="row between"><span className="row gap-2"><span className="dot" style={{background:c,width:8,height:8}}/><span className="t-sm">{l}</span></span><span className="t-sm t-num" style={{fontWeight:600}}>{v}%</span></div>
                ))}
              </div>
            </div>
          </Card>
        </Section>
        <Section title="Avatars">
          <Card>
            <div className="col gap-3">
              <Row label="Sizes">
                <Avatar name="Priya Menon" size="sm"/>
                <Avatar name="Marcus Wei"/>
                <Avatar name="Evan Park" size="lg" status="success"/>
                <Avatar name="Leah Ortiz" size="xl" status="warning"/>
              </Row>
              <Row label="Group">
                <AvatarGroup users={[
                  {name:'Priya Menon'},{name:'Marcus Wei'},{name:'Evan Park'},{name:'Leah Ortiz'},{name:'Ayesha Khan'}
                ]} max={3}/>
              </Row>
            </div>
          </Card>
        </Section>
        <Section title="Dense table">
          <Card padding={0}>
            <table className="table">
              <thead><tr><th>SYM</th><th>PX</th><th style={{textAlign:'right'}}>1D</th><th style={{textAlign:'right'}}>5D</th></tr></thead>
              <tbody>
                <tr><td className="t-mono">AAPL</td><td className="num">187.42</td><td className="num pos">+1.82%</td><td className="num pos">+4.12%</td></tr>
                <tr><td className="t-mono">NVDA</td><td className="num">889.12</td><td className="num pos">+3.41%</td><td className="num pos">+8.90%</td></tr>
                <tr><td className="t-mono">JPM</td><td className="num">198.44</td><td className="num neg">−0.28%</td><td className="num neg">−1.12%</td></tr>
                <tr><td className="t-mono">GS</td><td className="num">461.88</td><td className="num neg">−1.24%</td><td className="num pos">+0.40%</td></tr>
                <tr><td className="t-mono">XOM</td><td className="num">112.36</td><td className="num pos">+0.64%</td><td className="num pos">+2.18%</td></tr>
              </tbody>
            </table>
          </Card>
        </Section>
      </>}

      {tab === 'overlays' && <>
        <Section title="Modals & sheets" sub="Tap the buttons to preview">
          <Card>
            <div className="col gap-2">
              <Button variant="secondary" onClick={() => setDatesOpen(true)}>Open bottom sheet</Button>
              <Button variant="secondary">Open confirm dialog</Button>
              <Button variant="ghost">Show tooltip</Button>
            </div>
          </Card>
        </Section>
        <Section title="Tooltip & popover (static preview)">
          <Card padding={20}>
            <div style={{position:'relative',display:'inline-block'}}>
              <Button variant="secondary" size="sm">Trigger</Button>
              <div style={{position:'absolute',top:'calc(100% + 8px)',left:0,background:'var(--c-text)',color:'var(--c-textInverse)',padding:'6px 10px',borderRadius:'var(--r-md)',fontSize:'var(--t-xs)',whiteSpace:'nowrap'}}>
                This is a tooltip
                <div style={{position:'absolute',top:-3,left:16,width:6,height:6,background:'var(--c-text)',transform:'rotate(45deg)'}}/>
              </div>
            </div>
          </Card>
        </Section>
      </>}

      <Sheet open={datesOpen} onClose={() => setDatesOpen(false)} title="Select date"
        actions={<><Button variant="secondary" full onClick={() => setDatesOpen(false)}>Cancel</Button><Button full onClick={() => setDatesOpen(false)}>Done</Button></>}>
        <div className="col gap-2">
          <div className="row between">
            <button className="btn-icon" data-variant="ghost"><I.chevL size={16}/></button>
            <div className="t-sm" style={{fontWeight:600}}>April 2026</div>
            <button className="btn-icon" data-variant="ghost"><I.chevR size={16}/></button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,fontSize:'var(--t-xs)'}}>
            {['S','M','T','W','T','F','S'].map(d => <div key={d} className="t-muted" style={{textAlign:'center',padding:4}}>{d}</div>)}
            {Array.from({length:30}, (_, i) => i + 1).map(d => (
              <button key={d} style={{
                border:0,background: d === 20 ? 'var(--c-primary)' : 'transparent',
                color: d === 20 ? 'var(--c-primaryText)' : 'var(--c-text)',
                height:34,borderRadius:'var(--r-md)',fontWeight: d === 20 ? 600 : 400,cursor:'pointer',fontSize:'var(--t-sm)'
              }}>{d}</button>
            ))}
          </div>
        </div>
      </Sheet>
    </div>
  );
}

window.ScreenGallery = ScreenGallery;
