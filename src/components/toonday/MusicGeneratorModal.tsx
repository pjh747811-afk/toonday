import React, { useEffect, useState } from 'react';

export interface GeneratedMusicTrack {
  audioDataUrl: string;
  mimeType: string;
  lyrics: string;
  model: string;
  mood: string;
  title: string;
}

interface MusicGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceTitle: string;
  sourceStyle?: string;
  initialStorySummary: string;
  generatedTrack: GeneratedMusicTrack | null;
  onTrackGenerated: (track: GeneratedMusicTrack) => void;
  onShowToast: (msg: string) => void;
}

const MOOD_PRESETS = [
  { id: 'AI 자동 추천', label: '✨ AI 자동 추천' },
  { id: '따뜻하고 포근한 감성 Lo-Fi 비트', label: '☕ 감성 Lo-Fi' },
  { id: '경쾌하고 통통 튀는 시트콤 신스팝', label: '🎈 발랄 시트콤' },
  { id: '잔잔한 어쿠스틱 기타와 일렉 피아노', label: '🎸 따뜻한 어쿠스틱' },
  { id: '긴박하고 코믹한 리듬의 업비트 오케스트라', label: '⚡ 긴박한 액션' },
  { id: '서정적이고 로맨틱한 피아노 선율', label: '🌸 로맨틱 피아노' },
];

