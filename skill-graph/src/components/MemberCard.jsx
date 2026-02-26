import RadarChartComponent from './RadarChartComponent';
import { Edit2, Trash2 } from 'lucide-react';

export default function MemberCard({ member, skills, onEdit, onDelete, onSelect, selected }) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: 'white',
        border: `1px solid ${selected ? '#5B5BD6' : '#E5E7EB'}`,
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        boxShadow: selected ? '0 0 0 3px rgba(91,91,214,0.15)' : 'none',
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#C4B5FD';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#E5E7EB';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{member.name}</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{member.role}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 150ms ease, background 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#5B5BD6'; e.currentTarget.style.background = '#EEF2FF'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'none'; }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 150ms ease, background 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'none'; }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <RadarChartComponent
        skills={skills}
        managerRatings={member.managerRatings}
        selfRatings={member.selfRatings}
        mini={true}
      />

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '3px', background: '#5B5BD6', borderRadius: '2px' }} />
          <span style={{ fontSize: '11px', color: '#6B7280' }}>Manager</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '3px', background: '#0EA5E9', borderRadius: '2px', borderTop: '1px dashed #0EA5E9' }} />
          <span style={{ fontSize: '11px', color: '#6B7280' }}>Self</span>
        </div>
      </div>
    </div>
  );
}
