import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EPISODE_DATA,
  GEN_CUT1_IMG,
  STUDIO_STYLES,
  ViewerPanel,
  WebtoonEpisode,
} from '../../data/toondayData';
import { exportWebtoonImage } from '../../utils/toondayExport';

interface GenerationProgressScreenProps {
  prompt?: string;
  styleKey?: string;
  cuts?: 4 | 8;
  characterName?: string;
  authorHandle?: string;
  nextEpNum?: number;
  onCancel: () => void;
  onCompleteGeneration: (ep: WebtoonEpisode, openViewerNow?: boolean) => void;
  onBackgroundComplete: (ep: WebtoonEpisode) => void;
  onShowToast: (msg: string) => void;
}

const TINT_NAMES = ['인스타 선셋', '시그니처 퍼플', '따뜻한 앰버', '파스텔 드림', '딥 블랙'];

const FALLBACK_PANEL_IMAGES = [
  GEN_CUT1_IMG,
  EPISODE_DATA[18].panels[1].image,
  EPISODE_DATA[18].panels[2].image,
  EPISODE_DATA[18].panels[3].image,
  EPISODE_DATA[17].panels[0].image,
  EPISODE_DATA[17].panels[1].image,
  EPISODE_DATA[17].panels[2].image,
  EPISODE_DATA[17].panels[3].image,
];

function buildPromptDialogues(rawPrompt: string, cutCount: number): string[] {
  const clean = rawPrompt.trim();
  if (!clean) {
    return [
      '헉! 벌써 45분이라고?! 😱',
      '이번 열차 놓치면 지각 확정...! 🍞',
      '제발 문 닫히지 마라아아아! 🔥',
      '후... 오늘 운은 여기서 다 썼네 ㅎㅎ ✌️',
    ].slice(0, cutCount);
  }
  const short = clean.slice(0, 26);
  const base = [
    `${short}... 오늘 이야기의 시작! ✨`,
    '잠깐만, 상황이 예상과 다르게 흘러가는데?! 😳',
    '그래도 포기할 순 없지! 전력 돌진!! 🔥',
    '결국 오늘도 나만의 작은 행복 완성 ✌️💖',
    '다시 돌아보니 웃음이 나는 소중한 순간 😊',
    '작은 실수도 추억이 되는 법이니까 🌿',
    '다음엔 더 멋진 내일이 기다릴 거야 🌟',
    '오늘 하루도 정말 수고했어! 굿나잇 🌙',
  ];
  return base.slice(0, cutCount);
}

