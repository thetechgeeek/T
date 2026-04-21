// Primitive React components that consume tokens via CSS vars.
// All globally exported on window so other Babel scripts can use them.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------------- Button ---------------- */
function Button({ children, variant, size, iconLeft, iconRight, loading, full, onClick, disabled, ...rest }) {
  return (
    <button className="btn" data-variant={variant} data-size={size} data-full={full ? '1' : undefined}
      disabled={disabled || loading} onClick={onClick} {...rest}>
      {loading && <Spinner size={12} />}
      {!loading && iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  );
}

function Spinner({ size = 14, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 0.9s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="9" stroke={color || 'currentColor'} strokeWidth="2.5" fill="none" opacity="0.2"/>
      <path d="M21 12a9 9 0 0 0-9-9" stroke={color || 'currentColor'} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

/* ---------------- Field / Input ---------------- */
function Field({ label, hint, error, children, required }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}{required && <span style={{color:'var(--c-danger)'}}> *</span>}</label>}
      {children}
      {error ? <div className="field-error"><I.alert size={12}/>{error}</div>
       : hint ? <div className="field-hint">{hint}</div> : null}
    </div>
  );
}

function Input({ prefix, suffix, clearable, value, onChange, onClear, error, ...rest }) {
  const showClear = clearable && value;
  return (
    <div className="input-wrap">
      {prefix && <span className="adorn-l">{prefix}</span>}
      <input className="input" value={value ?? ''} onChange={onChange} data-error={error ? '1' : undefined}
        style={prefix ? {} : { paddingLeft: 12 }} data-suffix={suffix || showClear ? '1' : undefined} {...rest}/>
      {showClear && <span className="adorn-r" style={{cursor:'pointer'}} onClick={onClear}><I.close size={14}/></span>}
      {!showClear && suffix && <span className="adorn-r">{suffix}</span>}
    </div>
  );
}

/* ---------------- Switch / Checkbox ---------------- */
function Switch({ on, onChange, disabled }) {
  return (
    <div className="switch" data-on={on ? '1' : '0'}
      onClick={() => !disabled && onChange(!on)} style={disabled ? { opacity: 0.5 } : {}}/>
  );
}

function Checkbox({ checked, indeterminate, onChange, disabled }) {
  return <input type="checkbox" className="checkbox" checked={!!checked} disabled={disabled}
    data-indeterminate={indeterminate ? '1' : undefined}
    onChange={e => onChange && onChange(e.target.checked)}/>;
}

function Radio({ checked, onChange, disabled, name }) {
  return <input type="radio" className="radio" checked={!!checked} disabled={disabled} name={name}
    onChange={e => onChange && onChange(e.target.checked)}/>;
}

/* ---------------- Badge / Dot ---------------- */
function Badge({ children, tone, dot }) {
  return <span className="badge" data-tone={tone}>{dot && <span className="dot"/>}{children}</span>;
}

/* ---------------- Avatar ---------------- */
function Avatar({ name = '', size, src, status }) {
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div className="avatar" data-size={size} style={{
        background: src ? 'transparent' : `hsl(${hue} 60% 90%)`,
        color: `hsl(${hue} 60% 30%)`,
      }}>
        {src ? <img src={src} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : initials}
      </div>
      {status && <span style={{
        position: 'absolute', bottom: 0, right: 0, width: 8, height: 8,
        borderRadius: 999, background: `var(--c-${status})`,
        border: '1.5px solid var(--c-surface)',
      }}/>}
    </div>
  );
}

function AvatarGroup({ users, max = 3, size }) {
  const visible = users.slice(0, max);
  const extra = users.length - max;
  return (
    <div style={{ display: 'flex' }}>
      {visible.map((u, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -6, border: '2px solid var(--c-surface)', borderRadius: 999 }}>
          <Avatar name={u.name} src={u.src} size={size}/>
        </div>
      ))}
      {extra > 0 && (
        <div style={{ marginLeft: -6, border: '2px solid var(--c-surface)', borderRadius: 999 }}>
          <div className="avatar" data-size={size} style={{ background: 'var(--c-surfaceAlt)', color: 'var(--c-textMuted)' }}>+{extra}</div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Progress ---------------- */
function Progress({ value = 0, indeterminate }) {
  return (
    <div className="progress">
      <div className="bar" style={{
        width: indeterminate ? '40%' : `${value}%`,
        animation: indeterminate ? 'indet 1.4s ease-in-out infinite' : undefined
      }}/>
      <style>{`@keyframes indet { 0%{margin-left:-40%} 100%{margin-left:100%} }`}</style>
    </div>
  );
}

function CircularProgress({ value = 0, size = 40, indeterminate }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: indeterminate ? 'none' : 'rotate(-90deg)', animation: indeterminate ? 'spin 1.5s linear infinite' : undefined }}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--c-surfaceAlt)" strokeWidth="3" fill="none"/>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--c-primary)" strokeWidth="3" fill="none"
        strokeDasharray={c} strokeDashoffset={c - (indeterminate ? 0.25 : value/100) * c}
        strokeLinecap="round"/>
    </svg>
  );
}