export const MusicGeneratorModal: React.FC<MusicGeneratorModalProps> = ({
  isOpen,
  onClose,
  sourceTitle,
  sourceStyle,
  initialStorySummary,
  generatedTrack,
  onTrackGenerated,
  onShowToast,
}) => {
  const [modelMode, setModelMode] = useState<'clip' | 'pro'>('clip');
  const [selectedMood, setSelectedMood] = useState<string>(MOOD_PRESETS[0].id);
  const [musicPrompt, setMusicPrompt] = useState<string>(initialStorySummary);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMusicPrompt(initialStorySummary);
      setErrorMsg(null);
    }
  }, [isOpen, initialStorySummary]);

  if (!isOpen) return null;

  const handleGenerateMusic = async () => {
    const cleanPrompt = musicPrompt.trim() || initialStorySummary.trim() || sourceTitle.trim();
    if (!cleanPrompt) {
      setErrorMsg('음악을 작곡할 웹툰 스토리나 장면 설명을 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleanPrompt,
          episodeTitle: sourceTitle,
          styleName: sourceStyle,
          mood: selectedMood,
          modelMode,
        }),
      });

      const data = (await response.json()) as {
        audioDataUrl?: string;
        mimeType?: string;
        lyrics?: string;
        model?: string;
        error?: string;
      };

      if (!response.ok || !data.audioDataUrl) {
        const message =
          data.error || '웹툰 맞춤 음악 생성에 실패했습니다. 잠시 후 다시 시도해주세요.';
        setErrorMsg(message);
        return;
      }

      const moodObj = MOOD_PRESETS.find((m) => m.id === selectedMood);
      const track: GeneratedMusicTrack = {
        audioDataUrl: data.audioDataUrl,
        mimeType: data.mimeType || 'audio/mpeg',
        lyrics: data.lyrics || '',
        model: data.model || (modelMode === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview'),
        mood: moodObj ? moodObj.label : '✨ AI 맞춤 OST',
        title: sourceTitle || 'ToonDay AI 사운드트랙',
      };

      onTrackGenerated(track);
      onShowToast('🎵 웹툰 내용에 어울리는 맞춤 OST가 완성되었습니다!');
    } catch {
      setErrorMsg('네트워크 오류로 AI 음악 생성 서버에 연결하지 못했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-surface rounded-t-3xl shadow-2xl border-t border-outline-variant/40 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div
          className="px-5 pt-4 pb-3.5 border-b border-outline-variant/30 flex items-center justify-between gap-3"
          style={{
            background:
              'linear-gradient(125deg, rgba(255, 83, 118, 0.14) 0%, rgba(255, 211, 165, 0.2) 50%, rgba(141, 228, 255, 0.2) 100%)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{
                background:
                  'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166), rgb(96, 165, 250))',
              }}
            >
              <span className="material-symbols-outlined text-[20px]">music_note</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-headline font-extrabold text-on-surface truncate">
                  내용 맞춤 AI BGM 스튜디오
                </h3>
                <span className="px-1.5 py-0.2 rounded-full bg-primary/15 text-primary text-[9px] font-bold shrink-0">
                  Lyria AI
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant truncate">
                {sourceTitle}
                {sourceStyle ? ` · ${sourceStyle}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Model / Length Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-primary">graphic_eq</span>
              <span>트랙 길이 &amp; 작곡 모델</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModelMode('clip')}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  modelMode === 'clip'
                    ? 'border-primary bg-primary/10 shadow-xs'
                    : 'border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">⚡ 30초 숏폼 OST</span>
                  {modelMode === 'clip' && (
                    <span
                      className="material-symbols-outlined text-[15px] text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  릴스·4컷 감상용 (lyria-3-clip)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setModelMode('pro')}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  modelMode === 'pro'
                    ? 'border-primary bg-primary/10 shadow-xs'
                    : 'border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">🎼 풀버전 테마곡</span>
                  {modelMode === 'pro' && (
                    <span
                      className="material-symbols-outlined text-[15px] text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  정주행·스크롤용 (lyria-3-pro)
                </p>
              </button>
            </div>
          </div>

          {/* Mood Chips */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-tertiary">mood</span>
              <span>음악 분위기 선택</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MOOD_PRESETS.map((m) => {
                const active = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(m.id)}
                    className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                      active
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/50 hover:border-primary/40'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Story Context Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-secondary">
                  auto_stories
                </span>
                <span>반영할 웹툰 스토리 &amp; 장면 요약</span>
              </span>
              <button
                type="button"
                onClick={() => setMusicPrompt(initialStorySummary)}
                className="text-[10px] font-semibold text-primary hover:underline"
              >
                웹툰 내용 다시 채우기
              </button>
            </div>
            <textarea
              rows={3}
              value={musicPrompt}
              onChange={(e) => setMusicPrompt(e.target.value)}
              placeholder="웹툰 대사, 감정선, 배경 분위기를 자유롭게 수정하거나 입력하세요..."
              className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/50 p-3 text-xs text-on-surface placeholder:text-outline leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                error_outline
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generated Track Player */}
          {generatedTrack && (
            <div
              className="p-3.5 rounded-2xl border border-primary/35 flex flex-col gap-2.5 shadow-sm"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 83, 118, 0.08) 0%, rgba(255, 211, 165, 0.14) 50%, rgba(141, 228, 255, 0.14) 100%)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-primary text-on-primary text-[9px] font-bold">
                      OST 완성
                    </span>
                    <span className="text-[10px] font-semibold text-secondary">
                      {generatedTrack.mood}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-on-surface truncate mt-0.5">
                    {generatedTrack.title}
                  </p>
                </div>
                <a
                  href={generatedTrack.audioDataUrl}
                  download={`toonday_ost_${Date.now()}.mp3`}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-[11px] font-bold text-primary flex items-center gap-1 shrink-0 hover:bg-secondary-container"
                >
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  <span>MP3 저장</span>
                </a>
              </div>

              <audio
                key={generatedTrack.audioDataUrl}
                controls
                autoPlay
                loop
                src={generatedTrack.audioDataUrl}
                className="w-full h-10"
              />

              {generatedTrack.lyrics && (
                <div className="p-2.5 rounded-xl bg-surface-container-lowest/85 border border-outline-variant/40 text-[11px] text-on-surface-variant whitespace-pre-wrap max-h-28 overflow-y-auto leading-relaxed">
                  {generatedTrack.lyrics}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high"
          >
            닫기
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateMusic}
            className="flex-1 py-3 px-4 rounded-xl font-headline font-extrabold text-xs shadow-md active:scale-[0.98] disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
            style={{
              background:
                'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 35%, rgb(255, 211, 165) 70%, rgb(141, 228, 255) 100%)',
              color: 'rgb(27, 27, 37)',
            }}
          >
            <span
              className={`material-symbols-outlined text-[17px] ${
                isGenerating ? 'animate-spin' : ''
              }`}
            >
              {isGenerating ? 'progress_activity' : 'music_note'}
            </span>
            <span>
              {isGenerating
                ? 'AI가 웹툰 어울리는 BGM 작곡 중...'
                : generatedTrack
                  ? '🎵 새로운 버전으로 다시 작곡하기'
                  : '✨ 내용에 어울리는 음악 생성하기'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
