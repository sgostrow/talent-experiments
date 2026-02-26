export default function SkillHeatmap({ skills, members }) {
  if (!members.length) return null;

  // Compute average manager rating and average self rating per skill
  const skillStats = skills.map((skill, i) => {
    const managerVals = members.map(m => m.managerRatings[i] ?? 0).filter(v => v > 0);
    const selfVals = members.map(m => m.selfRatings[i] ?? 0).filter(v => v > 0);
    const avgManager = managerVals.length ? managerVals.reduce((a, b) => a + b, 0) / managerVals.length : 0;
    const avgSelf = selfVals.length ? selfVals.reduce((a, b) => a + b, 0) / selfVals.length : 0;
    const avg = (avgManager + avgSelf) / 2;
    return { skill, avgManager, avgSelf, avg, index: i };
  });

  const getColor = (val) => {
    if (val >= 4.5) return { bg: '#EEF2FF', text: '#4338CA', bar: '#5B5BD6' };
    if (val >= 3.5) return { bg: '#F0F9FF', text: '#0369A1', bar: '#0EA5E9' };
    if (val >= 2.5) return { bg: '#F0FDF4', text: '#15803D', bar: '#22C55E' };
    if (val >= 1.5) return { bg: '#FFFBEB', text: '#B45309', bar: '#F59E0B' };
    return { bg: '#FEF2F2', text: '#B91C1C', bar: '#EF4444' };
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '20px',
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: '#111827' }}>
        Team Skill Depth
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {skillStats
          .sort((a, b) => b.avg - a.avg)
          .map(({ skill, avgManager, avgSelf, avg }) => {
            const colors = getColor(avg);
            return (
              <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '180px',
                  minWidth: '180px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#374151',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {skill}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '50px', fontSize: '11px', color: '#6B7280' }}>Mgr</div>
                    <div style={{ flex: 1, background: '#F3F4F6', borderRadius: '4px', height: '6px' }}>
                      <div style={{
                        height: '6px',
                        borderRadius: '4px',
                        background: '#5B5BD6',
                        width: `${(avgManager / 5) * 100}%`,
                        transition: 'width 300ms ease',
                      }} />
                    </div>
                    <div style={{ width: '24px', fontSize: '12px', fontWeight: 600, color: '#5B5BD6', textAlign: 'right' }}>
                      {avgManager.toFixed(1)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '50px', fontSize: '11px', color: '#6B7280' }}>Self</div>
                    <div style={{ flex: 1, background: '#F3F4F6', borderRadius: '4px', height: '6px' }}>
                      <div style={{
                        height: '6px',
                        borderRadius: '4px',
                        background: '#0EA5E9',
                        width: `${(avgSelf / 5) * 100}%`,
                        transition: 'width 300ms ease',
                      }} />
                    </div>
                    <div style={{ width: '24px', fontSize: '12px', fontWeight: 600, color: '#0EA5E9', textAlign: 'right' }}>
                      {avgSelf.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: colors.bg,
                  color: colors.text,
                  fontSize: '12px',
                  fontWeight: 600,
                  minWidth: '40px',
                  textAlign: 'center',
                }}>
                  {avg.toFixed(1)}
                </div>
              </div>
            );
          })}
      </div>
      <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {[
          { label: 'Deep (4.5+)', bg: '#EEF2FF', text: '#4338CA' },
          { label: 'Strong (3.5–4.5)', bg: '#F0F9FF', text: '#0369A1' },
          { label: 'Solid (2.5–3.5)', bg: '#F0FDF4', text: '#15803D' },
          { label: 'Developing (1.5–2.5)', bg: '#FFFBEB', text: '#B45309' },
          { label: 'Gap (<1.5)', bg: '#FEF2F2', text: '#B91C1C' },
        ].map(({ label, bg, text }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: bg, border: `1px solid ${text}` }} />
            <span style={{ fontSize: '11px', color: '#6B7280' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