/* ---------------- Skeleton ---------------- */
function Skel({ w = '100%', h = 12, r, style }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r ?? 'var(--r-sm)', ...style }}/>;
}

/* ---------------- Sparkline ---------------- */
function Sparkline({ data, width = 80, height = 24, color = 'currentColor', filled }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / span) * height]);
  const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} style={{display:'block'}}>
      {filled && <path d={`${path} L${width} ${height} L0 ${height} Z`} fill={color} opacity="0.15"/>}
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ---------------- Card ---------------- */
function Card({ children, onClick, padding = 14, style, className }) {
  return (
    <div className={`card ${className || ''}`} onClick={onClick}
      style={{ padding, cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );
}

/* ---------------- Segmented ---------------- */
function Segmented({ options, value, onChange }) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o.value} data-active={value === o.value ? '1' : '0'}
          onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

/* ---------------- Tabs ---------------- */
function Tabs({ items, value, onChange, bar }) {
  const Cls = bar ? 'tabbar' : 'tabs';
  return (
    <div className={Cls}>
      {items.map(it => (
        <button key={it.value} data-active={value === it.value ? '1' : '0'}
          onClick={() => onChange(it.value)}>{it.label}{it.badge != null && <span className="badge" style={{marginLeft:6}} data-tone="primary">{it.badge}</span>}</button>
      ))}
    </div>
  );
}

/* ---------------- Toast ---------------- */
function Toast({ tone = 'info', title, children, onClose, action }) {
  const icons = { info: <I.info size={16}/>, success: <I.success size={16}/>, warning: <I.alert size={16}/>, danger: <I.danger size={16}/> };
  return (
    <div className="card" style={{
      padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start',
      background: `var(--c-${tone}Soft)`,
      borderColor: `color-mix(in srgb, var(--c-${tone}) 30%, transparent)`,
      color: `var(--c-${tone})`,
    }}>
      <div style={{marginTop:2}}>{icons[tone]}</div>
      <div style={{flex:1, color:'var(--c-text)'}}>
        {title && <div style={{fontWeight:600, fontSize:'var(--t-sm)'}}>{title}</div>}
        {children && <div className="t-sm t-muted">{children}</div>}
      </div>
      {action}
      {onClose && <button className="btn-icon" data-variant="ghost" onClick={onClose} style={{width:24,height:24}}><I.close size={12}/></button>}
    </div>
  );
}

/* ---------------- Sheet (bottom) ---------------- */
function Sheet({ open, onClose, children, title, actions }) {
  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose}/>
      <div className="sheet">
        <div className="sheet-handle"/>
        {title && (
          <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="t-h3">{title}</div>
            <button className="btn-icon" data-variant="ghost" onClick={onClose}><I.close size={16}/></button>
          </div>
        )}
        <div style={{ padding: '0 16px 16px', overflow: 'auto' }}>{children}</div>
        {actions && <div style={{ padding: '12px 16px', borderTop: '1px solid var(--c-divider)', display: 'flex', gap: 8 }}>{actions}</div>}
      </div>
    </>
  );
}

/* ---------------- Stat card ---------------- */
function StatCard({ label, value, delta, comparison, spark, sparkColor, loading, error, onClick }) {
  return (
    <Card padding={12} onClick={onClick}>
      <div className="t-xs t-muted" style={{textTransform:'uppercase', letterSpacing:'0.04em', fontWeight:500}}>{label}</div>
      {loading ? <Skel w="60%" h={24} style={{marginTop:8}}/>
       : error ? <div className="t-sm" style={{color:'var(--c-danger)'}}>Error</div>
       : <>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginTop:4,gap:8}}>
          <div className="t-h2 t-num" style={{letterSpacing:'-0.02em'}}>{value}</div>
          {spark && <div style={{color: sparkColor || 'var(--c-chartA)'}}><Sparkline data={spark} width={52} height={22} filled/></div>}
        </div>
        <div className="row gap-1" style={{marginTop:4}}>
          {delta != null && (
            <span className={delta >= 0 ? 'pos' : 'neg'} style={{fontSize:'var(--t-xs)',fontWeight:600}}>
              {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(2)}%
            </span>
          )}
          {comparison && <span className="t-xs t-subtle">{comparison}</span>}
        </div>
       </>}
    </Card>
  );
}

