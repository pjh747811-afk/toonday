import React from 'react';
import { AppRoute } from '../../data/toondayData';

interface BottomNavProps {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
  isWebMode?: boolean;
  isAppFrame?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  route,
  onNavigate,
  isWebMode = false,
  isAppFrame = false,
}) => {
  const isLibraryStyle = route === 'library' || route === 'drafts';

  return (
    <nav
      className={`fixed bottom-0 z-40 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(79,55,138,0.06)] ${
        isWebMode
          ? 'left-0 right-0 md:hidden'
          : isAppFrame
            ? 'left-0 right-0 w-full'
            : 'left-1/2 -translate-x-1/2 w-full max-w-[430px]'
      }`}
    >
      <div className="h-16 px-3 flex items-center justify-around">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-0.5 transition-colors ${
            route === 'home'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface font-medium'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: route === 'home' ? "'FILL' 1" : "'FILL' 0" }}
          >
            cottage
          </span>
          <span className="text-[11px] font-label tracking-tight">홈</span>
        </button>

        {isLibraryStyle ? (
          <button
            type="button"
            onClick={() => onNavigate('studio')}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-0.5 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <div
              className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_4px_16px_rgba(255,83,118,0.4)] hover:scale-105 transition-transform"
              style={{
                background:
                  'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 40%, rgb(186, 242, 187) 80%, rgb(141, 228, 255) 100%)',
                boxShadow: 'rgba(255, 83, 118, 0.4) 0px 4px 16px',
              }}
            >
              <span className="material-symbols-outlined text-2xl">auto_fix_high</span>
            </div>
            <span className="text-[11px] font-label font-medium tracking-tight text-primary">
              스튜디오
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('studio')}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-0.5 text-on-surface transition-colors -mt-4"
          >
            <div
              className="w-13 h-13 p-0.5 rounded-full shadow-[0_4px_16px_rgba(255,83,118,0.4)] hover:scale-105 transition-transform active:scale-95"
              style={{
                background:
                  'linear-gradient(135deg, #ff5376 0%, #fed2a4 50%, #7dd3fc 100%)',
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                style={{
                  background:
                    'linear-gradient(135deg, #ff5376 0%, #ff8e9b 25%, #fed2a4 55%, #7dd3fc 100%)',
                }}
              >
                <span className="material-symbols-outlined text-2xl drop-shadow-sm">add</span>
              </div>
            </div>
            <span className="text-[11px] font-label font-bold tracking-tight text-primary mt-0.5">
              만들기
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onNavigate('library')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-0.5 transition-colors ${
            route === 'library' || route === 'drafts'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface font-medium'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings:
                route === 'library' || route === 'drafts' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            video_library
          </span>
          <span className="text-[11px] font-label tracking-tight">내 보관함</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('subscription')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-0.5 transition-colors ${
            route === 'subscription'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface font-medium'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: route === 'subscription' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            workspace_premium
          </span>
          <span className="text-[11px] font-label tracking-tight">구독/PRO</span>
        </button>
      </div>
    </nav>
  );
};
