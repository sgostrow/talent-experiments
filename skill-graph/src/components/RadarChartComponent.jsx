import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        fontSize: '13px',
      }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
          {payload[0]?.payload?.skill}
        </p>
        {payload.map((entry, i) => (
          <p key={i} style={{ margin: '2px 0', color: entry.color }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomAngleAxis = (props) => {
  const { x, y, payload, cx, cy } = props;
  const dx = x - cx;
  const dy = y - cy;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  let textAnchor = 'middle';
  if (Math.abs(dx) > 10) {
    textAnchor = dx > 0 ? 'start' : 'end';
  }

  const words = payload.value.split(' & ').join('\n').split(' ').reduce((acc, word) => {
    const lastLine = acc[acc.length - 1];
    if (lastLine && lastLine.length + word.length < 16) {
      acc[acc.length - 1] = lastLine + ' ' + word;
    } else {
      acc.push(word);
    }
    return acc;
  }, []);

  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill="#6B7280"
      fontSize={11}
      fontFamily="Inter, sans-serif"
      fontWeight={500}
    >
      {words.map((w, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 14}>{w}</tspan>
      ))}
    </text>
  );
};

export default function RadarChartComponent({ skills, managerRatings, selfRatings, mini = false }) {
  const data = skills.map((skill, i) => ({
    skill: skill,
    Manager: managerRatings[i] ?? 0,
    Self: selfRatings[i] ?? 0,
  }));

  if (mini) {
    return (
      <ResponsiveContainer width="100%" height={160}>
        <RadarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="skill" tick={false} />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          <Radar
            name="Manager"
            dataKey="Manager"
            stroke="#5B5BD6"
            fill="#5B5BD6"
            fillOpacity={0.25}
            strokeWidth={1.5}
            animationDuration={300}
            animationEasing="ease"
          />
          <Radar
            name="Self"
            dataKey="Self"
            stroke="#0EA5E9"
            fill="#0EA5E9"
            fillOpacity={0.2}
            strokeWidth={1.5}
            strokeDasharray="4 2"
            animationDuration={300}
            animationEasing="ease"
          />
        </RadarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={340}>
      <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis dataKey="skill" tick={<CustomAngleAxis />} />
        <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          name="Manager"
          dataKey="Manager"
          stroke="#5B5BD6"
          fill="#5B5BD6"
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ r: 3, fill: '#5B5BD6' }}
          animationDuration={300}
          animationEasing="ease"
        />
        <Radar
          name="Self"
          dataKey="Self"
          stroke="#0EA5E9"
          fill="#0EA5E9"
          fillOpacity={0.2}
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={{ r: 3, fill: '#0EA5E9' }}
          animationDuration={300}
          animationEasing="ease"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
