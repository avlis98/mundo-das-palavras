import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import { analyzeChildAdaptation } from '../adaptive/engine';
import { SimpleBarChart, type BarDatum } from '../components/SimpleBarChart';
import {
  exportChildBundle,
  importChildBundle,
} from '../services/db';
import type {
  AttemptLog,
  ChildProfile,
  ConfusionPair,
  DailyMission,
  ExportBundle,
  SkillMastery,
} from '../types';

interface ParentDashboardScreenProps {
  profile: ChildProfile;
  masteries: SkillMastery[];
  confusions: ConfusionPair[];
  attempts: AttemptLog[];
  missions: DailyMission[];
  onResetProfile: () => Promise<void>;
  onDeleteProfile: () => Promise<void>;
  onDataImported: (importedProfile: ChildProfile) => Promise<void>;
  onBack: () => void;
}

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  profile,
  masteries,
  confusions,
  attempts,
  missions,
  onResetProfile,
  onDeleteProfile,
  onDataImported,
  onBack,
}) => {
  const [confirmAction, setConfirmAction] = useState<'reset' | 'delete' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const adaptation = analyzeChildAdaptation(profile, masteries, confusions, attempts);

  const totalMinutesUsed = Math.round(
    attempts.reduce((sum, a) => sum + Math.min(a.responseMs, 120000), 0) / 60000
  );
  const activeDays = new Set(attempts.map((a) => a.date)).size;

  const now = Date.now();
  const weekAttempts = attempts.filter((a) => now - a.timestamp <= 7 * 86400000);
  const monthAttempts = attempts.filter((a) => now - a.timestamp <= 30 * 86400000);
  const weekAccuracy =
    weekAttempts.length > 0
      ? Math.round((weekAttempts.filter((a) => a.isCorrect).length / weekAttempts.length) * 100)
      : 0;
  const monthAccuracy =
    monthAttempts.length > 0
      ? Math.round((monthAttempts.filter((a) => a.isCorrect).length / monthAttempts.length) * 100)
      : 0;

  const buildCategoryChart = (cats: Array<{ key: string; label: string; color: string }>): BarDatum[] => {
    const result: BarDatum[] = [];
    for (const c of cats) {
      const items = masteries.filter((m) => m.category === c.key);
      if (items.length === 0) continue;
      const avg = items.reduce((s, m) => s + m.masteryScore, 0) / items.length;
      result.push({
        label: c.label,
        value: avg,
        subtitle: `${Math.round(avg)}%`,
        color: c.color,
      });
    }
    return result;
  };

  const readingChart = buildCategoryChart([
    { key: 'letter', label: 'Letras reconhecidas', color: '#4F46E5' },
    { key: 'phoneme', label: 'Sons e consciência fonológica', color: '#0EA5E9' },
    { key: 'syllable', label: 'Sílabas', color: '#10B981' },
    { key: 'word', label: 'Leitura de palavras', color: '#F59E0B' },
    { key: 'sentence', label: 'Leitura de frases', color: '#EC4899' },
    { key: 'story', label: 'Compreensão de histórias', color: '#8B5CF6' },
  ]);

  const writingChart = buildCategoryChart([
    { key: 'orthography', label: 'Ortografia e ditado', color: '#F97316' },
    { key: 'word', label: 'Escrita de palavras', color: '#10B981' },
    { key: 'sentence', label: 'Escrita/ordem de frases', color: '#0EA5E9' },
  ]);

  const masteredSkills = masteries.filter((m) => m.status === 'mastered');
  const developingSkills = masteries.filter((m) => m.status === 'learning' || m.status === 'practicing');

  const handleExport = async () => {
    const bundle = await exportChildBundle(profile.id);
    if (!bundle) return;
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mundo-das-palavras-${profile.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Backup exportado com sucesso!');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const bundle = JSON.parse(text) as ExportBundle;
      if (!bundle.profile || !Array.isArray(bundle.masteries)) {
        setStatusMessage('Arquivo inválido de backup.');
        return;
      }
      const imported = await importChildBundle(bundle);
      await onDataImported(imported);
      setStatusMessage(`Perfil de ${imported.name} importado com sucesso!`);
    } catch {
      setStatusMessage('Não foi possível ler o arquivo selecionado.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onBack}>
          <ArrowLeft size={18} /> Voltar para a área infantil
        </button>
        <h2 style={{ margin: 0 }}>Painel dos Responsáveis</h2>
      </div>

      {statusMessage && (
        <div className="feedback-banner feedback-positive">
          <strong>{statusMessage}</strong>
        </div>
      )}

      {/* Resumo cadastral e frequência */}
      <div className="card">
        <h3 style={{ margin: '0 0 12px' }}>Perfil: {profile.name} ({profile.age} anos)</h3>
        <div className="grid-3">
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Data de início</div>
            <div style={{ fontWeight: 800 }}>{new Date(profile.createdAt).toLocaleDateString('pt-BR')}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tempo ativo registrado</div>
            <div style={{ fontWeight: 800 }}>{totalMinutesUsed} min ({activeDays} dia(s) ativos)</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Missões diárias concluídas</div>
            <div style={{ fontWeight: 800 }}>{missions.filter((m) => m.completedAt).length}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Evolução semanal</div>
            <div style={{ fontWeight: 800 }}>
              {weekAttempts.length > 0 ? `${weekAccuracy}% de acertos (${weekAttempts.length} ativ.)` : 'Sem registros na semana'}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Evolução mensal</div>
            <div style={{ fontWeight: 800 }}>
              {monthAttempts.length > 0 ? `${monthAccuracy}% de acertos (${monthAttempts.length} ativ.)` : 'Sem registros no mês'}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nível atual</div>
            <div style={{ fontWeight: 800 }}>Nível {profile.currentLevel} de 7</div>
          </div>
        </div>
      </div>

      {/* Gráficos reais de Leitura e Escrita */}
      <div className="grid-2">
        <SimpleBarChart
          title="LEITURA (Dados reais)"
          data={readingChart}
          emptyMessage="Nenhuma atividade de leitura registrada ainda."
        />
        <SimpleBarChart
          title="ESCRITA E ORTOGRAFIA (Dados reais)"
          data={writingChart}
          emptyMessage="Nenhuma atividade de escrita registrada ainda."
        />
      </div>

      {/* Habilidades dominadas x em desenvolvimento */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ margin: '0 0 10px' }}>Conteúdos Dominados ({masteredSkills.length})</h3>
          {masteredSkills.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Ainda em construção (são necessárias pelo menos 3 tentativas consistentes para marcar domínio).
            </p>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {masteredSkills.map((m) => (
                <span key={m.id} className="pill pill-green">{m.label} ({m.masteryScore}%)</span>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 10px' }}>Em Desenvolvimento ({developingSkills.length})</h3>
          {developingSkills.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Nenhum conteúdo pendente no momento.</p>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {developingSkills.map((m) => (
                <span key={m.id} className="pill pill-amber">{m.label} ({m.masteryScore}%)</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dificuldades identificadas e palavras com maior erro */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ margin: '0 0 10px' }}>Trocas / Confusões Recorrentes</h3>
          {adaptation.topConfusions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Nenhuma troca recorrente detectada até agora.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {adaptation.topConfusions.map((c) => (
                <li key={c.id} style={{ marginBottom: 6 }}>
                  <strong>{c.expected}</strong> ↔ <strong>{c.confused}</strong> ({c.count} ocorrência(s))
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 10px' }}>Palavras com Maior Índice de Erro</h3>
          {adaptation.difficultWords.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Sem erros registrados em palavras até o momento.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {adaptation.difficultWords.map((d) => (
                <li key={d.word} style={{ marginBottom: 6 }}>
                  <strong>{d.word}</strong> — {d.errorCount} tentativa(s) para ajustar
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recomendações práticas */}
      <div className="card" style={{ background: 'var(--bg-indigo-soft)', borderColor: '#C7D2FE' }}>
        <h3 style={{ margin: '0 0 10px' }}>Recomendações para os Próximos Dias</h3>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {adaptation.parentTips.map((tip, i) => (
            <li key={i} style={{ marginBottom: 6, fontWeight: 600 }}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* Histórico recente */}
      <div className="card">
        <h3 style={{ margin: '0 0 10px' }}>Histórico Recente de Atividades ({attempts.length})</h3>
        {attempts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Nenhuma atividade registrada ainda.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-soft)' }}>
                  <th style={{ padding: 8 }}>Data</th>
                  <th style={{ padding: 8 }}>Atividade</th>
                  <th style={{ padding: 8 }}>Esperado</th>
                  <th style={{ padding: 8 }}>Resposta</th>
                  <th style={{ padding: 8 }}>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {attempts.slice(0, 15).map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: 8 }}>{new Date(a.timestamp).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: 8 }}>{a.prompt}</td>
                    <td style={{ padding: 8, fontWeight: 700 }}>{a.expectedAnswer}</td>
                    <td style={{ padding: 8 }}>{a.userAnswer}</td>
                    <td style={{ padding: 8 }}>
                      <span className={`pill ${a.isCorrect ? 'pill-green' : 'pill-amber'}`} style={{ fontSize: '0.78rem' }}>
                        {a.isCorrect ? 'Acertou' : 'Em prática'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Backup, Exportação e Controle de Dados (LGPD) */}
      <div className="card">
        <h3 style={{ margin: '0 0 12px' }}>Gestão de Dados e Backup (LGPD)</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={handleExport}>
            <Download size={18} /> Exportar dados (JSON)
          </button>
          <button type="button" className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} /> Importar backup
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />

          <button type="button" className="btn btn-outline" onClick={() => setConfirmAction('reset')}>
            <RefreshCw size={18} /> Reiniciar progresso
          </button>
          <button type="button" className="btn btn-outline" style={{ color: '#DC2626', borderColor: '#FCA5A5' }} onClick={() => setConfirmAction('delete')}>
            <Trash2 size={18} /> Excluir perfil
          </button>
        </div>

        {confirmAction && (
          <div className="feedback-banner feedback-encourage" style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              <AlertTriangle size={20} />
              {confirmAction === 'reset'
                ? 'Tem certeza? Isso apagará o histórico de progresso deste perfil (recomendamos exportar antes).'
                : 'Tem certeza que deseja excluir permanentemente este perfil e todos os seus dados?'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => setConfirmAction(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  const act = confirmAction;
                  setConfirmAction(null);
                  if (act === 'reset') {
                    await onResetProfile();
                    setStatusMessage('Progresso reiniciado com sucesso.');
                  } else {
                    await onDeleteProfile();
                  }
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

        <p style={{ margin: '14px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Nota importante: este sistema apenas registra desempenho pedagógico nas atividades propostas e não emite diagnósticos médicos, psicológicos ou clínicos.
        </p>
      </div>
    </div>
  );
};
