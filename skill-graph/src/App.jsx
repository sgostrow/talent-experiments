import { useState, useEffect, useCallback, useReducer } from 'react';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Settings,
  Plus,
  X,
  Trash2,
  AlertCircle,
  Save,
  RotateCcw,
} from 'lucide-react';

import RadarChartComponent, { TeamOverviewRadar } from './components/RadarChartComponent';
import RatingSliders from './components/RatingSliders';
import SkillHeatmap from './components/SkillHeatmap';
import NudgeCards from './components/NudgeCards';

// ─── Seed Data ─────────────────────────────────────────────────────────────────

const DEFAULT_SKILLS = [
  'Relational Intelligence',
  'Communication & Influence',
  'Precision & Rigor',
  'Systems & Strategy',
  'Execution & Coordination',
  'AI Fluency',
  'Sense-Making Under Ambiguity',
  'Domain Expertise & Craft',
];

const SEED_DATA = {
  teamName: 'Product Design Team',
  skills: DEFAULT_SKILLS,
  members: [
    {
      id: 'seed-1',
      name: 'Maya Chen',
      role: 'Senior Designer',
      managerRatings: [4, 5, 3, 4, 3, 3, 4, 5],
      selfRatings: [4, 4, 3, 5, 2, 4, 5, 5],
    },
    {
      id: 'seed-2',
      name: 'Jordan Rivera',
      role: 'Design Engineer',
      managerRatings: [3, 3, 5, 3, 5, 5, 3, 4],
      selfRatings: [3, 3, 5, 4, 5, 5, 4, 4],
    },
    {
      id: 'seed-3',
      name: 'Priya Nair',
      role: 'Content Strategist',
      managerRatings: [5, 4, 4, 4, 4, 2, 3, 3],
      selfRatings: [5, 5, 4, 5, 3, 3, 5, 4],
    },
    {
      id: 'seed-4',
      name: 'Sam Okafor',
      role: 'Research Lead',
      managerRatings: [4, 3, 5, 5, 3, 4, 5, 4],
      selfRatings: [3, 3, 4, 5, 3, 5, 5, 5],
    },
  ],
  tasks: [
    {
      id: 'task-1',
      name: 'Q2 Strategy Deck',
      description: 'Build the Q2 strategic presentation for leadership',
      skillTags: ['Communication & Influence', 'Systems & Strategy'],
    },
    {
      id: 'task-2',
      name: 'Component Library Audit',
      description: 'Review and standardise the design system components',
      skillTags: ['Precision & Rigor', 'Execution & Coordination'],
    },
    {
      id: 'task-3',
      name: 'AI Tool Evaluation',
      description: 'Evaluate AI-assisted design and research tools',
      skillTags: ['AI Fluency', 'Domain Expertise & Craft'],
    },
  ],
  dismissedInsights: [],
};

// ─── Insight generation ────────────────────────────────────────────────────────

function generateInsights(members, skills, tasks) {
  const insights = [];
  const taskSkillSet = new Set(tasks.flatMap(t => t.skillTags));

  members.forEach(member => {
    skills.forEach((skill, i) => {
      const self = member.selfRatings[i] ?? 0;
      const mgr = member.managerRatings[i] ?? 0;

      // HIGH SELF / LOW TASK — only when tasks are entered
      if (tasks.length > 0 && self >= 4 && !taskSkillSet.has(skill)) {
        insights.push({
          id: `${member.id}-${i}-hst`,
          type: 'HIGH_SELF_LOW_TASK',
          memberId: member.id,
          memberName: member.name,
          skill,
          selfRating: self,
          managerRating: mgr,
        });
      }

      // SELF > MANAGER (threshold 1.5+)
      if (self - mgr >= 1.5) {
        insights.push({
          id: `${member.id}-${i}-som`,
          type: 'SELF_OVER_MANAGER',
          memberId: member.id,
          memberName: member.name,
          skill,
          selfRating: self,
          managerRating: mgr,
        });
      }
    });

    // SINGLETON: skill rated 4+ in only one person (using self ratings)
    skills.forEach((skill, i) => {
      const highRaters = members.filter(m => (m.selfRatings[i] ?? 0) >= 4);
      if (highRaters.length === 1 && highRaters[0].id === member.id) {
        const self = member.selfRatings[i] ?? 0;
        insights.push({
          id: `${member.id}-${i}-sing`,
          type: 'SINGLETON',
          memberId: member.id,
          memberName: member.name,
          skill,
          selfRating: self,
          managerRating: member.managerRatings[i] ?? 0,
        });
      }
    });
  });

  // Deduplicate by id
  const seen = new Set();
  return insights.filter(i => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });
}

