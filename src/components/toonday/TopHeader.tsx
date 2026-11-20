import React from 'react';
import { AppRoute, TOONDAY_ASSETS } from '../../data/toondayData';
import { PlatformViewMode } from './InstagramPublishModal';

interface TopHeaderProps {
  route: AppRoute;
  subtitle?: string;
  stackTitle?: string;
  isPro?: boolean;
  freeTicketsLeft?: number;
  equippedBadge?: string | null;
  avatarUrl?: string;
  onNavigate: (route: AppRoute) => void;
  onBack: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onSaveDraft?: () => void;
  onOpenSearch?: () => void;
  onOpenVoiceChat?: () => void;
  isWebMode?: boolean;
  isAppFrame?: boolean;
  viewMode?: PlatformViewMode;
  onToggleViewMode?: () => void;
  onOpenN8nHub?: () => void;
  instagramPublishedCount?: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  route,
  subtitle,
  stackTitle,
  isPro = false,
  freeTicketsLeft = 1,
  equippedBadge,
  avatarUrl = TOONDAY_ASSETS.userAvatar,
  onNavigate,
  onBack,
  isDarkMode,
  onToggleDarkMode,
  onSaveDraft,
  onOpenSearch,
  onOpenVoiceChat,
  isWebMode = false,
  isAppFrame = false,
  viewMode = 'auto',
  onToggleViewMode,
  onOpenN8nHub,
  instagramPublishedCount = 0,
}) => {
  const quotaText = isPro ? 'PRO 무제한' : `1일 무료 ${freeTicketsLeft}회`;
  const headerShellClass = isWebMode
    ? 'fixed top-0 left-0 md:left-64 right-0 z-40 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]'
    : isAppFrame
      ? 'fixed top-0 left-0 right-0 w-full z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]'
      : 'fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]';

  const modeBadgeLabel =
    viewMode === 'mobile' ? '앱 화면' : viewMode === 'web' ? '웹 화면' : isWebMode ? '웹' : '앱';

  if (route === 'generating') {
    return (
      <header className={headerShellClass}>
        <div className="h-16 px-4 flex items-center justify-between max-w-6xl mx-auto">
          <button
            type="button"
            aria-label="Cancel or Close"
            onClick={onBack}
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
          <h1 className="font-headline text-base font-semibold text-on-surface tracking-tight text-center">
            Generation Progress
          </h1>
          <button
            type="button"
            onClick={() => onNavigate('library')}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
            aria-label="내 보관함"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </button>
        </div>
      </header>
    );
  }

  const isStackScreen =
    route === 'viewer' ||
    route === 'search' ||
    route === 'collection' ||
    route === 'subscription';

  if (isStackScreen) {
    const titleText =
      stackTitle ||
      (route === 'search'
        ? '웹툰 검색 & 탐색 결과'
        : route === 'collection'
          ? '공유된 정주행 컬렉션'
          : route === 'subscription'
            ? 'ToonDay PRO 멤버십'
            : 'Webtoon Viewer');

    return (
      <header className={headerShellClass}>
        <div className="h-16 px-3 flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 mr-2">
            <button
              type="button"
              aria-label="Go back"
              onClick={onBack}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface hover:text-primary transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
            </button>
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 min-w-0 cursor-pointer"
            >
              <img
                alt="ToonDay Logo"
                className="h-6 w-auto object-contain flex-shrink-0"
                referrerPolicy="no-referrer"
                src={TOONDAY_ASSETS.logo}
              />
              <h1 className="text-base font-headline font-bold tracking-tight text-on-surface truncate">
                {titleText}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onToggleViewMode && (
              <button
                type="button"
                onClick={onToggleViewMode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-[11px] font-semibold whitespace-nowrap transition-colors"
                title="웹 화면 ↔ 앱 화면 전환"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">
                  {isWebMode ? 'desktop_windows' : 'smartphone'}
                </span>
                <span>{modeBadgeLabel}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('subscription')}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[12px] text-primary">auto_awesome</span>
              <span className="text-[11px] font-semibold whitespace-nowrap">{quotaText}</span>
            </button>

            {route === 'viewer' && onToggleDarkMode && (
              <button
                id="btn-toggle-dark-header"
                type="button"
                aria-label="다크 모드 전환"
                onClick={onToggleDarkMode}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors active:scale-95"
                title="몰입 다크 모드 전환"
              >
                <span className="material-symbols-outlined text-[18px] theme-icon">
                  {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('library')}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center relative"
              aria-label="내 보관함"
            >
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container"
                referrerPolicy="no-referrer"
                src={avatarUrl}
              />
              {equippedBadge && (
                <span
                  title={equippedBadge}
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-tertiary-fixed text-[10px] flex items-center justify-center shadow"
                >
                  🏆
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    );
  }

  const headerSub =
    subtitle ||
    (route === 'library' || route === 'drafts'
      ? '내 보관함 & 생성 히스토리'
      : isWebMode
        ? '웹 스튜디오 · 모바일 앱 연동'
        : 'Create Studio');

  return (
    <header className={headerShellClass}>
      <div className="h-16 px-4 flex items-center justify-between max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left min-w-0"
        >
          <img
            alt="ToonDay Logo"
            className="h-8 w-auto object-contain shrink-0"
            referrerPolicy="no-referrer"
            src={TOONDAY_ASSETS.logo}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-base font-headline font-extrabold tracking-tight text-primary leading-tight">
              ToonDay
            </span>
            <span className="text-[10px] font-label font-medium text-on-surface-variant leading-none truncate">
              {headerSub}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleViewMode && (
            <button
              type="button"
              aria-label="웹·앱 화면 전환"
              onClick={onToggleViewMode}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-[11px] font-semibold whitespace-nowrap transition-colors active:scale-95"
              title="웹 화면 ↔ 앱 화면 전환"
            >
              <span className="material-symbols-outlined text-[15px] text-primary">
                {isWebMode ? 'desktop_windows' : 'smartphone'}
              </span>
              <span>{modeBadgeLabel}</span>
            </button>
          )}

          {onOpenN8nHub && (
            <button
              type="button"
              aria-label="n8n 인스타 자동 게시"
              onClick={onOpenN8nHub}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold whitespace-nowrap transition-colors active:scale-95"
              title="n8n 인스타그램 자동 게시 · 발행 이력"
            >
              <span className="material-symbols-outlined text-[15px]">photo_camera</span>
              <span className="hidden sm:inline">n8n</span>
              {instagramPublishedCount > 0 && (
                <span className="px-1 rounded-full bg-primary text-on-primary text-[9px] tabular-nums">
                  {instagramPublishedCount}
                </span>
              )}
            </button>
          )}

          {onOpenVoiceChat && (
            <button
              type="button"
              aria-label="AI 음성대화"
              onClick={onOpenVoiceChat}
              className="w-9 h-9 rounded-full bg-primary-fixed/80 hover:bg-secondary-container flex items-center justify-center text-primary transition-colors active:scale-95"
              title="AI 스토리 코치 음성대화"
            >
              <span className="material-symbols-outlined text-[19px]">graphic_eq</span>
            </button>
          )}
          {route === 'home' && onOpenSearch && (
            <button
              type="button"
              aria-label="웹툰 검색"
              onClick={onOpenSearch}
              className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors active:scale-95"
              title="웹툰 검색 & 탐색"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
          )}

          {route === 'studio' && onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface-container-high hover:bg-secondary-container text-primary text-xs font-semibold tracking-tight transition-all shadow-sm whitespace-nowrap"
              title="임시저장"
            >
              <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
              <span className="text-[11px] hidden sm:inline">임시저장</span>
            </button>
          )}

          {route === 'home' ? (
            <button
              type="button"
              onClick={() => onNavigate('subscription')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full shadow-sm text-white font-semibold active:scale-95 transition-transform"
              style={{
                background:
                  'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(254, 210, 164) 60%, rgb(125, 211, 252) 100%)',
              }}
            >
              <span
                className="material-symbols-outlined text-[14px] text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              <span className="text-xs tracking-tight whitespace-nowrap drop-shadow-sm">
                {quotaText}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('subscription')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container shadow-sm active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[14px] text-primary">auto_awesome</span>
              <span className="text-xs font-semibold tracking-tight whitespace-nowrap">
                {quotaText}
              </span>
            </button>
          )}

          <button
            aria-label="User Profile"
            onClick={() => onNavigate('library')}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-1 rounded-full relative"
            type="button"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container"
              referrerPolicy="no-referrer"
              src={avatarUrl}
            />
            {equippedBadge && (
              <span
                title={equippedBadge}
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-tertiary-fixed text-[10px] flex items-center justify-center shadow"
              >
                🏆
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