export const GenerationProgressScreen: React.FC<GenerationProgressScreenProps> = ({
  prompt = '',
  styleKey = 'insta',
  cuts = 4,
  characterName = '서연',
  authorHandle = '@seoyeon_toon',
  nextEpNum = 20,
  onCancel,
  onCompleteGeneration,
  onBackgroundComplete,
  onShowToast,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(4);
  const [percent, setPercent] = useState(64);
  const [bgNotifyReserved, setBgNotifyReserved] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [exportingStory, setExportingStory] = useState(false);

  const styleObj = useMemo(
    () => STUDIO_STYLES.find((s) => s.key === styleKey) || STUDIO_STYLES[0],
    [styleKey]
  );

  const [generatedTitle, setGeneratedTitle] = useState(
    prompt.trim() ? prompt.trim().slice(0, 24) : '오늘의 일상 4컷 에피소드'
  );
  const [cutDialogues, setCutDialogues] = useState<string[]>(() =>
    buildPromptDialogues(prompt, cuts)
  );
  const [cutSfxList, setCutSfxList] = useState<string[]>([
    '두근두근-',
    '우다다다!',
    '짜잔-!!',
    '반짝✨',
  ]);
  const [templatePreset, setTemplatePreset] = useState(0);
  const [tintIdx, setTintIdx] = useState(0);
  const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({
    '#오늘의일기': true,
    '#만화로보는일상': false,
    '#ToonDay': true,
  });

  // Real API call to /api/studio/generate with clean graceful fallback
  useEffect(() => {
    let active = true;
    const promptToSend =
      prompt.trim() || '오늘 출근길 지하철 세이프한 소소한 일상 에피소드';

    fetch('/api/studio/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptToSend,
        tone: styleObj.title,
        panelCount: Math.min(cuts, 5),
      }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as {
          episodeTitle?: string;
          panels?: Array<{
            dialogue?: string;
            sfx?: string;
          }>;
        };
      })
      .then((data) => {
        if (!active || !data) return;
        if (data.episodeTitle) {
          setGeneratedTitle(data.episodeTitle);
        }
        if (Array.isArray(data.panels) && data.panels.length > 0) {
          const lines = data.panels.map(
            (p, idx) => p.dialogue || buildPromptDialogues(prompt, cuts)[idx] || '오늘도 파이팅!'
          );
          while (lines.length < cuts) {
            lines.push(buildPromptDialogues(prompt, cuts)[lines.length] || '오늘의 엔딩 ✨');
          }
          setCutDialogues(lines);
          setCutSfxList(data.panels.map((p) => p.sfx || ''));
        }
      })
      .catch(() => {
        // Keep localized prompt-based fallback lines
      });

    return () => {
      active = false;
    };
  }, [prompt, styleObj.title, cuts]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    const p = window.setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) return 100;
        const next = Math.min(100, prev + 8);
        if (next === 100) {
          window.setTimeout(() => setShowCompleteModal(true), 350);
        }
        return next;
      });
    }, 850);
    return () => {
      window.clearInterval(t);
      window.clearInterval(p);
    };
  }, []);

  const buildGeneratedEpisode = useCallback((): WebtoonEpisode => {
    const times = [
      '08:45 AM',
      '12:30 PM',
      '05:40 PM',
      '09:00 PM',
      '09:15 PM',
      '09:30 PM',
      '09:45 PM',
      '10:00 PM',
    ];
    const panels: ViewerPanel[] = cutDialogues.map((dlg, idx) => ({
      id: `ep${nextEpNum}-p${idx + 1}`,
      cutLabel: idx === cutDialogues.length - 1 ? `CUT #0${idx + 1} · 완결` : `CUT #0${idx + 1}`,
      timeLabel: times[idx] || 'TODAY',
      image: FALLBACK_PANEL_IMAGES[idx % FALLBACK_PANEL_IMAGES.length],
      alt: `${generatedTitle} ${idx + 1}컷`,
      dialogue: dlg,
      bubbleAlign: idx % 2 === 0 ? 'right' : 'left',
      sfx: cutSfxList[idx] || undefined,
      sfxColor: idx === 2 ? 'error' : idx === 0 ? 'tertiary' : 'surface',
      showWatermark: idx === cutDialogues.length - 1,
    }));

    return {
      epNum: nextEpNum,
      title: generatedTitle,
      subtitle: `${characterName} 주연 · ${cuts}컷 완결`,
      styleName: styleObj.title,
      author: authorHandle,
      likes: '1',
      likesNum: 1,
      commentsCount: 0,
      thumbnail: styleObj.image || GEN_CUT1_IMG,
      panels,
    };
  }, [
    authorHandle,
    characterName,
    cutDialogues,
    cutSfxList,
    cuts,
    generatedTitle,
    nextEpNum,
    styleObj,
  ]);

  const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const secs = String(elapsedSeconds % 60).padStart(2, '0');

  const triggerInstantComplete = () => {
    setPercent(100);
    setShowCompleteModal(true);
  };

  const applyAiWitDialogues = () => {
    const subject = prompt.trim().slice(0, 14) || '오늘 하루';
    setCutDialogues((prev) =>
      prev.map((_, idx) => {
        if (idx === 0) return `어라? [${subject}] 이게 실화라고...?! 😱`;
        if (idx === 1) return '눈앞이 핑 도는 초특급 폭풍 전개! 1초가 1년 같다... 💨';
        if (idx === 2) return '절대 물러설 수 없어! 레전드 턴 발동!! 🔥';
        return '하얗게 불태웠다... 오늘의 생존왕 달성 ✌️😎';
      })
    );
    onShowToast('✨ 컷별 대사가 위트있는 AI 대사로 자동 치환되었습니다!');
  };

  const handleExportAndOpenViewer = async () => {
    setExportingStory(true);
    const ep = buildGeneratedEpisode();
    const activeTagList = Object.entries(selectedTags)
      .filter(([, on]) => on)
      .map(([tag]) => tag);
    try {
      await exportWebtoonImage({
        episodeTitle: ep.title,
        panels: ep.panels,
        format: 'story',
        bgColor: TINT_NAMES[tintIdx] || '인스타 선셋',
        includeStamp: templatePreset !== 3,
        tags: activeTagList.length ? activeTagList : ['#ToonDay'],
      });
      onShowToast('📸 9:16 인스타 스토리 이미지가 저장되었습니다!');
    } catch {
      onShowToast('스토리 이미지 생성 후 뷰어로 이동합니다 📸');
    } finally {
      setExportingStory(false);
      onCompleteGeneration(ep, true);
    }
  };

  return (
    <div className="flex flex-col w-full pb-10 overflow-hidden relative min-h-[calc(100vh-4rem)]">
      {/* Dynamic Ambient Glow Backdrops */}
      <div className="absolute -top-12 -left-16 w-64 h-64 rounded-full bg-primary-container/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-72 -right-16 w-72 h-72 rounded-full bg-tertiary-fixed/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none" />

      {/* Real-time Generation Engine Status Banner */}
      <div className="px-4 pt-2 pb-3 relative z-10">
        <div className="flex items-center justify-between bg-surface-container-lowest/85 backdrop-blur-md px-3.5 py-2.5 rounded-full shadow-sm gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-xs text-primary font-bold tracking-tight truncate">
              AI 작화 엔진 가동 중 ⚡
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 text-on-surface-variant text-[11px] bg-surface-container-high px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px] text-tertiary">timer</span>
              <span className="font-semibold text-on-surface">
                {mins}:{secs}
              </span>
              <span className="opacity-40">/</span>
              <span className="text-on-surface-variant">15초</span>
            </div>
            <button
              type="button"
              onClick={triggerInstantComplete}
              className="bg-gradient-to-r from-primary-container via-secondary-container to-tertiary-fixed text-on-primary-fixed text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
              <span>100% 미리보기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Central Live 4-Cut Webtoon Board */}
      <div className="px-4 my-2 relative z-10">
        <div className="relative bg-surface-container-lowest/90 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl shadow-primary-container/10">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[14px]">
                  auto_stories
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface leading-tight truncate">
                  {generatedTitle}
                </p>
                <p className="text-[11px] text-on-surface-variant font-bold">
                  {styleObj.title} • {cuts}컷 규격
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-container font-semibold shrink-0">
              동기화 {percent}%
            </span>
          </div>

          {/* 4-Cut Visual Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Cut 1 */}
            <div className="relative rounded-2xl overflow-hidden bg-surface-container aspect-[4/5] flex flex-col justify-between p-2 shadow-sm">
              <img
                className="absolute inset-0 w-full h-full object-cover"
                alt="1컷 생성 완료"
                referrerPolicy="no-referrer"
                src={styleObj.image || GEN_CUT1_IMG}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent" />
              <div className="relative z-10 flex justify-between items-start">
                <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/90 text-on-surface text-[11px] font-bold shadow-sm">
                  1. 기
                </span>
                <div className="w-5 h-5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-surface text-[11px] font-medium leading-tight drop-shadow-sm">
                  감정 일기 분석 완료
                </p>
                <p className="text-surface-dim text-[10px] truncate">{characterName} · 구도 확정</p>
              </div>
            </div>

            {/* Cut 2 */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-fixed/40 via-surface-container to-tertiary-fixed/30 aspect-[4/5] flex flex-col justify-between p-2 shadow-md">
              <svg
                className="absolute inset-0 w-full h-full opacity-35"
                preserveAspectRatio="none"
                viewBox="0 0 100 120"
              >
                <path
                  className="text-primary-container animate-pulse"
                  d="M10,25 Q50,5 90,30 T20,80 T80,105"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="4,4"
                  strokeWidth="2"
                />
                <circle
                  className="text-tertiary"
                  cx="50"
                  cy="55"
                  fill="none"
                  r="22"
                  stroke="currentColor"
                  strokeDasharray="3,3"
                  strokeWidth="1.5"
                />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/20 to-transparent" />
              <div className="relative z-10 flex justify-between items-start">
                <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary text-[11px] font-bold shadow-sm animate-pulse">
                  2. 승
                </span>
                <div className="w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center animate-spin">
                  <span className="material-symbols-outlined text-[13px]">brush</span>
                </div>
              </div>
              <div className="relative z-10 my-auto text-center flex flex-col items-center justify-center px-1">
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest/90 flex items-center justify-center text-primary shadow-sm mb-1.5">
                  <span className="material-symbols-outlined text-[20px] animate-bounce">draw</span>
                </div>
                <p className="text-[11px] font-bold text-primary leading-tight">
                  캐릭터 펜선 채색 중
                </p>
                <p className="text-on-surface-variant text-[10px]">{styleObj.title} 렌더링</p>
              </div>
              <div className="relative z-10 w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-container to-secondary-container h-full rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Cut 3 */}
            <div className="relative rounded-2xl overflow-hidden bg-surface-container-low aspect-[4/5] flex flex-col justify-between p-2">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[11px] font-medium">
                  3. 전
                </span>
                <span className="material-symbols-outlined text-outline-variant text-[16px]">
                  hourglass_empty
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-center opacity-70">
                <span className="material-symbols-outlined text-outline text-[24px] mb-1">
                  forum
                </span>
                <p className="text-[11px] font-semibold text-on-surface">말풍선 &amp; 효과음</p>
                <p className="text-[10px] text-on-surface-variant">폰트 타이포 배치 대기</p>
              </div>
              <div className="flex items-center gap-1 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant animate-pulse" />
              </div>
            </div>

            {/* Cut 4 */}
            <div className="relative rounded-2xl overflow-hidden bg-surface-container-low aspect-[4/5] flex flex-col justify-between p-2">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[11px] font-medium">
                  4. 결
                </span>
                <span className="material-symbols-outlined text-outline-variant text-[16px]">
                  lock_clock
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-center opacity-70">
                <span className="material-symbols-outlined text-outline text-[24px] mb-1">
                  auto_awesome
                </span>
                <p className="text-[11px] font-semibold text-on-surface">4K 마스터링</p>
                <p className="text-[10px] text-on-surface-variant">색감 보정 &amp; 샤픈 처리</p>
              </div>
              <div className="w-full text-center">
                <span className="text-[10px] text-outline font-medium">대기열 #1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Progress Section */}
      <div className="px-4 mt-3 mb-2 relative z-10">
        <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-lg text-on-surface font-extrabold tracking-tight">
                웹툰 화폭 완성 중
              </span>
              <p className="text-xs text-on-surface-variant">
                AI가 컷 간의 흐름과 연출 구도를 다듬고 있어요
              </p>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-extrabold text-primary">{percent}</span>
              <span className="text-base font-bold text-primary-container ml-0.5">%</span>
            </div>
          </div>

          <div className="w-full bg-surface-container rounded-full h-3.5 p-0.5 relative overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-container via-secondary-container to-tertiary-fixed transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Stepper Item Statuses */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            <div className="flex items-center justify-between text-on-surface py-1 px-1.5 rounded-lg bg-surface-container-low/50">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-tertiary-fixed text-on-tertiary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                </div>
                <span className="text-xs font-medium text-on-surface">
                  1. 일기 감정 &amp; 사건 키워드 추출
                </span>
              </div>
              <span className="text-[11px] text-tertiary font-bold">완료</span>
            </div>

            <div className="flex items-center justify-between text-on-surface py-1 px-1.5 rounded-lg bg-surface-container-low/50">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-tertiary-fixed text-on-tertiary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                </div>
                <span className="text-xs font-medium text-on-surface">
                  2. {cuts}컷 콘티 구도 매핑 및 연출 기획
                </span>
              </div>
              <span className="text-[11px] text-tertiary font-bold">완료</span>
            </div>

            <div className="flex items-center justify-between text-on-surface py-1 px-1.5 rounded-lg bg-primary-fixed/40">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center animate-spin">
                  <span className="material-symbols-outlined text-[12px]">palette</span>
                </div>
                <span className="text-xs font-bold text-primary">
                  3. 캐릭터 화풍 입히기 &amp; 컷별 작화
                </span>
              </div>
              <span className="text-[11px] text-primary font-extrabold animate-pulse">
                {percent >= 100 ? '완료 ✨' : '생성 중 🎨'}
              </span>
            </div>

            <div className="flex items-center justify-between text-on-surface-variant py-1 px-1.5 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-surface-container-high text-outline flex items-center justify-center">
                  <span className="material-symbols-outlined text-[13px]">
                    chat_bubble_outline
                  </span>
                </div>
                <span className="text-xs font-normal text-on-surface-variant">
                  4. 대사 말풍선 &amp; 디테일 효과음 마스터링
                </span>
              </div>
              <span className="text-[11px] text-outline">
                {percent >= 100 ? '완료' : '대기'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Daily Comic Insight Carousel Card */}
      <div className="px-4 my-2 relative z-10">
        <div className="bg-gradient-to-r from-secondary-fixed/50 via-primary-fixed/40 to-tertiary-fixed/40 p-4 rounded-2xl shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex-shrink-0 flex items-center justify-center shadow-sm text-secondary">
            <span className="material-symbols-outlined text-[20px]">lightbulb</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-bold text-on-secondary-fixed tracking-wider uppercase">
                ToonDay 재미있는 상식
              </span>
              <span className="text-[10px] text-on-secondary-fixed-variant bg-surface-container-lowest/60 px-1.5 py-0.5 rounded-full">
                #일상기록
              </span>
            </div>
            <p className="text-xs text-on-surface leading-snug">
              오늘 벌써 <strong className="text-primary font-bold">14,289명</strong>의 유저가
              일상을 네컷 만화로 남겼어요! 다음 컷의 주인공도 당신이에요.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Buttons Slot */}
      <div className="px-4 pt-3 flex flex-col gap-2.5 relative z-10">
        <button
          type="button"
          onClick={triggerInstantComplete}
          className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-primary-container via-secondary-container to-tertiary-fixed text-on-primary-fixed font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">visibility</span>
          <span>완성작 즉시 뷰어로 열기 (100% 완료)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setBgNotifyReserved(true);
            onBackgroundComplete(buildGeneratedEpisode());
          }}
          className={`w-full py-3.5 px-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all ${
            bgNotifyReserved
              ? 'bg-tertiary-fixed/40 text-tertiary'
              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-primary text-[20px]">
            {bgNotifyReserved ? 'check_circle' : 'notifications_active'}
          </span>
          <span>
            {bgNotifyReserved
              ? '완료 시 푸시 알림이 예약되었어요!'
              : '백그라운드에서 생성 (완료 알림 받기)'}
          </span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 text-center text-on-surface-variant text-xs font-semibold hover:text-primary transition-colors"
        >
          생성 취소하고 편집 화면으로 돌아가기
        </button>
      </div>

      {/* Completion Modal */}
      {showCompleteModal && (
        <div
          onClick={() => setShowCompleteModal(false)}
          className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[390px] max-h-[88vh] overflow-y-auto bg-surface-container-lowest rounded-2xl p-5 shadow-xl flex flex-col gap-4 relative border border-outline-variant/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary text-[11px] font-bold flex items-center gap-1">
                  <span>🎉</span>
                  <span>제작 완료 100%</span>
                </span>
                <span className="text-[11px] text-tertiary font-bold bg-tertiary-fixed/35 px-2 py-0.5 rounded-full">
                  #{nextEpNum}화 · {cuts}컷
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="text-center">
              <h2 className="text-lg text-on-surface font-extrabold tracking-tight">
                {generatedTitle}
              </h2>
              <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                {characterName} 주인공 · {styleObj.title} 스타일 웹툰이 완성되었습니다.
              </p>
            </div>

            {/* 4-cut preview strip + dialogue customization */}
            <div className="p-2.5 rounded-xl bg-surface-container-low flex flex-col gap-3">
              <div className="grid grid-cols-4 gap-1.5">
                {FALLBACK_PANEL_IMAGES.slice(0, 4).map((img, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-full aspect-[3/4] rounded-lg bg-primary-fixed/30 overflow-hidden relative border border-primary/20">
                      <img
                        src={i === 0 ? styleObj.image || img : img}
                        alt={`${i + 1}컷`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center text-on-primary text-[9px] font-bold">
                        ✓
                      </span>
                    </div>
                    <span className="text-[10px] text-on-surface font-semibold">
                      {i === 0 ? '1. 기' : i === 1 ? '2. 승' : i === 2 ? '3. 전' : '4. 결'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-on-surface font-bold">
                    💬 컷별 캐릭터 말풍선 대사 커스텀
                  </span>
                  <button
                    type="button"
                    onClick={applyAiWitDialogues}
                    className="text-[10px] text-primary font-bold bg-primary-fixed/40 px-2 py-0.5 rounded-full flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[12px]">auto_fix_high</span>
                    <span>AI 위트 치환</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {cutDialogues.slice(0, 4).map((val, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-surface-container-lowest p-1.5 rounded-lg border border-outline-variant/30"
                    >
                      <span className="text-[10px] font-bold text-on-surface-variant px-1.5 py-0.5 rounded bg-surface-container-high flex-shrink-0">
                        {idx + 1}컷
                      </span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => {
                          const next = [...cutDialogues];
                          next[idx] = e.target.value;
                          setCutDialogues(next);
                        }}
                        className="w-full bg-transparent text-[11px] text-on-surface focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insta Story Customizer */}
            <div className="bg-surface-container-low/70 border border-outline-variant/30 rounded-xl p-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">palette</span>
                  <span className="text-xs font-bold text-on-surface">
                    인스타 스토리 템플릿 커스텀 꾸미기
                  </span>
                </div>
                <span className="text-[10px] text-primary font-bold bg-primary-fixed/40 px-2 py-0.5 rounded-full">
                  9:16 최적화
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { icon: 'filter', label: '① 폴라로이드 감성' },
                  { icon: 'blur_on', label: '② 오로라 네온' },
                  { icon: 'menu_book', label: '③ 미니 다이어리' },
                  { icon: 'crop_square', label: '④ 미니멀 클린' },
                ].map((tpl, i) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => setTemplatePreset(i)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 border ${
                      templatePreset === i
                        ? 'bg-surface-container-lowest border-primary text-primary font-bold shadow-sm'
                        : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{tpl.icon}</span>
                    <span>{tpl.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[11px] text-on-surface-variant font-medium">배경 틴트</span>
                <div className="flex items-center gap-2">
                  {[
                    'bg-primary-container',
                    'bg-secondary-container',
                    'bg-tertiary-fixed',
                    'bg-tertiary-fixed-dim',
                    'bg-inverse-surface',
                  ].map((c, idx) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTintIdx(idx)}
                      className={`w-5 h-5 rounded-full ${c} ${
                        tintIdx === idx ? 'ring-2 ring-primary ring-offset-1' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['#오늘의일기', '#만화로보는일상', '#ToonDay'].map((tag) => {
                  const on = !!selectedTags[tag];
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setSelectedTags((prev) => ({ ...prev, [tag]: !prev[tag] }))
                      }
                      className={`px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 ${
                        on
                          ? 'bg-primary text-on-primary font-bold shadow-sm'
                          : 'bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant'
                      }`}
                    >
                      <span>{on ? '✓' : '+'}</span>
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={exportingStory}
                onClick={handleExportAndOpenViewer}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-primary via-primary-container to-secondary-container text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                <span>
                  {exportingStory
                    ? '9:16 이미지 생성 중...'
                    : '인스타 스토리에 공유하기 (9:16 맞춤 내보내기)'}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onCompleteGeneration(buildGeneratedEpisode(), true)}
                  className="flex-1 py-2.5 px-3 rounded-full bg-surface-container-high text-on-surface text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    menu_book
                  </span>
                  <span>웹툰 뷰어로 보기</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCompleteGeneration(buildGeneratedEpisode(), false);
                    setShowCompleteModal(false);
                    onShowToast('내 보관함에 저장되었습니다! 🔖');
                  }}
                  className="flex-1 py-2.5 px-3 rounded-full bg-tertiary-fixed/30 text-on-tertiary-container text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>보관함 자동저장</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
