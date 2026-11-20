import React, { useCallback, useEffect, useRef, useState } from 'react';

interface VoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToStudio: (storyText: string) => void;
  onGenerateFromVoice: (storyText: string) => void;
  onShowToast: (msg: string) => void;
}

type VoiceName = 'Kore' | 'Zephyr' | 'Puck' | 'Charon';

interface TranscriptMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

const VOICE_OPTIONS: Array<{ id: VoiceName; label: string; desc: string }> = [
  { id: 'Kore', label: '서연 (따뜻함)', desc: '다정한 일상 코치' },
  { id: 'Zephyr', label: '민지 (발랄함)', desc: '통통 튀는 텐션' },
  { id: 'Puck', label: '도윤 (유쾌함)', desc: '재치있는 개그감' },
  { id: 'Charon', label: '민우 (차분함)', desc: '감성 시네마틱' },
];

const QUICK_STARTERS = [
  '오늘 출근길 지하철에서 겪은 웃픈 썰 4컷 웹툰으로 짜줘',
  '주말 홈카페에서 팬케이크 태운 이야기 재미있게 각색해줘',
  '반려동물이 내 양말 물어가는 일상 에피소드 추천해줘',
];

function downsampleTo16k(input: Float32Array, sourceRate: number): Float32Array {
  if (sourceRate === 16000) return input;
  const ratio = sourceRate / 16000;
  const outLength = Math.max(1, Math.round(input.length / ratio));
  const out = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const idx = i * ratio;
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = idx - i0;
    out[i] = input[i0] * (1 - frac) + input[i1] * frac;
  }
  return out;
}

function pcm16ToBase64(samples: Float32Array): string {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x4000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const sampleCount = Math.floor(bytes.length / 2);
  const floats = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    floats[i] = view.getInt16(i * 2, true) / 32768;
  }
  return floats;
}

