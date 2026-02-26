import { X, Lightbulb, AlertTriangle, Zap, Star } from 'lucide-react';

const TASK_SUGGESTIONS = {
  'Relational Intelligence': ['Cross-functional facilitation', 'Stakeholder alignment sessions', 'Conflict resolution support'],
  'Communication & Influence': ['Executive briefings', 'Proposal writing', 'Team all-hands facilitation'],
  'Precision & Rigor': ['Process audits', 'Quality reviews', 'Documentation ownership'],
  'Systems & Strategy': ['Roadmap planning', 'Org design work', 'Strategic analysis'],
  'Execution & Coordination': ['Project lead role', 'Launch coordination', 'Dependencies management'],
  'AI Fluency': ['AI tool evaluation', 'Prompt engineering', 'Automation initiatives'],
  'Sense-Making Under Ambiguity': ['Research synthesis', 'Exploratory problem-solving', 'Early-stage scoping'],
  'Domain Expertise & Craft': ['Mentoring others', 'Standard-setting', 'Deep technical reviews'],
};

function getSuggestions(skill) {
  for (const [key, suggestions] of Object.entries(TASK_SUGGESTIONS)) {
    if (skill.toLowerCase().includes(key.toLowerCase().split(' ')[0].toLowerCase()) ||
        key.toLowerCase().includes(skill.toLowerCase().split(' ')[0].toLowerCase())) {
      return suggestions.slice(0, 2);
    }
  }
  return ['Lead a cross-functional initiative', 'Mentor a junior team member in this area'];
}

function SignalBadge({ type }) {
  const configs = {
    'HIGH_SELF_LOW_TASK': {
      label: 'High Self / Low Task',
      color: '#F59E0B',
      bg: '#FFFBEB',
      icon: <Zap size={12} />,
    },
    'SELF_OVER_MANAGER': {
      label: 'Self > Manager',
      color: '#8B5CF6',
      bg: '#F5F3FF',
      icon: <AlertTriangle size={12} />,
    },
    'SINGLETON': {
      label: 'Unique Asset',
      color: '#059669',
      bg: '#ECFDF5',
      icon: <Star size={12} />,
    },
  };
  const cfg = configs[type] || configs['SINGLETON'];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '20px',
      background: cfg.bg,
      color: cfg.color,
      fontSize: '11px',
      fontWeight: 600,
      border: `1px solid ${cfg.color}30`,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function NudgeCard({ insight, onDismiss }) {
  const suggestions = getSuggestions(insight.skill);

  const descriptions = {
    'HIGH_SELF_LOW_TASK': `${insight.memberName} rates themselves ${insight.selfRating}/5 on ${insight.skill}, but this skill rarely appears in current task assignments.`,
    'SELF_OVER_MANAGER': `${insight.memberName} rates themselves ${insight.selfRating}/5 on ${insight.skill} — ${(insight.selfRating - insight.managerRating).toFixed(1)} points higher than the manager's view (${insight.managerRating}/5). Potential blind spot worth exploring.`,
    'SINGLETON': `${insight.memberName} is the only team member with a high rating (${insight.selfRating}/5) in ${insight.skill}. A unique asset that could be over-relied on or under-leveraged.`,
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '16px',
      position: 'relative',
      borderLeft: '3px solid #F59E0B',
    }}>
      <button
        onClick={onDismiss}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#9CA3AF',
          padding: '2px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 150ms ease',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#6B7280'}
        onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
      >
        <X size={14} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingRight: '24px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: '#FFFBEB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Lightbulb size={16} color="#F59E0B" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              {insight.memberName} · {insight.skill}
            </span>
            <SignalBadge type={insight.type} />
          </div>
          <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>
            {descriptions[insight.type]}
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Try assigning:</span>
            {suggestions.map((s, i) => (
              <span key={i} style={{
                padding: '2px 10px',
                background: '#F3F4F6',
                borderRadius: '20px',
                fontSize: '12px',
                color: '#374151',
                fontWeight: 500,
              }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NudgeCards({ insights, dismissed, onDismiss }) {
  const active = insights.filter(i => !dismissed.includes(i.id));

  if (insights.length === 0) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827' }}>
          Strength Nudges
          {active.length > 0 && (
            <span style={{
              marginLeft: '8px',
              padding: '1px 7px',
              background: '#FEF3C7',
              color: '#92400E',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {active.length}
            </span>
          )}
        </h3>
        {dismissed.length > 0 && (
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
            {dismissed.length} dismissed
          </span>
        )}
      </div>

      {active.length === 0 ? (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          color: '#9CA3AF',
          fontSize: '14px',
        }}>
          All nudges dismissed. Add more team data to surface new insights.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {active.map(insight => (
            <NudgeCard key={insight.id} insight={insight} onDismiss={() => onDismiss(insight.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
