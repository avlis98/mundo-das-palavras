import React from 'react';

export interface BarDatum {
  label: string;
  value: number; // 0..100
  subtitle?: string;
  color?: string;
}

interface SimpleBarChartProps {
  title: string;
  data: BarDatum[];
  emptyMessage?: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  title,
  data,
  emptyMessage = 'Ainda não há dados suficientes nesta categoria.',
}) => {
  return (
    <div className="card">
      <h3 style={{ margin: '0 0 14px', fontSize: '1.05rem' }}>{title}</h3>
      {data.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>{emptyMessage}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.map((item) => (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', fontWeight: 700, marginBottom: 4 }}>
                <span>{item.label}</span>
                <span>{item.subtitle ?? `${Math.round(item.value)}%`}</span>
              </div>
              <div className="progress-track" style={{ height: 12 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.max(4, Math.min(100, item.value))}%`,
                    background: item.color ?? 'var(--primary)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
