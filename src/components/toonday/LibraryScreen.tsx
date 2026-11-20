import React, { useEffect, useRef, useState } from 'react';
import {
  AppRoute,
  CharacterPresetItem,
  DraftItem,
  LibraryWebtoonItem,
  TOONDAY_ASSETS,
  WebtoonEpisode,
} from '../../data/toondayData';
import { shareOrCopyText } from '../../utils/toondayExport';
import {
  InstagramPublishRecord,
  InstagramPublishTarget,
} from './InstagramPublishModal';

export type LibraryTab = 'webtoons' | 'drafts' | 'bookmarks' | 'characters' | 'support';

interface AuthorProfile {
  name: string;
  handle: string;
  genre: string;
  avatar: string;
}

interface LibraryScreenProps {
  initialTab?: LibraryTab;
  isPro: boolean;
  equippedBadge: string | null;
  profile: AuthorProfile;
  onUpdateProfile: (next: AuthorProfile) => void;
  libraryItems: LibraryWebtoonItem[];
  allEpisodes: Record<number, WebtoonEpisode>;
  bookmarkedEpIds: number[];
  onToggleBookmark: (epId: number) => void;
  drafts: DraftItem[];
  onUpdateDraft: (id: string, patch: Partial<DraftItem>) => void;
  onDeleteDrafts: (ids: string[]) => void;
  characterPresets: CharacterPresetItem[];
  onNavigate: (route: AppRoute) => void;
  onOpenViewer: (episodeId: number) => void;
  onOpenStudio: (opts?: {
    prompt?: string;
    styleKey?: string;
    cuts?: 4 | 8;
    charId?: string;
  }) => void;
  onStartGenerateFromDraft: (draft: DraftItem) => void;
  onShowToast: (msg: string) => void;
  isWebMode?: boolean;
  instagramRecords?: Record<number, InstagramPublishRecord>;
  onOpenInstagramPublish?: (
    target?: InstagramPublishTarget,
    tab?: 'publish' | 'history' | 'n8n' | 'sync'
  ) => void;
}

interface SupporterRow {
  rank: number;
  name: string;
  badge?: string;
  cups: number;
  message?: string;
  highlighted?: boolean;
}

interface CheerItem {
  initial: string;
  bg: string;
  name: string;
  time: string;
  text: string;
}

const INITIAL_TOP_SUPPORTERS: SupporterRow[] = [
  {
    rank: 1,
    name: '지하철생존기',
    badge: 'VIP 서포터',
    cups: 30,
    message: '“작가님 항상 야근 퇴근길에 힐링받고 갑니다! 건강 챙기시면서 연재해주세요 ☕✨”',
    highlighted: true,
  },
  {
    rank: 2,
    name: '야식요정',
    badge: '열혈 팬',
    cups: 15,
    message: '“퇴근 후 맥주편 보고 빵터졌어요ㅋㅋ 작가님 공감능력 1000%!”',
  },
  { rank: 3, name: '수달작가', badge: '동료작가', cups: 10 },
  { rank: 4, name: '달콤한밤', cups: 8 },
];

const INITIAL_CHEERS: CheerItem[] = [
  {
    initial: '모카',
    bg: 'bg-primary-fixed text-primary',
    name: '모카라떼',
    time: '15분 전',
    text: '붕어빵 3천원어치 편 보고 저도 사먹으러 나갔다 왔어요 🥺 따뜻한 만화 최고!',
  },
  {
    initial: '하늘',
    bg: 'bg-secondary-container text-secondary',
    name: '하늘바라기',
    time: '1시간 전',
    text: '커피 2잔 쏘고 갑니다! 마감 힘내세요 서연 작가님 ☕☕',
  },
  {
    initial: '달콩',
    bg: 'bg-tertiary-container/30 text-tertiary',
    name: '달콩이',
    time: '3시간 전',
    text: '인스타툰 보고 유입됐는데 스토리 너무 귀여워요 자주 올려주세요 ㅎㅎ',
  },
];

