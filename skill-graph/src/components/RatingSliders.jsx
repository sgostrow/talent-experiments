export default function RatingSliders({ skills, managerRatings, selfRatings, onManagerChange, onSelfChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {skills.map((skill, i) => (
        <div key={skill} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{skill}</span>
          </div>

          {/* Manager rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: '#5B5BD6', fontWeight: 600, width: '52px', flexShrink: 0 }}>
              Mgr
            </span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={managerRatings[i] ?? 3}
              onChange={e => onManagerChange(i, Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: '#5B5BD6',
                cursor: 'pointer',
                height: '4px',
              }}
            />
            <span style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#5B5BD6',
              width: '20px',
              textAlign: 'center',
            }}>
              {managerRatings[i] ?? 3}
            </span>
          </div>

          {/* Self rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: '#0EA5E9', fontWeight: 600, width: '52px', flexShrink: 0 }}>
              Self
            </span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={selfRatings[i] ?? 3}
              onChange={e => onSelfChange(i, Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: '#0EA5E9',
                cursor: 'pointer',
                height: '4px',
              }}
            />
            <span style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#0EA5E9',
              width: '20px',
              textAlign: 'center',
            }}>
              {selfRatings[i] ?? 3}
            </span>
          </div>

          {/* Gap indicator */}
          {Math.abs((selfRatings[i] ?? 3) - (managerRatings[i] ?? 3)) >= 1.5 && (
            <div style={{
              fontSize: '11px',
              color: '#8B5CF6',
              background: '#F5F3FF',
              padding: '3px 8px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              width: 'fit-content',
              marginLeft: '62px',
            }}>
              ⚠ {(selfRatings[i] ?? 3) > (managerRatings[i] ?? 3) ? 'Self > Manager gap' : 'Manager > Self gap'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
