// Tweaks panel — surfaces all runtime configuration.
const { useState: useStateT, useEffect: useEffectT } = React;

function TweakRow({ label, sub, children }) {
  return (
    <div className="col" style={{gap:6, padding:'10px 0', borderBottom:'1px solid var(--c-divider)'}}>
      <div className="col" style={{gap:1}}>
        <div className="t-sm" style={{fontWeight:600, color:'var(--c-text)'}}>{label}</div>
        {sub && <div className="t-xs" style={{color:'var(--c-textMuted)'}}>{sub}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ChipChoice({ value, options, onChange }) {
  return (
    <div className="row gap-1" style={{flexWrap:'wrap'}}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          border:'1px solid var(--c-border)',
          background: value === o.value ? 'var(--c-text)' : 'var(--c-surface)',
          color: value === o.value ? 'var(--c-textInverse)' : 'var(--c-text)',
          padding:'5px 10px', borderRadius:'var(--r-pill)',
          fontSize:'var(--t-xs)', fontWeight:500, cursor:'pointer',
          display:'flex',alignItems:'center',gap:4
        }}>
          {o.swatch && <span style={{width:10,height:10,borderRadius:999,background:o.swatch,display:'inline-block'}}/>}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function TweaksPanel({ config, setConfig, onClose, screens }) {
  const update = (k, v) => setConfig({ ...config, [k]: v });

  return (
    <div style={{
      position:'absolute',top:0,right:0,bottom:0,width:340,maxWidth:'92vw',
      background:'#0c0c0e',color:'#f2f2f5',
      borderLeft:'1px solid #26272b',
      fontFamily:'"Geist", sans-serif', fontSize:13,
      zIndex:200, display:'flex',flexDirection:'column',
      boxShadow:'-12px 0 40px rgba(0,0,0,0.4)',
      animation: 'slideIn 0.22s ease'
    }}>
      <style>{`@keyframes slideIn { from{transform:translateX(100%);} to{transform:translateX(0);}}`}</style>
      <div style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #26272b'}}>
        <div>
          <div style={{fontWeight:700,fontSize:14}}>Tweaks</div>
          <div style={{color:'#8a8f98',fontSize:11,marginTop:1}}>Runtime configuration · all persisted</div>
        </div>
        <button onClick={onClose} style={{border:0,background:'#1a1b1e',color:'#f2f2f5',width:28,height:28,borderRadius:6,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
      </div>
      <div style={{flex:1,overflow:'auto',padding:'4px 16px 24px'}}>
        <TweakRow label="Theme" sub="5 complete looks · each with light + dark">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:2}}>
            {Object.entries(window.THEMES).map(([k, t]) => (
              <button key={k} onClick={() => update('theme', k)} style={{
                border: config.theme === k ? '1.5px solid #7b8ce5' : '1px solid #26272b',
                background: config.theme === k ? '#1e2140' : '#111113',
                color:'#f2f2f5', padding:'10px 12px', borderRadius:8,
                textAlign:'left', cursor:'pointer',
                display:'flex',flexDirection:'column',gap:4
              }}>
                <div style={{display:'flex',gap:3}}>
                  {['primary','chartB','chartC','chartE'].map(c => (
                    <span key={c} style={{width:10,height:10,borderRadius:3,
                      background: t[config.mode]?.[c] || t.light[c]
                    }}/>
                  ))}
                </div>
                <div style={{fontWeight:600,fontSize:12}}>{t.name}</div>
                <div style={{color:'#8a8f98',fontSize:10}}>{t.description}</div>
              </button>
            ))}
          </div>
        </TweakRow>

        <TweakRow label="Mode">
          <ChipChoice value={config.mode} onChange={v => update('mode', v)} options={[
            {value:'light',label:'Light'},{value:'dark',label:'Dark'}
          ]}/>
        </TweakRow>

        <TweakRow label="Accent hue" sub="Overrides the theme's primary">
          <ChipChoice value={config.accent} onChange={v => update('accent', v)} options={[
            {value:'default',label:'Default'},
            {value:'indigo',label:'Indigo',swatch:'#5E6AD2'},
            {value:'violet',label:'Violet',swatch:'#8B5CF6'},
            {value:'rose',label:'Rose',swatch:'#E11D74'},
            {value:'amber',label:'Amber',swatch:'#D97706'},
            {value:'emerald',label:'Emerald',swatch:'#10B981'},
            {value:'sky',label:'Sky',swatch:'#0BA5E9'},
            {value:'orange',label:'Orange',swatch:'#FF6B4A'},
          ]}/>
        </TweakRow>

        <TweakRow label="Density" sub="Affects spacing, row height, type scale">
          <ChipChoice value={config.density} onChange={v => update('density', v)} options={[
            {value:'compact',label:'Compact'},{value:'comfortable',label:'Comfortable'},{value:'spacious',label:'Spacious'}
          ]}/>
        </TweakRow>

        <TweakRow label="Corner radius">
          <ChipChoice value={config.radius} onChange={v => update('radius', v)} options={[
            {value:'sharp',label:'Sharp'},{value:'soft',label:'Soft'},{value:'pill',label:'Pill'}
          ]}/>
        </TweakRow>

        <TweakRow label="Typography">
          <ChipChoice value={config.font} onChange={v => update('font', v)} options={[
            {value:'theme',label:'Theme default'},
            {value:'geist',label:'Geist'},
            {value:'satoshi',label:'Satoshi'},
            {value:'general',label:'General Sans'},
            {value:'cabinet',label:'Cabinet'},
            {value:'fraunces',label:'Fraunces + GS'},
          ]}/>
        </TweakRow>

        <TweakRow label="Illustration style">
          <ChipChoice value={config.illustration} onChange={v => update('illustration', v)} options={[
            {value:'geometric',label:'Geometric'},
            {value:'line',label:'Line'},
            {value:'duotone',label:'Duotone'},
          ]}/>
        </TweakRow>

        <TweakRow label="Motion">
          <ChipChoice value={config.motion} onChange={v => update('motion', v)} options={[
            {value:'full',label:'Full'},{value:'reduced',label:'Reduced'},{value:'off',label:'Off'}
          ]}/>
        </TweakRow>

        <TweakRow label="Jump to screen">
          <div className="row gap-1" style={{flexWrap:'wrap'}}>
            {(screens ? screens.map(s => [s.id, s.label]) : [['portfolio','Portfolio'],['ledger','Ledger'],['approvals','Approvals'],['gallery','Gallery']]).map(([k, l]) => (
              <button key={k} onClick={() => update('screen', k)} style={{
                border:'1px solid #26272b',
                background: config.screen === k ? '#7b8ce5' : '#111113',
                color: config.screen === k ? '#fff' : '#f2f2f5',
                padding:'5px 10px', borderRadius:999,
                fontSize:11, fontWeight:500, cursor:'pointer'
              }}>{l}</button>
            ))}
          </div>
        </TweakRow>
      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
