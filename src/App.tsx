import React, { useCallback, useEffect, useState } from 'react';
import {
  Award,
  Compass,
  Gamepad2,
  Lock,
  Settings,
  Star,
  TrendingUp,
  UserCircle2,
} from 'lucide-react';
import { InstallAppButton } from './components/InstallAppButton';
import { PinModal } from './components/PinModal';
import { AVATARS, BADGES } from './content/worldsAndRewards';
import { GameArena } from './games/GameArena';
import type { GameAttemptPayload } from './games/SoundAndLetterGames';
import { generateDailyMission, getTodayDateKey } from './pedagogy/dailyMission';
import { recordActivityAttempt } from './pedagogy/progressRecorder';
import { AchievementsScreen } from './screens/AchievementsScreen';
import { DailyMissionScreen } from './screens/DailyMissionScreen';
import { DiagnosticScreen } from './screens/DiagnosticScreen';
import { GamesHubScreen } from './screens/GamesHubScreen';
import { MapScreen } from './screens/MapScreen';
import { ParentDashboardScreen } from './screens/ParentDashboardScreen';
import { ProfilesScreen } from './screens/ProfilesScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { WorldScreens } from './screens/WorldScreens';
import {
  deleteChildProfile,
  getAllProfiles,
  getAttemptsByChild,
  getConfusionsByChild,
  getMasteriesByChild,
  getMission,
  getMissionsByChild,
  getSettings,
  resetChildProgress,
  saveMission,
  saveProfile,
  saveSettings,
} from './services/db';
import { playCelebrationFanfare } from './services/soundEffects';
import { setPreferredVoiceURI } from './services/speechService';
import type {
  AppSettings,
  AttemptLog,
  ChildProfile,
  ConfusionPair,
  DailyMission,
  GameId,
  LearningLevel,
  ScreenId,
  SkillMastery,
} from './types';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [settings, setSettings] = useState<AppSettings>({
    id: 'global',
    parentPin: '1234',
    activeChildId: null,
  });
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [screen, setScreen] = useState<ScreenId>('welcome');
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  const [masteries, setMasteries] = useState<SkillMastery[]>([]);
  const [confusions, setConfusions] = useState<ConfusionPair[]>([]);
  const [attempts, setAttempts] = useState<AttemptLog[]>([]);
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [todayMission, setTodayMission] = useState<DailyMission | null>(null);

  const [showPinModal, setShowPinModal] = useState(false);
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);

  const activeProfile = profiles.find((p) => p.id === settings.activeChildId) ?? null;

  useEffect(() => {
    setPreferredVoiceURI(activeProfile?.preferredVoiceURI);
  }, [activeProfile?.preferredVoiceURI]);

  const loadChildData = useCallback(async (profile: ChildProfile) => {
    const [m, c, a, allMissions] = await Promise.all([
      getMasteriesByChild(profile.id),
      getConfusionsByChild(profile.id),
      getAttemptsByChild(profile.id),
      getMissionsByChild(profile.id),
    ]);
    setMasteries(m);
    setConfusions(c);
    setAttempts(a);
    setMissions(allMissions);

    const todayKey = getTodayDateKey();
    let mission = await getMission(profile.id, todayKey);
    if (!mission) {
      mission = generateDailyMission(profile, m, c, a, todayKey);
      await saveMission(mission);
    }
    setTodayMission(mission);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [st, profs] = await Promise.all([getSettings(), getAllProfiles()]);
        setSettings(st);
        setProfiles(profs);

        const active = profs.find((p) => p.id === st.activeChildId) ?? profs[0] ?? null;
        if (active) {
          if (st.activeChildId !== active.id) {
            const nextSt = { ...st, activeChildId: active.id };
            await saveSettings(nextSt);
            setSettings(nextSt);
          }
          await loadChildData(active);
          setScreen(active.diagnosticCompleted ? 'map' : 'diagnostic');
        } else {
          setScreen('welcome');
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Erro ao carregar dados locais.');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadChildData]);

  const showToast = (msg: string) => {
    setCelebrationToast(msg);
    window.setTimeout(() => setCelebrationToast(null), 4500);
  };

  const handleSelectProfile = async (childId: string) => {
    const found = profiles.find((p) => p.id === childId);
    if (!found) return;
    const nextSettings = { ...settings, activeChildId: childId };
    await saveSettings(nextSettings);
    setSettings(nextSettings);
    setActiveGame(null);
    await loadChildData(found);
    setScreen(found.diagnosticCompleted ? 'map' : 'diagnostic');
  };

  const handleCreateProfile = async (newProfile: ChildProfile) => {
    await saveProfile(newProfile);
    const nextProfiles = [...profiles, newProfile];
    setProfiles(nextProfiles);
    const nextSettings = { ...settings, activeChildId: newProfile.id };
    await saveSettings(nextSettings);
    setSettings(nextSettings);
    await loadChildData(newProfile);
    setScreen('diagnostic');
  };

  const handleUpdateProfile = async (updated: ChildProfile) => {
    await saveProfile(updated);
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleRecordAttempt = async (payload: GameAttemptPayload) => {
    if (!activeProfile) return { starsEarned: 0 };
    const outcome = await recordActivityAttempt({
      profile: activeProfile,
      ...payload,
    });

    setProfiles((prev) =>
      prev.map((p) => (p.id === outcome.updatedProfile.id ? outcome.updatedProfile : p))
    );
    await loadChildData(outcome.updatedProfile);

    if (outcome.unlockedWorld) {
      playCelebrationFanfare(outcome.updatedProfile.soundEnabled);
      showToast(`🎉 Incrível! Você desbloqueou o Mundo ${outcome.unlockedWorld}!`);
    } else if (outcome.newBadges.length > 0) {
      const badge = BADGES.find((b) => b.id === outcome.newBadges[0]);
      if (badge) {
        playCelebrationFanfare(outcome.updatedProfile.soundEnabled);
        showToast(`🏅 Nova medalha conquistada: ${badge.title}!`);
      }
    }

    return { starsEarned: outcome.starsEarned };
  };

  const handleCompleteDiagnostic = async (
    recommendedLevel: LearningLevel,
    unlockedWorlds: LearningLevel[]
  ) => {
    if (!activeProfile) return;
    const badges = activeProfile.badges.includes('first-steps')
      ? activeProfile.badges
      : [...activeProfile.badges, 'first-steps'];
    const updated: ChildProfile = {
      ...activeProfile,
      diagnosticCompleted: true,
      currentLevel: recommendedLevel,
      unlockedWorlds,
      badges,
      stars: activeProfile.stars + 5,
    };
    await handleUpdateProfile(updated);
    await loadChildData(updated);
    setScreen('map');
    showToast('🌟 Exploração inicial concluída! +5 estrelas!');
  };

  const handleToggleMissionBlock = async (blockId: string) => {
    if (!todayMission || !activeProfile) return;
    const updatedBlocks = todayMission.blocks.map((b) =>
      b.id === blockId ? { ...b, completed: !b.completed } : b
    );
    const allDone = updatedBlocks.every((b) => b.completed);
    const updatedMission: DailyMission = {
      ...todayMission,
      blocks: updatedBlocks,
      completedAt: allDone ? Date.now() : undefined,
      earnedStars: allDone ? todayMission.earnedStars + 5 : todayMission.earnedStars,
    };
    await saveMission(updatedMission);
    setTodayMission(updatedMission);

    if (allDone) {
      const badges = activeProfile.badges.includes('daily-hero')
        ? activeProfile.badges
        : [...activeProfile.badges, 'daily-hero'];
      await handleUpdateProfile({
        ...activeProfile,
        stars: activeProfile.stars + 5,
        badges,
      });
      playCelebrationFanfare(activeProfile.soundEnabled);
      showToast('🏆 Missão Diária completa! +5 estrelas bônus!');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: '3rem' }}>🦉</div>
        <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>Preparando o Mundo das Palavras...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: 24, maxWidth: 520, margin: '40px auto' }} className="card">
        <h2>Ops! Algo precisou de atenção</h2>
        <p>{loadError}</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Recarregar aplicativo
        </button>
      </div>
    );
  }

  const avatar = AVATARS.find((a) => a.id === activeProfile?.avatarId);

  const renderWorldNumber = (scr: ScreenId): LearningLevel | null => {
    if (!scr.startsWith('world-')) return null;
    return Number(scr.replace('world-', '')) as LearningLevel;
  };

  const activeWorldLevel = renderWorldNumber(screen);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '6px 10px', fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF' }}
            onClick={() => {
              setActiveGame(null);
              setScreen(activeProfile ? 'map' : 'welcome');
            }}
          >
            🦉 Mundo das Palavras
          </button>

          {activeProfile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <InstallAppButton compact />
              <span className="pill pill-amber">
                <Star size={15} fill="#F59E0B" color="#F59E0B" /> {activeProfile.stars}
              </span>

              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '6px 12px', minHeight: 40 }}
                onClick={() => {
                  setActiveGame(null);
                  setScreen('profiles');
                }}
                title="Trocar perfil"
              >
                <span>{avatar?.emoji ?? '🦉'}</span>
                <span>{activeProfile.name}</span>
              </button>

              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '6px 12px', minHeight: 40 }}
                onClick={() => setShowPinModal(true)}
                title="Painel dos Responsáveis"
              >
                <Lock size={16} /> Pais
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '6px 10px', minHeight: 40 }}
                onClick={() => {
                  setActiveGame(null);
                  setScreen('settings');
                }}
                aria-label="Configurações"
              >
                <Settings size={18} />
              </button>
            </div>
          )}
        </div>
      </header>

      {celebrationToast && (
        <div
          style={{
            position: 'fixed',
            top: 72,
            right: 16,
            zIndex: 80,
            background: '#10B981',
            color: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: 16,
            fontWeight: 800,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {celebrationToast}
        </div>
      )}

      <main className="app-main">
        {activeGame && activeProfile ? (
          <GameArena
            gameId={activeGame}
            profile={activeProfile}
            confusions={confusions}
            onRecordAttempt={handleRecordAttempt}
            onExit={() => setActiveGame(null)}
          />
        ) : (
          <>
            {screen === 'welcome' && (
              <WelcomeScreen
                hasProfiles={profiles.length > 0}
                onStart={() => setScreen('profiles')}
              />
            )}

            {screen === 'profiles' && (
              <ProfilesScreen
                profiles={profiles}
                activeChildId={settings.activeChildId}
                onSelectProfile={handleSelectProfile}
                onCreateProfile={handleCreateProfile}
              />
            )}

            {screen === 'diagnostic' && activeProfile && (
              <DiagnosticScreen
                profile={activeProfile}
                onRecordAttempt={async (p) => {
                  await handleRecordAttempt(p);
                }}
                onComplete={handleCompleteDiagnostic}
                onSkip={() => handleCompleteDiagnostic(1, [1])}
              />
            )}

            {screen === 'map' && activeProfile && (
              <MapScreen
                profile={activeProfile}
                mission={todayMission}
                masteries={masteries}
                onNavigate={(s) => setScreen(s)}
              />
            )}

            {screen === 'daily-mission' && activeProfile && todayMission && (
              <DailyMissionScreen
                profile={activeProfile}
                mission={todayMission}
                onStartGame={(g) => setActiveGame(g)}
                onOpenWorld={(lvl) => setScreen(`world-${lvl}` as ScreenId)}
                onToggleBlockComplete={handleToggleMissionBlock}
                onNavigate={(s) => setScreen(s)}
              />
            )}

            {activeWorldLevel && activeProfile && (
              <WorldScreens
                level={activeWorldLevel}
                profile={activeProfile}
                onBack={() => setScreen('map')}
                onLaunchGame={(g) => setActiveGame(g)}
                onRecordAttempt={async (p) => {
                  await handleRecordAttempt(p);
                }}
              />
            )}

            {screen === 'games' && activeProfile && (
              <GamesHubScreen
                profile={activeProfile}
                onStartGame={(g) => setActiveGame(g)}
                onBack={() => setScreen('map')}
              />
            )}

            {screen === 'achievements' && activeProfile && (
              <AchievementsScreen
                profile={activeProfile}
                onBack={() => setScreen('map')}
              />
            )}

            {screen === 'progress' && activeProfile && (
              <ProgressScreen
                profile={activeProfile}
                masteries={masteries}
                attempts={attempts}
                onBack={() => setScreen('map')}
              />
            )}

            {screen === 'parent-dashboard' && activeProfile && (
              <ParentDashboardScreen
                profile={activeProfile}
                masteries={masteries}
                confusions={confusions}
                attempts={attempts}
                missions={missions}
                onResetProfile={async () => {
                  const reset = await resetChildProgress(activeProfile.id);
                  if (reset) {
                    setProfiles((prev) => prev.map((p) => (p.id === reset.id ? reset : p)));
                    await loadChildData(reset);
                  }
                }}
                onDeleteProfile={async () => {
                  await deleteChildProfile(activeProfile.id);
                  const remaining = await getAllProfiles();
                  setProfiles(remaining);
                  if (remaining[0]) {
                    await handleSelectProfile(remaining[0].id);
                  } else {
                    setSettings({ ...settings, activeChildId: null });
                    setScreen('profiles');
                  }
                }}
                onDataImported={async (imported) => {
                  const all = await getAllProfiles();
                  setProfiles(all);
                  await handleSelectProfile(imported.id);
                }}
                onBack={() => setScreen('map')}
              />
            )}

            {screen === 'settings' && activeProfile && (
              <SettingsScreen
                profile={activeProfile}
                settings={settings}
                onUpdateProfile={handleUpdateProfile}
                onUpdatePin={async (newPin) => {
                  const next = { ...settings, parentPin: newPin };
                  await saveSettings(next);
                  setSettings(next);
                }}
                onBack={() => setScreen('map')}
              />
            )}
          </>
        )}
      </main>

      {activeProfile && screen !== 'welcome' && screen !== 'diagnostic' && !activeGame && (
        <nav className="bottom-nav" aria-label="Navegação principal">
          <button
            type="button"
            className={`bottom-nav-btn ${screen === 'map' ? 'active' : ''}`}
            onClick={() => setScreen('map')}
          >
            <Compass size={20} />
            <span>Mundos</span>
          </button>
          <button
            type="button"
            className={`bottom-nav-btn ${screen === 'games' ? 'active' : ''}`}
            onClick={() => setScreen('games')}
          >
            <Gamepad2 size={20} />
            <span>Jogos</span>
          </button>
          <button
            type="button"
            className={`bottom-nav-btn ${screen === 'achievements' ? 'active' : ''}`}
            onClick={() => setScreen('achievements')}
          >
            <Award size={20} />
            <span>Conquistas</span>
          </button>
          <button
            type="button"
            className={`bottom-nav-btn ${screen === 'progress' ? 'active' : ''}`}
            onClick={() => setScreen('progress')}
          >
            <TrendingUp size={20} />
            <span>Evolução</span>
          </button>
          <button
            type="button"
            className={`bottom-nav-btn ${screen === 'profiles' ? 'active' : ''}`}
            onClick={() => setScreen('profiles')}
          >
            <UserCircle2 size={20} />
            <span>Perfis</span>
          </button>
        </nav>
      )}

      {showPinModal && (
        <PinModal
          expectedPin={settings.parentPin}
          onSuccess={() => {
            setShowPinModal(false);
            setActiveGame(null);
            setScreen('parent-dashboard');
          }}
          onClose={() => setShowPinModal(false)}
        />
      )}
    </div>
  );
};
