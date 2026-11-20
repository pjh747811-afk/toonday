import React, { useEffect, useMemo, useState } from 'react';
import {
  AppRoute,
  EPISODE_17_PANELS,
  EPISODE_18_PANELS,
  EPISODE_1_PANELS,
  TOONDAY_ASSETS,
  VIEWER_EP19_THUMB,
  VIEWER_EP1_THUMB,
  ViewerPanel,
  WebtoonEpisode,
} from '../../data/toondayData';
import {
  exportPhotocardImage,
  exportWebtoonImage,
  shareOrCopyText,
} from '../../utils/toondayExport';
import { GeneratedMusicTrack, MusicGeneratorModal } from './MusicGeneratorModal';
import {
  InstagramPublishRecord,
  InstagramPublishTarget,
} from './InstagramPublishModal';

interface ViewerScreenProps {
  episode: WebtoonEpisode;
  allEpisodes: Record<number, WebtoonEpisode>;
  customPrompt?: string;
  isPro: boolean;
  bookmarkedEpIds: number[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleBookmark: (epId: number) => void;
  onActivatePro: (planLabel?: string) => void;
  onClaimBadge: (badge: string) => void;
  onSelectEpisode: (epId: number) => void;
  onNavigate: (route: AppRoute) => void;
  onShowToast: (msg: string) => void;
  isWebMode?: boolean;
  isAppFrame?: boolean;
  instagramRecord?: InstagramPublishRecord;
  onOpenInstagramPublish?: (target: InstagramPublishTarget) => void;
}

const EXPRESSIONS = ['😱', '😂', '🥹', '🔥', '😎', '✌️😌'];
const ALT_PANEL_IMAGES = [
  EPISODE_18_PANELS[0].image,
  EPISODE_17_PANELS[1].image,
  EPISODE_1_PANELS[2].image,
  EPISODE_18_PANELS[3].image,
  EPISODE_17_PANELS[0].image,
  EPISODE_1_PANELS[0].image,
];
const REGEN_PHRASES = [
  '지금 이 순간, 완벽한 타이밍 포착! ✨',
  '예상치 못한 반전 전개... 이건 못 참지! 🔥',
  '결국 해내고 마는 주인공의 레전드 컷 😎',
  '오늘도 해피엔딩으로 훈훈하게 마무리 ✌️',
];

export const ViewerScreen: React.FC<ViewerScreenProps> = ({
  episode,
  allEpisodes,
  customPrompt,
  isPro,
  bookmarkedEpIds,
  isDarkMode,
  onToggleDarkMode,
  onToggleBookmark,
  onActivatePro,
  onClaimBadge,
  onSelectEpisode,
  onNavigate,
  onShowToast,
  isWebMode = false,
  isAppFrame = false,
  instagramRecord,
  onOpenInstagramPublish,
}) => {
  const baseEpisode = episode;
  const effectivePro = isPro;

  const [panels, setPanels] = useState<ViewerPanel[]>(baseEpisode.panels);
  const [regenCounts, setRegenCounts] = useState<Record<string, number>>({});
  const [showEditToolbars, setShowEditToolbars] = useState(true);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedLines, setTranslatedLines] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState(false);
  const [alarmSet, setAlarmSet] = useState(false);

  // Modals
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'story' | 'feed' | 'scroll'>('story');
  const [storyBg, setStoryBg] = useState({
    color: 'linear-gradient(135deg, rgba(240, 148, 51, 0.25), rgba(188, 24, 136, 0.25))',
    name: '인스타 선셋',
  });
  const [includeStamp, setIncludeStamp] = useState(true);
  const [removeWatermark, setRemoveWatermark] = useState(effectivePro);
  const [isExporting, setIsExporting] = useState(false);

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [coffeeAmount, setCoffeeAmount] = useState('1,000원');
  const [commentInput, setCommentInput] = useState('');
  const [viewerComments, setViewerComments] = useState([
    {
      id: 'c1',
      name: '모닝커피러버',
      avatar: TOONDAY_ASSETS.userAvatar,
      badge: 'BEST',
      badge2: '☕ 커피 1잔 후원자',
      time: '12분 전',
      text: '월요일 아침 8시 55분 지하철 문 닫히기 직전 슬라이딩... 진짜 매주 제 모습이라 소름 돋았어요 ㅋㅋㅋ 빵 물고 뛰는 2컷 표정 퀄리티 대박!',
      likes: 142,
      liked: true,
    },
    {
      id: 'c2',
      name: '퇴근하고싶다냥',
      avatar: TOONDAY_ASSETS.commentUser2,
      badge: '',
      badge2: '',
      time: '28분 전',
      text: '공감 100%예요 ㅠㅠ 다음화 퇴근길 러시도 그려주실 수 있나요? 꼭 정주행할게요!',
      likes: 39,
      liked: false,
    },
    {
      id: 'c3',
      name: '민초파',
      avatar: '',
      initial: '냥',
      badge: '',
      badge2: '',
      time: '45분 전',
      text: '그림체 인스타 릴스로 보면 더 대박일 것 같아요! 인스타 공유 완료했습니다 ✨',
      likes: 17,
      liked: false,
    },
  ]);

  const [isEpModalOpen, setIsEpModalOpen] = useState(false);
  const [epTab, setEpTab] = useState<'all' | 'bookmarked'>('all');
  const [showFolderCreator, setShowFolderCreator] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState<{ name: string; epNums: number[] }[]>([
    { name: '최애 힐링 에피소드', epNums: [17, 1] },
  ]);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(null);
  const [shareFolderModal, setShareFolderModal] = useState<{
    name: string;
    count: number;
  } | null>(null);

  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [proStep, setProStep] = useState<1 | 2>(1);
  const [proPayMethod, setProPayMethod] = useState('kakao');

  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [voteTab, setVoteTab] = useState<'select' | 'analytics'>('select');
  const [selectedVote, setSelectedVote] = useState<'optionA' | 'optionB' | 'optionC'>('optionA');
  const [voteCompleted, setVoteCompleted] = useState(false);
  const [voteComment, setVoteComment] = useState('');
  const [voteCounts, setVoteCounts] = useState({
    optionA: 1420,
    optionB: 660,
    optionC: 360,
  });

  const [isBingeModalOpen, setIsBingeModalOpen] = useState(false);
  const [bingeAutoNext, setBingeAutoNext] = useState(true);
  const [bingeFullscreen, setBingeFullscreen] = useState(false);
  const [bingeSpeed, setBingeSpeed] = useState<'0.8x' | '1.0x' | '1.5x'>('1.0x');
  const [isBingeActive, setIsBingeActive] = useState(false);

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [episodeTracks, setEpisodeTracks] = useState<Record<number, GeneratedMusicTrack>>({});

  useEffect(() => {
    setPanels(baseEpisode.panels);
    setIsTranslated(false);
    setTranslatedLines({});
    setRegenCounts({});
  }, [baseEpisode]);

  useEffect(() => {
    if (effectivePro) {
      setRemoveWatermark(true);
    }
  }, [effectivePro]);

