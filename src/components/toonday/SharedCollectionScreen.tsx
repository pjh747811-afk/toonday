import React, { useEffect, useState } from 'react';
import { AppRoute, EPISODE_DATA } from '../../data/toondayData';
import { shareOrCopyText } from '../../utils/toondayExport';

interface SharedCollectionScreenProps {
  onNavigate: (route: AppRoute) => void;
  onOpenViewer: (episodeId: number) => void;
  onOpenStudio: (opts?: { prompt?: string; styleKey?: string }) => void;
  onShowToast: (msg: string) => void;
}

interface GuestComment {
  id: string;
  initial: string;
  badgeBg: string;
  author: string;
  time: string;
  text: string;
}

const INITIAL_COMMENTS: GuestComment[] = [
  {
    id: 'gc-1',
    initial: '민',
    badgeBg: 'bg-primary-fixed text-primary',
    author: '민트초코러버',
    time: '10분 전',
    text: '출근길에 보고 지하철에서 빵 터졌어요 ㅋㅋㅋ 진짜 18화 세이프는 과학임!',
  },
  {
    id: 'gc-2',
    initial: '솔',
    badgeBg: 'bg-secondary-container text-secondary',
    author: '솔이의일상',
    time: '42분 전',
    text: '이 조합 진짜 힐링 그 자체! 주말에 바로 팬케이크 구워 먹었습니다 🥞',
  },
];

const INLINE_EPISODES: Record<
  number,
  {
    title: string;
    cuts: { img: string; desc: string }[];
    nextEp: number | null;
    nextTitle: string;
    likes: string;
  }
> = {
  18: {
    title: '18화. 월요일 아침의 기적: 지하철 세이프 대작전',
    cuts: [
      { img: EPISODE_DATA[18].thumbnail, desc: '1컷: 알람 소리에 놀라 번쩍 눈을 뜬 월요일 아침 8시 10분' },
      { img: EPISODE_DATA[18].panels[1].image, desc: '2컷: 식빵 한 쪽 입에 물고 2호선 승강장으로 전력 질주' },
      { img: EPISODE_DATA[18].panels[2].image, desc: '3컷: 닫히는 지하철 출입문 0.5초 전 기적의 세이프 골인!' },
      { img: EPISODE_DATA[18].panels[3].image, desc: '4컷: 숨을 고르며 서로 눈 마주치고 웃음 참는 출근 동지들' },
    ],
    nextEp: 17,
    nextTitle: '17화: 주말 홈카페',
    likes: '1,420',
  },
  17: {
    title: '17화. 주말 홈카페와 소소한 홈베이킹의 낭만',
    cuts: [
      { img: EPISODE_DATA[17].panels[0].image, desc: '1컷: 일요일 늦은 오후, 따스한 햇살이 비치는 아담한 주방' },
      { img: EPISODE_DATA[17].panels[1].image, desc: '2컷: 버터 향 솔솔, 프라이팬에 노릇노릇 부쳐지는 팬케이크' },
      { img: EPISODE_DATA[17].panels[2].image, desc: '3컷: 살짝 탔지만 달콤한 메이플 시럽 듬뿍으로 심폐소생!' },
      { img: EPISODE_DATA[17].thumbnail, desc: '4컷: 톡톡 얼음 띄운 라떼와 함께 완성된 완벽한 힐링 브런치' },
    ],
    nextEp: null,
    nextTitle: '마지막 화입니다',
    likes: '980',
  },
};