export const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({
  isOpen,
  onClose,
  onApplyToStudio,
  onGenerateFromVoice,
  onShowToast,
}) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [voice, setVoice] = useState<VoiceName>('Kore');
  const [isMuted, setIsMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<TranscriptMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: '안녕하세요! ToonDay AI 스토리 코치예요 ✨ 마이크를 켜고 오늘 있었던 일을 편하게 들려주시면 바로 4컷 웹툰 콘티로 함께 만들어드릴게요!',
    },
  ]);

  // Refs for WebSocket & audio callbacks (prevents stale closures)
  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef<boolean>(false);
  const isConnectedRef = useRef<boolean>(false);
  const scrollBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stopPlaybackQueue = useCallback(() => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
      } catch {
        // already stopped
      }
    }
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
    setIsAiSpeaking(false);
  }, []);

  const cleanupSession = useCallback(() => {
    isConnectedRef.current = false;
    stopPlaybackQueue();

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {
        // ignore
      }
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceNodeRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    setMicLevel(0);
    setIsAiSpeaking(false);
  }, [stopPlaybackQueue]);

  useEffect(() => {
    if (!isOpen) {
      cleanupSession();
      setStatus('idle');
      setErrorMessage(null);
    }
    return () => {
      cleanupSession();
    };
  }, [isOpen, cleanupSession]);

  const appendTranscript = useCallback((role: 'user' | 'ai', chunkText: string) => {
    if (!chunkText) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === role && last.id !== 'welcome') {
        return [
          ...prev.slice(0, -1),
          { ...last, text: `${last.text}${chunkText}` },
        ];
      }
      return [
        ...prev,
        {
          id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role,
          text: chunkText,
        },
      ];
    });
  }, []);

  const scheduleAudioChunk = useCallback(
    (base64Data: string) => {
      const outCtx = outputAudioCtxRef.current;
      if (!outCtx) return;

      const floats = base64ToFloat32(base64Data);
      if (floats.length === 0) return;

      const buffer = outCtx.createBuffer(1, floats.length, 24000);
      buffer.getChannelData(0).set(floats);

      const source = outCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(outCtx.destination);

      const startAt = Math.max(outCtx.currentTime, nextStartTimeRef.current);
      source.start(startAt);
      nextStartTimeRef.current = startAt + buffer.duration;
      setIsAiSpeaking(true);

      activeSourcesRef.current.push(source);
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsAiSpeaking(false);
        }
      };
    },
    []
  );

  const startConversation = useCallback(async () => {
    cleanupSession();
    setErrorMessage(null);
    setStatus('connecting');

    try {
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      await inputCtx.resume();
      await outputCtx.resume();
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        micStreamRef.current = stream;
      } catch {
        setErrorMessage(
          '마이크 권한이 차단되었거나 장치를 찾을 수 없습니다. 아래 입력창으로 텍스트 대화를 보낼 수도 있어요.'
        );
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/live?voice=${voice}`);
      wsRef.current = ws;

      ws.onopen = () => {
        isConnectedRef.current = true;
        setStatus('connected');

        if (stream && inputAudioCtxRef.current) {
          const activeInCtx = inputAudioCtxRef.current;
          const srcNode = activeInCtx.createMediaStreamSource(stream);
          const processor = activeInCtx.createScriptProcessor(4096, 1, 1);
          sourceNodeRef.current = srcNode;
          processorRef.current = processor;

          srcNode.connect(processor);
          processor.connect(activeInCtx.destination);

          processor.onaudioprocess = (e) => {
            if (!isConnectedRef.current || isMutedRef.current) {
              setMicLevel(0);
              return;
            }
            const socket = wsRef.current;
            if (!socket || socket.readyState !== WebSocket.OPEN) return;

            const raw = e.inputBuffer.getChannelData(0);
            let sumSq = 0;
            for (let i = 0; i < raw.length; i++) {
              sumSq += raw[i] * raw[i];
            }
            const rms = Math.sqrt(sumSq / raw.length);
            setMicLevel(Math.min(1, rms * 8));

            const downsampled = downsampleTo16k(raw, activeInCtx.sampleRate);
            const base64 = pcm16ToBase64(downsampled);
            socket.send(JSON.stringify({ type: 'audio', data: base64 }));
          };
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as {
            type?: string;
            data?: string;
            text?: string;
            error?: string;
          };

          if (msg.type === 'ready') {
            setStatus('connected');
            return;
          }
          if (msg.type === 'audio' && msg.data) {
            scheduleAudioChunk(msg.data);
            return;
          }
          if (msg.type === 'inputTranscript' && msg.text) {
            appendTranscript('user', msg.text);
            return;
          }
          if (msg.type === 'outputTranscript' && msg.text) {
            appendTranscript('ai', msg.text);
            return;
          }
          if (msg.type === 'interrupted') {
            stopPlaybackQueue();
            return;
          }
          if (msg.type === 'error' && msg.error) {
            setErrorMessage(msg.error);
            setStatus('error');
          }
        } catch {
          // ignore non-json message
        }
      };

      ws.onerror = () => {
        setErrorMessage('음성 대화 서버와 WebSocket 연결에 실패했습니다.');
        setStatus('error');
      };

      ws.onclose = () => {
        isConnectedRef.current = false;
        setStatus((prev) => (prev === 'error' ? 'error' : 'idle'));
      };
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : '음성 대화를 시작하는 중 오류가 발생했습니다.';
      setErrorMessage(msg);
      setStatus('error');
      cleanupSession();
    }
  }, [voice, cleanupSession, scheduleAudioChunk, appendTranscript, stopPlaybackQueue]);

  const sendLiveText = (overrideText?: string) => {
    const content = (overrideText ?? textInput).trim();
    if (!content) return;

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      onShowToast('먼저 [실시간 음성 연결] 버튼을 눌러 대화를 시작해주세요 🎙️');
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text: content },
    ]);
    wsRef.current.send(JSON.stringify({ type: 'text', text: content }));
    if (!overrideText) setTextInput('');
  };

  const buildStorySummary = (): string => {
    const userLines = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.text.trim())
      .filter(Boolean);
    if (userLines.length > 0) {
      return userLines.join(' ').slice(0, 380);
    }
    const aiLines = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => m.text.trim())
      .filter(Boolean);
    return (
      aiLines.join(' ').slice(0, 380) ||
      '오늘 있었던 재미있는 에피소드를 밝고 유쾌한 4컷 일상툰으로 들려주는 이야기'
    );
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="ToonDay Live 실시간 음성 대화"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] max-h-[90vh] bg-surface rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Handle & Header */}
        <div className="px-5 pt-3 pb-3 border-b border-surface-container bg-surface-container-lowest">
          <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-sm"
                style={{
                  background:
                    'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 50%, rgb(125, 211, 252) 100%)',
                }}
              >
                <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-on-surface font-headline">
                    AI 스토리 코치 실시간 음성대화
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-primary-fixed text-primary text-[9px] font-bold">
                    Live API
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  {status === 'connected'
                    ? isAiSpeaking
                      ? '🔊 AI 코치가 실시간으로 대답하고 있어요...'
                      : isMuted
                        ? '🔇 마이크 음소거 중 (텍스트 입력 가능)'
                        : '🎙️ 편하게 말씀해주세요! 실시간으로 듣고 있어요'
                    : status === 'connecting'
                      ? '⏳ Gemini 3.8 Live 세션에 연결 중...'
                      : '마이크로 대화하며 4컷 웹툰 아이디어를 완성해보세요'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="음성 대화 닫기"
              className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Voice Persona Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3">
            {VOICE_OPTIONS.map((v) => {
              const active = voice === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={status === 'connected' || status === 'connecting'}
                  onClick={() => setVoice(v.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] shrink-0 transition-all ${
                    active
                      ? 'bg-primary text-on-primary font-bold shadow-xs'
                      : 'bg-surface-container text-on-surface-variant font-medium'
                  } ${
                    status === 'connected' || status === 'connecting'
                      ? 'opacity-70 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visualizer Orb & Controls */}
        <div
          className="px-5 py-4 flex items-center justify-between gap-3 border-b border-surface-container"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 83, 118, 0.08) 0%, rgba(254, 210, 164, 0.14) 50%, rgba(125, 211, 252, 0.14) 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-14 h-14">
              {status === 'connected' && (
                <span
                  className="absolute inset-0 rounded-full transition-transform duration-75"
                  style={{
                    background: isAiSpeaking
                      ? 'rgba(125, 211, 252, 0.45)'
                      : 'rgba(255, 83, 118, 0.3)',
                    transform: `scale(${1 + (isAiSpeaking ? 0.28 : micLevel * 0.45)})`,
                  }}
                />
              )}
              <div
                className="relative w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md"
                style={{
                  background:
                    status === 'connected'
                      ? 'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(125, 211, 252) 100%)'
                      : 'linear-gradient(135deg, rgb(148, 163, 184) 0%, rgb(100, 116, 139) 100%)',
                }}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {status === 'connected'
                    ? isAiSpeaking
                      ? 'volume_up'
                      : isMuted
                        ? 'mic_off'
                        : 'mic'
                    : 'record_voice_over'}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-on-surface">
                {status === 'connected'
                  ? '실시간 양방향 음성 연결됨'
                  : status === 'connecting'
                    ? '연결 준비 중...'
                    : '음성 대화 대기 중'}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                16kHz 입력 · 24kHz 네이티브 보이스 출력
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {status === 'connected' ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    isMuted
                      ? 'bg-error-container text-error'
                      : 'bg-surface-container-lowest text-on-surface shadow-xs'
                  }`}
                  aria-label={isMuted ? '마이크 켜기' : '마이크 음소거'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isMuted ? 'mic_off' : 'mic'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cleanupSession();
                    setStatus('idle');
                    onShowToast('실시간 음성 대화가 종료되었습니다.');
                  }}
                  className="px-3 py-2 rounded-full bg-error text-on-error text-xs font-bold shadow-sm active:scale-95 transition-transform"
                >
                  대화 종료
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={status === 'connecting'}
                onClick={startConversation}
                className="px-3.5 py-2 rounded-full text-white text-xs font-bold shadow-md active:scale-95 transition-transform flex items-center gap-1 disabled:opacity-60"
                style={{
                  background:
                    'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 137, 107) 100%)',
                }}
              >
                <span className="material-symbols-outlined text-[16px]">mic</span>
                <span>{status === 'connecting' ? '연결 중...' : '음성 연결 시작'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Error notice */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-error-container/70 text-on-error-container text-xs font-medium flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Live Transcript Conversation Log */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-[200px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                  m.role === 'user'
                    ? 'bg-primary text-on-primary rounded-br-sm'
                    : 'bg-surface-container-low text-on-surface rounded-bl-sm border border-outline-variant/20'
                }`}
              >
                <span className="block text-[9px] font-bold opacity-75 mb-0.5">
                  {m.role === 'user' ? '나 (음성/텍스트)' : 'ToonDay AI 코치'}
                </span>
                <span>{m.text}</span>
              </div>
            </div>
          ))}
          <div ref={scrollBottomRef} />
        </div>

        {/* Quick Topic Chips (when connected) */}
        <div className="px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-surface-container bg-surface-container-low/60">
          {QUICK_STARTERS.map((starter) => (
            <button
              key={starter}
              type="button"
              onClick={() => sendLiveText(starter)}
              className="px-2.5 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-[10px] font-semibold text-on-surface-variant hover:text-primary shrink-0"
            >
              “{starter.slice(0, 18)}...”
            </button>
          ))}
        </div>

        {/* Text Prompt Input & Direct Studio/Generate Actions */}
        <div className="px-4 pt-2.5 pb-6 bg-surface-container-lowest border-t border-surface-container space-y-2.5">
          <div className="flex items-center gap-2 bg-surface-container-low rounded-full px-3 py-1.5">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendLiveText();
              }}
              placeholder="음성과 함께 텍스트로도 AI 코치에게 말 걸기..."
              className="flex-1 bg-transparent text-xs text-on-surface placeholder:text-outline focus:outline-none"
            />
            <button
              type="button"
              onClick={() => sendLiveText()}
              className="px-3 py-1 rounded-full bg-primary text-on-primary text-[11px] font-bold shrink-0"
            >
              전송
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                const story = buildStorySummary();
                cleanupSession();
                onApplyToStudio(story);
              }}
              className="py-2.5 px-3 rounded-xl bg-surface-container text-on-surface text-xs font-bold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[15px] text-primary">edit_note</span>
              <span>스튜디오 일기장에 넣기</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const story = buildStorySummary();
                cleanupSession();
                onGenerateFromVoice(story);
              }}
              className="py-2.5 px-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md active:scale-[0.99] transition-all"
              style={{
                background:
                  'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 137, 107) 50%, rgb(125, 211, 252) 100%)',
              }}
            >
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
              <span>4컷 웹툰 바로 생성</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