/* ---------------- Chart primitives ---------------- */
function LineChart({ data, height = 140, series, yLabels, annotations }) {
  // data = [{x, [seriesKey]: value, ...}]
  const w = 320, pad = { l: 30, r: 10, t: 10, b: 20 };
  const inner = { w: w - pad.l - pad.r, h: height - pad.t - pad.b };
  const allVals = data.flatMap(d => series.map(s => d[s.key] || 0));
  const min = Math.min(...allVals, 0), max = Math.max(...allVals);
  const span = max - min || 1;
  const xs = (i) => pad.l + (i / (data.length - 1)) * inner.w;
  const ys = (v) => pad.t + inner.h - ((v - min) / span) * inner.h;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height}`} style={{display:'block'}} role="img" aria-label="Line chart">
      {/* gridlines */}
      {[0.25, 0.5, 0.75].map(t => (
        <line key={t} x1={pad.l} x2={w - pad.r} y1={pad.t + inner.h * t} y2={pad.t + inner.h * t}
          stroke="var(--c-divider)" strokeWidth="1"/>
      ))}
      <line x1={pad.l} x2={w - pad.r} y1={pad.t + inner.h} y2={pad.t + inner.h} stroke="var(--c-border)"/>

      {/* y labels */}
      {[0, 0.5, 1].map(t => {
        const v = min + (max - min) * (1 - t);
        return <text key={t} x={pad.l - 6} y={pad.t + inner.h * t + 3}
          fontSize="9" fill="var(--c-textSubtle)" textAnchor="end"
          fontFamily="var(--f-mono)">{v >= 1000 ? (v/1000).toFixed(1)+'k' : v.toFixed(0)}</text>;
      })}

      {/* x labels (sparse) */}
      {data.map((d, i) => (i % Math.ceil(data.length/5) === 0) && (
        <text key={i} x={xs(i)} y={height - 5} fontSize="9" fill="var(--c-textSubtle)" textAnchor="middle">{d.x}</text>
      ))}

      {/* series */}
      {series.map((s, si) => {
        const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xs(i)} ${ys(d[s.key] || 0)}`).join(' ');
        const area = `${path} L${xs(data.length-1)} ${pad.t+inner.h} L${xs(0)} ${pad.t+inner.h} Z`;
        const color = s.color || `var(--c-chart${String.fromCharCode(65 + si)})`;
        return (
          <g key={s.key} opacity={s.muted ? 0.25 : 1}>
            {s.area && <path d={area} fill={color} opacity="0.14"/>}
            <path d={path} stroke={color} strokeWidth={s.muted ? 1.2 : 1.8} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        );
      })}

      {/* annotation line */}
      {annotations?.map((a, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w-pad.r} y1={ys(a.value)} y2={ys(a.value)}
            stroke="var(--c-warning)" strokeWidth="1" strokeDasharray="3 3"/>
          <text x={w-pad.r} y={ys(a.value) - 3} fontSize="9" fill="var(--c-warning)" textAnchor="end">{a.label}</text>
        </g>
      ))}
    </svg>
  );
}

function BarChart({ data, keyName, valueName, height = 120 }) {
  const w = 320, pad = { l: 26, r: 8, t: 8, b: 18 };
  const inner = { w: w - pad.l - pad.r, h: height - pad.t - pad.b };
  const max = Math.max(...data.map(d => d[valueName]));
  const bw = inner.w / data.length - 4;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height}`} style={{display:'block'}}>
      {[0, 0.5, 1].map(t => (
        <line key={t} x1={pad.l} x2={w-pad.r} y1={pad.t + inner.h * t} y2={pad.t + inner.h * t} stroke="var(--c-divider)"/>
      ))}
      {data.map((d, i) => {
        const v = d[valueName];
        const h = (v / max) * inner.h;
        const x = pad.l + i * (inner.w / data.length) + 2;
        const y = pad.t + inner.h - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={h} rx="2"
              fill={d.color || (v >= 0 ? 'var(--c-chartA)' : 'var(--c-chartD)')}/>
            <text x={x + bw/2} y={height - 4} fontSize="9" fill="var(--c-textSubtle)" textAnchor="middle">{d[keyName]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ data, size = 100, inner = 32 }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = size / 2, cx = size / 2, cy = size / 2;
  let acc = 0;
  const arcs = data.map((d, i) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += d.value;
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
    const x3 = cx + inner * Math.cos(end),   y3 = cy + inner * Math.sin(end);
    const x4 = cx + inner * Math.cos(start), y4 = cy + inner * Math.sin(start);
    const color = d.color || `var(--c-chart${String.fromCharCode(65 + i)})`;
    return <path key={i} d={`M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`} fill={color}/>;
  });
  return <svg width={size} height={size}>{arcs}</svg>;
}

Object.assign(window, {
  Button, Spinner, Field, Input, Switch, Checkbox, Radio, Badge, Avatar, AvatarGroup,
  Progress, CircularProgress, Skel, Sparkline, Card, Segmented, Tabs, Toast, Sheet, StatCard,
  LineChart, BarChart, DonutChart
});