// ─── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return { ...SEED_DATA };
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.member] };
    case 'UPDATE_MEMBER':
      return { ...state, members: state.members.map(m => m.id === action.member.id ? action.member : m) };
    case 'DELETE_MEMBER':
      return { ...state, members: state.members.filter(m => m.id !== action.memberId) };
    case 'UPDATE_MANAGER_RATING': {
      const members = state.members.map(m => {
        if (m.id !== action.memberId) return m;
        const r = [...m.managerRatings];
        r[action.skillIdx] = action.val;
        return { ...m, managerRatings: r };
      });
      return { ...state, members };
    }
    case 'UPDATE_SELF_RATING': {
      const members = state.members.map(m => {
        if (m.id !== action.memberId) return m;
        const r = [...m.selfRatings];
        r[action.skillIdx] = action.val;
        return { ...m, selfRatings: r };
      });
      return { ...state, members };
    }
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.taskId) };
    case 'DISMISS_INSIGHT':
      return { ...state, dismissedInsights: [...state.dismissedInsights, action.id] };
    case 'UPDATE_SKILLS_AND_TEAM': {
      const newLen = action.skills.length;
      const members = state.members.map(m => ({
        ...m,
        managerRatings: Array.from({ length: newLen }, (_, i) => m.managerRatings[i] ?? 3),
        selfRatings: Array.from({ length: newLen }, (_, i) => m.selfRatings[i] ?? 3),
      }));
      return { ...state, skills: action.skills, teamName: action.teamName, members };
    }
    default:
      return state;
  }
}

// ─── Utility helpers ───────────────────────────────────────────────────────────

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadInitialState() {
  try {
    const saved = localStorage.getItem('team-skill-graph');
    if (saved) return JSON.parse(saved);
  } catch (_) { /* ignore */ }
  return SEED_DATA;
}

// ─── Shared UI primitives ──────────────────────────────────────────────────────

function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style: extra = {} }) {
  const sizes = { sm: '5px 10px', md: '8px 14px', lg: '10px 18px' };
  const fontSizes = { sm: '12px', md: '13px', lg: '14px' };
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    border: 'none', borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit', fontWeight: 600,
    padding: sizes[size], fontSize: fontSizes[size],
    transition: 'background 150ms ease, opacity 150ms ease',
    opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary: { background: '#5B5BD6', color: 'white' },
    secondary: { background: '#F3F4F6', color: '#374151' },
    danger: { background: '#FEE2E2', color: '#B91C1C' },
    ghost: { background: 'transparent', color: '#6B7280' },
    outline: { background: 'white', color: '#374151', border: '1px solid #E5E7EB' },
  };
  const hover = {
    primary: '#4F4FC4', secondary: '#E5E7EB', danger: '#FECACA',
    ghost: '#F3F4F6', outline: '#F9FAFB',
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...extra }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = hover[variant]; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = variants[variant].background || 'transparent'; }}
    >
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px',
      }}
    >
      <div style={{
        background: 'white', borderRadius: '16px', width: '100%', maxWidth: width,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: 'white', zIndex: 1,
          borderRadius: '16px 16px 0 0',
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: '#F3F4F6', border: 'none', borderRadius: '8px',
            cursor: 'pointer', padding: '6px', display: 'flex', color: '#6B7280',
            transition: 'background 150ms ease',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
            onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{label}</label>}
      <input
        type="text" value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '8px',
          fontSize: '14px', fontFamily: 'inherit', color: '#111827',
          background: 'white', outline: 'none', width: '100%', boxSizing: 'border-box',
          transition: 'border-color 150ms ease',
        }}
        onFocus={e => e.currentTarget.style.borderColor = '#5B5BD6'}
        onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
      />
    </div>
  );
}