export const SharedCollectionScreen: React.FC<SharedCollectionScreenProps> = ({
  onNavigate,
  onOpenViewer,
  onOpenStudio,
  onShowToast,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(142);
  const [copyDone, setCopyDone] = useState(false);
  const [comments, setComments] = useState<GuestComment[]>(INITIAL_COMMENTS);
  const [commentsCount, setCommentsCount] = useState(12);
  const [guestInput, setGuestInput] = useState('');

  // Inline Episode Viewer Modal state
  const [viewerEp, setViewerEp] = useState<number | null>(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [voiceType, setVoiceType] = useState<'cheerful' | 'calm' | 'bgm_only'>('cheerful');
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [durationSec, setDurationSec] = useState<3 | 5 | 10>(3);
  const [progressPct, setProgressPct] = useState(0);
  const [viewerLiked, setViewerLiked] = useState(true);

  const currentEpData = viewerEp ? INLINE_EPISODES[viewerEp] ?? INLINE_EPISODES[18] : null;

  useEffect(() => {
    setProgressPct(0);
    if (!viewerEp || !isAutoPlayEnabled || isAutoPaused) return;
    const ep = INLINE_EPISODES[viewerEp];
    if (!ep?.nextEp) return;

    const totalMs = durationSec * 1000;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, (elapsed / totalMs) * 100);
      setProgressPct(pct);
      if (pct >= 100) {
        window.clearInterval(timer);
        const nextNum = ep.nextEp;
        if (nextNum) {
          setViewerEp(nextNum);
          onShowToast(`${nextNum}화로 자동 이동했습니다 📖`);
        }
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [viewerEp, isAutoPlayEnabled, isAutoPaused, durationSec, onShowToast]);

  // Web Speech API Korean TTS narration for inline viewer
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (!viewerEp || !isAudioOn || voiceType === 'bgm_only') return;
      const ep = INLINE_EPISODES[viewerEp];
      if (!ep) return;
      const script = `${ep.title}. ${ep.cuts.map((c) => c.desc).join('. ')}`;
      const utter = new SpeechSynthesisUtterance(script);
      utter.lang = 'ko-KR';
      utter.pitch = voiceType === 'cheerful' ? 1.15 : 0.92;
      utter.rate = voiceType === 'cheerful' ? 1.05 : 0.94;
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore if speech synthesis is blocked
    }
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    };
  }, [viewerEp, isAudioOn, voiceType]);

  const toggleLikeCollection = () => {
    setIsLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => (next ? c + 1 : c - 1));
      if (next) onShowToast('이 컬렉션을 좋아합니다! ❤️');
      return next;
    });
  };

  const handleCopyShareLink = async () => {
    await navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setCopyDone(true);
    onShowToast('공유 링크가 클립보드에 복사되었습니다 🔗');
    window.setTimeout(() => setCopyDone(false), 2000);
  };

  const handleShareCollection = async (label = '최애 힐링 에피소드 모음집') => {
    const res = await shareOrCopyText({
      title: `ToonDay · ${label}`,
      text: '서연 작가님의 일상 공감 웹툰 정주행 컬렉션에 초대합니다! 💌',
    });
    onShowToast(
      res === 'shared'
        ? '공유 창이 열렸습니다 💬'
        : '공유 메시지와 링크가 클립보드에 복사되었습니다 💬'
    );
  };

  const handleSubmitGuestComment = () => {
    const trimmed = guestInput.trim();
    if (!trimmed) {
      onShowToast('한 줄 소감을 작성해주세요!');
      return;
    }
    const newItem: GuestComment = {
      id: `gc-${Date.now()}`,
      initial: '나',
      badgeBg: 'bg-secondary-container text-secondary',
      author: '방문 독자',
      time: '방금 전',
      text: trimmed,
    };
    setComments((prev) => [newItem, ...prev]);
    setCommentsCount((c) => c + 1);
    setGuestInput('');
    onShowToast('소중한 감상평이 등록되었어요! ✨');
  };

  const voiceSubtitle =
    voiceType === 'cheerful'
      ? '🎙️ 나레이터: 밝고 발랄한 서연 보이스'
      : voiceType === 'calm'
        ? '🎙️ 나레이터: 차분하고 따뜻한 민우 보이스'
        : '🎵 BGM 전용 모드 (음성 나레이션 OFF)';

  return (
    <div className="flex flex-col w-full pb-28">
      {/* Top Web Promotion Banner / Micro Header */}
      <section className="w-full px-4 pt-3 pb-2">
        <div
          className="w-full bg-secondary-container text-on-secondary-container rounded-xl px-3.5 py-2 flex items-center justify-between shadow-sm"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 83, 118, 0.12), rgba(255, 211, 165, 0.2), rgba(186, 242, 187, 0.18))',
            border: '1px solid rgba(255, 170, 166, 0.35)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2 w-2 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs font-semibold truncate tracking-tight">
              일상 AI 웹툰 플랫폼 ToonDay
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex-shrink-0 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm active:scale-95 transition-transform flex items-center gap-1"
            style={{
              background: 'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166))',
              boxShadow: 'rgba(255, 83, 118, 0.25) 0px 2px 8px',
            }}
          >
            <span>앱 열기</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </button>
        </div>
      </section>

      {/* Shared Collection Info Hero Card */}
      <section className="w-full px-4 py-2">
        <div
          className="w-full bg-surface-container-lowest rounded-2xl p-5 shadow-md flex flex-col gap-4 relative overflow-hidden"
          style={{
            background:
              'linear-gradient(145deg, rgb(255, 255, 255) 0%, rgb(255, 245, 246) 30%, rgb(255, 249, 240) 65%, rgb(242, 251, 244) 100%)',
            border: '1px solid rgba(255, 170, 166, 0.4)',
            boxShadow: 'rgba(255, 170, 166, 0.12) 0px 4px 20px',
          }}
        >
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-primary-fixed/60 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-secondary-container/50 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 relative z-10">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs shadow-xs"
              style={{
                background: 'linear-gradient(135deg, rgb(255, 227, 232), rgb(255, 237, 224))',
                color: 'rgb(183, 25, 69)',
                border: '1px solid rgba(255, 83, 118, 0.2)',
              }}
            >
              <span>💌</span>
              <span>친구가 공유한 정주행 컬렉션 도착!</span>
            </span>
          </div>

          <div className="flex flex-col gap-1.5 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="material-symbols-outlined text-primary text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                folder_special
              </span>
              <h2 className="text-lg font-headline font-bold text-on-surface tracking-tight leading-snug">
                최애 힐링 에피소드 모음집
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">
                2개 에피소드
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              서연 작가님의 찐팬 <strong className="text-primary font-semibold">@다희</strong> 님이
              팍팍한 월요병 극복을 위해 엄선한 일상 공감 웹툰 시리즈예요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 relative z-10">
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1"
              style={{
                background: 'rgb(238, 252, 240)',
                color: 'rgb(30, 112, 57)',
                border: '1px solid rgba(186, 242, 187, 0.7)',
              }}
            >
              <span className="material-symbols-outlined text-[13px]">auto_stories</span>총 2개 화 ·
              완결 포함
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1"
              style={{
                background: 'rgb(255, 247, 237)',
                color: 'rgb(161, 85, 12)',
                border: '1px solid rgba(255, 211, 165, 0.7)',
              }}
            >
              <span className="material-symbols-outlined text-[13px]">timer</span>5분 컷 정주행
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1"
              style={{
                background: 'rgb(230, 249, 248)',
                color: 'rgb(0, 104, 116)',
                border: '1px solid rgba(160, 231, 229, 0.7)',
              }}
            >
              <span className="material-symbols-outlined text-[13px]">visibility</span>공유 조회수
              1,280회
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 relative z-10">
            <button
              type="button"
              onClick={toggleLikeCollection}
              className="flex-1 py-2 px-3 rounded-full active:scale-95 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              style={{
                background: 'linear-gradient(135deg, rgb(255, 240, 243), rgb(255, 229, 234))',
                color: 'rgb(214, 34, 84)',
                border: '1px solid rgba(255, 83, 118, 0.3)',
              }}
            >
              <span
                className="material-symbols-outlined text-[18px] text-error"
                style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
              <span>좋아요</span>
              <span className="font-bold text-on-surface">{likeCount}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="flex-1 py-2 px-3 rounded-full active:scale-95 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              style={{
                background: 'linear-gradient(135deg, rgb(234, 249, 251), rgb(224, 246, 248))',
                color: 'rgb(0, 103, 124)',
                border: '1px solid rgba(160, 231, 229, 0.5)',
              }}
            >
              <span className="material-symbols-outlined text-[18px]">link</span>
              <span>{copyDone ? '복사 완료!' : '링크 복사'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleShareCollection()}
              className="flex-1 py-2 px-3 rounded-full active:scale-95 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              style={{
                background: 'linear-gradient(135deg, rgb(255, 245, 232), rgb(255, 238, 215))',
                color: 'rgb(120, 88, 51)',
                border: '1px solid rgba(255, 211, 165, 0.6)',
              }}
            >
              <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
              <span>카톡 공유</span>
            </button>
          </div>
        </div>
      </section>

      {/* Episode Binge List Section */}
      <section className="w-full px-4 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">play_circle</span>
            <h3 className="text-sm font-headline font-bold text-on-surface">정주행 리스트</h3>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">전편 무료 공개 중</span>
        </div>

        {/* Episode Card 18 */}
        <article
          onClick={() => setViewerEp(18)}
          className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3 cursor-pointer"
          style={{
            border: '1px solid rgba(255, 170, 166, 0.3)',
            boxShadow: 'rgba(255, 170, 166, 0.08) 0px 2px 12px',
          }}
        >
          <div className="flex gap-3">
            <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-surface-container">
              <img
                className="w-full h-full object-cover"
                alt="18화"
                referrerPolicy="no-referrer"
                src={EPISODE_DATA[18].thumbnail}
              />
              <span
                className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 158, 121))',
                  color: 'white',
                  boxShadow: 'rgba(255, 83, 118, 0.3) 0px 2px 6px',
                }}
              >
                18화
              </span>
            </div>
            <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                    ✨ 무료 감상
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium">4컷 완결</span>
                </div>
                <h4 className="text-sm font-bold text-on-surface leading-tight line-clamp-2">
                  월요일 아침의 기적: 지하철 세이프 대작전
                </h4>
                <p className="text-[11px] text-on-surface-variant line-clamp-1">
                  "1초만 늦었어도 지각이었는데 기사님 감사합니다 ㅠㅠ"
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-on-surface-variant font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-error">favorite</span>
                  1,420
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">mode_comment</span>
                  28
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewerEp(18);
            }}
            className="w-full py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            style={{
              background:
                'linear-gradient(135deg, rgb(255, 240, 243) 0%, rgb(255, 247, 237) 50%, rgb(239, 252, 242) 100%)',
              color: 'rgb(183, 25, 69)',
              border: '1px solid rgba(255, 170, 166, 0.6)',
              boxShadow: 'rgba(255, 83, 118, 0.12) 0px 2px 10px',
            }}
          >
            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            <span>바로 정주행하기 (1분 소요)</span>
          </button>
        </article>

        {/* Episode Card 17 */}
        <article
          onClick={() => setViewerEp(17)}
          className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3 cursor-pointer"
          style={{
            border: '1px solid rgba(255, 170, 166, 0.3)',
            boxShadow: 'rgba(255, 170, 166, 0.08) 0px 2px 12px',
          }}
        >
          <div className="flex gap-3">
            <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-surface-container">
              <img
                className="w-full h-full object-cover"
                alt="17화"
                referrerPolicy="no-referrer"
                src={EPISODE_DATA[17].thumbnail}
              />
              <span
                className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 158, 121))',
                  color: 'white',
                  boxShadow: 'rgba(255, 83, 118, 0.3) 0px 2px 6px',
                }}
              >
                17화
              </span>
            </div>
            <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                    ✨ 무료 감상
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium">4컷 완결</span>
                </div>
                <h4 className="text-sm font-bold text-on-surface leading-tight line-clamp-2">
                  주말 홈카페와 소소한 홈베이킹의 낭만
                </h4>
                <p className="text-[11px] text-on-surface-variant line-clamp-1">
                  "타버린 팬케이크도 버터랑 시럽 듬뿍이면 천국행!"
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-on-surface-variant font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-error">favorite</span>
                  980
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">mode_comment</span>
                  15
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewerEp(17);
            }}
            className="w-full py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            style={{
              background:
                'linear-gradient(135deg, rgb(255, 240, 243) 0%, rgb(255, 247, 237) 50%, rgb(239, 252, 242) 100%)',
              color: 'rgb(183, 25, 69)',
              border: '1px solid rgba(255, 170, 166, 0.6)',
              boxShadow: 'rgba(255, 83, 118, 0.12) 0px 2px 10px',
            }}
          >
            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            <span>바로 정주행하기 (1분 소요)</span>
          </button>
        </article>
      </section>

      {/* Guest Conversion & Creation Promo Banner */}
      <section className="w-full px-4 pt-5 pb-2">
        <div
          className="w-full rounded-2xl p-5 shadow-lg flex flex-col gap-3 relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 30%, rgb(255, 211, 165) 60%, rgb(186, 242, 187) 85%, rgb(160, 231, 229) 100%)',
            color: 'rgb(59, 16, 28)',
            boxShadow: 'rgba(255, 83, 118, 0.22) 0px 8px 28px',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-white/25 text-white text-[10px] font-bold tracking-wide backdrop-blur-md">
              ToonDay AI Studio
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-on-surface/85">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>제작 시간 약 3초</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-headline font-extrabold tracking-tight text-on-surface">
              나도 3초 만에 내 일상으로 웹툰 만들기
            </h3>
            <p className="text-xs text-on-surface/85 leading-relaxed">
              하루 1회 무료 생성 혜택! 일기처럼 텍스트 한 줄만 적으면 고퀄리티 4컷 웹툰이 즉시
              탄생해요.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 py-1">
            {['#오늘퇴근길', '#반려견산책', '#소소한점심'].map((tag) => (
              <span
                key={tag}
                onClick={() => onOpenStudio({ prompt: `${tag} 에피소드` })}
                className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-semibold text-white cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onOpenStudio()}
            className="w-full py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            style={{
              background: 'rgb(255, 255, 255)',
              color: 'rgb(183, 25, 69)',
              boxShadow: 'rgba(255, 83, 118, 0.25) 0px 4px 14px',
            }}
          >
            <span
              className="material-symbols-outlined text-[16px] text-tertiary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span>✨ 나만의 일상 웹툰 만들어보기 (무료)</span>
          </button>
        </div>
      </section>

      {/* Guestbook & Quick Comment Section */}
      <section className="w-full px-4 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">forum</span>
            <h3 className="text-sm font-headline font-bold text-on-surface">
              이 컬렉션에 남긴 한 줄 감상평
            </h3>
            <span className="text-xs font-bold text-primary">({commentsCount})</span>
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium">실시간</span>
        </div>

        {/* Quick Comment Input Box */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-2.5 shadow-sm flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-[18px]">
              sentiment_satisfied
            </span>
          </div>
          <input
            type="text"
            value={guestInput}
            onChange={(e) => setGuestInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmitGuestComment();
            }}
            placeholder="친구의 컬렉션에 가벼운 소감을 남겨보세요!"
            className="flex-1 bg-transparent text-xs text-on-surface placeholder:text-outline focus:outline-none min-w-0"
          />
          <button
            type="button"
            onClick={handleSubmitGuestComment}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-white text-xs font-semibold active:scale-95 transition-transform flex items-center gap-1"
            style={{
              background: 'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166))',
              boxShadow: 'rgba(255, 83, 118, 0.25) 0px 2px 8px',
            }}
          >
            <span>등록</span>
          </button>
        </div>

        {/* Comment List */}
        <div className="flex flex-col gap-2 pt-1">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-surface-container-lowest rounded-xl p-3 shadow-xs flex items-start gap-2.5"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.badgeBg}`}
              >
                {c.initial}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface truncate">{c.author}</span>
                  <span className="text-[10px] text-outline font-medium">{c.time}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky Bottom Bar */}
      <aside
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 px-4 py-3 pb-safe flex items-center justify-between gap-3 backdrop-blur-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          borderTop: '1px solid rgba(255, 170, 166, 0.35)',
          boxShadow: 'rgba(255, 170, 166, 0.12) 0px -4px 20px',
        }}
      >
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[14px]">bolt</span>
            <span className="text-[11px] font-bold text-on-surface truncate">
              로그인 없이 웹에서도 바로 감상
            </span>
          </div>
          <p className="text-[10px] text-on-surface-variant truncate">
            앱 설치 시 광고 없는 고화질 뷰어 및 맞춤 추천
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          style={{
            background:
              'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 50%, rgb(255, 211, 165) 100%)',
            color: 'rgb(255, 255, 255)',
            boxShadow: 'rgba(255, 83, 118, 0.35) 0px 4px 14px',
          }}
        >
          <span>ToonDay 앱에서 정주행</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </button>
      </aside>

      {/* Inline Web Viewer Modal */}
      {viewerEp && currentEpData && (
        <div
          className="fixed inset-0 z-50 flex justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="웹툰 에피소드 뷰어"
        >
          <div className="w-full max-w-[430px] h-full flex flex-col bg-surface">
            <header className="sticky top-0 z-20 flex items-center justify-between px-3 h-14 bg-surface/95 backdrop-blur-md border-b border-surface-container-high pt-safe shadow-xs">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setViewerEp(null)}
                  aria-label="닫기"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-on-surface hover:text-primary transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-xs font-bold text-on-surface truncate">
                    {currentEpData.title}
                  </h3>
                  <span className="text-[10px] text-primary font-medium">
                    4컷 웹툰 · 전편 무료 감상
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAutoPlayEnabled((v) => !v)}
                  className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    {isAutoPlayEnabled ? 'play_circle' : 'pause_circle'}
                  </span>
                  <span>자동 넘김 {isAutoPlayEnabled ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAudioOn((v) => !v)}
                  className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    {isAudioOn ? 'volume_up' : 'volume_off'}
                  </span>
                  <span>BGM·TTS {isAudioOn ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col items-center gap-5 bg-surface-container-lowest">
              {/* Audio Status Bar */}
              <div className="w-full p-3 rounded-2xl bg-surface-container-low border border-primary/20 flex flex-col gap-2 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          isAudioOn ? 'animate-pulse' : ''
                        }`}
                      >
                        graphic_eq
                      </span>
                    </span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-on-surface truncate">
                          감성 Lo-Fi 일상 BGM &amp; AI 나레이션
                        </span>
                        <span className="px-1.5 py-0.2 rounded-full bg-secondary-container text-on-secondary-container text-[9px] font-bold flex-shrink-0">
                          {isAudioOn ? '재생 중' : '일시정지'}
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant truncate">{voiceSubtitle}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAudioOn((v) => !v)}
                    className="flex-shrink-0 p-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface active:scale-95 transition-all"
                    aria-label="음소거 토글"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      {isAudioOn ? 'volume_up' : 'volume_off'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-surface-container">
                  <span className="text-[10px] font-semibold text-on-surface-variant flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px] text-primary">
                      record_voice_over
                    </span>
                    성우
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'cheerful' as const, label: '밝은 서연' },
                      { id: 'calm' as const, label: '차분한 민우' },
                      { id: 'bgm_only' as const, label: '음악만' },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVoiceType(v.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] active:scale-95 transition-all ${
                          voiceType === v.id
                            ? 'font-bold border border-primary bg-primary text-on-primary'
                            : 'font-medium border border-surface-container-high bg-surface-container text-on-surface'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cuts Body */}
              <div className="w-full flex flex-col gap-4">
                {currentEpData.cuts.map((cut, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 rounded-2xl overflow-hidden bg-surface-container-low p-3 shadow-xs border border-surface-container"
                  >
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-container">
                      <img
                        className="w-full h-full object-cover"
                        src={cut.img}
                        alt={cut.desc}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium px-1">{cut.desc}</p>
                  </div>
                ))}
              </div>

              {/* Auto-Next Countdown Card */}
              {currentEpData.nextEp && (
                <div className="w-full p-4 rounded-2xl bg-surface-container-low border border-secondary-container flex flex-col gap-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-primary text-[18px]">
                        timer
                      </span>
                      <span className="text-xs font-bold text-on-surface truncate">
                        {durationSec}초 후 다음 에피소드({currentEpData.nextTitle})로 자동 이동
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold shrink-0">
                      {durationSec}초
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-100 ease-linear"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-primary">
                          pace
                        </span>
                        자동 넘김 시간 설정
                      </span>
                      <span className="text-[10px] text-outline font-medium">취향에 맞춰 조절</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {([3, 5, 10] as const).map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setDurationSec(sec)}
                          className={`py-1.5 px-2 rounded-full text-[11px] flex items-center justify-center gap-1 active:scale-95 transition-all ${
                            durationSec === sec
                              ? 'border border-primary bg-secondary-container text-on-secondary-container font-bold shadow-xs'
                              : 'border border-surface-container-high bg-surface-container text-on-surface font-medium'
                          }`}
                        >
                          {durationSec === sec && (
                            <span className="material-symbols-outlined text-[13px] text-primary">
                              check
                            </span>
                          )}
                          <span>{sec === 3 ? '3초 (기본)' : `${sec}초`}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAutoPaused((p) => !p)}
                      className="flex-1 py-1.5 px-3 rounded-full bg-surface-container hover:bg-surface-container-high active:scale-95 text-xs font-semibold text-on-surface flex items-center justify-center gap-1 transition-all"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {isAutoPaused ? 'play_circle' : 'pause_circle'}
                      </span>
                      <span>{isAutoPaused ? '자동 넘김 재개' : '자동 넘김 일시정지'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewerEp(currentEpData.nextEp)}
                      className="flex-1 py-1.5 px-3 rounded-full bg-primary text-on-primary active:scale-95 text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs"
                    >
                      <span>지금 바로 보기</span>
                      <span className="material-symbols-outlined text-[15px]">fast_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Actions inside Modal */}
              <div className="w-full flex flex-col gap-3 pt-4 border-t border-surface-container mt-2">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setViewerLiked((v) => !v)}
                    className="flex-1 py-2.5 px-3 rounded-full bg-surface-container-low hover:bg-surface-container active:scale-95 text-xs font-semibold text-on-surface flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span
                      className="material-symbols-outlined text-[18px] text-error"
                      style={{ fontVariationSettings: viewerLiked ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                    <span>좋아요</span>
                    <span className="font-bold">{currentEpData.likes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareCollection(currentEpData.title)}
                    className="flex-1 py-2.5 px-3 rounded-full bg-surface-container-low hover:bg-surface-container active:scale-95 text-xs font-semibold text-on-surface flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">share</span>
                    <span>공유하기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewerEp(currentEpData.nextEp ?? 18)}
                    className="flex-1 py-2.5 px-3 rounded-full bg-primary-fixed hover:bg-primary-fixed-dim active:scale-95 text-xs font-bold text-on-primary-fixed flex items-center justify-center gap-1 transition-all"
                  >
                    <span>
                      {currentEpData.nextEp ? `다음화 (${currentEpData.nextEp}화)` : '18화로 이동'}
                    </span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>

                <div className="w-full p-3.5 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary-container/40 to-surface-container flex items-center justify-between gap-3 border border-secondary-container">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-[18px]">app_shortcut</span>
                    </span>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">
                        전체 뷰어에서 번역·저장·편집하기
                      </p>
                      <p className="text-[10px] text-on-surface-variant truncate">
                        4K PNG 저장 · AI 번역 · 포토카드 추출
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const epNum = viewerEp;
                      setViewerEp(null);
                      onOpenViewer(epNum);
                    }}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold active:scale-95 transition-transform flex items-center gap-1"
                  >
                    <span>전체 뷰어</span>
                    <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
