import React from 'react';

interface ToastBannerProps {
  message: string | null;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[380px] pointer-events-none">
      <div className="px-4 py-2.5 rounded-full bg-inverse-surface text-inverse-on-surface text-xs font-semibold shadow-xl flex items-center justify-center gap-2 text-center">
        <span className="material-symbols-outlined text-[16px] text-tertiary-fixed shrink-0">
          auto_awesome
        </span>
        <span className="truncate">{message}</span>
      </div>
    </div>
  );
};
