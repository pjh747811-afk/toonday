import React, { useEffect, useMemo, useState } from 'react';
import {
  AppRoute,
  COMMUNITY_BEST_CUTS,
  HOME_STYLE_PRESETS,
  HOME_TOP_RANKING,
  LibraryWebtoonItem,
  VIEWER_EP1_THUMB,
} from '../../data/toondayData';

interface HomeScreenProps {
  isPro?: boolean;
  freeTicketsLeft?: number;
  libraryItems?: LibraryWebtoonItem[];
  onOpenStudio: (opts?: { prompt?: string; styleKey?: string }) => void;
  onOpenViewer: (episodeId: number) => void;
  onOpenSearch: (opts?: { query?: string; tab?: string }) => void;
  onOpenVoiceChat?: () => void;
  onNavigate: (route: AppRoute) => void;
  isWebMode?: boolean;
}

const CATEGORIES = [
  { id: '전체', label: '전체', emoji: '' },
  { id: '실시간 인기', label: '실시간 인기', emoji: '🔥' },
  { id: '직장인 공감', label: '직장인 공감', emoji: '💼' },
  { id: '연애/로맨스', label: '연애/로맨스', emoji: '💖' },
  { id: '반려동물', label: '반려동물', emoji: '🐾' },
  { id: '학교/캠퍼스', label: '학교/캠퍼스', emoji: '🎓' },
  { id: '자취/일상', label: '자취/일상', emoji: '🍳' },
];

const EXTRA_CATEGORY_RANKINGS = [
  {
    rank: 4,
    rankGradient: 'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(168, 85, 247) 100%)',
    badgeText: '로맨스 1위',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    views: '4.5만',
    title: '비 오는 날 우산 씌워준 선배와의 첫만남 ☔',
    authorInitial: '달',
    authorColor: 'bg-secondary-fixed text-on-secondary-fixed',
    author: '@sweet_night',
    likes: '7.9천',
    category: '연애/로맨스',
    episodeId: 19,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCiZLJsCgmrC_kSatmwoDxBWoQcJWvRfG8UQpVu24YTmlbH2w9QQDtxT0uSIlPfuXhYlR_ND8oU_hPavRYw8GGBQ3myFgnR7fMd6jzfS5QuPeAUadxTzq6qs2jpd8FU0Mq5JCl8-d2ybi_ZpCjKEuHPAVF5pi168fWXYHKT_Ku0B-gb0Y8LySP_SPiLbvp2PUylD68qLC_SUdp6IByHmotpxGCpqnefFKyz9YA2r1M',
  },
  {
    rank: 5,
    rankGradient: 'linear-gradient(135deg, rgb(56, 189, 248) 0%, rgb(129, 140, 248) 100%)',
    badgeText: '캠퍼스 1위',
    badgeClass: 'bg-primary-fixed text-primary',
    views: '3.8만',
    title: '전공책 두고 온 새내기 시험기간 생존기 🎓',
    authorInitial: '캠',
    authorColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
    author: '@campus_log',
    likes: '6.2천',
    category: '학교/캠퍼스',
    episodeId: 1,
    image: VIEWER_EP1_THUMB,
  },
  {
    rank: 6,
    rankGradient: 'linear-gradient(135deg, rgb(254, 210, 164) 0%, rgb(255, 137, 107) 100%)',
    badgeText: '자취 꿀잼',
    badgeClass: 'bg-surface-container-lowest/90 backdrop-blur text-primary',
    views: '3.2만',
    title: '주말 홈베이킹 팬케이크 태워먹은 썰 🥞',
    authorInitial: '서',
    authorColor: 'bg-secondary-container text-primary',
    author: '@seoyeon_toon',
    likes: '5.4천',
    category: '자취/일상',
    episodeId: 17,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB9wOxt4UZcKTk601nwtclgD_PNIjNBQYa2DPd3EP7s944AIeo23Ee8EcDEIdzm9ycSova4sc8om1pfWpsXBdmpiXLbTivAQ8htu4PsLnqNgDaerycPW3qS7iztD7U3dg8VXnm0YQhnoBF5KTVMTXtcj4Ec20u5UsXF4j-dc8F0gShZeE9b7jks2_iSJMvIOypXcOedTwGumb1P7UtD42-qMz5FClxkjoxe_78bzGw',
  },
];

