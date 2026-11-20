/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AppRoute,
  CharacterPresetItem,
  DRAFTS_LIST,
  DraftItem,
  EPISODE_DATA,
  INITIAL_CHARACTER_PRESETS,
  LIBRARY_WEBTOONS,
  LibraryWebtoonItem,
  STUDIO_STYLES,
  TOONDAY_ASSETS,
  WebtoonEpisode,
} from './data/toondayData';
import { TopHeader } from './components/toonday/TopHeader';
import { BottomNav } from './components/toonday/BottomNav';
import { ToastBanner } from './components/toonday/ToastBanner';
import { HomeScreen } from './components/toonday/HomeScreen';
import { StudioScreen } from './components/toonday/StudioScreen';
import { GenerationProgressScreen } from './components/toonday/GenerationProgressScreen';
import { ViewerScreen } from './components/toonday/ViewerScreen';
import { LibraryScreen } from './components/toonday/LibraryScreen';
import { SearchScreen } from './components/toonday/SearchScreen';
import { SharedCollectionScreen } from './components/toonday/SharedCollectionScreen';
import { SubscriptionScreen } from './components/toonday/SubscriptionScreen';
import { VoiceConversationModal } from './components/toonday/VoiceConversationModal';
import {
  InstagramPublishModal,
  InstagramPublishRecord,
  InstagramPublishTarget,
  PlatformViewMode,
} from './components/toonday/InstagramPublishModal';

const VALID_ROUTES: AppRoute[] = [
  'home',
  'studio',
  'generating',
  'viewer',
  'library',
  'drafts',
  'search',
  'collection',
  'subscription',
];

export interface AuthorProfile {
  name: string;
  handle: string;
  genre: string;
  avatar: string;
}

const DEFAULT_PROFILE: AuthorProfile = {
  name: '서연이의 일상일기',
  handle: '@seoyeon_toon',
  genre: '일상·공감툰',
  avatar: TOONDAY_ASSETS.authorAvatar,
};