// ─── Dashboard View ────────────────────────────────────────────────────────────

function DashboardView({ state, dispatch }) {
  const insights = generateInsights(state.members, state.skills, state.tasks);
  const activeInsights = insights.filter(i => !state.dismissedInsights.includes(i.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: '#111827' }}>
          {state.teamName}
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
          {state.members.length} member{state.members.length !== 1 ? 's' : ''} · {state.skills.length} skill dimensions · {state.tasks.length} tasks
        </p>
      </div>

      {/* Team Overview — holistic radar, moved to top */}
      {state.members.length > 0 && (
        <TeamOverviewRadar skills={state.skills} members={state.members} />
      )}

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Team Members', value: state.members.length, color: '#5B5BD6' },
          { label: 'Active Tasks', value: state.tasks.length, color: '#0EA5E9' },
          { label: 'Strength Nudges', value: activeInsights.length, color: '#F59E0B' },
          { label: 'Skill Dimensions', value: state.skills.length, color: '#059669' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Nudge cards */}
      <NudgeCards
        insights={insights}
        dismissed={state.dismissedInsights}
        onDismiss={id => dispatch({ type: 'DISMISS_INSIGHT', id })}
      />

      {/* Heatmap */}
      {state.members.length > 0 && (
        <SkillHeatmap skills={state.skills} members={state.members} />
      )}

      {state.members.length === 0 && (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
            Go to Team Members to add people and start mapping skills.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Member Form Modal ─────────────────────────────────────────────────────────

function MemberFormModal({ member, onSave, onClose }) {
  const [name, setName] = useState(member?.name ?? '');
  const [role, setRole] = useState(member?.role ?? '');
  const valid = name.trim().length > 0;
  return (
    <Modal title={member ? 'Edit Team Member' : 'Add Team Member'} onClose={onClose} width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextInput label="Name" value={name} onChange={setName} placeholder="e.g. Alex Kim" />
        <TextInput label="Role" value={role} onChange={setRole} placeholder="e.g. Product Designer" />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn disabled={!valid} onClick={() => valid && onSave({ name: name.trim(), role: role.trim() })}>
            <Save size={14} /> {member ? 'Save Changes' : 'Add Member'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── Team Members View ─────────────────────────────────────────────────────────

function TeamMembersView({ state, dispatch }) {
  const [selectedId, setSelectedId] = useState(state.members[0]?.id ?? null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const selected = state.members.find(m => m.id === selectedId);

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* Member list */}
      <div style={{ width: '240px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px',
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Team</h2>
          <Btn size="sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add</Btn>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {state.members.map(m => (
            <div
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              style={{
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                background: selectedId === m.id ? '#EEF2FF' : 'white',
                border: `1px solid ${selectedId === m.id ? '#A5B4FC' : '#E5E7EB'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 150ms ease',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{m.name}</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>{m.role}</div>
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                <IconBtn
                  onClick={e => { e.stopPropagation(); setEditing(m); }}
                  hoverColor="#5B5BD6" hoverBg="#EEF2FF"
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </IconBtn>
                <IconBtn
                  onClick={e => { e.stopPropagation(); setConfirmDel(m); }}
                  hoverColor="#EF4444" hoverBg="#FEF2F2"
                >
                  <Trash2 size={12} />
                </IconBtn>
              </div>
            </div>
          ))}
          {state.members.length === 0 && (
            <div style={{
              padding: '20px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px',
              background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px',
            }}>
              No members yet
            </div>
          )}
        </div>
      </div>

      {/* Skill assessment panel */}
      {selected ? (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px',
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                {selected.name}
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>{selected.role}</p>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 280px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Skill Radar</p>
                <RadarChartComponent
                  skills={state.skills}
                  managerRatings={selected.managerRatings}
                  selfRatings={selected.selfRatings}
                />
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '10px' }}>
                  <LegendItem color="#5B5BD6" dashed={false} label="Manager rating" />
                  <LegendItem color="#0EA5E9" dashed label="Self-assessment" />
                </div>
              </div>
              <div style={{ flex: '1 1 240px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Adjust Ratings</p>
                <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#9CA3AF' }}>
                  Drag sliders to update in real-time
                </p>
                <RatingSliders
                  skills={state.skills}
                  managerRatings={selected.managerRatings}
                  selfRatings={selected.selfRatings}
                  onManagerChange={(i, v) => dispatch({ type: 'UPDATE_MANAGER_RATING', memberId: selected.id, skillIdx: i, val: v })}
                  onSelfChange={(i, v) => dispatch({ type: 'UPDATE_SELF_RATING', memberId: selected.id, skillIdx: i, val: v })}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
          <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Select a team member to view their profile</p>
        </div>
      )}

      {(showAdd || editing) && (
        <MemberFormModal
          member={editing}
          onSave={data => {
            if (editing) {
              dispatch({ type: 'UPDATE_MEMBER', member: { ...editing, ...data } });
            } else {
              const nm = {
                id: genId(), ...data,
                managerRatings: Array(state.skills.length).fill(3),
                selfRatings: Array(state.skills.length).fill(3),
              };
              dispatch({ type: 'ADD_MEMBER', member: nm });
              setSelectedId(nm.id);
            }
            setShowAdd(false);
            setEditing(null);
          }}
          onClose={() => { setShowAdd(false); setEditing(null); }}
        />
      )}

      {confirmDel && (
        <Modal title="Remove Team Member" onClose={() => setConfirmDel(null)} width={400}>
          <p style={{ margin: '0 0 20px', color: '#6B7280', fontSize: '14px' }}>
            Remove <strong>{confirmDel.name}</strong>? All ratings will be deleted.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Btn variant="outline" onClick={() => setConfirmDel(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => {
              dispatch({ type: 'DELETE_MEMBER', memberId: confirmDel.id });
              if (selectedId === confirmDel.id) {
                const rest = state.members.filter(m => m.id !== confirmDel.id);
                setSelectedId(rest[0]?.id ?? null);
              }
              setConfirmDel(null);
            }}>
              <Trash2 size={14} /> Remove
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Tasks View ────────────────────────────────────────────────────────────────

function TaskFormModal({ task, skills, onSave, onClose }) {
  const [name, setName] = useState(task?.name ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [selected, setSelected] = useState(task?.skillTags ?? []);

  const toggle = s => setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const valid = name.trim().length > 0;

  return (
    <Modal title={task ? 'Edit Task' : 'Add Task'} onClose={onClose} width={480}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextInput label="Task Name" value={name} onChange={setName} placeholder="e.g. Q2 Strategy Deck" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Description (optional)</label>
          <textarea
            value={description} rows={2}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description..."
            style={{
              padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '8px',
              fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#5B5BD6'}
            onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
          />
        </div>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
            Primary Skills
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {skills.map(s => (
              <button key={s} onClick={() => toggle(s)} style={{
                padding: '4px 10px', borderRadius: '20px', fontFamily: 'inherit',
                border: `1px solid ${selected.includes(s) ? '#5B5BD6' : '#E5E7EB'}`,
                background: selected.includes(s) ? '#EEF2FF' : 'white',
                color: selected.includes(s) ? '#4338CA' : '#6B7280',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 150ms ease',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn disabled={!valid} onClick={() => valid && onSave({ name: name.trim(), description: description.trim(), skillTags: selected })}>
            <Save size={14} /> {task ? 'Save Changes' : 'Add Task'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function TasksView({ state, dispatch }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#111827' }}>Tasks & Projects</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
            Tag tasks with skills to surface High Self / Low Task insights
          </p>
        </div>
        <Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Add Task</Btn>
      </div>

      {state.tasks.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
          <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#374151' }}>No tasks yet</p>
          <p style={{ margin: '0 0 16px', color: '#6B7280', fontSize: '13px' }}>
            Add current or upcoming tasks to enable skill-gap analysis
          </p>
          <Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Add Task</Btn>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {state.tasks.map(task => (
            <div key={task.id} style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px',
              display: 'flex', alignItems: 'flex-start', gap: '16px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>{task.name}</div>
                {task.description && (
                  <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{task.description}</div>
                )}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {task.skillTags.map(tag => (
                    <span key={tag} style={{
                      padding: '2px 8px', background: '#EEF2FF', color: '#4338CA',
                      borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                    }}>{tag}</span>
                  ))}
                  {task.skillTags.length === 0 && (
                    <span style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic' }}>No skills tagged</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <IconBtn onClick={() => setEditing(task)} hoverColor="#5B5BD6" hoverBg="#EEF2FF">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </IconBtn>
                <IconBtn onClick={() => setConfirmDel(task)} hoverColor="#EF4444" hoverBg="#FEF2F2">
                  <Trash2 size={14} />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAdd || editing) && (
        <TaskFormModal
          task={editing} skills={state.skills}
          onSave={data => {
            if (editing) dispatch({ type: 'UPDATE_TASK', task: { ...editing, ...data } });
            else dispatch({ type: 'ADD_TASK', task: { id: genId(), ...data } });
            setShowAdd(false); setEditing(null);
          }}
          onClose={() => { setShowAdd(false); setEditing(null); }}
        />
      )}

      {confirmDel && (
        <Modal title="Delete Task" onClose={() => setConfirmDel(null)} width={380}>
          <p style={{ margin: '0 0 20px', color: '#6B7280', fontSize: '14px' }}>
            Delete <strong>"{confirmDel.name}"</strong>? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Btn variant="outline" onClick={() => setConfirmDel(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => {
              dispatch({ type: 'DELETE_TASK', taskId: confirmDel.id });
              setConfirmDel(null);
            }}>
              <Trash2 size={14} /> Delete
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Settings View ─────────────────────────────────────────────────────────────

function SettingsView({ state, dispatch }) {
  const [teamName, setTeamName] = useState(state.teamName);
  const [skills, setSkills] = useState([...state.skills]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmSkillRemove, setConfirmSkillRemove] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [saved, setSaved] = useState(false);

  const canAdd = skills.length < 10;

  const removeSkill = idx => {
    const hasNonDefault = state.members.some(m => {
      const mr = m.managerRatings[idx];
      const sr = m.selfRatings[idx];
      return (mr !== undefined && mr !== 3) || (sr !== undefined && sr !== 3);
    });
    if (hasNonDefault) {
      setConfirmSkillRemove(idx);
    } else {
      setSkills(p => p.filter((_, i) => i !== idx));
    }
  };

  const addSkill = () => {
    const n = newSkill.trim();
    if (n && skills.length < 10) { setSkills(p => [...p, n]); setNewSkill(''); }
  };

  const save = () => {
    dispatch({ type: 'UPDATE_SKILLS_AND_TEAM', skills, teamName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 700, color: '#111827' }}>Settings</h1>

      <Card title="Team" style={{ marginBottom: '16px' }}>
        <TextInput label="Team Name" value={teamName} onChange={setTeamName} placeholder="e.g. Product Design Team" />
      </Card>

      <Card title={`Skill Dimensions (${skills.length}/10)`} style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {skills.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text" value={s}
                onChange={e => setSkills(p => p.map((x, j) => j === i ? e.target.value : x))}
                style={{
                  flex: 1, padding: '7px 10px', border: '1px solid #E5E7EB', borderRadius: '7px',
                  fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#5B5BD6'}
                onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
              />
              {skills.length > 3 && (
                <IconBtn onClick={() => removeSkill(i)} hoverColor="#EF4444" hoverBg="#FEF2F2">
                  <X size={14} />
                </IconBtn>
              )}
            </div>
          ))}
        </div>
        {canAdd && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text" value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              placeholder="New skill dimension..."
              onKeyDown={e => e.key === 'Enter' && addSkill()}
              style={{
                flex: 1, padding: '7px 10px', border: '1px dashed #D1D5DB', borderRadius: '7px',
                fontSize: '13px', fontFamily: 'inherit', outline: 'none', background: '#FAFAFA',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#5B5BD6'}
              onBlur={e => e.currentTarget.style.borderColor = '#D1D5DB'}
            />
            <Btn size="sm" variant="secondary" onClick={addSkill} disabled={!newSkill.trim()}>
              <Plus size={14} /> Add
            </Btn>
          </div>
        )}
      </Card>

      <div style={{ marginBottom: '16px' }}>
        <Btn onClick={save} style={saved ? { background: '#059669' } : {}}>
          {saved ? '✓ Saved' : <><Save size={14} /> Save Changes</>}
        </Btn>
      </div>

      <div style={{
        background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '20px',
      }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600, color: '#991B1B' }}>Danger Zone</h3>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#B91C1C' }}>
          Reset all team data, ratings, and tasks.
        </p>
        <Btn variant="danger" onClick={() => setConfirmReset(true)}>
          <RotateCcw size={14} /> Reset All Data
        </Btn>
      </div>

      {confirmReset && (
        <Modal title="Reset All Data" onClose={() => setConfirmReset(false)} width={400}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <AlertCircle size={20} color="#EF4444" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, color: '#6B7280', fontSize: '14px', lineHeight: '1.5' }}>
              This will permanently delete all team members, ratings, and tasks, and restore the seed data. This cannot be undone.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Btn variant="outline" onClick={() => setConfirmReset(false)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => { dispatch({ type: 'RESET' }); setConfirmReset(false); }}>
              <RotateCcw size={14} /> Yes, Reset
            </Btn>
          </div>
        </Modal>
      )}

      {confirmSkillRemove !== null && (
        <Modal title="Remove Skill Dimension" onClose={() => setConfirmSkillRemove(null)} width={400}>
          <p style={{ margin: '0 0 20px', color: '#6B7280', fontSize: '14px' }}>
            Team members have custom ratings for <strong>"{skills[confirmSkillRemove]}"</strong>. Removing it will discard those ratings.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Btn variant="outline" onClick={() => setConfirmSkillRemove(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => {
              setSkills(p => p.filter((_, i) => i !== confirmSkillRemove));
              setConfirmSkillRemove(null);
            }}>Remove</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Small shared pieces ───────────────────────────────────────────────────────

function IconBtn({ children, onClick, hoverColor = '#6B7280', hoverBg = '#F3F4F6' }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#9CA3AF', padding: '4px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', transition: 'color 150ms ease, background 150ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = hoverColor; e.currentTarget.style.background = hoverBg; }}
      onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'none'; }}
    >
      {children}
    </button>
  );
}

function Card({ title, children, style: extra = {} }) {
  return (
    <div style={{
      background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', ...extra,
    }}>
      {title && <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: '#111827' }}>{title}</h3>}
      {children}
    </div>
  );
}

function LegendItem({ color, dashed, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{
        width: '20px', height: '2px',
        background: dashed ? 'transparent' : color,
        borderTop: dashed ? `2px dashed ${color}` : 'none',
      }} />
      <span style={{ fontSize: '11px', color: '#6B7280' }}>{label}</span>
    </div>
  );
}

// ─── Landing Page ──────────────────────────────────────────────────────────────

function LandingPage({ onEnter }) {
  const steps = [
    {
      num: '1',
      title: 'Add your team',
      body: 'Go to Team Members to add people, assign roles, and rate each person across skill dimensions — both from your perspective as manager and their own self-assessment.',
    },
    {
      num: '2',
      title: 'Log active tasks',
      body: 'In Tasks, add the work your team is currently doing and tag each task to the skills it draws on. This lets the tool see how strengths map to actual workload.',
    },
    {
      num: '3',
      title: 'Read the insights',
      body: 'The Dashboard shows a skill heatmap, individual radar charts comparing manager vs. self ratings, and auto-generated nudges — like when someone rates themselves highly in a skill that no current task uses.',
    },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#FAFAFA',
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div style={{ maxWidth: '560px', width: '100%' }}>
        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            width: '40px', height: '40px', flexShrink: 0,
            background: 'linear-gradient(135deg, #5B5BD6 0%, #0EA5E9 100%)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Skill Graph</div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>Team talent dashboard</div>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ margin: '0 0 12px', fontSize: '26px', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
          See how your team's strengths map to your work
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: '15px', color: '#4B5563', lineHeight: 1.65 }}>
          Team Skill Graph helps you ensure all your team members are applying their strengths where it matters most by visualizing skill distributions, tracking alignment between self- and manager assessments, and surfacing where top skills are — or aren't — being used.
        </p>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {steps.map(({ num, title, body }) => (
            <div key={num} style={{
              display: 'flex', gap: '16px', background: 'white',
              border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px',
            }}>
              <div style={{
                width: '28px', height: '28px', flexShrink: 0,
                background: '#EEF2FF', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700, color: '#5B5BD6',
              }}>{num}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6 }}>{body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mock-data callout */}
        <div style={{
          background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px',
          padding: '16px 20px', marginBottom: '32px',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
        }}>
          <AlertCircle size={16} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '13px', color: '#92400E', lineHeight: 1.6 }}>
            <strong>The data you see is sample data.</strong> Everything is editable — add your real team members, adjust skill dimensions in Settings, and log your actual tasks. Your changes are saved automatically in this browser.
          </p>
        </div>

        {/* CTA */}
        <Btn onClick={onEnter} size="lg" style={{ width: '100%', justifyContent: 'center' }}>
          Get started
        </Btn>
      </div>
    </div>
  );
}

// ─── Navigation config ─────────────────────────────────────────────────────────

const NAV = [
  { id: 'dashboard', label: 'Dashboard', short: 'Dashboard', Icon: LayoutDashboard },
  { id: 'members', label: 'Team Members', short: 'Team', Icon: Users },
  { id: 'tasks', label: 'Tasks', short: 'Tasks', Icon: CheckSquare },
  { id: 'settings', label: 'Settings', short: 'Settings', Icon: Settings },
];

// ─── Root App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [appState, dispatch] = useReducer(reducer, undefined, loadInitialState);
  const [view, setView] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLanding, setShowLanding] = useState(
    () => localStorage.getItem('skill-graph-seen') !== 'true'
  );

  const handleEnter = () => {
    localStorage.setItem('skill-graph-seen', 'true');
    setShowLanding(false);
  };

  // Persist state — must be before any early returns (Rules of Hooks)
  useEffect(() => {
    try { localStorage.setItem('team-skill-graph', JSON.stringify(appState)); } catch (_) {}
  }, [appState]);

  // Track viewport
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  if (showLanding) return <LandingPage onEnter={handleEnter} />;

  const renderView = () => {
    const props = { state: appState, dispatch };
    switch (view) {
      case 'dashboard': return <DashboardView {...props} />;
      case 'members': return <TeamMembersView {...props} />;
      case 'tasks': return <TasksView {...props} />;
      case 'settings': return <SettingsView {...props} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAFA', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <nav style={{
          width: '216px', flexShrink: 0, background: 'white', borderRight: '1px solid #E5E7EB',
          display: 'flex', flexDirection: 'column', padding: '24px 12px',
          height: '100vh', position: 'sticky', top: 0, overflowY: 'auto',
        }}>
          <div style={{ padding: '0 8px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{
                width: '28px', height: '28px',
                background: 'linear-gradient(135deg, #5B5BD6 0%, #0EA5E9 100%)',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Skill Graph</span>
            </div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', paddingLeft: '36px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {appState.teamName}
            </div>
          </div>
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setView(id)} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px',
              borderRadius: '8px', border: 'none', cursor: 'pointer', width: '100%',
              textAlign: 'left', fontFamily: 'inherit', marginBottom: '2px',
              background: view === id ? '#EEF2FF' : 'transparent',
              color: view === id ? '#5B5BD6' : '#6B7280',
              fontSize: '13px', fontWeight: view === id ? 600 : 500,
              transition: 'all 150ms ease',
            }}
              onMouseEnter={e => { if (view !== id) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#374151'; } }}
              onMouseLeave={e => { if (view !== id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; } }}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
      )}

      {/* Main content */}
      <main style={{
        flex: 1, padding: isMobile ? '20px 16px 80px' : '32px',
        overflow: 'auto', maxWidth: isMobile ? undefined : '1100px',
      }}>
        {renderView()}
      </main>

      {/* Mobile bottom bar */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'white', borderTop: '1px solid #E5E7EB',
          display: 'flex', zIndex: 100,
        }}>
          {NAV.map(({ id, short, Icon }) => (
            <button key={id} onClick={() => setView(id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '3px', padding: '10px 4px', border: 'none', background: 'transparent',
              color: view === id ? '#5B5BD6' : '#9CA3AF', fontFamily: 'inherit',
              fontSize: '10px', fontWeight: view === id ? 600 : 400, cursor: 'pointer',
            }}>
              <Icon size={18} />{short}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
