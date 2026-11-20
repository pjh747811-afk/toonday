import React, { useEffect, useMemo, useState } from 'react';
import { LibraryWebtoonItem, WebtoonEpisode } from '../../data/toondayData';
import { shareOrCopyText } from '../../utils/toondayExport';

export interface InstagramPublishRecord {
  episodeId: number;
  title: string;
  postId: string;
  postedAt: string;
  caption: string;
  imageUrl: string;
}

export interface InstagramPublishTarget {
  episodeId: number;
  title: string;
  caption: string;
  imageUrl: string;
  styleName?: string;
}

export type PlatformViewMode = 'auto' | 'web' | 'mobile';

interface ServerStatus {
  webhookConfigured: boolean;
  secretConfigured: boolean;
  defaultImageConfigured: boolean;
}

interface InstagramPublishModalProps {
  isOpen: boolean;
  initialTab?: 'publish' | 'history' | 'n8n' | 'sync';
  target: InstagramPublishTarget | null;
  allEpisodes: Record<number, WebtoonEpisode>;
  libraryItems: LibraryWebtoonItem[];
  publishRecords: Record<number, InstagramPublishRecord>;
  viewMode: PlatformViewMode;
  onChangeViewMode: (mode: PlatformViewMode) => void;
  onSelectTarget: (target: InstagramPublishTarget) => void;
  onPublishSuccess: (record: InstagramPublishRecord) => void;
  onSyncRecords: (records: Record<number, InstagramPublishRecord>) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const InstagramPublishModal: React.FC<InstagramPublishModalProps> = ({
  isOpen,
  initialTab = 'publish',
  target,
  allEpisodes,
  libraryItems,
  publishRecords,
  viewMode,
  onChangeViewMode,
  onSelectTarget,
  onPublishSuccess,
  onSyncRecords,
  onClose,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'publish' | 'history' | 'n8n' | 'sync'>(initialTab);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'published' | 'pending'>('all');
  const [captionInput, setCaptionInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [sqlPreview, setSqlPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(target ? initialTab : initialTab === 'publish' ? 'history' : initialTab);
    setPublishError(null);
    setNeedsSetup(false);

    fetch('/api/instagram/status')
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok) {
          setServerStatus({
            webhookConfigured: Boolean(data.webhookConfigured),
            secretConfigured: Boolean(data.secretConfigured),
            defaultImageConfigured: Boolean(data.defaultImageConfigured),
          });
          if (data.records && typeof data.records === 'object') {
            const normalized: Record<number, InstagramPublishRecord> = {};
            Object.entries(data.records).forEach(([key, val]) => {
              const rec = val as InstagramPublishRecord;
              if (rec && rec.postId) {
                normalized[Number(key)] = rec;
              }
            });
            onSyncRecords(normalized);
          }
        }
      })
      .catch(() => {});
  }, [isOpen, initialTab, target, onSyncRecords]);

  useEffect(() => {
    if (target) {
      setCaptionInput(target.caption);
      setImageUrlInput(target.imageUrl);
      setPublishError(null);
      setNeedsSetup(false);
    }
  }, [target]);

  const mergedEpisodesList = useMemo(() => {
    const map = new Map<number, InstagramPublishTarget>();
    Object.values(allEpisodes).forEach((ep) => {
      const panelSummary = ep.panels
        .slice(0, 3)
        .map((p) => p.dialogue)
        .filter(Boolean)
        .join(' / ');
      map.set(ep.epNum, {
        episodeId: ep.epNum,
        title: ep.title,
        caption: `${ep.title}\n\n${panelSummary || ep.subtitle}\n\n#ToonDay #인스타툰`,
        imageUrl: ep.thumbnail,
        styleName: ep.styleName,
      });
    });
    libraryItems.forEach((item) => {
      if (!map.has(item.episodeId)) {
        map.set(item.episodeId, {
          episodeId: item.episodeId,
          title: item.title,
          caption: `${item.title}\n\n오늘의 일상 4컷 AI 웹툰 기록\n\n#ToonDay #인스타툰`,
          imageUrl: item.image,
          styleName: item.styleLabel,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.episodeId - a.episodeId);
  }, [allEpisodes, libraryItems]);

  const publishedCount = useMemo(
    () => mergedEpisodesList.filter((ep) => Boolean(publishRecords[ep.episodeId])).length,
    [mergedEpisodesList, publishRecords]
  );

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'published') {
      return mergedEpisodesList.filter((ep) => Boolean(publishRecords[ep.episodeId]));
    }
    if (historyFilter === 'pending') {
      return mergedEpisodesList.filter((ep) => !publishRecords[ep.episodeId]);
    }
    return mergedEpisodesList;
  }, [mergedEpisodesList, publishRecords, historyFilter]);

  if (!isOpen) return null;

  const existingRecord = target ? publishRecords[target.episodeId] : undefined;

  const handlePublish = async () => {
    if (!target) return;
    setIsPublishing(true);
    setPublishError(null);
    setNeedsSetup(false);

    try {
      const response = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId: target.episodeId,
          title: target.title,
          caption: captionInput,
          imageUrl: imageUrlInput,
          tags: ['ToonDay', '인스타툰', target.styleName || '일상툰'],
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        id?: string;
        postId?: string;
        postedAt?: string;
        caption?: string;
        imageUrl?: string;
        error?: string;
        needsSetup?: boolean;
      };

      if (!response.ok) {
        if (response.status === 409 && data.postId) {
          onPublishSuccess({
            episodeId: target.episodeId,
            title: target.title,
            postId: data.postId,
            postedAt: data.postedAt || new Date().toISOString(),
            caption: captionInput,
            imageUrl: imageUrlInput,
          });
        }
        setNeedsSetup(Boolean(data.needsSetup));
        setPublishError(data.error || '인스타그램 자동 게시에 실패했습니다.');
        return;
      }

      const record: InstagramPublishRecord = {
        episodeId: target.episodeId,
        title: target.title,
        postId: data.postId || data.id || `ig_${Date.now()}`,
        postedAt: data.postedAt || new Date().toISOString(),
        caption: data.caption || captionInput,
        imageUrl: data.imageUrl || imageUrlInput,
      };
      onPublishSuccess(record);
      onShowToast('인스타그램 피드에 올렸어요!');
    } catch {
      setPublishError('네트워크 연결 오류로 n8n 서버에 요청하지 못했습니다.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLoadSql = async () => {
    if (sqlPreview) {
      await shareOrCopyText({ title: '004_toonday_instagram.sql', text: sqlPreview });
      onShowToast('Supabase SQL 마이그레이션이 복사되었습니다.');
      return;
    }
    try {
      const res = await fetch('/api/n8n/supabase-migration');
      const text = await res.text();
      setSqlPreview(text);
    } catch {
      onShowToast('SQL 템플릿을 불러오지 못했습니다.');
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] md:max-w-[640px] bg-surface rounded-t-3xl md:rounded-2xl shadow-2xl border border-outline-variant/40 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Top Bar */}
        <div
          className="px-5 py-4 border-b border-outline-variant/30 flex items-center justify-between gap-3"
          style={{
            background:
              'linear-gradient(125deg, rgba(255, 83, 118, 0.12) 0%, rgba(255, 211, 165, 0.16) 50%, rgba(141, 228, 255, 0.16) 100%)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{
                background:
                  'linear-gradient(135deg, rgb(240, 148, 51) 0%, rgb(220, 39, 67) 50%, rgb(188, 24, 136) 100%)',
              }}
            >
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-headline font-extrabold text-on-surface truncate">
                인스타그램 자동 게시 · n8n 연동
              </h3>
              <p className="text-[11px] text-on-surface-variant truncate">
                웹·모바일 공용 Webhook 자동 발행 및 이력 관리
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-3 pb-2 border-b border-outline-variant/25 bg-surface-container-low/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            ...(target ? [{ id: 'publish' as const, label: '인스타 올리기', icon: 'send' }] : []),
            { id: 'history' as const, label: '발행 이력', icon: 'receipt_long' },
            { id: 'n8n' as const, label: 'n8n 5노드 설정', icon: 'account_tree' },
            { id: 'sync' as const, label: '모바일 · 웹 연동', icon: 'devices' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-outline-variant/40'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'publish' && target && (
            <>
              {existingRecord ? (
                <div className="p-4 rounded-xl bg-tertiary-fixed/35 border border-tertiary/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined text-[20px] text-tertiary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                      <span className="text-xs font-extrabold text-on-surface">
                        인스타 게시됨
                      </span>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-on-surface-variant">
                      {new Date(existingRecord.postedAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    게시물 ID:{' '}
                    <span className="font-mono font-semibold text-on-surface">
                      {existingRecord.postId}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-primary mt-0.5 shrink-0">
                    info
                  </span>
                  <div className="text-xs text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">실제로 인스타그램에 공개 게시됩니다.</strong>{' '}
                    Webhook 호출 후 게시물 번호를 받아 이력에 자동 기록합니다.
                  </div>
                </div>
              )}

              {/* Preview + Caption */}
              <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
                <div className="w-full sm:w-28 h-40 sm:h-32 rounded-lg overflow-hidden bg-surface-container shrink-0">
                  <img
                    src={imageUrlInput || target.imageUrl}
                    alt={target.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="text-xs font-bold text-on-surface truncate">
                    {target.episodeId}화 · {target.title}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant">
                      공개 이미지 URL (JPEG/PNG)
                    </label>
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://...supabase.co/storage/v1/object/public/promo/..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">인스타그램 피드 캡션</label>
                <textarea
                  rows={4}
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-xs text-on-surface leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              {publishError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs leading-relaxed space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                      error_outline
                    </span>
                    <span>{publishError}</span>
                  </div>
                  {needsSetup && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('n8n')}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-bold text-[11px] shadow-xs"
                      >
                        n8n 연동 방법 &amp; JSON 보기
                      </button>
                      <a
                        href="/api/n8n/workflow-template"
                        download="toonday-instagram-workflow.json"
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-bold text-[11px] shadow-xs"
                      >
                        워크플로 JSON 다운로드
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={isPublishing || Boolean(existingRecord)}
                  onClick={handlePublish}
                  className="flex-1 py-3 px-4 rounded-xl text-white font-bold text-xs shadow-md disabled:opacity-55 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background:
                      'linear-gradient(90deg, rgb(240, 148, 51) 0%, rgb(220, 39, 67) 50%, rgb(188, 24, 136) 100%)',
                  }}
                >
                  <span
                    className={`material-symbols-outlined text-[17px] ${
                      isPublishing ? 'animate-spin' : ''
                    }`}
                  >
                    {isPublishing ? 'progress_activity' : existingRecord ? 'check_circle' : 'send'}
                  </span>
                  <span>
                    {isPublishing
                      ? '올리는 중... (최대 60초)'
                      : existingRecord
                        ? '인스타 게시됨 (중복 게시 방지)'
                        : '확인 · 인스타그램에 올리기'}
                  </span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
                  <div className="text-[11px] text-on-surface-variant">총 웹툰</div>
                  <div className="text-lg font-extrabold text-on-surface font-mono tabular-nums mt-0.5">
                    {mergedEpisodesList.length}건
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
                  <div className="text-[11px] text-on-surface-variant">인스타 게시됨</div>
                  <div className="text-lg font-extrabold text-primary font-mono tabular-nums mt-0.5">
                    {publishedCount}건
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
                  <div className="text-[11px] text-on-surface-variant">미게시 대기</div>
                  <div className="text-lg font-extrabold text-secondary font-mono tabular-nums mt-0.5">
                    {Math.max(0, mergedEpisodesList.length - publishedCount)}건
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container">
                {[
                  { id: 'all' as const, label: '전체' },
                  { id: 'published' as const, label: '게시됨' },
                  { id: 'pending' as const, label: '대기 중' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setHistoryFilter(f.id)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      historyFilter === f.id
                        ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Episodes List */}
              <div className="space-y-2">
                {filteredHistory.map((ep) => {
                  const rec = publishRecords[ep.episodeId];
                  return (
                    <div
                      key={ep.episodeId}
                      className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={ep.imageUrl}
                          alt={ep.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover shrink-0 bg-surface-container"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-on-surface truncate">
                            {ep.episodeId}화 · {ep.title}
                          </div>
                          <div className="text-[11px] text-on-surface-variant truncate mt-0.5">
                            {rec
                              ? `게시 ID ${rec.postId} · ${new Date(rec.postedAt).toLocaleDateString('ko-KR')}`
                              : ep.styleName || '인스타 게시 대기'}
                          </div>
                        </div>
                      </div>
                      {rec ? (
                        <span className="px-2.5 py-1.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold shrink-0">
                          인스타 게시됨
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTarget(ep);
                            setActiveTab('publish');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-bold shrink-0 hover:bg-primary-container flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            photo_camera
                          </span>
                          <span>인스타 올리기</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'n8n' && (
            <div className="space-y-3.5">
              {/* Server Env Status */}
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-2">
                <div className="text-xs font-bold text-on-surface">
                  서버 환경변수 연결 상태 (Settings &gt; Secrets)
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    {
                      name: 'N8N_INSTAGRAM_WEBHOOK_URL',
                      ok: serverStatus?.webhookConfigured ?? false,
                      desc: 'n8n Webhook Production URL',
                    },
                    {
                      name: 'N8N_WEBHOOK_SECRET',
                      ok: serverStatus?.secretConfigured ?? false,
                      desc: 'Header Auth 비밀값 (x-toonday-secret / x-ieoga-secret)',
                    },
                    {
                      name: 'DEFAULT_INSTAGRAM_IMAGE_URL',
                      ok: serverStatus?.defaultImageConfigured ?? false,
                      desc: '공개 버킷 기본 이미지 URL (선택)',
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-2 py-1.5 border-b border-outline-variant/25 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-[11px] font-semibold text-on-surface truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-on-surface-variant">{item.desc}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          item.ok
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {item.ok ? '설정됨' : '미설정'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5-Node Pipeline */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2.5">
                <div className="text-xs font-bold text-on-surface">
                  n8n 5노드 워크플로 파이프라인
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 text-[11px]">
                  {[
                    { step: '1', name: 'Webhook', detail: 'POST + Header Auth' },
                    { step: '2', name: 'Edit Fields', detail: 'image_url · caption' },
                    { step: '3', name: 'Media 상자', detail: 'POST /{IG_ID}/media' },
                    { step: '4', name: 'Media 게시', detail: 'POST /media_publish' },
                    { step: '5', name: 'Respond', detail: '게시 ID 반환' },
                  ].map((node) => (
                    <div
                      key={node.step}
                      className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/35"
                    >
                      <div className="font-bold text-primary">
                        {node.step}. {node.name}
                      </div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">
                        {node.detail}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="/api/n8n/workflow-template"
                    download="toonday-instagram-workflow.json"
                    className="px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>n8n 워크플로 JSON 다운로드</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleLoadSql}
                    className="px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-xs font-semibold text-on-surface hover:bg-surface-container"
                  >
                    {sqlPreview ? 'Supabase SQL 복사' : 'Supabase SQL 보기'}
                  </button>
                </div>

                {sqlPreview && (
                  <pre className="p-3 rounded-xl bg-inverse-surface text-inverse-on-surface text-[10px] font-mono overflow-x-auto leading-relaxed">
                    {sqlPreview}
                  </pre>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-2.5">
                <div className="text-xs font-bold text-on-surface">
                  화면 모드 전환 (웹 버전 · 모바일 버전)
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  같은 서버 API(`/api/instagram/publish`, `/api/studio/*`, `/api/music/generate`,
                  `/api/live`)를 공유하며 데스크톱 웹 대시보드와 모바일 앱 화면을 자유롭게 전환할 수
                  있습니다.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'auto' as const,
                      title: '자동 반응형',
                      desc: '화면 너비에 맞춤',
                      icon: 'devices',
                    },
                    {
                      id: 'web' as const,
                      title: '웹 버전',
                      desc: '넓은 대시보드 UI',
                      icon: 'desktop_windows',
                    },
                    {
                      id: 'mobile' as const,
                      title: '모바일 버전',
                      desc: '430px 앱 뷰',
                      icon: 'smartphone',
                    },
                  ].map((mode) => {
                    const active = viewMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          onChangeViewMode(mode.id);
                          onShowToast(`${mode.title} 레이아웃으로 전환했습니다.`);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          active
                            ? 'border-primary bg-primary/10'
                            : 'border-outline-variant/40 bg-surface-container-low hover:bg-surface-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] text-primary">
                          {mode.icon}
                        </span>
                        <div className="text-xs font-bold text-on-surface mt-1">{mode.title}</div>
                        <div className="text-[10px] text-on-surface-variant">{mode.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2">
                <div className="text-xs font-bold text-on-surface">
                  모바일 · 다른 기기에서 바로 열기
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  아래 주소를 스마트폰 브라우저에서 열면 모바일 최적화 버전으로 바로 연동됩니다.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-[11px] font-mono text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await shareOrCopyText({
                        title: 'ToonDay 웹 & 모바일 연동 링크',
                        text: currentUrl,
                      });
                      onShowToast('모바일·웹 접속 주소가 복사되었습니다!');
                    }}
                    className="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold shrink-0"
                  >
                    주소 복사
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