function readHashRoute(): AppRoute {
  const clean = window.location.hash.replace(/^#\/?/, '').split('/')[0] as AppRoute;
  return VALID_ROUTES.includes(clean) ? clean : 'home';
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, val: T) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore storage quota errors
  }
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => readHashRoute());
  const [history, setHistory] = useState<AppRoute[]>(['home']);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<PlatformViewMode>(() =>
    readStorage<PlatformViewMode>('toonday_view_mode', 'auto')
  );
  const [isDesktopViewport, setIsDesktopViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false
  );
  const [instagramRecords, setInstagramRecords] = useState<Record<number, InstagramPublishRecord>>(
    () => readStorage('toonday_instagram_records', {})
  );
  const [instagramModalState, setInstagramModalState] = useState<{
    isOpen: boolean;
    initialTab: 'publish' | 'history' | 'n8n' | 'sync';
    target: InstagramPublishTarget | null;
  }>({
    isOpen: false,
    initialTab: 'history',
    target: null,
  });

  // Persisted global platform state
  const [isPro, setIsPro] = useState<boolean>(() => readStorage('toonday_is_pro', false));
  const [freeTicketsLeft, setFreeTicketsLeft] = useState<number>(() =>
    readStorage('toonday_free_tickets', 1)
  );
  const [equippedBadge, setEquippedBadge] = useState<string | null>(() =>
    readStorage('toonday_badge', null)
  );
  const [profile, setProfile] = useState<AuthorProfile>(() =>
    readStorage('toonday_profile', DEFAULT_PROFILE)
  );
  const [customEpisodes, setCustomEpisodes] = useState<Record<number, WebtoonEpisode>>(() =>
    readStorage('toonday_custom_episodes', {})
  );
  const [libraryItems, setLibraryItems] = useState<LibraryWebtoonItem[]>(() =>
    readStorage('toonday_library_items', LIBRARY_WEBTOONS)
  );
  const [drafts, setDrafts] = useState<DraftItem[]>(() =>
    readStorage('toonday_drafts', DRAFTS_LIST)
  );
  const [bookmarkedEpIds, setBookmarkedEpIds] = useState<number[]>(() =>
    readStorage('toonday_bookmarks', [17, 1])
  );
  const [characterPresets, setCharacterPresets] = useState<CharacterPresetItem[]>(() =>
    readStorage('toonday_characters', INITIAL_CHARACTER_PRESETS)
  );

  // Cross-screen shared navigation & generation state
  const [studioPrompt, setStudioPrompt] = useState('');
  const [studioStyleKey, setStudioStyleKey] = useState('insta');
  const [studioCuts, setStudioCuts] = useState<4 | 8>(4);
  const [studioCharId, setStudioCharId] = useState<string>(
    INITIAL_CHARACTER_PRESETS[0].id
  );
  const [viewerEpisodeId, setViewerEpisodeId] = useState<number>(18);
  const [generatedCustomTitle, setGeneratedCustomTitle] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('월요일 출근');
  const [searchTab, setSearchTab] = useState('전체');

  useEffect(() => writeStorage('toonday_is_pro', isPro), [isPro]);
  useEffect(() => writeStorage('toonday_free_tickets', freeTicketsLeft), [freeTicketsLeft]);
  useEffect(() => writeStorage('toonday_badge', equippedBadge), [equippedBadge]);
  useEffect(() => writeStorage('toonday_profile', profile), [profile]);
  useEffect(() => writeStorage('toonday_custom_episodes', customEpisodes), [customEpisodes]);
  useEffect(() => writeStorage('toonday_library_items', libraryItems), [libraryItems]);
  useEffect(() => writeStorage('toonday_drafts', drafts), [drafts]);
  useEffect(() => writeStorage('toonday_bookmarks', bookmarkedEpIds), [bookmarkedEpIds]);
  useEffect(() => writeStorage('toonday_characters', characterPresets), [characterPresets]);
  useEffect(() => writeStorage('toonday_view_mode', viewMode), [viewMode]);
  useEffect(() => writeStorage('toonday_instagram_records', instagramRecords), [instagramRecords]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktopViewport(e.matches);
    setIsDesktopViewport(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    fetch('/api/instagram/status')
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && data.records && typeof data.records === 'object') {
          const synced: Record<number, InstagramPublishRecord> = {};
          Object.entries(data.records).forEach(([k, v]) => {
            const rec = v as InstagramPublishRecord;
            if (rec && rec.postId) {
              synced[Number(k)] = rec;
            }
          });
          if (Object.keys(synced).length > 0) {
            setInstagramRecords((prev) => ({ ...prev, ...synced }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const allEpisodes = useMemo<Record<number, WebtoonEpisode>>(
    () => ({ ...EPISODE_DATA, ...customEpisodes }),
    [customEpisodes]
  );

  const nextEpisodeNumber = useMemo(() => {
    const nums = Object.keys(allEpisodes).map(Number);
    return Math.max(19, ...nums) + 1;
  }, [allEpisodes]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const t = window.setTimeout(() => setToastMsg(null), 2800);
    return () => window.clearTimeout(t);
  }, [toastMsg]);

  useEffect(() => {
    const onHashChange = () => {
      const next = readHashRoute();
      setRoute(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (route === 'viewer' && isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [route, isDarkMode]);

  const navigate = useCallback((nextRoute: AppRoute) => {
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last === nextRoute) return prev;
      return [...prev.slice(-12), nextRoute];
    });
    setRoute(nextRoute);
    const nextHash = `#${nextRoute}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('toonday-scroll-root')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) {
        setRoute('home');
        window.location.hash = '#home';
        return ['home'];
      }
      const nextStack = prev.slice(0, -1);
      const target = nextStack[nextStack.length - 1] || 'home';
      setRoute(target);
      window.location.hash = `#${target}`;
      return nextStack;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('toonday-scroll-root')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openStudio = useCallback(
    (opts?: { prompt?: string; styleKey?: string; cuts?: 4 | 8; charId?: string }) => {
      if (opts?.prompt !== undefined) setStudioPrompt(opts.prompt);
      if (opts?.styleKey) setStudioStyleKey(opts.styleKey);
      if (opts?.cuts) setStudioCuts(opts.cuts);
      if (opts?.charId) setStudioCharId(opts.charId);
      navigate('studio');
    },
    [navigate]
  );

  const openViewer = useCallback(
    (epId: number, customTitle?: string) => {
      setViewerEpisodeId(epId);
      setGeneratedCustomTitle(customTitle);
      navigate('viewer');
    },
    [navigate]
  );

  const openSearch = useCallback(
    (opts?: { query?: string; tab?: string }) => {
      if (opts?.query !== undefined) setSearchQuery(opts.query);
      if (opts?.tab !== undefined) setSearchTab(opts.tab);
      navigate('search');
    },
    [navigate]
  );

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      showToast(next ? '다크 모드로 전환되었습니다. 🌙' : '라이트 모드로 전환되었습니다. ☀️');
      return next;
    });
  };

  const handleSaveDraft = useCallback(
    (payload?: { prompt?: string; styleKey?: string; cuts?: 4 | 8 }) => {
      const memoText = (payload?.prompt ?? studioPrompt).trim() ||
        '오늘 하루 스쳐간 소소한 일상 에피소드 아이디어 메모';
      const styleObj = STUDIO_STYLES.find(
        (s) => s.key === (payload?.styleKey ?? studioStyleKey)
      );
      const titleCandidate = memoText.replace(/\s+/g, ' ').slice(0, 22);
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const cutsNum = payload?.cuts ?? studioCuts;

      const newDraft: DraftItem = {
        id: `draft-${Date.now()}`,
        statusBadge: '콘티 작성 중 · 방금 저장',
        statusStyle: 'bg-secondary-container text-on-secondary-container',
        isComplete: true,
        updatedAt: `방금 전 (${hh}:${mm})`,
        title: titleCandidate,
        tags: [`#${styleObj?.title || '명랑 인스타툰'}`, `#${cutsNum}컷`, '직접작성'],
        step: 'Step 4: 생성 전 콘티 검토',
        memo: `“${memoText}”`,
        cuts: [
          { label: '1컷', caption: '기 · 도입', image: styleObj?.image || TOONDAY_ASSETS.logo },
          { label: '2컷', caption: '승 · 전개', image: EPISODE_DATA[18].panels[1].image },
          { label: '3컷', caption: '전 · 위기', image: EPISODE_DATA[18].panels[2].image },
          { label: '4컷', caption: '결 · 반전', image: null },
        ],
      };

      try {
        localStorage.setItem('toonday_draft_story', memoText);
      } catch {
        // ignore
      }
      setDrafts((prev) => [newDraft, ...prev]);
      showToast('작성 중인 콘티가 임시저장 보관함에 저장되었습니다 📁');
    },
    [studioPrompt, studioStyleKey, studioCuts, showToast]
  );

  const handleUpdateDraft = useCallback(
    (id: string, patch: Partial<DraftItem>) => {
      setDrafts((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, ...patch, updatedAt: '방금 수정됨' } : d
        )
      );
      showToast('임시저장 콘티 내용이 수정되었습니다 ✏️');
    },
    [showToast]
  );

  const handleDeleteDrafts = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      setDrafts((prev) => prev.filter((d) => !idSet.has(d.id)));
    },
    []
  );

  const handleCompleteGeneration = useCallback(
    (newEpisode: WebtoonEpisode, openAfter = true) => {
      setCustomEpisodes((prev) => ({
        ...prev,
        [newEpisode.epNum]: newEpisode,
      }));
      const styleObj = STUDIO_STYLES.find((s) => s.title === newEpisode.styleName);
      const libItem: LibraryWebtoonItem = {
        id: `lib-${newEpisode.epNum}-${Date.now()}`,
        title: newEpisode.title,
        date: `${new Date().toISOString().slice(0, 10).replace(/-/g, '.')} · 공개`,
        styleLabel: styleObj?.title || newEpisode.styleName,
        styleBadgeClass: 'bg-primary/85 text-on-primary',
        likes: 1,
        isPrivate: false,
        episodeId: newEpisode.epNum,
        image: newEpisode.thumbnail,
      };
      setLibraryItems((prev) => [libItem, ...prev.filter((i) => i.episodeId !== newEpisode.epNum)]);
      if (!isPro) {
        setFreeTicketsLeft((t) => Math.max(0, t - 1));
      }
      if (openAfter) {
        openViewer(newEpisode.epNum);
      }
    },
    [isPro, openViewer]
  );

  const handleBackgroundGenerate = useCallback(
    (newEpisode: WebtoonEpisode) => {
      showToast('완료 시 알림을 보내드릴게요! 홈에서 다른 웹툰을 둘러보세요 🔔');
      navigate('home');
      window.setTimeout(() => {
        handleCompleteGeneration(newEpisode, false);
        showToast(`🎉 [${newEpisode.title.slice(0, 16)}] 웹툰 제작 완료! 내 보관함에 저장됐어요`);
      }, 2400);
    },
    [handleCompleteGeneration, navigate, showToast]
  );

  const handleToggleBookmark = useCallback(
    (epId: number) => {
      setBookmarkedEpIds((prev) => {
        const exists = prev.includes(epId);
        const next = exists ? prev.filter((id) => id !== epId) : [epId, ...prev];
        showToast(
          exists ? `${epId}화 북마크가 해제되었습니다.` : `${epId}화가 북마크 보관함에 저장되었습니다 🔖`
        );
        return next;
      });
    },
    [showToast]
  );

  const handleActivatePro = useCallback(
    (planLabel?: string) => {
      setIsPro(true);
      showToast(
        planLabel
          ? `🎉 ${planLabel} 활성화! 무제한 생성·19화 선공개·노마크 저장이 열렸습니다.`
          : '🎉 ToonDay PRO 멤버십이 활성화되었습니다!'
      );
    },
    [showToast]
  );

  const handleClaimBadge = useCallback(
    (badge: string) => {
      setEquippedBadge(badge);
      showToast(`✨ [${badge}] 한정판 뱃지가 프로필에 장착되었습니다!`);
    },
    [showToast]
  );

  const handleAddCharacterPreset = useCallback(
    (preset: CharacterPresetItem) => {
      setCharacterPresets((prev) => [preset, ...prev]);
      setStudioCharId(preset.id);
      showToast(`✨ 나만의 캐릭터 [${preset.name}] 프리셋이 저장되었습니다!`);
    },
    [showToast]
  );

  const openInstagramPublish = useCallback(
    (
      target?: InstagramPublishTarget | null,
      initialTab: 'publish' | 'history' | 'n8n' | 'sync' = 'publish'
    ) => {
      setInstagramModalState({
        isOpen: true,
        initialTab: target ? initialTab : initialTab === 'publish' ? 'history' : initialTab,
        target: target || null,
      });
    },
    []
  );

  const handleInstagramPublishSuccess = useCallback((record: InstagramPublishRecord) => {
    setInstagramRecords((prev) => ({
      ...prev,
      [record.episodeId]: record,
    }));
  }, []);

  const handleSyncInstagramRecords = useCallback(
    (records: Record<number, InstagramPublishRecord>) => {
      setInstagramRecords((prev) => {
        const merged = { ...prev, ...records };
        if (Object.keys(merged).length === Object.keys(prev).length) {
          return prev;
        }
        return merged;
      });
    },
    []
  );

  const isWebMode = viewMode === 'web' || (viewMode === 'auto' && isDesktopViewport);
  const isAppFrame = !isWebMode && isDesktopViewport;

  const handleToggleViewMode = useCallback(() => {
    setViewMode((prev) => {
      const next: PlatformViewMode =
        prev === 'auto' ? (isDesktopViewport ? 'mobile' : 'web') : prev === 'web' ? 'mobile' : 'web';
      showToast(
        next === 'web'
          ? '🖥️ 웹 화면 대시보드 레이아웃으로 전환했습니다.'
          : '📱 모바일 앱 화면 (412px)으로 전환했습니다.'
      );
      return next;
    });
  }, [isDesktopViewport, showToast]);

  const hasBottomTabBar =
    route === 'home' ||
    route === 'studio' ||
    route === 'library' ||
    route === 'drafts' ||
    route === 'subscription';

  const wrapperClass =
    route === 'viewer' && isDarkMode ? 'viewer-dark-shell' : '';

  const activeChar =
    characterPresets.find((c) => c.id === studioCharId) || characterPresets[0];

  const activeViewerEpisode = allEpisodes[viewerEpisodeId] || allEpisodes[18];
  const instagramPublishedCount = Object.keys(instagramRecords).length;

  const mainContent = (
    <main
      className={`flex flex-col relative w-full pt-16 bg-surface ${
        isWebMode
          ? route === 'viewer'
            ? 'pb-safe'
            : 'max-w-6xl mx-auto pb-12'
          : hasBottomTabBar
            ? 'pb-24'
            : 'pb-safe'
      }`}
    >
      {route === 'home' && (
        <HomeScreen
          isPro={isPro}
          freeTicketsLeft={freeTicketsLeft}
          libraryItems={libraryItems}
          onOpenStudio={openStudio}
          onOpenViewer={(epId) => openViewer(epId)}
          onOpenSearch={openSearch}
          onOpenVoiceChat={() => setIsVoiceModalOpen(true)}
          onNavigate={navigate}
          isWebMode={isWebMode}
        />
      )}

      {route === 'studio' && (
        <StudioScreen
          initialPrompt={studioPrompt}
          initialStyleKey={studioStyleKey}
          initialCuts={studioCuts}
          initialCharId={studioCharId}
          isPro={isPro}
          freeTicketsLeft={freeTicketsLeft}
          characterPresets={characterPresets}
          onAddCharacterPreset={handleAddCharacterPreset}
          onSaveDraft={(p) => handleSaveDraft(p)}
          onNavigate={navigate}
          onShowToast={showToast}
          onOpenVoiceChat={() => setIsVoiceModalOpen(true)}
          isWebMode={isWebMode}
          onStartGenerate={(payload) => {
            setStudioPrompt(payload.prompt);
            setStudioStyleKey(payload.styleKey);
            setStudioCuts(payload.cuts);
            setStudioCharId(payload.charId);
            setGeneratedCustomTitle(payload.prompt);
            navigate('generating');
          }}
        />
      )}

      {route === 'generating' && (
        <GenerationProgressScreen
          prompt={studioPrompt}
          styleKey={studioStyleKey}
          cuts={studioCuts}
          characterName={activeChar?.name || '서연'}
          authorHandle={profile.handle}
          nextEpNum={nextEpisodeNumber}
          onCancel={() => navigate('studio')}
          onCompleteGeneration={(ep, openViewerNow) =>
            handleCompleteGeneration(ep, openViewerNow)
          }
          onBackgroundComplete={(ep) => handleBackgroundGenerate(ep)}
          onShowToast={showToast}
        />
      )}

      {route === 'viewer' && (
        <ViewerScreen
          episode={activeViewerEpisode}
          allEpisodes={allEpisodes}
          customPrompt={generatedCustomTitle}
          isPro={isPro}
          bookmarkedEpIds={bookmarkedEpIds}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onToggleBookmark={handleToggleBookmark}
          onActivatePro={handleActivatePro}
          onClaimBadge={handleClaimBadge}
          onSelectEpisode={(epId) => openViewer(epId)}
          onNavigate={navigate}
          onShowToast={showToast}
          isWebMode={isWebMode}
          isAppFrame={isAppFrame}
          instagramRecord={instagramRecords[activeViewerEpisode.epNum]}
          onOpenInstagramPublish={(target) => openInstagramPublish(target, 'publish')}
        />
      )}

      {(route === 'library' || route === 'drafts') && (
        <LibraryScreen
          initialTab={route === 'drafts' ? 'drafts' : 'webtoons'}
          isPro={isPro}
          equippedBadge={equippedBadge}
          profile={profile}
          onUpdateProfile={(next) => {
            setProfile(next);
            showToast('작가 프로필 정보가 저장되었습니다 ✨');
          }}
          libraryItems={libraryItems}
          allEpisodes={allEpisodes}
          bookmarkedEpIds={bookmarkedEpIds}
          onToggleBookmark={handleToggleBookmark}
          drafts={drafts}
          onUpdateDraft={handleUpdateDraft}
          onDeleteDrafts={handleDeleteDrafts}
          characterPresets={characterPresets}
          onNavigate={navigate}
          onOpenViewer={(epId) => openViewer(epId)}
          onOpenStudio={openStudio}
          onStartGenerateFromDraft={(draft) => {
            const cleanPrompt = draft.memo.replace(/^“|”$/g, '').trim() || draft.title;
            setStudioPrompt(cleanPrompt);
            setStudioStyleKey('insta');
            setStudioCuts(4);
            setGeneratedCustomTitle(draft.title);
            navigate('generating');
          }}
          onShowToast={showToast}
          isWebMode={isWebMode}
          instagramRecords={instagramRecords}
          onOpenInstagramPublish={(target, tab) => openInstagramPublish(target, tab || 'publish')}
        />
      )}

      {route === 'search' && (
        <SearchScreen
          initialQuery={searchQuery}
          initialTab={searchTab}
          bookmarkedEpIds={bookmarkedEpIds}
          onToggleBookmark={handleToggleBookmark}
          onOpenViewer={(epId) => openViewer(epId)}
          onOpenStudio={openStudio}
          onShowToast={showToast}
          isWebMode={isWebMode}
        />
      )}

      {route === 'collection' && (
        <SharedCollectionScreen
          onNavigate={navigate}
          onOpenViewer={(epId) => openViewer(epId)}
          onOpenStudio={openStudio}
          onShowToast={showToast}
        />
      )}

      {route === 'subscription' && (
        <SubscriptionScreen
          isPro={isPro}
          isWebMode={isWebMode}
          onShowToast={showToast}
          onSuccessSubscribe={(planLabel) => {
            handleActivatePro(planLabel);
            navigate('studio');
          }}
        />
      )}
    </main>
  );

  const appShell = (
    <div
      className={
        isAppFrame
          ? `relative flex-1 min-h-0 flex flex-col [transform:translateZ(0)] overflow-hidden bg-surface text-on-surface ${wrapperClass}`
          : isWebMode
            ? `w-full md:pl-64 min-h-screen bg-surface text-on-surface relative ${wrapperClass}`
            : `w-full max-w-[430px] min-h-screen bg-surface text-on-surface relative shadow-[0_0_50px_rgba(79,55,138,0.12)] ${wrapperClass}`
      }
    >
      <TopHeader
        route={route}
        isPro={isPro}
        freeTicketsLeft={freeTicketsLeft}
        equippedBadge={equippedBadge}
        avatarUrl={profile.avatar}
        onNavigate={navigate}
        onBack={goBack}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenSearch={() => openSearch()}
        onSaveDraft={() => handleSaveDraft()}
        onOpenVoiceChat={() => setIsVoiceModalOpen(true)}
        isWebMode={isWebMode}
        isAppFrame={isAppFrame}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        onOpenN8nHub={() => openInstagramPublish(null, 'history')}
        instagramPublishedCount={instagramPublishedCount}
      />

      {isAppFrame ? (
        <div
          id="toonday-scroll-root"
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none"
        >
          {mainContent}
        </div>
      ) : (
        mainContent
      )}

      {hasBottomTabBar && (
        <BottomNav
          route={route}
          onNavigate={navigate}
          isWebMode={isWebMode}
          isAppFrame={isAppFrame}
        />
      )}

      <VoiceConversationModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplyToStudio={(story) => {
          setIsVoiceModalOpen(false);
          openStudio({ prompt: story });
          showToast('음성 대화 이야기가 스튜디오 일기장에 적용되었습니다 ✨');
        }}
        onGenerateFromVoice={(story) => {
          setIsVoiceModalOpen(false);
          setStudioPrompt(story);
          setGeneratedCustomTitle(story);
          navigate('generating');
        }}
        onShowToast={showToast}
      />

      <InstagramPublishModal
        isOpen={instagramModalState.isOpen}
        initialTab={instagramModalState.initialTab}
        target={instagramModalState.target}
        allEpisodes={allEpisodes}
        libraryItems={libraryItems}
        publishRecords={instagramRecords}
        viewMode={viewMode}
        onChangeViewMode={(mode) => setViewMode(mode)}
        onSelectTarget={(target) =>
          setInstagramModalState({
            isOpen: true,
            initialTab: 'publish',
            target,
          })
        }
        onPublishSuccess={handleInstagramPublishSuccess}
        onSyncRecords={handleSyncInstagramRecords}
        onClose={() =>
          setInstagramModalState((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
        onShowToast={showToast}
      />

      <ToastBanner message={toastMsg} />
    </div>
  );

  if (isAppFrame) {
    return (
      <div className="min-h-screen bg-[#efe8f5] dark:bg-[#05080f] py-3 px-4 flex flex-col items-center justify-center gap-3">
        {/* Desktop App Preview Switcher Bar */}
        <div className="w-full max-w-[440px] h-11 px-3.5 rounded-2xl bg-surface-container-lowest/95 border border-outline-variant/40 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
              smartphone
            </span>
            <span className="text-xs font-bold text-on-surface truncate">
              모바일 앱 화면
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-[10px] font-bold text-on-surface-variant tabular-nums shrink-0">
              412px
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center bg-surface-container p-0.5 rounded-xl">
              {[
                { id: 'web' as const, label: '웹' },
                { id: 'mobile' as const, label: '앱' },
                { id: 'auto' as const, label: '자동' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setViewMode(m.id);
                    showToast(
                      m.id === 'web'
                        ? '🖥️ 웹 화면 대시보드 레이아웃으로 전환했습니다.'
                        : m.id === 'mobile'
                          ? '📱 모바일 앱 화면 (412px)으로 전환했습니다.'
                          : '✨ 자동 반응형 화면 모드로 전환했습니다.'
                    );
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    viewMode === m.id
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => openInstagramPublish(null, 'history')}
              className="h-7 px-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition-colors"
              title="n8n 인스타 자동화 허브"
            >
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>n8n</span>
            </button>
          </div>
        </div>

        {/* Realistic Smartphone Bezel Frame */}
        <div
          className={`relative w-full max-w-[412px] h-[min(820px,calc(100dvh-84px))] rounded-[38px] border-[6px] border-[#1d1b20] bg-surface text-on-surface shadow-[0_24px_60px_rgba(29,27,32,0.22)] overflow-hidden flex flex-col ${wrapperClass}`}
        >
          {/* Phone Status Bar */}
          <div className="h-7 px-6 flex items-center justify-between text-[11px] font-bold shrink-0 bg-surface text-on-surface border-b border-outline-variant/10 select-none">
            <span className="tabular-nums">9:41</span>
            <div className="w-20 h-4 rounded-full bg-[#1d1b20]" />
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
              <span className="material-symbols-outlined text-[13px]">wifi</span>
              <span className="material-symbols-outlined text-[14px]">battery_full</span>
            </div>
          </div>

          {appShell}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#f4edf8] dark:bg-[#05080f] ${
        isWebMode ? 'block' : 'flex flex-col items-center'
      }`}
    >
      {/* Desktop Web Version Navigation Sidebar */}
      {isWebMode && (
        <aside className="hidden md:flex flex-col justify-between w-64 fixed inset-y-0 left-0 z-40 bg-surface-container-lowest border-r border-outline-variant/40 p-4">
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="flex items-center gap-2.5 text-left w-full px-1"
            >
              <img
                alt="ToonDay Logo"
                className="h-9 w-auto object-contain shrink-0"
                referrerPolicy="no-referrer"
                src={TOONDAY_ASSETS.logo}
              />
              <div className="min-w-0">
                <div className="text-base font-headline font-extrabold text-primary leading-tight">
                  ToonDay
                </div>
                <div className="text-[10px] font-medium text-on-surface-variant truncate">
                  웹 · 모바일 앱 연동 스튜디오
                </div>
              </div>
            </button>

            <div className="p-3 rounded-xl bg-surface-container-low flex items-center gap-2.5">
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/40 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-on-surface truncate">{profile.name}</div>
                <div className="text-[10px] text-on-surface-variant truncate">{profile.handle}</div>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'home' as const, icon: 'cottage', label: '홈 피드' },
                { id: 'studio' as const, icon: 'auto_fix_high', label: 'AI 웹툰 스튜디오' },
                { id: 'library' as const, icon: 'video_library', label: '내 보관함 · 발행이력' },
                { id: 'drafts' as const, icon: 'pending_actions', label: '임시저장 콘티' },
                { id: 'subscription' as const, icon: 'workspace_premium', label: 'PRO 멤버십' },
              ].map((navItem) => {
                const active = route === navItem.id;
                return (
                  <button
                    key={navItem.id}
                    type="button"
                    onClick={() => navigate(navItem.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-primary text-on-primary shadow-sm font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] shrink-0">
                      {navItem.icon}
                    </span>
                    <span className="truncate">{navItem.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-surface-container space-y-1.5">
              <div className="px-2 text-[10px] font-bold text-outline uppercase tracking-wider">
                n8n 자동화 · 기기 연동
              </div>
              <button
                type="button"
                onClick={() => openInstagramPublish(null, 'history')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/18 text-primary text-xs font-bold whitespace-nowrap transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px]">photo_camera</span>
                  <span>인스타 자동 게시</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] tabular-nums">
                  {instagramPublishedCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold whitespace-nowrap transition-colors"
              >
                <span className="material-symbols-outlined text-[17px] text-primary">graphic_eq</span>
                <span>AI 음성 스토리 코치</span>
              </button>
              <button
                type="button"
                onClick={() => openInstagramPublish(null, 'sync')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold whitespace-nowrap transition-colors"
              >
                <span className="material-symbols-outlined text-[17px] text-secondary">devices</span>
                <span>모바일 · 웹 연동 허브</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-container space-y-2">
            <div className="text-[10px] font-bold text-outline px-1">화면 보기 전환</div>
            <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-xl">
              {[
                { id: 'auto' as const, label: '자동' },
                { id: 'web' as const, label: '웹' },
                { id: 'mobile' as const, label: '앱' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setViewMode(m.id);
                    showToast(
                      m.id === 'web'
                        ? '🖥️ 웹 화면 대시보드 레이아웃으로 전환했습니다.'
                        : m.id === 'mobile'
                          ? '📱 모바일 앱 화면 (412px)으로 전환했습니다.'
                          : '✨ 자동 반응형 화면 모드로 전환했습니다.'
                    );
                  }}
                  className={`py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    viewMode === m.id
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}

      {appShell}
    </div>
  );
}