const AVATAR_PRESETS = [
  TOONDAY_ASSETS.authorAvatar,
  TOONDAY_ASSETS.userAvatar,
  TOONDAY_ASSETS.reviewer1,
  TOONDAY_ASSETS.reviewer2,
];

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  initialTab = 'webtoons',
  isPro,
  equippedBadge,
  profile,
  onUpdateProfile,
  libraryItems,
  allEpisodes,
  bookmarkedEpIds,
  onToggleBookmark,
  drafts,
  onUpdateDraft,
  onDeleteDrafts,
  characterPresets,
  onNavigate,
  onOpenViewer,
  onOpenStudio,
  onStartGenerateFromDraft,
  onShowToast,
  isWebMode = false,
  instagramRecords = {},
  onOpenInstagramPublish,
}) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>(initialTab);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'최신순' | '인기순'>('최신순');

  const buildPublishTarget = (
    episodeId: number,
    title: string,
    fallbackImage: string,
    styleName?: string
  ): InstagramPublishTarget => {
    const ep = allEpisodes[episodeId];
    const summary = ep?.panels
      ?.slice(0, 3)
      .map((p) => p.dialogue)
      .filter(Boolean)
      .join(' / ');
    return {
      episodeId,
      title: ep?.title || title,
      caption: summary || ep?.subtitle || `${title} — 오늘의 AI 4컷 웹툰`,
      imageUrl: ep?.thumbnail || fallbackImage,
      styleName: ep?.styleName || styleName,
    };
  };

  const publishedCount = Object.keys(instagramRecords).length;

  // Drafts management state
  const [selectedDraftIds, setSelectedDraftIds] = useState<Record<string, boolean>>({});
  const [resumeSheet, setResumeSheet] = useState<{
    id: string;
    title: string;
    status: string;
    step: string;
    memo: string;
  } | null>(null);

  // Profile edit modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editHandle, setEditHandle] = useState(profile.handle);
  const [editGenre, setEditGenre] = useState(profile.genre);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Webtoon card action sheet state
  const [cardActionItem, setCardActionItem] = useState<LibraryWebtoonItem | null>(null);

  // Coffee support modal & stateful leaderboard/cheers
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);
  const [coffeeTier, setCoffeeTier] = useState<{ cups: number; amount: number }>({
    cups: 3,
    amount: 3000,
  });
  const [payMethod, setPayMethod] = useState('카카오페이');
  const [cheerMessage, setCheerMessage] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [totalCups, setTotalCups] = useState(142);
  const [supporters, setSupporters] = useState<SupporterRow[]>(INITIAL_TOP_SUPPORTERS);
  const [cheers, setCheers] = useState<CheerItem[]>(INITIAL_CHEERS);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setEditName(profile.name);
    setEditHandle(profile.handle);
    setEditGenre(profile.genre);
    setEditAvatar(profile.avatar);
  }, [profile]);

  const selectedCount = Object.values(selectedDraftIds).filter(Boolean).length;
  const allSelected = drafts.length > 0 && selectedCount === drafts.length;

  const toggleSelectAllDrafts = () => {
    if (allSelected) {
      setSelectedDraftIds({});
    } else {
      const next: Record<string, boolean> = {};
      drafts.forEach((d) => {
        next[d.id] = true;
      });
      setSelectedDraftIds(next);
    }
  };

  const handleDeleteSelectedDrafts = () => {
    if (selectedCount === 0) {
      onShowToast('삭제할 콘티를 먼저 선택해주세요.');
      return;
    }
    const ids = Object.entries(selectedDraftIds)
      .filter(([, v]) => v)
      .map(([k]) => k);
    onDeleteDrafts(ids);
    setSelectedDraftIds({});
    onShowToast(`선택한 ${ids.length}건의 콘티가 삭제되었습니다.`);
  };

  const handleDeleteSingleDraft = (id: string) => {
    onDeleteDrafts([id]);
    setSelectedDraftIds((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    onShowToast('임시저장 콘티가 삭제되었습니다.');
  };

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: editName.trim() || profile.name,
      handle: editHandle.trim() || profile.handle,
      genre: editGenre.trim() || profile.genre,
      avatar: editAvatar || profile.avatar,
    });
    setIsProfileModalOpen(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoffeePayment = () => {
    const cleanMsg = cheerMessage.trim() || `따뜻한 커피 ${coffeeTier.cups}잔 응원합니다! ☕✨`;
    const supporterName = isAnon ? '익명의 팬' : profile.name.slice(0, 6) || '열혈독자';
    setIsCoffeeModalOpen(false);
    setTotalCups((c) => c + coffeeTier.cups);
    setCheers((prev) => [
      {
        initial: isAnon ? '익명' : supporterName.slice(0, 2),
        bg: 'bg-primary text-on-primary',
        name: supporterName,
        time: '방금 전',
        text: cleanMsg,
      },
      ...prev,
    ]);
    setSupporters((prev) => {
      const existing = prev.find((s) => s.name === supporterName);
      const updated = existing
        ? prev.map((s) =>
            s.name === supporterName
              ? { ...s, cups: s.cups + coffeeTier.cups, message: `“${cleanMsg}”` }
              : s
          )
        : [
            ...prev,
            {
              rank: prev.length + 1,
              name: supporterName,
              badge: coffeeTier.cups >= 5 ? 'VIP 서포터' : '신규 후원',
              cups: coffeeTier.cups,
              message: `“${cleanMsg}”`,
            },
          ];
      return [...updated]
        .sort((a, b) => b.cups - a.cups)
        .map((s, idx) => ({ ...s, rank: idx + 1, highlighted: idx === 0 }));
    });
    onShowToast(
      `☕ 서연 작가님에게 ${payMethod}로 커피 ${coffeeTier.cups}잔을 선물했습니다! 명예의 전당에 반영되었습니다.`
    );
    setCheerMessage('');
  };

  const bookmarkedEpisodes = bookmarkedEpIds
    .map((id) => allEpisodes[id])
    .filter((ep): ep is WebtoonEpisode => Boolean(ep));

  const sortedLibrary =
    sortOrder === '인기순'
      ? [...libraryItems].sort((a, b) => (b.likes || 0) - (a.likes || 0))
      : libraryItems;

  // Dedicated Drafts Detail layout when on 'drafts' tab
  if (activeTab === 'drafts') {
    return (
      <div className="flex flex-col w-full pb-12">
        {/* Sub Bar */}
        <section className="sticky top-16 z-30 bg-surface/90 backdrop-blur-md px-4 pt-2 pb-3">
          <div className="flex items-center justify-between p-1 bg-surface-container rounded-full shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('webtoons')}
              className="flex-1 py-2 px-3 text-xs font-semibold text-on-surface-variant hover:text-on-surface text-center rounded-full transition-all"
            >
              생성 웹툰 <span className="opacity-75 font-normal">{libraryItems.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('drafts')}
              className="flex-1 py-2 px-3 text-xs font-bold rounded-full shadow-sm text-center transition-all flex items-center justify-center gap-1"
              style={{
                background: 'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 100%)',
                color: 'rgb(255, 255, 255)',
              }}
            >
              <span>임시저장 콘티</span>
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] bg-primary-container text-on-primary-container rounded-full font-extrabold">
                {drafts.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookmarks')}
              className="flex-1 py-2 px-3 text-xs font-semibold text-on-surface-variant hover:text-on-surface text-center rounded-full transition-all"
            >
              북마크 <span className="opacity-75 font-normal">{bookmarkedEpisodes.length}</span>
            </button>
          </div>
        </section>

        {/* Guide Banner & Multi-select Control */}
        <section className="px-4 pt-1 pb-3 space-y-3">
          <div
            className="relative overflow-hidden rounded-xl p-3.5 shadow-sm flex items-start gap-3"
            style={{
              background:
                'linear-gradient(135deg, rgba(255, 211, 165, 0.45) 0%, rgba(186, 242, 187, 0.45) 100%)',
              border: '1px solid rgba(255, 170, 166, 0.35)',
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-0.5"
              style={{
                background: 'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 100%)',
                color: 'rgb(255, 255, 255)',
              }}
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-bold text-on-secondary-container">
                  작성 중인 콘티 {drafts.length}건이 보관되어 있어요 ✨
                </p>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant">
                  30일간 보관
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                떠오른 순간의 감정과 대사를 저장해두고 언제든 나만의 툰으로 완성해보세요.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAllDrafts}
                className="w-4 h-4 rounded text-primary accent-primary bg-surface-container-high focus:ring-0 cursor-pointer"
              />
              <span className="font-medium text-on-surface-variant">
                전체 선택 ({selectedCount}/{drafts.length})
              </span>
            </label>
            <button
              type="button"
              onClick={handleDeleteSelectedDrafts}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors ${
                selectedCount > 0
                  ? 'text-error bg-error-container font-bold'
                  : 'font-medium text-on-surface-variant bg-surface-container-low hover:bg-error-container hover:text-on-error-container'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
              <span>선택 삭제</span>
            </button>
          </div>
        </section>

        {/* Drafts Cards List */}
        <section className="px-4 space-y-4">
          {drafts.map((draft) => (
            <article
              key={draft.id}
              className="bg-surface-container-lowest rounded-2xl p-4 shadow-md space-y-3.5 transition-transform hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={!!selectedDraftIds[draft.id]}
                    onChange={() =>
                      setSelectedDraftIds((prev) => ({
                        ...prev,
                        [draft.id]: !prev[draft.id],
                      }))
                    }
                    className="mt-1 w-4 h-4 rounded accent-primary bg-surface-container cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 ${draft.statusStyle}`}
                      >
                        {draft.isComplete && (
                          <span className="material-symbols-outlined text-[12px]">
                            check_circle
                          </span>
                        )}
                        {draft.statusBadge}
                      </span>
                      <span className="text-[10px] text-outline flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>{' '}
                        {draft.updatedAt}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-on-surface tracking-tight truncate">
                      {draft.title}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="콘티 정보 수정"
                  onClick={() =>
                    setResumeSheet({
                      id: draft.id,
                      title: draft.title,
                      status: draft.statusBadge,
                      step: draft.step,
                      memo: draft.memo,
                    })
                  }
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">more_vert</span>
                </button>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {draft.tags.map((tag, idx) => (
                  <span
                    key={tag}
                    className={`text-[10px] px-2 py-0.5 rounded-md ${
                      idx === 0
                        ? 'font-semibold bg-surface-container text-primary'
                        : idx === 1
                          ? 'font-semibold bg-surface-container text-secondary'
                          : 'font-medium bg-surface-container-low text-on-surface-variant'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 4-cut Storyboard Thumbnail Strip */}
              <div className="bg-surface-container-low p-2.5 rounded-xl">
                <div className="grid grid-cols-4 gap-2">
                  {draft.cuts.map((cut) => (
                    <div key={cut.label} className="flex flex-col gap-1">
                      {cut.image ? (
                        <div
                          className={`relative rounded-lg overflow-hidden bg-surface-container shadow-xs ${
                            draft.isComplete ? 'aspect-square' : 'aspect-[3/4]'
                          }`}
                        >
                          <img
                            className="w-full h-full object-cover"
                            alt={cut.caption}
                            referrerPolicy="no-referrer"
                            src={cut.image}
                          />
                          <div className="absolute bottom-1 left-1 px-1 py-0.2 bg-on-background/70 backdrop-blur-xs rounded text-[9px] font-bold text-surface-bright">
                            {cut.label}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenStudio({ prompt: draft.memo.replace(/^“|”$/g, '') })
                          }
                          className="aspect-[3/4] rounded-lg bg-surface-container-high/80 hover:bg-surface-container-highest transition-colors flex flex-col items-center justify-center gap-1 text-primary group"
                        >
                          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">
                            add_photo_alternate
                          </span>
                          <span className="text-[9px] font-bold">4컷 추가</span>
                        </button>
                      )}
                      <span
                        className={`text-[9px] text-center truncate ${
                          cut.image ? 'text-on-surface-variant' : 'text-outline'
                        }`}
                      >
                        {cut.caption}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Memo */}
              <div className="p-2.5 rounded-xl bg-surface-container-low text-xs text-on-surface-variant leading-relaxed">
                <p className="line-clamp-2">{draft.memo}</p>
                {draft.isComplete && (
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-outline-variant/20 text-[11px]">
                    <span className="flex items-center gap-1 font-medium text-tertiary">
                      <span className="material-symbols-outlined text-[15px]">
                        confirmation_number
                      </span>
                      생성 예상 비용:{' '}
                      <strong className="text-on-surface">
                        {isPro ? 'PRO 무제한 무료' : '무료 티켓 1장'}
                      </strong>{' '}
                      사용 가능
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container font-semibold text-secondary">
                      예상 소요 1분
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  aria-label="콘티 삭제"
                  onClick={() => handleDeleteSingleDraft(draft.id)}
                  className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-error hover:bg-error-container flex items-center justify-center transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[19px]">delete</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setResumeSheet({
                      id: draft.id,
                      title: draft.title,
                      status: draft.statusBadge,
                      step: draft.step,
                      memo: draft.memo,
                    })
                  }
                  className="h-10 px-3 rounded-xl bg-surface-container text-on-surface-variant hover:text-primary font-semibold text-xs flex items-center justify-center gap-1 transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {draft.isComplete ? 'visibility' : 'draw'}
                  </span>
                  <span>{draft.isComplete ? '미리보기·편집' : '콘티 편집'}</span>
                </button>
                {draft.isComplete ? (
                  <button
                    type="button"
                    onClick={() => onStartGenerateFromDraft(draft)}
                    className="flex-1 h-10 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
                    style={{
                      background:
                        'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 25%, rgb(255, 211, 165) 50%, rgb(186, 242, 187) 75%, rgb(141, 228, 255) 100%)',
                      color: 'rgb(255, 255, 255)',
                      textShadow: 'rgba(0, 0, 0, 0.18) 0px 1px 2px',
                      boxShadow: 'rgba(255, 83, 118, 0.35) 0px 4px 14px',
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    <span>지금 바로 웹툰 생성</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setResumeSheet({
                        id: draft.id,
                        title: draft.title,
                        status: draft.statusBadge,
                        step: draft.step,
                        memo: draft.memo,
                      })
                    }
                    className="flex-1 h-10 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-primary-container active:scale-[0.98] transition-all"
                  >
                    <span>이어서 만들기</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </article>
          ))}

          {drafts.length === 0 && (
            <div className="p-8 rounded-2xl bg-surface-container-low text-center flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-3xl text-outline">inbox</span>
              <p className="text-xs font-bold text-on-surface">임시저장된 콘티가 없습니다</p>
              <button
                type="button"
                onClick={() => onOpenStudio()}
                className="mt-1 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold"
              >
                새 콘티 작성하러 가기
              </button>
            </div>
          )}
        </section>

        {/* Bottom Insight Tip & Quick Studio Banner */}
        <section className="px-4 pt-5 space-y-3">
          <div className="p-3.5 rounded-2xl bg-surface-container-high/60 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[16px]">lightbulb</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-on-surface">ToonDay 콘티 완성 꿀팁</h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
                대사와 인물의 감정 상태를 한 줄만 더 적어주시면, AI가 배경 소품과 표정 음영을 훨씬
                풍성하게 렌더링해요!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenStudio()}
            className="w-full p-4 rounded-2xl flex items-center justify-between shadow-xs transition-colors text-left"
            style={{
              background:
                'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 35%, rgb(255, 211, 165) 70%, rgb(141, 228, 255) 100%)',
              color: 'rgb(255, 255, 255)',
              boxShadow: 'rgba(255, 83, 118, 0.25) 0px 6px 20px',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">오늘의 새로운 순간 기록하기</h4>
                <p className="text-[11px] text-white/90">
                  사진 1장 또는 짧은 일기로 4컷 콘티 시작
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-white text-[20px]">chevron_right</span>
          </button>
        </section>

        {/* Draft Resume Modal Sheet (Editable) */}
        {resumeSheet && (
          <div
            onClick={() => setResumeSheet(null)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-t-2xl p-5 shadow-2xl space-y-4 max-w-[430px] w-full mx-auto"
            >
              <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-1" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    auto_fix_high
                  </span>
                  <h4 className="text-sm font-bold text-on-surface">스튜디오 콘티 편집</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setResumeSheet(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="bg-surface-container-low p-3.5 rounded-xl space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                    {resumeSheet.status}
                  </span>
                  <span className="text-[10px] text-outline truncate">{resumeSheet.step}</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant">콘티 제목</label>
                  <input
                    type="text"
                    value={resumeSheet.title}
                    onChange={(e) =>
                      setResumeSheet((prev) => (prev ? { ...prev, title: e.target.value } : null))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest text-xs font-bold text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant">스토리 메모</label>
                  <textarea
                    rows={3}
                    value={resumeSheet.memo.replace(/^“|”$/g, '')}
                    onChange={(e) =>
                      setResumeSheet((prev) => (prev ? { ...prev, memo: e.target.value } : null))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest text-xs text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const cleanMemo = resumeSheet.memo.replace(/^“|”$/g, '').trim();
                    onUpdateDraft(resumeSheet.id, {
                      title: resumeSheet.title.trim() || '제목 없는 콘티',
                      memo: cleanMemo ? `“${cleanMemo}”` : resumeSheet.memo,
                    });
                    setResumeSheet(null);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-surface-container text-on-surface font-semibold text-xs text-center hover:bg-surface-container-high transition-colors"
                >
                  수정 저장
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cleanPrompt = resumeSheet.memo.replace(/^“|”$/g, '').trim();
                    onUpdateDraft(resumeSheet.id, {
                      title: resumeSheet.title.trim() || '제목 없는 콘티',
                      memo: cleanPrompt ? `“${cleanPrompt}”` : resumeSheet.memo,
                    });
                    setResumeSheet(null);
                    onOpenStudio({ prompt: cleanPrompt });
                  }}
                  className="py-2.5 px-3 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1 shadow-md hover:bg-primary-container transition-all"
                >
                  <span>스튜디오 열기</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main Library View ('webtoons' | 'bookmarks' | 'characters' | 'support')
  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Author Profile & Quota Card */}
      <section className="px-4 pt-2 pb-3">
        <div
          className={`bg-surface-container-lowest rounded-2xl p-4 shadow-sm relative overflow-hidden ${
            isWebMode ? 'grid grid-cols-1 lg:grid-cols-12 gap-4 items-center' : 'flex flex-col gap-3.5'
          }`}
        >
          <div className={isWebMode ? 'lg:col-span-7 flex flex-col gap-3.5' : 'flex flex-col gap-3.5'}>
          <div className="flex items-center gap-3.5 z-10">
            <div className="relative shrink-0">
              <img
                className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-primary-fixed"
                alt={profile.name}
                referrerPolicy="no-referrer"
                src={profile.avatar}
              />
              <button
                type="button"
                aria-label="프로필 이미지 편집"
                onClick={() => setIsProfileModalOpen(true)}
                className="absolute -bottom-1 -right-1 bg-primary text-on-primary w-6 h-6 rounded-full flex items-center justify-center shadow-md"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </button>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base font-bold text-on-surface truncate">{profile.name}</h2>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold shrink-0">
                  <span
                    className="material-symbols-outlined text-[12px] text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  인스타툰 작가
                </span>
                {equippedBadge && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold shrink-0">
                    🏆 {equippedBadge}
                  </span>
                )}
              </div>
              <span className="text-xs text-on-surface-variant font-medium mt-0.5">
                {profile.handle}
              </span>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] text-outline flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px] text-tertiary">draw</span>{' '}
                  {profile.genre}
                </span>
                <span className="text-[10px] text-outline-variant">•</span>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-[11px] font-semibold text-primary flex items-center"
                >
                  프로필 관리 <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-surface-container-low text-center">
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-on-surface-variant">총 생성</span>
              <span className="text-sm font-extrabold text-on-surface mt-0.5">
                {libraryItems.length + 14}
                <span className="text-[11px] font-medium text-on-surface-variant ml-0.5">편</span>
              </span>
            </div>
            <div className="flex flex-col items-center border-l border-outline-variant/30">
              <span className="text-[11px] font-medium text-on-surface-variant">공개 웹툰</span>
              <span className="text-sm font-extrabold text-primary mt-0.5">
                {libraryItems.filter((i) => !i.isPrivate).length + 9}
                <span className="text-[11px] font-medium text-on-surface-variant ml-0.5">편</span>
              </span>
            </div>
            <div className="flex flex-col items-center border-l border-outline-variant/30">
              <span className="text-[11px] font-medium text-on-surface-variant">받은 하트</span>
              <span className="text-sm font-extrabold text-tertiary mt-0.5 tabular-nums">
                2.4k<span className="text-[11px] font-medium text-on-surface-variant ml-0.5">개</span>
              </span>
            </div>
          </div>
          </div>

          {/* PRO Membership Card */}
          <div
            onClick={() => onNavigate('subscription')}
            className={`${
              isWebMode ? 'lg:col-span-5 h-full flex flex-col justify-between' : ''
            } text-on-primary rounded-xl p-3.5 shadow-sm relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform`}
            style={{
              background:
                'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 30%, rgb(255, 211, 165) 65%, rgb(141, 228, 255) 100%)',
              boxShadow: 'rgba(255, 83, 118, 0.35) 0px 6px 20px -2px',
            }}
          >
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-md" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="material-symbols-outlined text-[18px] text-tertiary-fixed"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
                <span className="text-xs font-bold tracking-tight">
                  {isPro ? 'ToonDay PRO 연간 구독 중 ✨' : '무료 플랜 · PRO 업그레이드 >'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                {isPro ? 'D-320' : 'FREE'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-primary-fixed pt-1 border-t border-white/15">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">all_inclusive</span>
                <span>
                  오늘 생성:{' '}
                  <strong className="text-white font-semibold">
                    {isPro ? '무제한 가능' : '무료 티켓 1장'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-tertiary-fixed">
                  face
                </span>
                <span>
                  {isPro ? (
                    <>
                      페이스락 <strong className="text-white font-semibold">ON</strong>
                    </>
                  ) : (
                    <>
                      PRO 전환 시 <strong className="text-white font-semibold">무제한</strong>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mid Segmented Horizontal Tabs */}
      <section className="mt-2 px-4">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            {
              id: 'webtoons' as const,
              icon: 'auto_stories',
              label: '내 생성 웹툰',
              badge: String(libraryItems.length),
            },
            {
              id: 'drafts' as const,
              icon: 'pending_actions',
              label: '임시저장 콘티',
              badge: String(drafts.length),
            },
            {
              id: 'bookmarks' as const,
              icon: 'bookmark',
              label: '북마크한 웹툰',
              badge: String(bookmarkedEpisodes.length),
            },
            {
              id: 'characters' as const,
              icon: 'face_6',
              label: '캐릭터 프리셋',
              badge: String(characterPresets.length),
            },
            {
              id: 'support' as const,
              icon: 'local_cafe',
              label: '팬 응원 & 후원',
              badge: `${totalCups}잔`,
              goldBadge: true,
            },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs shrink-0 transition-transform active:scale-95 ${
                  active
                    ? 'font-bold shadow-sm text-white'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface font-semibold'
                }`}
                style={
                  active
                    ? {
                        background:
                          'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 100%)',
                        boxShadow: 'rgba(255, 83, 118, 0.35) 0px 2px 10px',
                      }
                    : undefined
                }
              >
                <span
                  className={`material-symbols-outlined text-[15px] ${
                    !active && tab.goldBadge ? 'text-tertiary' : ''
                  }`}
                >
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    active
                      ? 'bg-white/20 text-white'
                      : tab.goldBadge
                        ? 'bg-tertiary-container/90 text-on-tertiary-container font-bold'
                        : 'bg-surface-variant'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {activeTab === 'support' ? (
        <section className="px-4 mt-3 flex flex-col gap-3.5">
          {/* Coffee Donation Summary Card */}
          <div className="bg-gradient-to-r from-secondary-container via-surface-container-high to-surface-container-low rounded-2xl p-4 shadow-sm border border-outline-variant/30 flex items-center justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-tertiary-container/20 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-3 z-10">
              <div className="w-12 h-12 rounded-2xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center shadow-sm shrink-0">
                <span className="material-symbols-outlined text-2xl">local_cafe</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                  이번 달 누적 커피 후원{' '}
                  <span className="material-symbols-outlined text-[14px] text-tertiary">
                    favorite
                  </span>
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-extrabold text-on-surface tracking-tight">
                    {totalCups}
                    <span className="text-sm font-semibold ml-0.5 text-primary">잔</span>
                  </span>
                  <span className="text-xs text-outline font-medium">
                    ({(totalCups * 1000).toLocaleString()}원 상당)
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCoffeeModalOpen(true)}
              className="z-10 flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">redeem</span>
              <span>커피 선물하기</span>
            </button>
          </div>

          {/* Author Thank You Note */}
          <div className="bg-primary/5 rounded-2xl p-3.5 border border-primary/15 relative">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span
                className="material-symbols-outlined text-[16px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                push_pin
              </span>
              <span className="text-xs font-bold text-primary">작가의 감사 한마디</span>
              <span className="text-[10px] text-outline ml-auto">2024.11.18 업데이트</span>
            </div>
            <p className="text-xs font-medium text-on-surface leading-relaxed pl-1">
              “소중한 커피 한 잔 덕분에 밤샘 마감도 힘이 납니다! 다음 주엔 댕댕이 특별편 올라가요
              🐶💖 독자님들의 한 줄 댓글과 응원이 제 가장 큰 비타민이에요!”
            </p>
          </div>

          {/* Top Supporters Leaderboard */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className="material-symbols-outlined text-[18px] text-tertiary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  emoji_events
                </span>
                <h3 className="text-sm font-bold text-on-surface">
                  11월 명예의 전당 TOP 후원 팬
                </h3>
              </div>
              <span className="text-[11px] text-outline font-medium">실시간 집계</span>
            </div>

            <div className="flex flex-col gap-2.5 mt-1">
              {supporters.slice(0, 5).map((sup) =>
                sup.message ? (
                  <div
                    key={sup.name}
                    className={`p-3 rounded-xl flex flex-col gap-1.5 ${
                      sup.highlighted
                        ? 'bg-surface-container-low border border-tertiary-container/40'
                        : 'bg-surface-container-lowest border border-outline-variant/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full text-[11px] font-extrabold flex items-center justify-center shrink-0 ${
                            sup.rank === 1
                              ? 'bg-tertiary-container text-on-tertiary-container'
                              : 'bg-secondary-container text-on-secondary-container'
                          }`}
                        >
                          {sup.rank}
                        </span>
                        <span className="text-xs font-bold text-on-surface">{sup.name}</span>
                        {sup.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              sup.rank === 1
                                ? 'bg-tertiary-container/30 text-tertiary'
                                : 'bg-secondary-container text-on-secondary-container'
                            }`}
                          >
                            {sup.badge}
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs font-bold ${
                          sup.rank === 1 ? 'text-tertiary' : 'text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">local_cafe</span>
                        <span>{sup.cups}잔 후원</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-medium pl-7 leading-snug">
                      {sup.message}
                    </p>
                  </div>
                ) : (
                  <div
                    key={sup.name}
                    className="p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface-variant text-[11px] font-bold flex items-center justify-center shrink-0">
                        {sup.rank}
                      </span>
                      <span className="text-xs font-semibold text-on-surface">{sup.name}</span>
                      {sup.badge && (
                        <span className="text-[10px] text-outline font-medium">{sup.badge}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-on-surface">
                      <span className="material-symbols-outlined text-[14px] text-outline">
                        local_cafe
                      </span>
                      <span>{sup.cups}잔</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Live Cheers Timeline */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">sms</span>
                <h3 className="text-sm font-bold text-on-surface">실시간 한줄 응원 타임라인</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCoffeeModalOpen(true)}
                className="text-[11px] text-primary font-bold hover:underline"
              >
                응원 남기기 +
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {cheers.map((row, idx) => (
                <div
                  key={`${row.name}-${idx}`}
                  className={`flex items-start gap-2.5 py-2 ${
                    idx < cheers.length - 1 ? 'border-b border-surface-container' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${row.bg}`}
                  >
                    {row.initial}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface">{row.name}</span>
                      <span className="text-[10px] text-outline">{row.time}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">{row.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Slim Notice: Drafts Banner */}
          <section className="px-4 mt-2.5">
            <div
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-on-secondary-container"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 83, 118, 0.1) 0%, rgba(255, 211, 165, 0.18) 50%, rgba(186, 242, 187, 0.15) 100%)',
                border: '1px solid rgba(255, 83, 118, 0.25)',
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0 animate-pulse">
                  history_edu
                </span>
                <span className="text-xs font-medium truncate">
                  작성 중인 콘티가 <strong className="font-bold text-primary">{drafts.length}건</strong>{' '}
                  있습니다
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('drafts')}
                className="flex items-center gap-0.5 text-xs font-bold text-primary shrink-0 hover:underline"
              >
                이어 만들기
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </section>
          {/* n8n Instagram Auto-Publish Summary Strip */}
          {onOpenInstagramPublish && (
            <section className="px-4 mt-2.5">
              <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/40 px-3.5 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px]">auto_mode</span>
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate">
                      n8n 인스타그램 자동 게시
                    </p>
                    <p className="text-[10px] text-on-surface-variant tabular-nums">
                      게시 완료 {publishedCount}편 · 웹&amp;모바일 실시간 동기화
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenInstagramPublish(undefined, 'history')}
                    className="px-2.5 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-bold whitespace-nowrap hover:bg-primary-container transition-colors"
                  >
                    발행 이력
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenInstagramPublish(undefined, 'n8n')}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface text-[11px] font-semibold whitespace-nowrap hover:bg-surface-container-high transition-colors"
                  >
                    n8n 연동
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenInstagramPublish(undefined, 'sync')}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface text-[11px] font-semibold whitespace-nowrap hover:bg-surface-container-high transition-colors"
                  >
                    모바일·웹
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Filter & View Controls */}
          <section className="px-4 mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSortOrder((s) => (s === '최신순' ? '인기순' : '최신순'))}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-semibold shadow-xs"
              >
                <span>{sortOrder}</span>
                <span className="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
              </button>
              <span className="text-xs text-outline font-medium">
                {activeTab === 'characters'
                  ? `고정 캐릭터 프리셋 ${characterPresets.length}종`
                  : activeTab === 'bookmarks'
                    ? `북마크 작품 ${bookmarkedEpisodes.length}편`
                    : `총 ${libraryItems.length}개 작품`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('drafts')}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-primary text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">checklist</span>
                <span>콘티 편집</span>
              </button>
              <div className="flex items-center bg-surface-container rounded-lg p-0.5">
                <button
                  type="button"
                  aria-label="그리드 뷰"
                  onClick={() => setViewMode('grid')}
                  className={`w-7 h-7 flex items-center justify-center rounded-md ${
                    viewMode === 'grid'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">grid_view</span>
                </button>
                <button
                  type="button"
                  aria-label="리스트 뷰"
                  onClick={() => setViewMode('list')}
                  className={`w-7 h-7 flex items-center justify-center rounded-md ${
                    viewMode === 'list'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">view_agenda</span>
                </button>
              </div>
            </div>
          </section>

          {/* Character Presets Tab */}
          {activeTab === 'characters' ? (
            <section
              className={`px-4 mt-3 grid gap-3 ${
                isWebMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {characterPresets.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={ch.avatar}
                      alt={ch.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-fixed shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-primary bg-primary-fixed/50 px-2 py-0.5 rounded-full">
                        {ch.style}
                      </span>
                      <h4 className="text-xs font-bold text-on-surface mt-1 truncate">{ch.name}</h4>
                      <p className="text-[11px] text-outline truncate">{ch.desc}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenStudio({
                        charId: ch.id,
                        prompt: `${ch.name} 캐릭터가 주인공인 오늘의 새로운 에피소드`,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-bold shrink-0"
                  >
                    작화에 적용
                  </button>
                </div>
              ))}
            </section>
          ) : activeTab === 'bookmarks' ? (
            /* Bookmarked Webtoons Tab */
            <section
              className={`px-4 mt-3 grid gap-3 ${
                bookmarkedEpisodes.length === 0
                  ? 'grid-cols-1'
                  : viewMode === 'grid'
                    ? isWebMode
                      ? 'grid-cols-2 sm:grid-cols-3'
                      : 'grid-cols-2'
                    : 'grid-cols-1'
              }`}
            >
              {bookmarkedEpisodes.length === 0 ? (
                <div className="p-8 rounded-2xl bg-surface-container-low text-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-outline">
                    bookmark_border
                  </span>
                  <p className="text-xs font-bold text-on-surface">
                    북마크한 에피소드가 아직 없습니다
                  </p>
                  <p className="text-[11px] text-outline">
                    마음에 드는 웹툰에서 🔖 북마크를 눌러 모아보세요!
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('home')}
                    className="mt-1 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold"
                  >
                    인기 웹툰 둘러보기
                  </button>
                </div>
              ) : (
                bookmarkedEpisodes.map((ep) => (
                  <article
                    key={ep.epNum}
                    onClick={() => onOpenViewer(ep.epNum)}
                    className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col group relative cursor-pointer"
                  >
                    <div className="relative w-full aspect-[4/5] bg-surface-container overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={ep.title}
                        referrerPolicy="no-referrer"
                        src={ep.thumbnail}
                      />
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-inverse-surface/80 text-inverse-on-surface text-[10px] font-bold">
                        {ep.epNum}화
                      </span>
                      <button
                        type="button"
                        aria-label="북마크 해제"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(ep.epNum);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/45 text-error flex items-center justify-center"
                      >
                        <span
                          className="material-symbols-outlined text-[15px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          bookmark
                        </span>
                      </button>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="px-1.5 py-0.5 rounded-md bg-primary/85 text-on-primary text-[9px] font-semibold">
                          {ep.styleName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-surface-container-lowest/90 text-primary font-bold text-[9px] flex items-center gap-0.5">
                          ❤️ {ep.likes}
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 flex flex-col flex-1 justify-between gap-1">
                      <h3 className="text-xs font-bold text-on-surface line-clamp-1">
                        {ep.title}
                      </h3>
                      <p className="text-[10px] text-outline truncate">{ep.author}</p>
                    </div>
                  </article>
                ))
              )}
            </section>
          ) : (
            /* Webtoon History Cards Grid */
            <section
              className={`px-4 mt-3 grid gap-3 ${
                viewMode === 'grid'
                  ? isWebMode
                    ? 'grid-cols-2 sm:grid-cols-3'
                    : 'grid-cols-2'
                  : 'grid-cols-1'
              }`}
            >
              {sortedLibrary.map((item) => {
                const igRecord = instagramRecords[item.episodeId];
                return (
                  <article
                    key={item.id}
                    onClick={() => onOpenViewer(item.episodeId)}
                    className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col group relative cursor-pointer"
                  >
                    <div className="relative w-full aspect-[4/5] bg-surface-container overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        src={item.image}
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        <span className="px-1.5 py-0.5 rounded-md bg-inverse-surface/80 backdrop-blur-xs text-inverse-on-surface text-[10px] font-bold">
                          4컷 완결
                        </span>
                        {igRecord && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-600/90 text-white text-[9px] font-bold">
                            인스타 게시됨
                          </span>
                        )}
                      </div>
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          aria-label="메뉴"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCardActionItem(item);
                          }}
                          className="w-6 h-6 rounded-full bg-inverse-surface/60 backdrop-blur-xs text-white flex items-center justify-center hover:bg-inverse-surface"
                        >
                          <span className="material-symbols-outlined text-[14px]">more_vert</span>
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span
                          className={`px-1.5 py-0.5 rounded-md backdrop-blur-xs text-[9px] font-semibold ${item.styleBadgeClass}`}
                        >
                          {item.styleLabel}
                        </span>
                        {item.isPrivate ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-surface-container-lowest/90 backdrop-blur-xs text-outline font-bold text-[9px] flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">lock</span> 비공개
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md bg-surface-container-lowest/90 backdrop-blur-xs text-primary font-bold text-[9px] flex items-center gap-0.5">
                            <span
                              className="material-symbols-outlined text-[10px] text-tertiary"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              favorite
                            </span>{' '}
                            {item.likes}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-2.5 flex flex-col flex-1 justify-between gap-1.5">
                      <div>
                        <h3 className="text-xs font-bold text-on-surface line-clamp-1 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-[10px] text-outline mt-0.5">{item.date}</p>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-surface-container gap-1">
                        {onOpenInstagramPublish ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenInstagramPublish(
                                buildPublishTarget(
                                  item.episodeId,
                                  item.title,
                                  item.image,
                                  item.styleLabel
                                ),
                                'publish'
                              );
                            }}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 whitespace-nowrap transition-colors ${
                              igRecord
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-primary/10 text-primary hover:bg-primary/20'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[12px]">
                              {igRecord ? 'check_circle' : 'photo_camera'}
                            </span>
                            <span>{igRecord ? '인스타 게시됨' : '인스타 올리기'}</span>
                          </button>
                        ) : (
                          <span
                            className={`text-[10px] font-medium flex items-center gap-0.5 ${
                              item.isPrivate ? 'text-outline' : 'text-on-surface-variant'
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-[11px] ${
                                item.isPrivate ? '' : 'text-secondary'
                              }`}
                            >
                              {item.isPrivate ? 'lock' : 'visibility'}
                            </span>{' '}
                            {item.isPrivate ? '비공개' : '공개됨'}
                          </span>
                        )}
                        <span className="text-primary hover:text-primary-container flex items-center shrink-0">
                          <span className="material-symbols-outlined text-[16px]">play_circle</span>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {/* End Indicator */}
          <div className="flex flex-col items-center justify-center mt-5 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-outline font-medium">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>모든 웹툰 히스토리를 불러왔습니다</span>
            </div>
          </div>

          {/* Floating Action Button (FAB) */}
          <div className={`fixed right-4 z-40 ${isWebMode ? 'bottom-20 md:bottom-8 md:right-8' : 'bottom-20'}`}>
            <button
              type="button"
              onClick={() => onOpenStudio()}
              className="flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
              style={{
                background:
                  'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 30%, rgb(255, 211, 165) 60%, rgb(141, 228, 255) 100%)',
                boxShadow: 'rgba(255, 83, 118, 0.45) 0px 6px 20px',
                color: 'rgb(255, 255, 255)',
              }}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="text-xs font-bold tracking-tight">새 웹툰 만들기</span>
            </button>
          </div>
        </>
      )}

      {/* Card Action Menu Modal */}
      {cardActionItem && (
        <div
          onClick={() => setCardActionItem(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-surface rounded-t-2xl p-4 pb-7 shadow-2xl space-y-2"
          >
            <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-2" />
            <p className="text-xs font-bold text-on-surface truncate px-1 pb-2 border-b border-surface-container">
              {cardActionItem.title}
            </p>
            {onOpenInstagramPublish && (
              <button
                type="button"
                onClick={() => {
                  const item = cardActionItem;
                  setCardActionItem(null);
                  onOpenInstagramPublish(
                    buildPublishTarget(
                      item.episodeId,
                      item.title,
                      item.image,
                      item.styleLabel
                    ),
                    'publish'
                  );
                }}
                className="w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold text-primary bg-primary/8 hover:bg-primary/15 flex items-center gap-2.5"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">
                  {instagramRecords[cardActionItem.episodeId] ? 'check_circle' : 'photo_camera'}
                </span>
                <span>
                  {instagramRecords[cardActionItem.episodeId]
                    ? '✅ 인스타 게시됨 (발행 기록 보기)'
                    : '📷 인스타그램에 자동 올리기 (n8n)'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const epId = cardActionItem.episodeId;
                setCardActionItem(null);
                onOpenViewer(epId);
              }}
              className="w-full py-2.5 px-3 rounded-xl text-left text-xs font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
              <span>뷰어에서 감상 및 저장하기</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const title = cardActionItem.title;
                setCardActionItem(null);
                onOpenStudio({ prompt: `${title} 후속 에피소드` });
              }}
              className="w-full py-2.5 px-3 rounded-xl text-left text-xs font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">draw</span>
              <span>스튜디오에서 후속작 만들기</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                const title = cardActionItem.title;
                setCardActionItem(null);
                const res = await shareOrCopyText({
                  title: `ToonDay · ${title}`,
                  text: '내 일상 AI 4컷 웹툰을 지금 감상해보세요!',
                });
                onShowToast(
                  res === 'shared'
                    ? '웹툰 공유 창을 열었습니다 ✨'
                    : '작품 공유 링크가 복사되었습니다 🔗'
                );
              }}
              className="w-full py-2.5 px-3 rounded-xl text-left text-xs font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary">share</span>
              <span>친구에게 작품 공유하기</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCardActionItem(null);
                onNavigate('collection');
              }}
              className="w-full py-2.5 px-3 rounded-xl text-left text-xs font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">
                folder_special
              </span>
              <span>정주행 공유 컬렉션 보기</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div
          onClick={() => setIsProfileModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-surface rounded-t-2xl p-5 pb-8 shadow-2xl space-y-4"
          >
            <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto" />
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  manage_accounts
                </span>
                작가 프로필 관리
              </h3>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Avatar selector & file upload */}
            <div className="flex items-center gap-3">
              <img
                src={editAvatar}
                alt="프로필 미리보기"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-primary"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  {AVATAR_PRESETS.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditAvatar(src)}
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 ${
                        editAvatar === src ? 'border-primary' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img
                        src={src}
                        alt={`아바타 ${i + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-full bg-surface-container text-[10px] font-bold text-primary hover:bg-surface-container-high"
                  >
                    사진 업로드
                  </button>
                </div>
                <p className="text-[10px] text-outline">원하는 아바타나 사진을 선택하세요</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant">작가명</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-surface-container-low text-xs font-semibold text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant">핸들 (@ID)</label>
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-surface-container-low text-xs font-semibold text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant">주력 장르</label>
                <input
                  type="text"
                  value={editGenre}
                  onChange={(e) => setEditGenre(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-surface-container-low text-xs font-semibold text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              className="w-full py-3 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:opacity-95 active:scale-[0.99] transition-all"
            >
              프로필 변경사항 저장하기
            </button>
          </div>
        </div>
      )}

      {/* Coffee Gift Modal */}
      {isCoffeeModalOpen && (
        <div
          onClick={() => setIsCoffeeModalOpen(false)}
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest w-full max-w-[430px] mx-auto rounded-t-2xl max-h-[90vh] overflow-y-auto p-4 flex flex-col gap-4 shadow-2xl relative"
          >
            <div className="w-10 h-1 bg-surface-variant rounded-full mx-auto mb-1" />
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">local_cafe</span>
                <h3 className="text-base font-bold text-on-surface">서연 작가님에게 커피 후원하기</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCoffeeModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
              <img
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-fixed"
                alt="서연 작가"
                referrerPolicy="no-referrer"
                src={TOONDAY_ASSETS.authorAvatar}
              />
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-on-surface truncate">
                    서연이의 일상일기
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-secondary-container text-on-secondary-container text-[9px] font-bold">
                    인스타툰
                  </span>
                </div>
                <span className="text-[11px] text-outline mt-0.5">
                  @seoyeon_toon · 마감 힘내세요! ☕
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                <span>후원할 커피 수량 선택</span>
                <span className="text-primary font-extrabold text-sm">
                  {coffeeTier.amount.toLocaleString()}원
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { cups: 1, amount: 1000, label: '1잔 (1,000원)', desc: '가벼운 응원', icon: '☕' },
                  {
                    cups: 3,
                    amount: 3000,
                    label: '3잔 (3,000원)',
                    desc: '따뜻한 라떼 ☕☕☕',
                    badge: 'BEST',
                  },
                  {
                    cups: 5,
                    amount: 5000,
                    label: '5잔 (5,000원)',
                    desc: '마감 파이팅 세트',
                    icon: '🥐',
                  },
                  {
                    cups: 10,
                    amount: 10000,
                    label: '10잔 (10,000원)',
                    desc: '명예의 전당 VIP 등극',
                    icon: '👑',
                  },
                ].map((tier) => {
                  const selected = coffeeTier.cups === tier.cups;
                  return (
                    <button
                      key={tier.cups}
                      type="button"
                      onClick={() => setCoffeeTier({ cups: tier.cups, amount: tier.amount })}
                      className={`p-2.5 rounded-xl text-left flex flex-col gap-0.5 transition-colors ${
                        selected
                          ? 'border-2 border-primary bg-primary-fixed/40'
                          : 'border border-outline-variant/30 hover:border-primary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            selected ? 'text-primary' : 'text-on-surface'
                          }`}
                        >
                          {tier.label}
                        </span>
                        {tier.badge ? (
                          <span className="px-1 py-0.2 rounded bg-primary text-white text-[9px] font-bold">
                            {tier.badge}
                          </span>
                        ) : (
                          <span className="text-[14px]">{tier.icon}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-outline font-medium">{tier.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface">작가에게 보낼 응원 메시지</label>
              <textarea
                rows={2}
                maxLength={100}
                value={cheerMessage}
                onChange={(e) => setCheerMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary resize-none"
                placeholder="작가님 이번 주 야근편 너무 공감됐어요! 힘내세요 💖"
              />
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnon}
                    onChange={(e) => setIsAnon(e.target.checked)}
                    className="rounded border-outline text-primary focus:ring-primary"
                  />
                  <span className="text-[11px] text-on-surface-variant">
                    비공개로 후원하기 (익명 서포터)
                  </span>
                </label>
                <span className="text-[10px] text-outline">최대 100자</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface">결제 수단</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['카카오페이', '네이버페이', '토스페이', '신용카드'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayMethod(m)}
                    className={`py-2 px-1 rounded-lg text-[11px] text-center ${
                      payMethod === m
                        ? 'border-2 border-primary bg-primary-fixed/40 font-bold text-primary'
                        : 'border border-outline-variant/30 bg-surface-container-low font-medium text-on-surface hover:border-primary'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCoffeePayment}
              className="w-full py-3 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-bold shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-1"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span>{coffeeTier.amount.toLocaleString()}원 커피 후원 결제하기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