  // Smooth auto-scroll during Binge Mode
  useEffect(() => {
    if (!isBingeActive) return;
    const stepPx = bingeSpeed === '0.8x' ? 1.1 : bingeSpeed === '1.5x' ? 2.6 : 1.7;
    const timer = window.setInterval(() => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 48;
      if (atBottom) {
        if (bingeAutoNext) {
          const sortedAsc = Object.values(allEpisodes)
            .filter((e) => effectivePro || !e.isProOnly)
            .sort((a, b) => a.epNum - b.epNum);
          const idx = sortedAsc.findIndex((e) => e.epNum === baseEpisode.epNum);
          const nextEp = idx >= 0 && idx < sortedAsc.length - 1 ? sortedAsc[idx + 1] : null;
          if (nextEp) {
            onShowToast(`⏭️ 자동 정주행: ${nextEp.epNum}화로 이동합니다!`);
            onSelectEpisode(nextEp.epNum);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setIsBingeActive(false);
            onShowToast('🏆 시리즈 마지막 화까지 정주행을 완료했습니다!');
          }
        }
      } else {
        window.scrollBy({ top: stepPx });
      }
    }, 32);

    return () => window.clearInterval(timer);
  }, [
    isBingeActive,
    bingeSpeed,
    bingeAutoNext,
    allEpisodes,
    effectivePro,
    baseEpisode.epNum,
    onSelectEpisode,
    onShowToast,
  ]);

  const sortedEpisodes = useMemo(
    () => Object.values(allEpisodes).sort((a, b) => b.epNum - a.epNum),
    [allEpisodes]
  );

  const activeMusicTrack = episodeTracks[baseEpisode.epNum] || null;
  const episodeMusicSummary = useMemo(() => {
    const titlePart = customPrompt || baseEpisode.title;
    const panelLines = panels
      .map((p) => `${p.cutLabel}: ${p.dialogue}${p.sfx ? ` (${p.sfx})` : ''}`)
      .join(' / ');
    return `${titlePart} — ${panelLines}`;
  }, [customPrompt, baseEpisode.title, panels]);

  const totalVotes = voteCounts.optionA + voteCounts.optionB + voteCounts.optionC;
  const pctA = Math.round((voteCounts.optionA / totalVotes) * 100);
  const pctB = Math.round((voteCounts.optionB / totalVotes) * 100);
  const pctC = Math.max(0, 100 - pctA - pctB);

  const openEditModal = (panel: ViewerPanel) => {
    setEditingPanelId(panel.id);
    setEditText(panel.dialogue);
  };

  const handleSaveDialogue = () => {
    if (!editingPanelId || !editText.trim()) return;
    setPanels((prev) =>
      prev.map((p) => (p.id === editingPanelId ? { ...p, dialogue: editText.trim() } : p))
    );
    setEditingPanelId(null);
    onShowToast('말풍선 대사가 수정되었습니다 💬');
  };

  const handleCycleExpression = (panelId: string) => {
    setPanels((prev) =>
      prev.map((p) => {
        if (p.id !== panelId) return p;
        const currentIdx = EXPRESSIONS.findIndex((em) => p.dialogue.includes(em));
        const nextEmoji = EXPRESSIONS[(currentIdx + 1) % EXPRESSIONS.length];
        const cleaned = p.dialogue.replace(/[😱😂🥹🔥😎✌️😌💦⚡️]/g, '').trim();
        return { ...p, dialogue: `${cleaned} ${nextEmoji}` };
      })
    );
    onShowToast('컷 표정 감정 표현이 변경되었습니다 😊');
  };

  const handleRegenCut = (panelId: string, cutLabel: string) => {
    const nextCount = (regenCounts[panelId] || 0) + 1;
    setRegenCounts((prev) => ({ ...prev, [panelId]: nextCount }));
    setPanels((prev) =>
      prev.map((p, idx) => {
        if (p.id !== panelId) return p;
        const nextImg = ALT_PANEL_IMAGES[(idx + nextCount) % ALT_PANEL_IMAGES.length];
        const nextBubble = REGEN_PHRASES[(idx + nextCount) % REGEN_PHRASES.length];
        return {
          ...p,
          image: nextImg,
          dialogue: nextBubble,
          sfx: p.sfx ? p.sfx : '반짝-✨',
        };
      })
    );
    onShowToast(`${cutLabel} AI 구도·선화 다시 그리기 완료 ✨`);
  };

  const handleToggleTranslate = async () => {
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }
    setTranslating(true);
    try {
      const res = await fetch('/api/reader/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: 'English',
          episodeTitle: baseEpisode.title,
          panels: panels.map((p, i) => ({
            id: p.id,
            narration: `${p.cutLabel} (${p.timeLabel})`,
            sfx: p.sfx || '',
            bubbles: [{ id: `${p.id}-b1`, speaker: `Speaker${i + 1}`, text: p.dialogue }],
          })),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          panels?: Array<{
            id: string;
            bubbles?: Array<{ id: string; text: string }>;
          }>;
        };
        if (data.panels?.length) {
          const map: Record<string, string> = {};
          data.panels.forEach((tp) => {
            const firstText = tp.bubbles?.[0]?.text;
            if (firstText) map[tp.id] = firstText;
          });
          if (Object.keys(map).length > 0) {
            setTranslatedLines(map);
            setIsTranslated(true);
            onShowToast('AI 대사 영어 번역이 적용되었습니다 🌐');
            return;
          }
        }
      }

      // Smart English fallback reflecting current panel count & episode
      const fallbackMap: Record<string, string> = {};
      panels.forEach((p, idx) => {
        if (baseEpisode.epNum === 18) {
          fallbackMap[p.id] =
            idx === 0
              ? 'Whoa! Already 8:45?! 😱'
              : idx === 1
                ? "If I miss this train, I'm definitely late...! 🍞💦"
                : idx === 2
                  ? "Please don't close the doors!! 🔥⚡️"
                  : 'Phew... I used up all my luck today haha ✌️😌';
        } else {
          fallbackMap[p.id] = `[EN Cut #${idx + 1}] ${
            idx === 0
              ? 'What a surprising start to the day! ✨'
              : idx === 1
                ? 'Wait... things are turning unexpected?! 😳'
                : idx === 2
                  ? 'Full speed ahead, no giving up now! 🔥'
                  : 'Another happy ending wrapped up neatly ✌️😌'
          }`;
        }
      });
      setTranslatedLines(fallbackMap);
      setIsTranslated(true);
      onShowToast('대사 영어 번역 보기 모드가 켜졌습니다 🌐');
    } catch {
      onShowToast('번역을 불러오지 못했습니다.');
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmitComment = () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    setViewerComments((prev) => [
      {
        id: `c-${Date.now()}`,
        name: '서연팬 독자',
        avatar: TOONDAY_ASSETS.userAvatar,
        badge: '',
        badge2: '',
        time: '방금 전',
        text: trimmed,
        likes: 1,
        liked: true,
      },
      ...prev,
    ]);
    setCommentInput('');
    onShowToast('댓글이 등록되었습니다 💬');
  };

  const handleRealExport = async (mode: 'insta' | 'gallery') => {
    setIsExporting(true);
    try {
      await exportWebtoonImage({
        episodeTitle: customPrompt ? customPrompt.slice(0, 24) : baseEpisode.title,
        panels,
        format: exportFormat,
        bgColor: storyBg.name,
        includeStamp,
        removeWatermark: effectivePro && removeWatermark,
      });
      setIsExportOpen(false);
      onShowToast(
        mode === 'insta'
          ? '📸 인스타 공유용 고해상도 PNG 이미지가 저장되었습니다!'
          : '💾 선택한 규격으로 갤러리 PNG 파일이 저장되었습니다!'
      );
    } catch {
      onShowToast('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePhotocardDownload = async () => {
    try {
      await exportPhotocardImage({
        episodeTitle: baseEpisode.title,
        panel: panels[0],
        author: baseEpisode.author,
      });
      onShowToast('🎁 포토카드 굿즈 인쇄용 PNG가 다운로드되었습니다!');
    } catch {
      onShowToast('포토카드 생성 중 오류가 발생했습니다.');
    }
  };

  const handleKakaoShare = async () => {
    const result = await shareOrCopyText({
      title: `[ToonDay] ${baseEpisode.title}`,
      text: `${baseEpisode.author} 작가의 4컷 웹툰을 지금 감상해보세요!`,
    });
    onShowToast(
      result === 'shared'
        ? '카카오톡 / OS 공유 시트가 열렸습니다 💬'
        : '카카오톡 공유 카드 메시지 및 링크가 복사되었습니다! 💬'
    );
  };

  const voteOptionLabels: Record<'optionA' | 'optionB' | 'optionC', string> = {
    optionA: '옵션 A: 칼퇴 사수 대작전 🔥',
    optionB: '옵션 B: 나 홀로 럭셔리 오마카세 ☕',
    optionC: '옵션 C: 냥줍의 서막 길고양이 구출 🌧️',
  };

  const prevEpNum =
    baseEpisode.epNum > 18
      ? 18
      : baseEpisode.epNum === 18
        ? 17
        : baseEpisode.epNum === 17
          ? 1
          : 18;

  const isBookmarked = bookmarkedEpIds.includes(baseEpisode.epNum);

  return (
    <div className="flex flex-col w-full relative">
      {/* Live Binge Auto-Scroll Floating Pill */}
      {isBingeActive && (
        <div
          className={`fixed top-20 -translate-x-1/2 z-40 w-[92%] max-w-[400px] bg-inverse-surface/95 text-inverse-on-surface px-3.5 py-2 rounded-full shadow-xl flex items-center justify-between gap-2 backdrop-blur-md ${
            isWebMode ? 'left-1/2 md:left-[calc(50%+8rem)]' : 'left-1/2'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping shrink-0" />
            <span className="text-[11px] font-bold truncate">
              정주행 자동 스크롤 ({bingeSpeed}) · {baseEpisode.epNum}화
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                setBingeSpeed((s) => (s === '0.8x' ? '1.0x' : s === '1.0x' ? '1.5x' : '0.8x'))
              }
              className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold"
            >
              속도
            </button>
            <button
              type="button"
              onClick={() => setIsBingeActive(false)}
              className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold"
            >
              일시정지
            </button>
          </div>
        </div>
      )}

      {/* Top Episode Switcher Bar */}
      {!bingeFullscreen && (
        <div className="px-4 py-2 bg-surface-container-low border-b border-outline-variant/50 z-20 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onSelectEpisode(prevEpNum)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 text-on-surface text-xs font-medium active:scale-95 transition-all truncate"
            >
              <span className="material-symbols-outlined text-[15px] text-primary shrink-0">
                chevron_left
              </span>
              <span className="truncate text-[11px]">{prevEpNum}화</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEpModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-outline-variant text-on-surface shadow-sm active:scale-95 transition-all shrink-0"
              style={{
                background:
                  'linear-gradient(100deg, rgba(255, 99, 132, 0.15) 0%, rgba(255, 154, 162, 0.2) 25%, rgba(255, 218, 165, 0.25) 50%, rgba(206, 246, 201, 0.25) 75%, rgba(160, 231, 255, 0.2) 100%)',
                borderColor: 'rgba(255, 154, 162, 0.6)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-bold font-headline">{baseEpisode.epNum}화</span>
              <span className="text-[10px] text-secondary font-medium font-mono">
                / {Math.max(19, baseEpisode.epNum)}
              </span>
              <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-tertiary-fixed text-on-tertiary-fixed">
                {baseEpisode.epNum >= 18 ? '최신' : '인기'}
              </span>
              <span className="material-symbols-outlined text-[14px] text-outline">
                keyboard_arrow_down
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (baseEpisode.epNum < 18) {
                  onSelectEpisode(18);
                } else if (baseEpisode.epNum === 18) {
                  if (effectivePro) {
                    onSelectEpisode(19);
                  } else {
                    setIsProModalOpen(true);
                  }
                } else {
                  onSelectEpisode(18);
                }
              }}
              className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg bg-surface-container/60 border border-outline-variant/40 text-outline text-[11px] font-medium shrink-0"
              title={baseEpisode.epNum === 18 ? '19화 선공개 보기' : '다음화'}
            >
              <span className="truncate text-[10px]">
                {baseEpisode.epNum === 18 ? '19화' : '다음화'}
              </span>
              <span className="material-symbols-outlined text-[15px] text-outline shrink-0">
                chevron_right
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsBingeModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-white text-[11px] font-bold shadow-sm active:scale-95 transition-all shrink-0"
            style={{
              background:
                'linear-gradient(90deg, rgb(255, 94, 126) 0%, rgb(255, 142, 160) 30%, rgb(255, 179, 123) 70%, rgb(71, 207, 153) 100%)',
              textShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 2px',
            }}
          >
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            <span className="whitespace-nowrap">1화부터 정주행</span>
          </button>
        </div>
      )}

      {/* Top Meta & Title Header */}
      <section className="viewer-meta-section px-4 py-3 bg-surface-container-lowest shadow-sm z-20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-container text-on-primary-container tracking-wider uppercase">
                AI Episode
              </span>
              <span className="text-[11px] font-medium text-secondary">{baseEpisode.subtitle}</span>
            </div>
            <h2 className="text-base font-headline font-bold text-on-surface leading-tight truncate">
              {customPrompt ? `${customPrompt.slice(0, 26)}` : baseEpisode.title}
            </h2>
            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[13px] text-tertiary">palette</span>
              스타일: {baseEpisode.styleName}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0 pt-1">
            {onOpenInstagramPublish && (
              <button
                type="button"
                onClick={() => {
                  const captionText = panels
                    .slice(0, 3)
                    .map((p) => p.dialogue)
                    .filter(Boolean)
                    .join(' / ');
                  onOpenInstagramPublish({
                    episodeId: baseEpisode.epNum,
                    title: customPrompt ? customPrompt.slice(0, 26) : baseEpisode.title,
                    caption: captionText || baseEpisode.subtitle || baseEpisode.title,
                    imageUrl: baseEpisode.thumbnail,
                    styleName: baseEpisode.styleName,
                  });
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform ${
                  instagramRecord
                    ? 'bg-emerald-600 text-white'
                    : 'bg-primary/12 text-primary hover:bg-primary/20'
                }`}
                title={instagramRecord ? '인스타 게시됨 (발행 기록 보기)' : 'n8n 인스타그램 자동 올리기'}
              >
                <span className="material-symbols-outlined text-[17px]">
                  {instagramRecord ? 'check_circle' : 'photo_camera'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onToggleBookmark(baseEpisode.epNum)}
              className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform ${
                isBookmarked
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
              title="북마크 저장"
            >
              <span
                className="material-symbols-outlined text-[17px]"
                style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
              >
                bookmark
              </span>
            </button>
            <button
              type="button"
              onClick={async () => {
                const res = await shareOrCopyText({
                  title: baseEpisode.title,
                  text: `ToonDay에서 '${baseEpisode.title}' 웹툰을 감상해보세요!`,
                });
                onShowToast(
                  res === 'shared'
                    ? '웹툰 공유 창을 열었습니다 ✨'
                    : '툰 링크가 클립보드에 복사되었습니다!'
                );
              }}
              className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"
              title="공유하기"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"
              title="다운로드"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
            <button
              type="button"
              onClick={() => setShowEditToolbars((v) => !v)}
              className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform ${
                showEditToolbars
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
              title="편집 툴바 토글"
            >
              <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
            </button>
          </div>
        </div>

        {/* Quick Format Selector Pill */}
        <div className="flex items-center justify-between mt-3 pt-2.5 bg-surface-container-low rounded-xl px-3 py-1.5 gap-1">
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant min-w-0">
            <span className="material-symbols-outlined text-[15px] text-primary shrink-0">
              view_timeline
            </span>
            <span className="font-medium truncate">웹툰 규격</span>
            <span className="text-outline text-[11px] truncate">· {panels.length}컷 세로</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsMusicModalOpen(true)}
              className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all active:scale-95 ${
                activeMusicTrack
                  ? 'bg-primary text-on-primary border-primary shadow-xs'
                  : 'bg-secondary-container text-primary border-primary/30 hover:bg-primary/15'
              }`}
              title="웹툰 내용에 어울리는 AI BGM 만들기"
            >
              <span className="material-symbols-outlined text-[12px]">music_note</span>
              <span>{activeMusicTrack ? 'BGM ON' : '맞춤 BGM'}</span>
            </button>
            <button
              type="button"
              onClick={handleToggleTranslate}
              disabled={translating}
              className={`flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                isTranslated
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant/50'
              }`}
              title="AI 영어 번역 토글"
            >
              <span className="material-symbols-outlined text-[12px]">translate</span>
              <span>{translating ? '번역 중' : isTranslated ? 'EN ON' : '번역'}</span>
            </button>
            <button
              id="btn-toggle-dark-chip"
              type="button"
              onClick={onToggleDarkMode}
              className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors active:scale-95 ${
                isDarkMode
                  ? 'bg-primary text-on-primary border-primary'
                  : 'text-on-surface-variant bg-surface-container hover:bg-surface-container-high border-outline-variant/50'
              }`}
            >
              <span className="material-symbols-outlined text-[13px] theme-icon-chip">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="theme-text-chip font-bold">
                {isDarkMode ? '라이트 모드' : '다크 모드 OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Inline AI BGM Bar */}
        {activeMusicTrack ? (
          <div className="mt-2.5 p-2.5 rounded-xl bg-surface-container-low border border-primary/30 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[16px] text-primary animate-pulse shrink-0">
                  graphic_eq
                </span>
                <span className="text-[11px] font-bold text-on-surface truncate">
                  {activeMusicTrack.mood} · {activeMusicTrack.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMusicModalOpen(true)}
                className="text-[10px] font-bold text-primary hover:underline shrink-0"
              >
                다시 작곡
              </button>
            </div>
            <audio
              key={activeMusicTrack.audioDataUrl}
              controls
              loop
              src={activeMusicTrack.audioDataUrl}
              className="w-full h-8"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsMusicModalOpen(true)}
            className="w-full mt-2.5 px-3 py-2 rounded-xl border border-primary/25 flex items-center justify-between gap-2 text-left active:scale-[0.99] transition-all"
            style={{
              background:
                'linear-gradient(110deg, rgba(255, 83, 118, 0.08) 0%, rgba(255, 211, 165, 0.14) 55%, rgba(141, 228, 255, 0.14) 100%)',
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[17px] text-primary shrink-0">
                music_note
              </span>
              <span className="text-[11px] font-bold text-on-surface truncate">
                이 웹툰 내용에 어울리는 AI 맞춤 BGM 생성하기
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold shrink-0">
              작곡하기
            </span>
          </button>
        )}

        <div
          className="w-full h-1.5 rounded-full mt-2.5 shadow-sm overflow-hidden flex"
          style={{
            background:
              'linear-gradient(90deg, rgb(255, 94, 126) 0%, rgb(255, 154, 162) 25%, rgb(255, 218, 165) 50%, rgb(181, 245, 190) 75%, rgb(136, 231, 255) 100%)',
          }}
        />
      </section>

      {/* Webtoon Vertical Scroll Track */}
      <div className={`w-full px-4 py-4 flex flex-col gap-5 ${isWebMode ? 'max-w-xl mx-auto' : ''}`}>
        {panels.map((panel, index) => (
          <article
            key={panel.id}
            className="viewer-panel-card relative flex flex-col bg-surface-container-lowest rounded-xl shadow-md overflow-hidden group"
          >
            {/* Panel Badge */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-surface-container-highest/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  index === 2 ? 'bg-error animate-ping' : index === 0 ? 'bg-primary animate-pulse' : 'bg-primary'
                }`}
              />
              <span className="text-[11px] font-bold text-on-surface">{panel.cutLabel}</span>
              <span
                className={`text-[10px] font-mono ${
                  index === 2 ? 'text-error font-bold' : 'text-on-surface-variant'
                }`}
              >
                {panel.timeLabel}
              </span>
            </div>

            {/* Comic Canvas Area */}
            <div className="relative w-full aspect-[4/5] bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover transition-all duration-300"
                alt={panel.alt}
                referrerPolicy="no-referrer"
                src={panel.image}
              />

              {/* Speech Bubble Overlay */}
              <div
                onClick={() => openEditModal(panel)}
                className={`absolute ${
                  panel.bubbleAlign === 'right' ? 'top-16 right-4' : 'top-14 left-4'
                } max-w-[75%] z-10 transition-transform active:scale-95 cursor-pointer`}
              >
                <div
                  className={`speech-bubble-box relative bg-surface-container-lowest text-on-surface px-4 py-2.5 rounded-2xl ${
                    panel.bubbleAlign === 'right' ? 'rounded-tr-none' : 'rounded-tl-none'
                  } shadow-lg`}
                >
                  <p
                    className={`text-sm font-bold tracking-tight leading-snug ${
                      panel.dialogueClass || ''
                    }`}
                  >
                    {isTranslated && translatedLines[panel.id]
                      ? translatedLines[panel.id]
                      : panel.dialogue}
                  </p>
                  <div
                    className={`speech-bubble-tail absolute -top-1.5 ${
                      panel.bubbleAlign === 'right' ? 'right-0' : 'left-0'
                    } w-3 h-3 bg-surface-container-lowest rotate-45`}
                  />
                </div>
              </div>

              {/* Floating SFX */}
              {panel.sfx && (
                <div
                  className={`absolute z-10 pointer-events-none ${
                    index === 1 ? 'bottom-6 right-5' : 'bottom-5 left-4'
                  }`}
                >
                  <span
                    className={`inline-block font-black tracking-tighter italic ${
                      panel.sfxColor === 'error'
                        ? 'text-2xl text-error drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] rotate-[-8deg]'
                        : panel.sfxColor === 'tertiary'
                          ? 'text-2xl text-tertiary drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] rotate-[6deg]'
                          : 'text-3xl text-on-surface bg-surface-container-lowest/90 px-3 py-1 rounded-lg shadow rotate-[-5deg]'
                    }`}
                  >
                    {panel.sfx}
                  </span>
                </div>
              )}

              {/* Watermark on final cut (hidden if PRO & removeWatermark) */}
              {panel.showWatermark && !(effectivePro && removeWatermark) && (
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-surface/75 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm">
                  <span className="material-symbols-outlined text-[12px] text-primary">
                    auto_stories
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider text-on-surface/80">
                    ToonDay Free
                  </span>
                </div>
              )}
            </div>

            {/* Interactive Quick Edit Toolbar */}
            {showEditToolbars && (
              <div className="viewer-panel-toolbar p-2.5 bg-surface-container-lowest flex items-center justify-between gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => openEditModal(panel)}
                  className="viewer-panel-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant transition-colors flex-1 justify-center active:scale-95"
                >
                  <span className="material-symbols-outlined text-[15px]">chat_bubble</span>
                  <span className="font-medium text-[11px]">대사 수정</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRegenCut(panel.id, panel.cutLabel)}
                  className="viewer-panel-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant transition-colors flex-1 justify-center active:scale-95"
                >
                  <span className="material-symbols-outlined text-[15px]">replay</span>
                  <span className="font-medium text-[11px]">이 컷 재생성</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCycleExpression(panel.id)}
                  className="viewer-panel-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant transition-colors flex-1 justify-center active:scale-95"
                >
                  <span className="material-symbols-outlined text-[15px]">mood</span>
                  <span className="font-medium text-[11px]">표정 변경</span>
                </button>
              </div>
            )}
          </article>
        ))}

        {/* Marathon Binge Start Card */}
        <section
          className="bg-surface-container-lowest border-2 border-primary/30 rounded-2xl p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 94, 126, 0.12) 0%, rgba(255, 154, 162, 0.15) 25%, rgba(255, 218, 165, 0.18) 50%, rgba(181, 245, 190, 0.18) 75%, rgba(136, 231, 255, 0.15) 100%)',
            borderColor: 'rgba(255, 154, 162, 0.6)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">⚡</span>
              <h3 className="text-xs font-bold text-on-surface">
                서연의 하루 시리즈 1화부터 정주행
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary text-on-primary">
              전회차 무료 감상
            </span>
          </div>

          <div
            onClick={() => onSelectEpisode(1)}
            className="p-3 bg-surface-container-low/95 border border-outline-variant/50 rounded-xl flex items-center gap-3 relative cursor-pointer hover:bg-surface-container"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container relative shadow-sm">
              <img
                className="w-full h-full object-cover"
                src={VIEWER_EP1_THUMB}
                alt="1화: 첫 출근의 설렘"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-0.5 left-0.5 bg-primary text-on-primary text-[8px] font-bold px-1 rounded">
                1화 START
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[10px] text-secondary font-mono">
                  총 {sortedEpisodes.length}화 구성
                </span>
                <span className="text-outline text-[10px]">·</span>
                <span className="text-[10px] text-primary font-bold font-mono">
                  평균 소요 약 7분
                </span>
              </div>
              <p className="text-xs font-bold text-on-surface truncate">
                01화: 두근두근 신입사원의 첫 출근길 ☕
              </p>
              <p className="text-[10px] text-on-surface-variant leading-tight mt-0.5">
                지하철 세이프의 주인공 서연이의 좌충우돌 첫 시작 이야기!
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-on-surface-variant font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-primary">auto_mode</span>
                <span>정주행 완독 진척도</span>
              </span>
              <span className="font-mono font-bold text-primary">
                {baseEpisode.epNum} / {Math.max(18, baseEpisode.epNum)}화
              </span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden flex">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round((baseEpisode.epNum / 18) * 100))}%`,
                  background:
                    'linear-gradient(90deg, rgb(255, 94, 126) 0%, rgb(255, 154, 162) 100%)',
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => {
                onSelectEpisode(1);
                setIsBingeActive(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onShowToast('🚀 1화 [첫 출근의 설렘] 정주행 자동 스크롤을 시작합니다!');
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
              style={{
                background:
                  'linear-gradient(90deg, rgb(255, 94, 126) 0%, rgb(255, 142, 160) 25%, rgb(255, 179, 123) 50%, rgb(71, 207, 153) 75%, rgb(57, 188, 229) 100%)',
                textShadow: 'rgba(0, 0, 0, 0.25) 0px 1px 2px',
              }}
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>1화부터 바로 정주행 시작</span>
            </button>
            <button
              type="button"
              onClick={() => setIsBingeModalOpen(true)}
              className="px-3 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 text-on-surface text-xs font-semibold active:scale-95 transition-all flex items-center gap-1 shrink-0"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">tune</span>
              <span>옵션</span>
            </button>
          </div>

          <div className="pt-1 border-t border-outline-variant/40">
            <button
              type="button"
              onClick={() => setIsRewardModalOpen(true)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-primary/40 bg-surface-container-lowest/90 hover:bg-surface-container-high transition-all active:scale-98 group"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg group-hover:scale-110 transition-transform">🏆</span>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-on-surface">
                      18화 전편 완독 리워드 도착!
                    </p>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary text-on-primary animate-pulse">
                      보너스
                    </span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant">
                    한정판 골든 스탬프 &amp; [새벽의 정주행러] 뱃지 수령하기
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-primary text-on-primary text-[11px] font-bold shadow-sm shrink-0 flex items-center gap-0.5">
                <span>리워드 받기</span>
                <span className="material-symbols-outlined text-[13px]">chevron_right</span>
              </span>
            </button>
          </div>
        </section>

        {/* Next Episode Preview Card */}
        <div
          className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 99, 132, 0.08) 0%, rgba(255, 154, 162, 0.1) 25%, rgba(255, 218, 165, 0.12) 50%, rgba(181, 245, 190, 0.12) 75%, rgba(136, 231, 255, 0.1) 100%)',
            borderColor: 'rgba(255, 154, 162, 0.5)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">✨</span>
              <h4 className="text-xs font-bold text-on-surface">이번 화가 마음에 드셨나요?</h4>
            </div>
            <span className="text-[10px] font-bold text-primary bg-primary-fixed/30 px-2 py-0.5 rounded-full">
              다음 에피소드 안내
            </span>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 flex items-center gap-3 relative">
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container relative shadow-sm">
              <img
                className="w-full h-full object-cover"
                src={VIEWER_EP19_THUMB}
                alt="19화 미리보기"
                referrerPolicy="no-referrer"
              />
              {!effectivePro && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[20px]">lock</span>
                </div>
              )}
              <div className="absolute top-0.5 left-0.5 bg-primary text-on-primary text-[8px] font-bold px-1 rounded">
                19화 미리보기
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-secondary-container text-on-secondary-container">
                  PRO 선공개
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  {effectivePro ? '바로 감상 가능' : '내일 09:00 공개'}
                </span>
              </div>
              <p className="text-xs font-bold text-on-surface truncate">
                19화: 비 오는 날 깜짝 야근과 버스 놓친 썰 ☔
              </p>
              <p className="text-[10px] text-on-surface-variant leading-tight mt-0.5">
                우산 없이 퇴근길 폭우를 마주한 서연의 대탈출기!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAlarmSet((prev) => {
                  const next = !prev;
                  onShowToast(
                    next
                      ? '19화 공개 알림이 설정되었습니다! 내일 오전 9시에 알려드릴게요 🔔'
                      : '다음화 공개 알림 설정이 해제되었습니다.'
                  );
                  return next;
                });
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold active:scale-95 transition-all ${
                alarmSet
                  ? 'bg-tertiary-fixed/40 border-tertiary text-on-tertiary-fixed font-bold'
                  : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/60 text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">
                {alarmSet ? 'notifications_paused' : 'notifications_active'}
              </span>
              <span>{alarmSet ? '알림 설정됨 🔔' : '다음화 알림 받기'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (effectivePro) {
                  onSelectEpisode(19);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setIsProModalOpen(true);
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
              style={{
                background:
                  'linear-gradient(90deg, rgb(255, 94, 126) 0%, rgb(255, 131, 155) 25%, rgb(252, 162, 110) 50%, rgb(60, 198, 138) 75%, rgb(41, 182, 246) 100%)',
                color: 'rgb(255, 255, 255)',
                textShadow: 'rgba(0, 0, 0, 0.25) 0px 1px 2px',
              }}
            >
              <span className="material-symbols-outlined text-[16px]">lock_open</span>
              <span>{effectivePro ? '19화 바로 감상하기' : '19화 선공개 보기'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-outline-variant/40 text-[11px] text-on-surface-variant">
            <button
              type="button"
              onClick={() => onSelectEpisode(17)}
              className="flex items-center gap-0.5 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              <span>이전 17화 다시보기</span>
            </button>
            <span className="text-[10px] text-outline font-medium">작가: 서연 일상툰</span>
          </div>
        </div>

        {/* Reader Vote Card */}
        <div
          className="border border-primary/30 rounded-2xl p-3.5 shadow-sm flex flex-col gap-2.5"
          style={{
            background:
              'linear-gradient(120deg, rgba(255, 94, 126, 0.12) 0%, rgba(255, 154, 162, 0.15) 25%, rgba(255, 218, 165, 0.2) 50%, rgba(181, 245, 190, 0.18) 75%, rgba(136, 231, 255, 0.15) 100%)',
            borderColor: 'rgba(255, 154, 162, 0.6)',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center text-lg shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[22px]">how_to_vote</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary text-on-primary">
                    독자 투표
                  </span>
                  <span className="text-[10px] text-error font-bold font-mono">D-3일 마감</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-surface-container text-[9px] font-semibold text-secondary font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                    {totalVotes.toLocaleString()}명 참여 중
                  </span>
                </div>
                <h4 className="text-xs font-bold text-on-surface truncate">
                  다음 주 20화 스토리 독자 투표 진행 중!
                </h4>
                <p className="text-[10px] text-on-surface-variant leading-tight mt-0.5">
                  투표 1위 스토리가 실제 콘티로 연재됩니다 🗳️
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsVoteModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold shrink-0 shadow-sm active:scale-95 transition-all flex items-center gap-1 whitespace-nowrap"
              style={{
                background:
                  'linear-gradient(90deg, rgb(255, 94, 126) 0%, rgb(255, 137, 155) 25%, rgb(255, 177, 120) 50%, rgb(72, 201, 145) 75%, rgb(52, 181, 229) 100%)',
                color: 'rgb(255, 255, 255)',
                textShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 2px',
              }}
            >
              <span className="material-symbols-outlined text-[15px]">
                {voteCompleted ? 'task_alt' : 'ballot'}
              </span>
              <span>{voteCompleted ? '투표 완료' : '투표하기'}</span>
            </button>
          </div>
          <div className="bg-surface-container-low/90 border border-outline-variant/40 rounded-xl p-2 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-on-surface flex items-center gap-1">
                <span className="text-xs">👑</span>
                <span className="truncate font-bold">실시간 1위: 옵션 A 칼퇴 사수 대작전</span>
              </span>
              <span className="font-mono font-extrabold text-primary shrink-0">
                {pctA}% ({voteCounts.optionA.toLocaleString()}표)
              </span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden flex">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pctA}%`,
                  background:
                    'linear-gradient(90deg, rgb(255, 94, 126) 0%, rgb(255, 154, 162) 25%, rgb(255, 218, 165) 50%, rgb(138, 233, 165) 75%, rgb(118, 215, 255) 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ToonDay PRO Upsell Banner */}
        <section className="bg-gradient-to-r from-primary/10 via-secondary-container to-primary/5 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">diamond</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-on-surface">ToonDay PRO</h4>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed">
                  {effectivePro ? '이용 중' : '무료체험'}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-snug mt-0.5">
                워터마크 완전 제거 &amp; 4K 인쇄용 초고화질 무제한 저장
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('subscription')}
            className="px-3 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shrink-0 hover:bg-primary-container transition-colors shadow-sm active:scale-95 whitespace-nowrap"
          >
            {effectivePro ? '내 플랜' : '혜택 보기'}
          </button>
        </section>

        {/* Saved Capsule */}
        <div className="flex items-center justify-center gap-2 py-1 text-xs text-secondary font-medium">
          <span
            className="material-symbols-outlined text-[16px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <span>내 툰 보관함에 자동 저장되었습니다</span>
        </div>

        {/* Comments & Cheer Bar */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCommentsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-secondary-container text-on-surface text-xs font-semibold active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[17px] text-primary">chat</span>
              <span>댓글 {25 + viewerComments.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCommentsOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-all"
              style={{
                background:
                  'linear-gradient(90deg, rgb(255, 238, 241) 0%, rgb(255, 244, 230) 50%, rgb(232, 251, 243) 100%)',
                border: '1px solid rgba(255, 154, 162, 0.6)',
                color: 'rgb(183, 25, 69)',
              }}
            >
              <span className="material-symbols-outlined text-[16px] text-primary">favorite</span>
              <span>응원하기</span>
            </button>
          </div>
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            <img
              className="w-6 h-6 rounded-full object-cover border-2 border-surface-container-lowest"
              src={TOONDAY_ASSETS.userAvatar}
              alt="User 1"
              referrerPolicy="no-referrer"
            />
            <img
              className="w-6 h-6 rounded-full object-cover border-2 border-surface-container-lowest"
              src={TOONDAY_ASSETS.commentUser2}
              alt="User 2"
              referrerPolicy="no-referrer"
            />
            <div className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed text-[9px] font-bold flex items-center justify-center border-2 border-surface-container-lowest">
              +26
            </div>
          </div>
        </div>

        <div className="h-28" />
      </div>

      {/* Floating Sticky Bottom Action Toolbar */}
      {!bingeFullscreen && (
        <aside
          className={`viewer-bottom-bar fixed bottom-0 z-40 bg-surface/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 pt-3 pb-safe ${
            isWebMode
              ? 'left-0 md:left-64 right-0'
              : isAppFrame
                ? 'left-0 right-0 w-full'
                : 'left-1/2 -translate-x-1/2 w-full max-w-[430px]'
          }`}
        >
          <div className={`flex flex-col gap-2.5 mb-2 ${isWebMode ? 'max-w-2xl mx-auto' : ''}`}>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-white font-bold text-xs shadow-sm hover:opacity-95 active:scale-98 transition-all"
                style={{
                  background:
                    'linear-gradient(90deg, rgb(255, 94, 126) 0%, rgb(255, 143, 160) 25%, rgb(252, 174, 116) 50%, rgb(70, 207, 152) 75%, rgb(52, 190, 232) 100%)',
                  textShadow: 'rgba(0, 0, 0, 0.25) 0px 1px 2px',
                  boxShadow: 'rgba(255, 94, 126, 0.25) 0px 4px 12px',
                }}
              >
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                <span className="truncate">인스타 스토리·피드</span>
              </button>
              <button
                type="button"
                onClick={handleKakaoShare}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#FEE500] text-[#191919] font-bold text-xs shadow-sm hover:opacity-95 active:scale-98 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                <span className="truncate">카카오톡 공유</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              {onOpenInstagramPublish && (
                <button
                  type="button"
                  onClick={() => {
                    const captionText = panels
                      .slice(0, 3)
                      .map((p) => p.dialogue)
                      .filter(Boolean)
                      .join(' / ');
                    onOpenInstagramPublish({
                      episodeId: baseEpisode.epNum,
                      title: customPrompt ? customPrompt.slice(0, 26) : baseEpisode.title,
                      caption: captionText || baseEpisode.subtitle || baseEpisode.title,
                      imageUrl: baseEpisode.thumbnail,
                      styleName: baseEpisode.styleName,
                    });
                  }}
                  className={`flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all active:scale-98 ${
                    instagramRecord
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-secondary-container text-on-secondary-container hover:bg-primary/15 hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {instagramRecord ? 'check_circle' : 'send'}
                  </span>
                  <span>{instagramRecord ? '인스타 게시됨' : '인스타 올리기'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handlePhotocardDownload}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-semibold text-xs active:scale-98 transition-all min-w-0"
              >
                <span className="material-symbols-outlined text-[16px] text-tertiary shrink-0">
                  card_giftcard
                </span>
                <span className="truncate">포토카드 굿즈 인쇄</span>
              </button>
              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                className="flex items-center justify-center gap-1 py-2.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-sm hover:bg-primary-container active:scale-98 transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>저장</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* MODAL 1: Dialogue Edit Modal */}
      {editingPanelId && (
        <div
          onClick={() => setEditingPanelId(null)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-t-2xl w-full max-w-[430px] p-5 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
                <h3 className="font-bold text-base text-on-surface">말풍선 대사 수정</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPanelId(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                선택된 컷 말풍선 텍스트
              </label>
              <textarea
                rows={3}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface p-3 rounded-xl text-sm outline-none shadow-sm focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingPanelId(null)}
                className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-semibold text-xs"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveDialogue}
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-sm"
              >
                대사 적용하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Export / Story Save Modal */}
      {isExportOpen && (
        <div
          onClick={() => setIsExportOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-t-2xl w-full max-w-[430px] p-5 shadow-2xl flex flex-col gap-4 max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">ios_share</span>
                <h3 className="font-bold text-base text-on-surface">웹툰 내보내기 &amp; 저장</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExportOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                내보내기 규격 선택
              </label>
              <div className="flex flex-col gap-2">
                {[
                  {
                    id: 'story' as const,
                    emoji: '📱',
                    title: '인스타 스토리용 (9:16)',
                    badge: '추천',
                    desc: '세로 컷 최적화 · 배경 그라데이션 자동 생성',
                  },
                  {
                    id: 'feed' as const,
                    emoji: '🖼️',
                    title: '인스타 피드 4컷 슬라이드 (1:1)',
                    desc: '정사각형 4컷 피드 이미지 저장',
                  },
                  {
                    id: 'scroll' as const,
                    emoji: '📜',
                    title: '웹툰 전체 세로 스크롤',
                    desc: '원문 무손실 4컷 롱이미지 한 장으로 묶기',
                  },
                ].map((opt) => {
                  const selected = exportFormat === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setExportFormat(opt.id)}
                      className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        selected
                          ? 'border-2 border-primary bg-primary-fixed/30'
                          : 'border border-outline-variant bg-surface-container-lowest hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${
                            selected ? 'bg-primary text-on-primary' : 'bg-surface-container-high'
                          }`}
                        >
                          {opt.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-on-surface">{opt.title}</p>
                            {opt.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          selected ? 'text-primary' : 'text-outline'
                        }`}
                      >
                        {selected ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl flex items-center gap-3">
              <div
                className="w-16 h-24 rounded-lg overflow-hidden shrink-0 shadow-sm border border-outline-variant relative flex items-center justify-center p-1"
                style={{ background: storyBg.color }}
              >
                <img
                  className="w-full h-full object-cover rounded"
                  src={baseEpisode.thumbnail}
                  alt="스토리 프리뷰"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/40 rounded text-[9px] text-white font-mono">
                  {exportFormat === 'story' ? '9:16' : exportFormat === 'feed' ? '1:1' : 'SCROLL'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-primary">스토리 템플릿 프리뷰</span>
                <p className="text-xs font-bold text-on-surface truncate mt-0.5">
                  {baseEpisode.title} ({panels.length}컷)
                </p>
                <p className="text-[11px] text-on-surface-variant leading-tight mt-1">
                  고해상도 PNG 규격으로 인스타 스티커 및 링크 태그에 최적화됩니다.
                </p>
              </div>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-primary">palette</span>
                  스토리 배경 컬러 커스텀
                </span>
                <span className="text-[10px] text-primary font-medium">{storyBg.name}</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  {
                    color: 'linear-gradient(135deg, rgba(240, 148, 51, 0.25), rgba(188, 24, 136, 0.25))',
                    name: '인스타 선셋',
                  },
                  { color: '#7C3AED', name: '시그니처 퍼플' },
                  { color: '#1E1B4B', name: '미드나잇 네이비' },
                  { color: '#F43F5E', name: '코랄 선셋' },
                  { color: '#0F172A', name: '딥 블랙' },
                  { color: '#EC4899', name: '캔디 핑크' },
                  { color: '#F59E0B', name: '따뜻한 앰버' },
                  { color: '#FFFFFF', name: '클린 화이트' },
                  {
                    color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                    name: '파스텔 드림',
                  },
                ].map((sw) => {
                  const active = storyBg.name === sw.name;
                  return (
                    <button
                      key={sw.name}
                      type="button"
                      onClick={() => setStoryBg(sw)}
                      className={`w-7 h-7 rounded-full shrink-0 transition-transform active:scale-90 flex items-center justify-center border border-outline-variant/40 ${
                        active ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      style={{ background: sw.color }}
                    >
                      {active && (
                        <span className="material-symbols-outlined text-[14px] text-primary">
                          check
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <div
                onClick={() => {
                  if (effectivePro) {
                    setRemoveWatermark((v) => !v);
                  } else {
                    setIsProModalOpen(true);
                  }
                }}
                className="flex items-center justify-between py-1.5 px-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-on-surface">워터마크 완전 제거</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary-container text-on-primary-container">
                    PRO
                  </span>
                </div>
                <div
                  className={`w-8 h-4 rounded-full flex items-center px-0.5 ${
                    effectivePro && removeWatermark
                      ? 'bg-primary justify-end'
                      : 'bg-surface-container-highest'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      effectivePro && removeWatermark ? 'bg-on-primary' : 'bg-outline'
                    }`}
                  />
                </div>
              </div>
              <div
                onClick={() => setIncludeStamp((s) => !s)}
                className="flex items-center justify-between py-1.5 px-1 cursor-pointer"
              >
                <span className="text-xs font-semibold text-on-surface">
                  컷 타이틀 &amp; 시간 스탬프 포함
                </span>
                <div
                  className={`w-8 h-4 rounded-full flex items-center px-0.5 ${
                    includeStamp ? 'bg-primary justify-end' : 'bg-surface-container-highest'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      includeStamp ? 'bg-on-primary' : 'bg-outline'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleRealExport('insta')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold text-xs shadow-md disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                <span>{isExporting ? '이미지 생성 중...' : '인스타그램 앱으로 바로 공유'}</span>
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleRealExport('gallery')}
                className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-semibold text-xs disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  file_download
                </span>
                <span>갤러리에 이미지 저장 (PNG)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Comments & Author Funding Modal */}
      {isCommentsOpen && (
        <div
          onClick={() => setIsCommentsOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-t-2xl w-full max-w-[430px] shadow-2xl flex flex-col max-h-[88vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 pb-3 border-b border-surface-container-highest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  chat_bubble
                </span>
                <h3 className="font-bold text-base text-on-surface">
                  댓글 및 작가 응원{' '}
                  <span className="text-primary text-sm font-semibold">
                    ({25 + viewerComments.length})
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div
                className="rounded-2xl p-3.5 border shadow-sm"
                style={{
                  background:
                    'linear-gradient(125deg, rgba(255, 94, 126, 0.15) 0%, rgba(255, 154, 162, 0.18) 25%, rgba(255, 218, 165, 0.22) 50%, rgba(181, 245, 190, 0.2) 75%, rgba(136, 231, 255, 0.18) 100%)',
                  borderColor: 'rgba(255, 154, 162, 0.6)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">☕</span>
                    <span className="text-xs font-bold text-on-surface">
                      작가님에게 커피 한 잔 선물하기
                    </span>
                  </div>
                  <span className="text-[10px] text-primary font-bold bg-surface/80 px-2 py-0.5 rounded-full">
                    창작 응원 펀딩
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                  {['1,000원', '3,000원', '5,000원', '10,000원'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCoffeeAmount(amt)}
                      className={`py-1.5 rounded-lg text-xs text-center transition-all ${
                        coffeeAmount === amt
                          ? 'border border-primary bg-primary text-on-primary font-bold'
                          : 'border border-outline-variant bg-surface-container-lowest text-on-surface font-medium'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewerComments((prev) => [
                      {
                        id: `sup-${Date.now()}`,
                        name: '응원 독자',
                        avatar: TOONDAY_ASSETS.userAvatar,
                        badge: '후원',
                        badge2: `☕ ${coffeeAmount} 커피 선물`,
                        time: '방금 전',
                        text: `작가님 항상 재미있게 보고 있어요! 따뜻한 커피 ${coffeeAmount} 보냅니다 💖`,
                        likes: 1,
                        liked: true,
                      },
                      ...prev,
                    ]);
                    onShowToast(`작가님께 따뜻한 ${coffeeAmount} 응원을 전달했습니다 ☕💖`);
                  }}
                  className="w-full py-2.5 rounded-xl text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
                  style={{
                    background:
                      'linear-gradient(90deg, rgb(255, 94, 126) 0%, rgb(255, 142, 160) 25%, rgb(255, 179, 123) 50%, rgb(71, 207, 153) 75%, rgb(57, 188, 229) 100%)',
                    textShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 2px',
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
                  <span>따뜻한 응원 보내기</span>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {viewerComments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 shadow-sm flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {c.avatar ? (
                          <img
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-primary"
                            src={c.avatar}
                            alt={c.name}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs">
                            {c.initial}
                          </div>
                        )}
                        <span className="text-xs font-bold text-on-surface">{c.name}</span>
                        {c.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed">
                            {c.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        {c.time}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface leading-relaxed pl-9">{c.text}</p>
                    <div className="flex items-center justify-between pl-9 pt-1">
                      {c.badge2 ? (
                        <span className="text-[10px] text-primary font-semibold bg-secondary-container px-2 py-0.5 rounded-full">
                          {c.badge2}
                        </span>
                      ) : (
                        <span />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setViewerComments((prev) =>
                            prev.map((row) =>
                              row.id === c.id
                                ? {
                                    ...row,
                                    liked: !row.liked,
                                    likes: row.liked ? row.likes - 1 : row.likes + 1,
                                  }
                                : row
                            )
                          )
                        }
                        className="flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-error"
                      >
                        <span
                          className={`material-symbols-outlined text-[14px] ${
                            c.liked ? 'text-error' : ''
                          }`}
                        >
                          {c.liked ? 'favorite' : 'favorite_border'}
                        </span>
                        <span className="font-semibold text-xs">{c.likes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-surface-container border-t border-surface-container-highest flex items-center gap-2">
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitComment();
                  }}
                  placeholder="따뜻한 댓글과 응원을 남겨보세요..."
                  className="w-full bg-surface-container-lowest text-on-surface text-xs rounded-xl px-3.5 py-2.5 pr-9 outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleSubmitComment}
                  className="absolute right-1.5 w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Episode List & Bookmark Folders Modal */}
      {isEpModalOpen && (
        <div
          onClick={() => setIsEpModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-t-2xl w-full max-w-[430px] shadow-2xl flex flex-col max-h-[82vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 pb-3 border-b border-surface-container-highest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  format_list_bulleted
                </span>
                <h3 className="font-bold text-base text-on-surface">
                  전체 회차 목록{' '}
                  <span className="text-primary text-sm font-semibold">
                    (총 {sortedEpisodes.length}화)
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEpModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between bg-surface-container-low p-1 rounded-xl mb-1 border border-outline-variant/50">
                <button
                  type="button"
                  onClick={() => {
                    setEpTab('all');
                    setSelectedFolderName(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 ${
                    epTab === 'all'
                      ? 'font-bold bg-surface-container-lowest text-primary shadow-sm'
                      : 'font-medium text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">apps</span>
                  <span>전체 회차 ({sortedEpisodes.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEpTab('bookmarked')}
                  className={`flex-1 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 ${
                    epTab === 'bookmarked'
                      ? 'font-bold bg-surface-container-lowest text-primary shadow-sm'
                      : 'font-medium text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px] text-tertiary">
                    bookmark
                  </span>
                  <span>북마크한 회차 ({bookmarkedEpIds.length})</span>
                </button>
              </div>

              {epTab === 'bookmarked' && (
                <div className="flex flex-col gap-2.5">
                  <div className="p-2.5 rounded-xl bg-tertiary-fixed/30 border border-tertiary/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-on-surface font-medium">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">
                        grade
                      </span>
                      <span>자주 다시 보는 내 즐겨찾기 회차 ({bookmarkedEpIds.length}개)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFolderCreator((v) => !v)}
                      className="px-2 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant text-[11px] font-bold text-primary flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        create_new_folder
                      </span>
                      <span>+ 새 폴더</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedFolderName(null)}
                      className={`px-2.5 py-1 rounded-full font-bold text-[11px] flex items-center gap-1 shrink-0 ${
                        selectedFolderName === null
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">bookmark</span>
                      <span>전체 북마크 ({bookmarkedEpIds.length})</span>
                    </button>
                    {folders.map((folder) => {
                      const active = selectedFolderName === folder.name;
                      return (
                        <div
                          key={folder.name}
                          className={`flex items-center gap-0.5 rounded-full border p-0.5 shrink-0 ${
                            active
                              ? 'bg-secondary-container border-primary'
                              : 'bg-surface-container border-outline-variant/60'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedFolderName(folder.name)}
                            className="px-2.5 py-1 text-on-surface text-[11px] font-medium flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[13px] text-tertiary">
                              folder
                            </span>
                            <span>
                              {folder.name} ({folder.epNums.length})
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setShareFolderModal({
                                name: folder.name,
                                count: folder.epNums.length,
                              })
                            }
                            className="w-6 h-6 rounded-full hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center"
                            title="친구에게 폴더 링크 공유"
                          >
                            <span className="material-symbols-outlined text-[13px]">share</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {showFolderCreator && (
                    <div className="p-3 rounded-xl bg-surface-container-lowest border-2 border-primary/40 shadow-sm flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface">
                          나만의 정주행 컬렉션 폴더 만들기
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowFolderCreator(false)}
                          className="text-outline"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="폴더명 (예: 주말에 몰아보는 힐링 일상툰)"
                        className="w-full bg-surface-container-low border border-outline-variant/50 text-on-surface text-xs rounded-lg px-2.5 py-2 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const title = newFolderName.trim() || '내 정주행 컬렉션';
                          setFolders((prev) => [
                            ...prev,
                            { name: title, epNums: [baseEpisode.epNum, 18] },
                          ]);
                          setSelectedFolderName(title);
                          onShowToast(`📁 '${title}' 폴더가 생성되었습니다!`);
                          setShowFolderCreator(false);
                          setNewFolderName('');
                        }}
                        className="w-full py-2 rounded-lg bg-primary text-on-primary text-xs font-bold"
                      >
                        컬렉션 폴더 만들기 완료
                      </button>
                    </div>
                  )}
                </div>
              )}

              {sortedEpisodes
                .filter((row) => {
                  if (epTab === 'all') return true;
                  if (selectedFolderName) {
                    const folder = folders.find((f) => f.name === selectedFolderName);
                    return folder ? folder.epNums.includes(row.epNum) : true;
                  }
                  return bookmarkedEpIds.includes(row.epNum);
                })
                .map((row) => {
                  const locked = !!row.isProOnly && !effectivePro;
                  const rowBookmarked = bookmarkedEpIds.includes(row.epNum);
                  return (
                    <div
                      key={row.epNum}
                      onClick={() => {
                        if (locked) {
                          setIsEpModalOpen(false);
                          setIsProModalOpen(true);
                          return;
                        }
                        onSelectEpisode(row.epNum);
                        setIsEpModalOpen(false);
                      }}
                      className={`p-3 rounded-xl flex items-center justify-between gap-2 cursor-pointer ${
                        row.epNum === baseEpisode.epNum
                          ? 'bg-primary-fixed/30 border-2 border-primary'
                          : 'bg-surface-container-lowest border border-outline-variant/60 hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container relative">
                          <img
                            className="w-full h-full object-cover"
                            src={row.thumbnail}
                            alt={`${row.epNum}화`}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-0.5 left-0.5 bg-primary text-on-primary text-[9px] font-bold px-1 rounded">
                            {row.epNum}화
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary text-on-primary">
                              {row.epNum === baseEpisode.epNum
                                ? '현재 회차'
                                : locked
                                  ? 'PRO 선공개'
                                  : row.epNum >= 20
                                    ? '내가 만든 툰'
                                    : '추천'}
                            </span>
                            <span className="text-[10px] text-secondary font-mono">
                              {row.subtitle}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-on-surface truncate">{row.title}</p>
                          <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                            {row.styleName} · 좋아요 {row.likes}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(row.epNum);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            rowBookmarked ? 'text-primary' : 'text-outline'
                          }`}
                        >
                          <span
                            className="material-symbols-outlined text-[18px]"
                            style={{
                              fontVariationSettings: rowBookmarked ? "'FILL' 1" : "'FILL' 0",
                            }}
                          >
                            bookmark
                          </span>
                        </button>
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          {locked ? 'lock' : 'play_circle'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Collection Folder Share Bottom Sheet */}
      {shareFolderModal && (
        <div
          onClick={() => setShareFolderModal(null)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-t-2xl w-full max-w-[430px] p-5 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  folder_shared
                </span>
                <h3 className="font-bold text-base text-on-surface">컬렉션 폴더 공유하기</h3>
              </div>
              <button
                type="button"
                onClick={() => setShareFolderModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">
                  collections_bookmark
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-on-surface truncate">
                  📁 {shareFolderModal.name} ({shareFolderModal.count}개 에피소드 포함)
                </p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  친구와 함께 좋아하는 에피소드를 한 번에 정주행하세요!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShareFolderModal(null);
                setIsEpModalOpen(false);
                onNavigate('collection');
              }}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span>공유된 컬렉션 랜딩 페이지 열기</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: PRO 19화 Preview Modal */}
      {isProModalOpen && (
        <div
          onClick={() => setIsProModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-t-2xl w-full max-w-[430px] p-5 shadow-2xl flex flex-col gap-4 max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary text-on-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">diamond</span>ToonDay PRO
                  전용
                </span>
                <span className="text-xs font-bold text-on-surface">
                  {proStep === 1 ? '최신화 선공개 열람' : '결제 수단 선택 및 7일 무료체험'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsProModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {proStep === 1 ? (
              <div className="flex flex-col gap-4">
                <div className="relative rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant/60 shadow-sm">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover blur-[2px] brightness-75 scale-105"
                      src={VIEWER_EP19_THUMB}
                      alt="19화 잠금 프리뷰"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white gap-1.5 p-4 text-center">
                      <div className="w-11 h-11 rounded-full bg-primary/80 flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-white text-[24px]">
                          lock
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-white">
                        24시간 먼저 즐기는 최신화 선공개
                      </p>
                      <p className="text-[10px] text-white/80 font-mono">
                        내일 09:00 일반 무료 공개 예정
                      </p>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-on-surface">
                      19화: 비 오는 날 깜짝 야근과 버스 놓친 썰 ☔
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      우산 없이 퇴근길 폭우를 마주한 서연의 대탈출기! 정식 공개 전 누구보다 빠르게
                      감상하세요.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setProStep(2)}
                  className="w-full flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span>✨ 7일 무료로 선공개 바로 보기 (이후 월 9,900원)</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'kakao', label: '카카오페이' },
                    { id: 'naver', label: '네이버페이' },
                    { id: 'toss', label: '토스페이' },
                    { id: 'card', label: '신용카드' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setProPayMethod(pm.id)}
                      className={`p-3 rounded-xl text-xs font-bold ${
                        proPayMethod === pm.id
                          ? 'border-2 border-primary bg-primary-fixed/20 text-primary'
                          : 'border border-outline-variant bg-surface-container-lowest text-on-surface'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onActivatePro('ToonDay PRO 7일 무료 체험');
                    setIsProModalOpen(false);
                    setProStep(1);
                    onSelectEpisode(19);
                  }}
                  className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-xs"
                >
                  0원으로 7일 무료 체험 시작하고 19화 바로 보기
                </button>
                <button
                  type="button"
                  onClick={() => setProStep(1)}
                  className="text-xs text-secondary text-center"
                >
                  이전 화면으로 돌아가기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 7: Story Vote Modal */}
      {isVoteModalOpen && (
        <div
          onClick={() => setIsVoteModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-t-2xl w-full max-w-[430px] p-5 shadow-2xl flex flex-col gap-3.5 max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  how_to_vote
                </span>
                <h3 className="font-bold text-base text-on-surface">다음 주 20화 스토리 투표</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-error-container text-on-error-container font-mono">
                  마감 D-3
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsVoteModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex items-center justify-between bg-surface-container-low p-1 rounded-xl border border-outline-variant/50">
              <button
                type="button"
                onClick={() => setVoteTab('select')}
                className={`flex-1 py-1.5 rounded-lg text-xs ${
                  voteTab === 'select'
                    ? 'font-bold bg-surface-container-lowest text-primary shadow-sm'
                    : 'font-medium text-on-surface-variant'
                }`}
              >
                스토리 투표 선택
              </button>
              <button
                type="button"
                onClick={() => setVoteTab('analytics')}
                className={`flex-1 py-1.5 rounded-lg text-xs ${
                  voteTab === 'analytics'
                    ? 'font-bold bg-surface-container-lowest text-primary shadow-sm'
                    : 'font-medium text-on-surface-variant'
                }`}
              >
                실시간 랭킹 분석 📊
              </button>
            </div>

            {voteTab === 'select' ? (
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    id: 'optionA' as const,
                    rank: '👑 1위 BEST',
                    title: '🔥 칼퇴 사수 대작전: 부장님의 기습 회식 제안 철벽 방어전',
                    pct: `${pctA}%`,
                    cnt: `${voteCounts.optionA.toLocaleString()}표`,
                    barColor: 'bg-primary',
                  },
                  {
                    id: 'optionB' as const,
                    rank: '🥈 2위',
                    title: '☕ 월급날의 소소한 사치: 나 홀로 럭셔리 오마카세 도전기',
                    pct: `${pctB}%`,
                    cnt: `${voteCounts.optionB.toLocaleString()}표`,
                    barColor: 'bg-secondary',
                  },
                  {
                    id: 'optionC' as const,
                    rank: '🥉 3위',
                    title: '🌧️ 비 오는 날 길고양이 구출 대작전: 냥줍의 서막',
                    pct: `${pctC}%`,
                    cnt: `${voteCounts.optionC.toLocaleString()}표`,
                    barColor: 'bg-tertiary',
                  },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setSelectedVote(opt.id)}
                    className={`flex flex-col p-3 rounded-xl cursor-pointer transition-all ${
                      selectedVote === opt.id
                        ? 'border-2 border-primary bg-primary-fixed/20'
                        : 'border border-outline-variant bg-surface-container-lowest'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <input
                          type="radio"
                          checked={selectedVote === opt.id}
                          onChange={() => setSelectedVote(opt.id)}
                          className="accent-primary mt-0.5 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-primary">{opt.rank}</span>
                          <p className="text-xs font-bold text-on-surface leading-tight mt-0.5">
                            {opt.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-primary font-mono">
                          {opt.pct}
                        </span>
                        <p className="text-[9px] text-on-surface-variant font-mono">{opt.cnt}</p>
                      </div>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className={`${opt.barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: opt.pct }}
                      />
                    </div>
                  </label>
                ))}
                <textarea
                  rows={2}
                  value={voteComment}
                  onChange={(e) => setVoteComment(e.target.value)}
                  placeholder="작가님에게 투표 이유 & 연출 한 줄 제안 (선택)"
                  className="w-full bg-surface-container-low border border-outline-variant/50 text-on-surface text-xs rounded-xl p-2.5 outline-none"
                />
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 flex flex-col gap-2.5">
                <span className="text-xs font-bold text-on-surface">
                  📊 독자 연령 &amp; 성향별 실시간 지지율 (총 {totalVotes.toLocaleString()}표)
                </span>
                {[
                  { label: '1위 칼퇴 사수 (옵션 A)', pct: `${pctA}%` },
                  { label: '2위 오마카세 사치 (옵션 B)', pct: `${pctB}%` },
                  { label: '3위 길고양이 구출 (옵션 C)', pct: `${pctC}%` },
                ].map((bar) => (
                  <div key={bar.label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px]">
                      <span>{bar.label}</span>
                      <span className="font-bold text-primary">{bar.pct}</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: bar.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-low border border-outline-variant/40">
              <span className="text-[10px] text-secondary font-semibold shrink-0">내 픽:</span>
              <span className="text-[11px] font-bold text-primary truncate">
                {voteOptionLabels[selectedVote]}
              </span>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (!voteCompleted) {
                  setVoteCounts((prev) => ({
                    ...prev,
                    [selectedVote]: prev[selectedVote] + 1,
                  }));
                }
                setVoteCompleted(true);
                setIsVoteModalOpen(false);
                await shareOrCopyText({
                  title: '[ToonDay] 다음 주 20화 스토리 투표 참여 완료!',
                  text: `내가 뽑은 20화 스토리: ${voteOptionLabels[selectedVote]}`,
                });
                onShowToast('🗳️ 투표가 집계되고 공유 텍스트가 복사되었습니다! ✨');
              }}
              className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md"
              style={{
                background:
                  'linear-gradient(90deg, rgb(255, 94, 126) 0%, rgb(255, 142, 160) 25%, rgb(255, 179, 123) 50%, rgb(71, 207, 153) 75%, rgb(57, 188, 229) 100%)',
              }}
            >
              투표 완료하고 친구에게 결과 공유하기
            </button>
          </div>
        </div>
      )}

      {/* MODAL 8: Binge Marathon Mode Modal */}
      {isBingeModalOpen && (
        <div
          onClick={() => setIsBingeModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-t-2xl w-full max-w-[430px] p-5 shadow-2xl flex flex-col gap-4 max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  auto_mode
                </span>
                <h3 className="font-bold text-base text-on-surface">1화부터 연속 정주행 모드</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBingeModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div
                onClick={() => setBingeAutoNext((v) => !v)}
                className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-on-surface">
                    에피소드 자동 넘김 (연속 읽기)
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    컷 끝에서 다음 화로 자동 전환
                  </p>
                </div>
                <div
                  className={`w-9 h-5 rounded-full flex items-center px-0.5 ${
                    bingeAutoNext ? 'bg-primary justify-end' : 'bg-surface-container-highest'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>

              <div
                onClick={() => setBingeFullscreen((v) => !v)}
                className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-on-surface">몰입형 뷰어 모드</p>
                  <p className="text-[10px] text-on-surface-variant">
                    상하단 내비게이션 바 숨김 및 터치 최적화
                  </p>
                </div>
                <div
                  className={`w-9 h-5 rounded-full flex items-center px-0.5 ${
                    bingeFullscreen ? 'bg-primary justify-end' : 'bg-surface-container-highest'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">자동 스크롤 속도</span>
                  <span className="text-xs font-bold text-primary font-mono">{bingeSpeed}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['0.8x', '1.0x', '1.5x'] as const).map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setBingeSpeed(sp)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold ${
                        bingeSpeed === sp
                          ? 'border-2 border-primary bg-primary text-on-primary'
                          : 'border border-outline-variant bg-surface-container-lowest text-on-surface'
                      }`}
                    >
                      {sp === '0.8x' ? '느리게 (0.8x)' : sp === '1.0x' ? '보통 (1.0x)' : '빠르게 (1.5x)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsBingeModalOpen(false);
                onSelectEpisode(1);
                setIsBingeActive(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onShowToast('🚀 1화 [첫 출근의 설렘] 정주행 자동 스크롤을 시작합니다! ✨');
              }}
              className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md"
              style={{
                background:
                  'linear-gradient(90deg, rgb(255, 94, 126) 0%, rgb(255, 142, 160) 25%, rgb(255, 179, 123) 50%, rgb(71, 207, 153) 75%, rgb(57, 188, 229) 100%)',
              }}
            >
              1화부터 정주행 시작하기
            </button>
          </div>
        </div>
      )}

      {/* MODAL 9: Binge Reward Achievement Modal */}
      {isRewardModalOpen && (
        <div
          onClick={() => setIsRewardModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-2xl w-full max-w-[390px] shadow-2xl flex flex-col overflow-hidden border border-outline-variant/50 max-h-[90vh] overflow-y-auto"
          >
            <div
              className="p-5 text-center relative flex flex-col items-center justify-center text-white"
              style={{
                background:
                  'linear-gradient(135deg, rgb(255, 94, 126) 0%, rgb(255, 142, 160) 25%, rgb(255, 179, 123) 50%, rgb(71, 207, 153) 75%, rgb(57, 188, 229) 100%)',
              }}
            >
              <button
                type="button"
                onClick={() => setIsRewardModalOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl shadow-lg mb-2 ring-4 ring-white/30">
                🏆
              </div>
              <h3 className="text-lg font-headline font-extrabold tracking-tight">
                1화~18화 전편 정주행 완독 달성! 🎉
              </h3>
              <p className="text-xs text-white/90 mt-1">
                총 18개 에피소드를 모두 함께 달려주신 열혈 독자님을 위한 특별한 선물
              </p>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {[
                {
                  title: '18/18 정주행 골든 스탬프',
                  tag: '도장 완료',
                  desc: '서연의 하루 첫 시즌 전편을 정복한 증표가 도감에 등록되었습니다.',
                },
                {
                  title: "한정판 프로필 뱃지: '새벽의 정주행러'",
                  tag: '오로라 뱃지',
                  desc: '내 프로필 테두리에 반짝이는 무지갯빛 오로라 효과가 활성화됩니다.',
                },
                {
                  title: '내일 무료 생성 티켓 +1장',
                  tag: '즉시 지급',
                  desc: '내일 오전 09시 계정 보관함에 1회 생성권이 자동 충전됩니다.',
                },
              ].map((r) => (
                <div
                  key={r.title}
                  className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-0.5"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-on-surface">{r.title}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed">
                      {r.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">{r.desc}</p>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsRewardModalOpen(false);
                  onClaimBadge('새벽의 정주행러');
                }}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs"
              >
                내 보관함에 뱃지 등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      <MusicGeneratorModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        sourceTitle={customPrompt ? customPrompt.slice(0, 28) : baseEpisode.title}
        sourceStyle={baseEpisode.styleName}
        initialStorySummary={episodeMusicSummary}
        generatedTrack={activeMusicTrack}
        onTrackGenerated={(track) => {
          setEpisodeTracks((prev) => ({
            ...prev,
            [baseEpisode.epNum]: track,
          }));
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