const EXTRA_COMMUNITY_CUTS = [
  {
    id: 'com-5',
    cutCount: '4컷',
    title: '1교시 지각 면하고 강의실 뒷문 세이프 🎓',
    authorInitial: '학',
    avatarBg: 'bg-primary-fixed text-primary',
    author: '학식요정',
    likes: '418',
    comments: '53',
    category: '학교/캠퍼스',
    episodeId: 1,
    image: VIEWER_EP1_THUMB,
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  isPro = false,
  freeTicketsLeft = 1,
  libraryItems = [],
  onOpenStudio,
  onOpenViewer,
  onOpenSearch,
  onOpenVoiceChat,
  onNavigate,
  isWebMode = false,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(23 * 3600 + 45 * 60 + 10);
  const [quickPrompt, setQuickPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formattedTime = useMemo(() => {
    const hrs = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
    const mins = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }, [secondsLeft]);

  const userCreatedItems = useMemo(
    () => libraryItems.filter((item) => item.episodeId >= 20),
    [libraryItems]
  );

  const filteredRankings = useMemo(() => {
    if (selectedCategory === '전체') return HOME_TOP_RANKING;
    if (selectedCategory === '실시간 인기') {
      return [...HOME_TOP_RANKING].reverse();
    }
    const allRankings = [...HOME_TOP_RANKING, ...EXTRA_CATEGORY_RANKINGS];
    const matched = allRankings.filter((item) => item.category === selectedCategory);
    return matched.length > 0 ? matched : HOME_TOP_RANKING;
  }, [selectedCategory]);

  const filteredCommunity = useMemo(() => {
    if (selectedCategory === '전체' || selectedCategory === '실시간 인기') {
      return COMMUNITY_BEST_CUTS;
    }
    const allPosts = [...COMMUNITY_BEST_CUTS, ...EXTRA_COMMUNITY_CUTS];
    const matched = allPosts.filter((item) => item.category === selectedCategory);
    return matched.length > 0 ? matched : COMMUNITY_BEST_CUTS;
  }, [selectedCategory]);

  const handleQuickSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onOpenStudio({
      prompt:
        quickPrompt.trim() ||
        '오늘 출근길 만원 지하철에서 이어폰 없이 버틴 극한 생존기...',
    });
  };

  return (
    <div className="flex flex-col w-full pb-8 space-y-6">
      {/* 1 & 2. Hero Quota Banner + Quick Diary Create Split (2-col in Web, stacked in App) */}
      <div
        className={
          isWebMode
            ? 'px-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch'
            : 'flex flex-col space-y-6'
        }
      >
        <section className={isWebMode ? 'lg:col-span-7 flex flex-col' : 'px-4'}>
          <div
            className="relative overflow-hidden rounded-xl p-4 shadow-md text-on-surface flex-1 flex flex-col justify-between"
            style={{
              background:
                'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 142, 155) 22%, rgb(254, 210, 164) 45%, rgb(187, 247, 208) 72%, rgb(125, 211, 252) 100%)',
            }}
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-0 right-10 w-16 h-16 bg-white/40 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-3 flex-1 justify-between">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 backdrop-blur-md text-[11px] font-semibold text-primary tracking-tight shadow-sm">
                  <span
                    className="material-symbols-outlined text-[13px] text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    bolt
                  </span>
                  {isPro ? 'ToonDay PRO 무제한 이용 중' : '매일 밤 12시 무료 충전'}
                </span>
                <div className="flex items-center gap-1 text-[11px] font-mono tabular-nums text-on-surface/85 bg-white/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[13px]">timer</span>
                  <span className="font-bold tracking-tight">{formattedTime}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-base font-headline font-bold leading-tight flex items-center gap-1.5 text-on-surface">
                  {isPro
                    ? 'PRO 무제한 웹툰 & 4K 내보내기 사용 가능'
                    : `오늘 무료 웹툰 ${freeTicketsLeft}회 생성 가능`}
                  <span className="text-primary text-sm">✨</span>
                </h2>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                  짧은 문장 한 줄만 적으면 AI가 감성 4컷 웹툰으로 바꿔드려요!
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between gap-2">
                <div className="flex -space-x-1.5 items-center">
                  <span className="w-5 h-5 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center shadow-sm tabular-nums">
                    {isPro ? '∞' : `${freeTicketsLeft}/1`}
                  </span>
                  <span className="text-[11px] pl-2 text-on-surface font-semibold">
                    {isPro ? '무제한 패스 활성화' : `잔여 티켓 ${freeTicketsLeft}장`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenStudio()}
                  className="px-3.5 py-2 rounded-lg text-white font-bold text-xs shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(135deg, #b71945 0%, #ff5376 40%, #ea580c 100%)',
                  }}
                >
                  <span
                    className="material-symbols-outlined text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    draw
                  </span>
                  <span>일기 쓰고 웹툰 만들기</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right side in Web mode: Quick Prompt + Recently created */}
        <section className={isWebMode ? 'lg:col-span-5 flex flex-col justify-between gap-3' : 'flex flex-col gap-4'}>
          {userCreatedItems.length > 0 && (
            <div className={isWebMode ? '' : 'px-4 -mt-2'}>
              <div
                onClick={() => onOpenViewer(userCreatedItems[0].episodeId)}
                className="rounded-xl bg-surface-container-lowest p-3 shadow-sm border border-primary/25 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={userCreatedItems[0].image}
                    alt={userCreatedItems[0].title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-primary">
                      ✨ 방금 내가 만든 #{userCreatedItems[0].episodeId}화
                    </span>
                    <p className="text-xs font-bold text-on-surface truncate">
                      {userCreatedItems[0].title}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary text-on-primary text-[11px] font-bold shrink-0 whitespace-nowrap">
                  바로 보기
                </span>
              </div>
            </div>
          )}

          <div className={isWebMode ? 'flex-1 flex flex-col justify-between bg-surface-container-lowest rounded-xl p-3.5 shadow-sm border border-outline-variant/30 gap-2.5' : 'px-4'}>
            {isWebMode && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">빠른 4컷 웹툰 시작</span>
                <span className="text-[11px] text-on-surface-variant">음성 또는 한 줄 입력</span>
              </div>
            )}
            <form
              onSubmit={handleQuickSubmit}
              className={
                isWebMode
                  ? 'bg-surface-container-low rounded-xl p-2 flex items-center gap-2'
                  : 'bg-surface-container-lowest rounded-xl p-2.5 shadow-sm flex items-center gap-2'
              }
            >
              <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base">edit_note</span>
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="오늘 하루는 어땠나요? 한 줄만 써도 4컷 완성!"
                  className="w-full bg-transparent text-xs text-on-surface placeholder:text-outline focus:outline-none truncate"
                />
              </div>
              {onOpenVoiceChat && (
                <button
                  type="button"
                  onClick={onOpenVoiceChat}
                  aria-label="AI 실시간 음성대화"
                  title="AI 코치와 음성대화"
                  className="w-8 h-8 rounded-lg bg-primary-fixed text-primary hover:bg-secondary-container flex items-center justify-center shrink-0 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">mic</span>
                </button>
              )}
              <button
                type="submit"
                aria-label="웹툰 생성하기"
                className="h-8 px-3 rounded-lg text-white text-xs font-bold flex items-center gap-1 shrink-0 shadow-md active:scale-95 transition-transform whitespace-nowrap"
                style={{
                  background:
                    'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 142, 155) 30%, rgb(65, 157, 182) 100%)',
                }}
              >
                <span
                  className="material-symbols-outlined text-[15px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_fix_high
                </span>
                <span>만들기</span>
              </button>
            </form>
            {isWebMode && (
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
                <span>예시: 출근길 지하철, 성수동 디저트</span>
                <button
                  type="button"
                  onClick={() => onNavigate('library')}
                  className="font-semibold text-primary hover:underline whitespace-nowrap"
                >
                  보관함 · 인스타 발행 ➔
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 3. Category Filter Chips (Horizontal Scroll) */}
      <section className="w-full">
        <div className="flex items-center gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={
                  active
                    ? 'shrink-0 px-3.5 py-1.5 rounded-full text-white text-xs font-bold shadow-sm flex items-center gap-1'
                    : 'shrink-0 px-3.5 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1'
                }
                style={
                  active
                    ? {
                        background:
                          'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 142, 155) 35%, rgb(123, 210, 237) 100%)',
                      }
                    : undefined
                }
              >
                <span>{cat.label}</span>
                {cat.emoji && <span className="text-[13px]">{cat.emoji}</span>}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onOpenSearch({ query: '월요일 출근', tab: '전체' })}
            className="shrink-0 px-3 py-1.5 rounded-full bg-secondary-container/70 text-primary text-xs font-bold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">search</span>
            <span>탐색 결과</span>
          </button>
        </div>

        {selectedCategory !== '전체' && (
          <div className="px-4 pt-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-primary">
              [{selectedCategory}] 카테고리 필터 적용 중 · {filteredRankings.length + filteredCommunity.length}개 작품
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('전체')}
              className="text-[11px] text-outline hover:text-primary font-semibold"
            >
              전체 보기 ✕
            </button>
          </div>
        )}
      </section>

      {/* 4. Real-time Top Webtoon Showcase */}
      <section className="flex flex-col gap-3">
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-primary text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              trending_up
            </span>
            <h3 className="font-headline font-bold text-sm text-on-surface">
              {selectedCategory === '전체' ? '실시간 TOP 랭킹' : `${selectedCategory} 추천 랭킹`}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-outline">오후 2시 기준 업데이트</span>
            <button
              type="button"
              onClick={() =>
                onOpenSearch({
                  query: selectedCategory === '전체' ? '월요일 출근' : selectedCategory,
                  tab: '웹툰 작품',
                })
              }
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              전체보기
            </button>
          </div>
        </div>

        {/* Showcase Grid (Web) / Horizontal Carousel (App) */}
        <div
          className={
            isWebMode
              ? 'px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex gap-3.5 overflow-x-auto px-4 pb-2 scrollbar-none snap-x snap-mandatory'
          }
        >
          {filteredRankings.map((item) => (
            <article
              key={`${selectedCategory}-${item.rank}-${item.title}`}
              onClick={() => onOpenViewer(item.episodeId)}
              className={`${
                isWebMode ? 'w-full' : 'shrink-0 w-72 snap-start'
              } bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col group cursor-pointer`}
            >
              <div className="relative w-full h-44 overflow-hidden bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  src={item.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-black/30" />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span
                    className="w-6 h-6 rounded-md text-white font-headline font-extrabold text-xs flex items-center justify-center shadow-md"
                    style={{ background: item.rankGradient }}
                  >
                    {item.rank}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${item.badgeClass}`}>
                    {item.badgeText}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur text-white text-[10px] font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">visibility</span>
                  {item.views}
                </div>
              </div>
              <div className="p-3 flex flex-col gap-2">
                <h4 className="font-headline font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${item.authorColor}`}
                    >
                      {item.authorInitial}
                    </div>
                    <span className="text-[11px] font-medium text-outline">{item.author}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-error">
                    <span
                      className="material-symbols-outlined text-[13px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                    <span>{item.likes}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. Popular Art Style Preset Gallery */}
      <section className="px-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-primary text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              palette
            </span>
            <h3 className="font-headline font-bold text-sm text-on-surface">
              인기 작화 스타일 프리셋
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenSearch({ query: '명랑 인스타툰', tab: '스타일 프리셋' })}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            스타일 전체보기
          </button>
        </div>

        <div className={`grid gap-2.5 ${isWebMode ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
          {HOME_STYLE_PRESETS.map((preset) => (
            <div
              key={preset.key}
              className="bg-surface-container-lowest rounded-xl p-2.5 shadow-sm flex flex-col gap-2 group hover:bg-surface-container-low transition-colors"
            >
              <div className="relative w-full h-24 rounded-lg overflow-hidden bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt={preset.title}
                  referrerPolicy="no-referrer"
                  src={preset.image}
                />
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium backdrop-blur-sm">
                  {preset.tag}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-on-surface">{preset.title}</span>
                <p className="text-[10px] text-outline line-clamp-1">{preset.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenStudio({ styleKey: preset.key })}
                className="w-full py-1.5 rounded-md text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm hover:opacity-95 active:scale-98 transition-all"
                style={{ background: preset.btnGradient }}
              >
                <span className="material-symbols-outlined text-[13px]">magic_button</span>
                이 스타일로 생성
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Community Today's Best Cut (2-Column Grid) */}
      <section className="px-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-primary text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              forum
            </span>
            <h3 className="font-headline font-bold text-sm text-on-surface">
              커뮤니티 오늘의 베스트 컷
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('collection')}
            className="text-[11px] font-semibold text-primary flex items-center gap-0.5 hover:underline"
          >
            <span>공유 컬렉션 보기</span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
          </button>
        </div>

        <div className={`grid gap-3 ${isWebMode ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
          {filteredCommunity.map((post) => (
            <article
              key={post.id}
              onClick={() => onOpenViewer(post.episodeId)}
              className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col group cursor-pointer"
            >
              <div className="relative w-full aspect-square bg-surface-container overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  src={post.image}
                />
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[9px] font-medium">
                  {post.cutCount}
                </div>
              </div>
              <div className="p-2.5 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${post.avatarBg}`}
                    >
                      {post.authorInitial}
                    </div>
                    <span className="text-[10px] text-on-surface-variant truncate">
                      {post.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-outline shrink-0">
                    <span className="flex items-center gap-0.5">
                      <span
                        className="material-symbols-outlined text-[12px] text-error"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">chat_bubble</span>
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 7. Bottom Studio Entry Action Banner */}
      <section className="px-4">
        <div
          onClick={() => onOpenStudio()}
          className="w-full p-4 rounded-xl flex items-center justify-between shadow-md relative overflow-hidden cursor-pointer"
          style={{
            background:
              'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 142, 155) 25%, rgb(254, 210, 164) 50%, rgb(187, 247, 208) 75%, rgb(125, 211, 252) 100%)',
          }}
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/90 text-primary flex items-center justify-center shadow-sm">
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">나도 내 일상 웹툰 만들기</span>
              <span className="text-[10px] text-on-surface-variant font-medium">
                어떤 이야기든 3초 만에 4컷 만화로
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenStudio();
            }}
            className="relative z-10 px-3.5 py-2 rounded-lg bg-white text-primary text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 transition-transform"
          >
            <span>시작하기</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
};
