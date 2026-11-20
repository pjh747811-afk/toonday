import React, { useEffect, useMemo, useState } from 'react';
import {
  SEARCH_CARDS,
  SEARCH_CREATORS,
  SEARCH_STYLE_SPOTLIGHT_IMG,
  STUDIO_STYLES,
} from '../../data/toondayData';

interface SearchScreenProps {
  initialQuery?: string;
  initialTab?: string;
  bookmarkedEpIds: number[];
  onToggleBookmark: (epId: number) => void;
  onOpenViewer: (episodeId: number) => void;
  onOpenStudio: (opts?: {
    prompt?: string;
    styleKey?: string;
    cuts?: 4 | 8;
    charId?: string;
  }) => void;
  onShowToast: (msg: string) => void;
  isWebMode?: boolean;
}

const TRENDING_TAGS = [
  '#직장인공감',
  '#지각대작전',
  '#소소한멘붕',
  '#반려묘일상',
  '#순정로맨스',
  '#맛집탐방',
];

const SORT_OPTIONS = ['인기순', '최신순', '좋아요순'];

export const SearchScreen: React.FC<SearchScreenProps> = ({
  initialQuery = '월요일 출근',
  initialTab = '전체',
  bookmarkedEpIds,
  onToggleBookmark,
  onOpenViewer,
  onOpenStudio,
  onShowToast,
  isWebMode = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTag, setActiveTag] = useState<string>('');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sortIdx, setSortIdx] = useState(0);
  const [subscribedCreators, setSubscribedCreators] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const filteredCards = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = SEARCH_CARDS.filter((c) => {
      const tagMatch = !activeTag || c.tags.includes(activeTag);
      if (!tagMatch) return false;
      if (!q || q === '전체') return true;
      const tokens = q
        .replace(/#/g, '')
        .split(/\s+/)
        .filter(Boolean);
      const haystack = `${c.title} ${c.author} ${c.tagRight} ${c.tags.join(' ')}`.toLowerCase();
      return tokens.some((t) => haystack.includes(t));
    });

    const sortKey = SORT_OPTIONS[sortIdx];
    if (sortKey === '인기순') {
      list = [...list].sort((a, b) => b.viewsNum - a.viewsNum);
    } else if (sortKey === '최신순') {
      list = [...list].sort((a, b) => a.recentRank - b.recentRank);
    } else {
      list = [...list].sort((a, b) => b.likesNum - a.likesNum);
    }
    return list;
  }, [query, activeTag, sortIdx]);

  const toggleSubscribe = (creatorId: string, name: string) => {
    setSubscribedCreators((prev) => {
      const next = !prev[creatorId];
      onShowToast(
        next ? `${name} 작가를 구독했습니다! ✨` : `${name} 작가 구독을 취소했습니다.`
      );
      return { ...prev, [creatorId]: next };
    });
  };

  const resultCount =
    activeTab === '스타일 프리셋'
      ? STUDIO_STYLES.length
      : activeTab === '크리에이터'
        ? SEARCH_CREATORS.length
        : filteredCards.length;

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Search Header Input Section */}
      <section className="px-4 pt-3 pb-2 sticky top-16 z-30 bg-surface/95 backdrop-blur-md">
        <div className="relative flex items-center w-full">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-primary">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveTag('');
            }}
            placeholder="작가명, 키워드, 스타일, 일상 태그 검색..."
            className="w-full h-11 pl-10 pr-10 text-sm font-medium bg-surface-container-high text-on-surface rounded-full outline-none focus:bg-surface-container-highest transition-colors placeholder:text-outline"
          />
          {query && (
            <button
              type="button"
              aria-label="검색어 삭제"
              onClick={() => {
                setQuery('');
                setActiveTag('');
              }}
              className="absolute right-2.5 w-7 h-7 flex items-center justify-center rounded-full bg-surface-variant text-on-surface-variant hover:bg-outline-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Suggested Trending Tags (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-1 -mx-4 px-4">
          {TRENDING_TAGS.map((tag) => {
            const isSelected = activeTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setActiveTag('');
                    setQuery('');
                  } else {
                    setActiveTag(tag);
                    setQuery(tag.replace('#', ''));
                  }
                }}
                className={
                  isSelected
                    ? 'flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-semibold whitespace-nowrap shadow-sm'
                    : 'flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container text-xs font-medium whitespace-nowrap transition-colors'
                }
                style={
                  isSelected
                    ? {
                        background:
                          'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166))',
                        color: 'rgb(255, 255, 255)',
                      }
                    : undefined
                }
              >
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Segmented Tabs */}
      <nav className="px-4 mt-1 bg-surface">
        <div className="flex items-center gap-4 text-sm font-semibold border-b border-transparent overflow-x-auto no-scrollbar">
          {[
            {
              id: '전체',
              count: filteredCards.length + STUDIO_STYLES.length + SEARCH_CREATORS.length,
            },
            { id: '웹툰 작품', count: filteredCards.length },
            { id: '스타일 프리셋', count: STUDIO_STYLES.length },
            { id: '크리에이터', count: SEARCH_CREATORS.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-2.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>
                  {tab.id}{' '}
                  <span
                    className={`text-xs ${
                      isActive ? 'font-medium text-primary' : 'font-normal text-outline'
                    }`}
                  >
                    {tab.count}
                  </span>
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 rounded-full"
                    style={{
                      background:
                        'linear-gradient(90deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 25%, rgb(255, 211, 165) 50%, rgb(186, 242, 187) 75%, rgb(141, 228, 255) 100%)',
                      height: '3px',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Search Results Header & Filter Bar */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <p className="text-sm font-bold text-on-surface truncate">
            ‘{query || activeTag || '전체 웹툰'}’
          </p>
          <span className="text-xs font-medium text-outline whitespace-nowrap">
            {resultCount}건
          </span>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortIdx((prev) => (prev + 1) % SORT_OPTIONS.length)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-on-surface bg-surface-container rounded-full hover:bg-surface-container-high transition-colors"
          >
            <span>{SORT_OPTIONS[sortIdx]}</span>
            <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
          </button>
        </div>
      </div>

      {/* Webtoon Grid Section */}
      {(activeTab === '전체' || activeTab === '웹툰 작품') && (
        <section className="px-4 pt-1 pb-4">
          {filteredCards.length === 0 ? (
            <div className="p-6 rounded-2xl bg-surface-container-low text-center flex flex-col items-center gap-2.5">
              <span className="material-symbols-outlined text-3xl text-outline">search_off</span>
              <p className="text-xs font-bold text-on-surface">
                ‘{query || activeTag}’에 대한 검색 결과가 없습니다
              </p>
              <p className="text-[11px] text-outline">
                찾는 이야기가 없다면 스튜디오에서 3초 만에 직접 만들어보세요!
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setActiveTag('');
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface text-xs font-semibold"
                >
                  검색 초기화
                </button>
                <button
                  type="button"
                  onClick={() => onOpenStudio({ prompt: query })}
                  className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold shadow-sm"
                >
                  스튜디오에서 직접 만들기 ✨
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`grid gap-3 ${
                isWebMode ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2'
              }`}
            >
              {filteredCards.map((card) => {
                const isBookmarked = bookmarkedEpIds.includes(card.episodeId);
                return (
                  <article
                    key={card.id}
                    onClick={() => onOpenViewer(card.episodeId)}
                    className="flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm group cursor-pointer"
                  >
                    <div className="relative w-full aspect-[4/5] bg-surface-container-highest overflow-hidden">
                      <img
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        alt={card.title}
                        referrerPolicy="no-referrer"
                        src={card.image}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span
                        className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-md"
                        style={card.badgeTopStyle}
                      >
                        {card.badgeTop}
                      </span>
                      <button
                        type="button"
                        aria-label="북마크"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(card.episodeId);
                        }}
                        className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md transition-colors ${
                          isBookmarked ? 'text-error' : 'text-white'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[16px]"
                          style={{
                            fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          bookmark
                        </span>
                      </button>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white/90">
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px] text-white">
                            visibility
                          </span>
                          {card.views}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px] text-rose-300">
                            favorite
                          </span>
                          {card.likes}
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 flex flex-col flex-1 justify-between">
                      <h2 className="text-xs font-bold text-on-surface line-clamp-2 leading-snug">
                        {card.title}
                      </h2>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-transparent">
                        <span className="text-[11px] font-medium text-outline truncate">
                          {card.author}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[9px] font-semibold"
                          style={card.tagRightStyle}
                        >
                          {card.tagRight}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Style Preset Grid when Style Tab selected */}
      {activeTab === '스타일 프리셋' && (
        <section
          className={`px-4 pt-1 pb-4 grid gap-3 ${
            isWebMode ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'
          }`}
        >
          {STUDIO_STYLES.map((st) => (
            <div
              key={st.key}
              onClick={() => onOpenStudio({ styleKey: st.key })}
              className="rounded-xl bg-surface-container-lowest p-2.5 shadow-sm flex flex-col gap-2 cursor-pointer"
            >
              <div className="relative w-full h-28 rounded-lg overflow-hidden">
                <img
                  src={st.image}
                  alt={st.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold ${st.badgeClass}`}
                  style={st.badgeStyle}
                >
                  {st.badge}
                </span>
              </div>
              <span className="text-xs font-bold text-on-surface">{st.title}</span>
              <span className="text-[10px] text-outline">{st.desc}</span>
            </div>
          ))}
        </section>
      )}

      {/* Creators List Tab */}
      {activeTab === '크리에이터' && (
        <section
          className={`px-4 pt-1 pb-4 ${
            isWebMode ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-2.5'
          }`}
        >
          {SEARCH_CREATORS.map((creator) => {
            const isSub = !!subscribedCreators[creator.id];
            return (
              <div
                key={creator.id}
                className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${creator.avatarBg}`}
                  >
                    {creator.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-on-surface truncate">{creator.name}</p>
                      <span className="text-[10px] text-outline shrink-0">
                        팔로워 {creator.followers}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                      {creator.specialty}
                    </p>
                    <p className="text-[10px] text-primary truncate mt-0.5">
                      대표작: {creator.latestTitle}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleSubscribe(creator.id, creator.name.split(' ')[0])}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                      isSub
                        ? 'bg-primary text-on-primary'
                        : 'bg-secondary-container text-on-secondary-container hover:bg-primary hover:text-on-primary'
                    }`}
                  >
                    {isSub ? '구독중 ✓' : '+ 구독'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenViewer(creator.episodeId)}
                    className="px-3 py-1 rounded-full bg-surface-container text-[10px] font-semibold text-on-surface-variant hover:text-primary"
                  >
                    작품 보기
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Style Preset Recommendation Spotlight */}
      <section className="px-4 py-2">
        <div
          className="relative overflow-hidden rounded-xl bg-surface-container p-4 shadow-sm"
          style={{
            background:
              'linear-gradient(135deg, rgb(255, 240, 242) 0%, rgb(255, 245, 235) 35%, rgb(240, 255, 244) 70%, rgb(237, 251, 255) 100%)',
            border: '1.5px solid rgba(255, 170, 166, 0.4)',
            boxShadow: 'rgba(255, 83, 118, 0.1) 0px 4px 20px -2px',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-[16px] text-primary">palette</span>
                <span className="text-[11px] font-bold text-primary tracking-wide">
                  추천 작화 스타일 프리셋
                </span>
              </div>
              <h3 className="text-sm font-bold text-on-surface truncate">
                ‘명랑 인스타툰’ 에디션
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                방금 검색한 <strong>‘{query || '월요일 출근'}’</strong> 에피소드를 귀여운 라인
                드로잉으로 손쉽게 각색해보세요!
              </p>
            </div>
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-highest shadow-inner">
              <img
                className="w-full h-full object-cover"
                alt="명랑 인스타툰 미리보기"
                referrerPolicy="no-referrer"
                src={SEARCH_STYLE_SPOTLIGHT_IMG}
              />
            </div>
          </div>
          <div className="mt-3.5 pt-3 flex items-center justify-between bg-surface-container-low/60 rounded-lg p-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
              <span className="text-[11px] font-medium text-on-surface">
                3초 만에 4컷 콘티 완성
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                onOpenStudio({
                  styleKey: 'insta',
                  prompt: `${query || '월요일 출근'} 에피소드를 명랑 인스타툰 스타일로 그려줘!`,
                })
              }
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-semibold shadow hover:opacity-90 active:scale-95 transition-all"
              style={{
                background:
                  'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 30%, rgb(255, 211, 165) 65%, rgb(141, 228, 255) 100%)',
                color: 'rgb(255, 255, 255)',
              }}
            >
              <span>이 스타일로 만들기</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Creator Spotlight Ribbon */}
      <section className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-secondary">group</span>
            <h4 className="text-xs font-bold text-on-surface">연관 인기 크리에이터</h4>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('크리에이터')}
            className="text-[11px] font-semibold text-primary"
          >
            더보기
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-lowest shadow-sm min-w-[190px] flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container text-xs flex-shrink-0">
              M
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-on-surface truncate">밍툰 (@ming_toon)</p>
              <p className="text-[10px] text-outline truncate">직장공감 4컷 전문</p>
            </div>
            <button
              type="button"
              onClick={() => toggleSubscribe('c1', '밍툰')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                subscribedCreators['c1']
                  ? 'bg-primary text-on-primary'
                  : 'bg-secondary-container text-on-secondary-container hover:bg-primary hover:text-on-primary'
              }`}
            >
              {subscribedCreators['c1'] ? '구독중' : '구독'}
            </button>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-lowest shadow-sm min-w-[190px] flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-on-tertiary-fixed text-xs flex-shrink-0">
              S
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-on-surface truncate">지하철생존기</p>
              <p className="text-[10px] text-outline truncate">2호선 일러스트레이터</p>
            </div>
            <button
              type="button"
              onClick={() => toggleSubscribe('c2', '지하철생존기')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                subscribedCreators['c2']
                  ? 'bg-primary text-on-primary'
                  : 'bg-secondary-container text-on-secondary-container hover:bg-primary hover:text-on-primary'
              }`}
            >
              {subscribedCreators['c2'] ? '구독중' : '구독'}
            </button>
          </div>
        </div>
      </section>

      {/* Studio Creation CTA Floating/Sticky Banner */}
      <section className="px-4 mt-3">
        <div
          className="relative overflow-hidden rounded-xl bg-primary text-on-primary p-4 shadow-md"
          style={{
            background:
              'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 30%, rgb(255, 211, 165) 65%, rgb(141, 228, 255) 100%)',
            boxShadow: 'rgba(255, 83, 118, 0.35) 0px 8px 24px -4px',
          }}
        >
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold mb-1">
                <span className="material-symbols-outlined text-[12px] text-tertiary-fixed">
                  smart_toy
                </span>
                <span>AI 웹툰 메이커</span>
              </div>
              <p className="text-xs text-primary-fixed leading-tight">
                원하는 이야기가 없으신가요?
              </p>
              <h4 className="text-sm font-extrabold text-white mt-0.5">
                내 일상으로 3초 만에 직접 만들기
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onOpenStudio({ prompt: query })}
              className="flex items-center justify-center gap-1 px-3.5 py-2 rounded-lg bg-surface-bright text-primary text-xs font-bold shadow hover:bg-white active:scale-95 transition-all flex-shrink-0"
              style={{
                background: 'rgb(255, 255, 255)',
                color: 'rgb(255, 83, 118)',
                boxShadow: 'rgba(0, 0, 0, 0.12) 0px 2px 8px',
              }}
            >
              <span>스튜디오 이동</span>
              <span className="material-symbols-outlined text-[16px]">draw</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
