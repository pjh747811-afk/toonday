import React, { useEffect, useRef, useState } from 'react';
import {
  AppRoute,
  CharacterPresetItem,
  STUDIO_STYLES,
  TOONDAY_ASSETS,
} from '../../data/toondayData';
import { GeneratedMusicTrack, MusicGeneratorModal } from './MusicGeneratorModal';

interface StudioScreenProps {
  initialPrompt?: string;
  initialStyleKey?: string;
  initialCuts?: 4 | 8;
  initialCharId?: string;
  isPro?: boolean;
  freeTicketsLeft?: number;
  characterPresets: CharacterPresetItem[];
  onAddCharacterPreset: (preset: CharacterPresetItem) => void;
  onSaveDraft: (payload: { prompt: string; styleKey: string; cuts: 4 | 8 }) => void;
  onNavigate: (route: AppRoute) => void;
  onStartGenerate: (payload: {
    prompt: string;
    styleKey: string;
    cuts: 4 | 8;
    charId: string;
  }) => void;
  onOpenVoiceChat?: () => void;
  onShowToast: (msg: string) => void;
  isWebMode?: boolean;
}

const TOPIC_CHIPS = [
  {
    label: '출근/통학 ☕',
    prompt: '오늘 출근길 만원 지하철에서 벌어진 일...',
    style: {
      backgroundColor: 'rgba(255, 83, 118, 0.12)',
      color: 'rgb(183, 25, 69)',
      border: '1px solid rgba(255, 83, 118, 0.35)',
    },
  },
  {
    label: '소소한 실수 😂',
    prompt: '다이어트 중인데 친구가 디저트 가게로 끌고 감...',
    style: {
      backgroundColor: 'rgba(255, 170, 166, 0.18)',
      color: 'rgb(196, 56, 89)',
      border: '1px solid rgba(255, 170, 166, 0.45)',
    },
  },
  {
    label: '맛집/카페 🍰',
    prompt: '드디어 오픈런 성공한 성수동 인생 케이크 후기...',
    style: {
      backgroundColor: 'rgba(255, 211, 165, 0.22)',
      color: 'rgb(156, 92, 22)',
      border: '1px solid rgba(255, 211, 165, 0.55)',
    },
  },
  {
    label: '반려동물 🐾',
    prompt: '퇴근하고 돌아왔더니 강아지가 신발을 베개 삼아 자고 있음...',
    style: {
      backgroundColor: 'rgba(186, 242, 187, 0.25)',
      color: 'rgb(30, 112, 74)',
      border: '1px solid rgba(186, 242, 187, 0.6)',
    },
  },
  {
    label: '연애/썸 💕',
    prompt: '퇴근길에 우연히 눈마주친 카페 알바생과의 심쿵 모먼트...',
    style: {
      backgroundColor: 'rgba(141, 228, 255, 0.22)',
      color: 'rgb(2, 107, 139)',
      border: '1px solid rgba(141, 228, 255, 0.55)',
    },
  },
  {
    label: '퇴근/힐링 🌙',
    prompt: '샤워하고 캔맥주 한 캔 까며 좋아하는 넷플릭스 정주행한 힐링타임...',
    style: {
      backgroundColor: 'rgba(255, 83, 118, 0.08)',
      color: 'rgb(138, 51, 89)',
      border: '1px solid rgba(255, 170, 166, 0.35)',
    },
  },
];

const COMPARE_CUTS_BY_TONE = {
  comic: [
    {
      cutNum: 1,
      badge: 'Cut 1 · 기',
      tag: '클로즈업 추천',
      orig: '침대에서 화들짝 놀라는 주인공과 08:45 알람시계',
      ai: '08:45분 빨간 알람시계 폭발 직전! 동공지진 클로즈업 + 땀방울 효과선',
    },
    {
      cutNum: 2,
      badge: 'Cut 2 · 승',
      tag: '다이내믹 풀샷',
      orig: '토스트 입에 물고 아파트 계단 뛰어내려가는 액션',
      ai: '물고 있던 식빵이 날아갈 듯한 초특급 전력질주! 펄럭이는 재킷 깃',
    },
    {
      cutNum: 3,
      badge: 'Cut 3 · 전',
      tag: '슬로우모션 로우앵글',
      orig: '닫히는 지하철 문 틈으로 가방과 몸을 던지는 돌진',
      ai: '영화 인디아나 존스급 슬라이딩! 지하철 스크린도어 사이 가방 세이프!',
    },
    {
      cutNum: 4,
      badge: 'Cut 4 · 결',
      tag: '코믹 미디엄샷',
      orig: '만원 지하철 속 땀 닦으며 몰래 짓는 승리의 미소',
      ai: '숨 몰아쉬며 V사인 날리는 주인공! 독자 공감 100% 멘붕 극복 미소',
    },
  ],
  healing: [
    {
      cutNum: 1,
      badge: 'Cut 1 · 기',
      tag: '감성 아침 햇살',
      orig: '아침 햇살에 눈을 뜨며 시계를 확인하는 순간',
      ai: '포근한 커튼 틈 사이 햇살과 함께 여유를 되찾는 모닝 루틴 클로즈업',
    },
    {
      cutNum: 2,
      badge: 'Cut 2 · 승',
      tag: '따뜻한 스냅샷',
      orig: '출근길 모닝 토스트와 커피를 챙겨 나서는 길',
      ai: '선선한 아침 바람과 따뜻한 토스트 온기가 담긴 감성 수채화 앵글',
    },
    {
      cutNum: 3,
      badge: 'Cut 3 · 전',
      tag: '잔잔한 여운',
      orig: '도착 직전의 지하철에 간신히 올라타는 장면',
      ai: '노을빛 창가 너머로 스쳐 지나가는 도시 풍경과 작은 안도의 한숨',
    },
    {
      cutNum: 4,
      badge: 'Cut 4 · 결',
      tag: '힐링 엔딩',
      orig: '좌석에 앉아 하루를 시작하는 미소',
      ai: '오늘도 무사히 해낸 나에게 건네는 작은 미소와 따뜻한 BGM 여운',
    },
  ],
  action: [
    {
      cutNum: 1,
      badge: 'Cut 1 · 기',
      tag: '초긴장 줌인',
      orig: '08:45 알람을 확인하고 놀라는 모습',
      ai: '시계 초침과 함께 붉게 점멸하는 데드라인! 0.01초 각성 임팩트 컷',
    },
    {
      cutNum: 2,
      badge: 'Cut 2 · 승',
      tag: '스피드 집중선',
      orig: '집을 나서 계단을 뛰어 내려가는 장면',
      ai: '집중선 폭발! 바람을 가르는 질주와 바닥을 박차는 역동적 로우앵글',
    },
    {
      cutNum: 3,
      badge: 'Cut 3 · 전',
      tag: '하이앵글 액션',
      orig: '닫히려는 스크린도어 사이로 돌진하는 모습',
      ai: '화려한 스파크 효과와 함께 문 닫히기 0.1초 전 극적 돌파 슬라이딩!',
    },
    {
      cutNum: 4,
      badge: 'Cut 4 · 결',
      tag: '승리의 포즈',
      orig: '지하철 안에서 안도의 숨을 쉬는 장면',
      ai: '전율의 미션 클리어! 역광 속 땀방울이 빛나는 시네마틱 피날레',
    },
  ],
};

const REWRITTEN_TEXT_BY_TONE = {
  comic:
    '알람을 끄고 5분만 더... 했는데 벌써 8시 45분?! 쏜살같이 튀어나가 식빵 물고 계단을 질주해 스크린도어에 가방을 들이민 기적의 출근 생존기! 결국 해냈다 ✌️',
  healing:
    '바쁜 아침 8시 45분, 정신없이 집을 나섰지만 닫히려던 지하철에 무사히 올라탄 작은 기적. 창밖 햇살을 보며 오늘 하루도 괜찮을 거라 미소 지은 아침 ☕✨',
  action:
    '데드라인 08:45 발동! 계단을 단숨에 주파하고 닫히는 스크린도어를 0.1초 차로 돌파한 초고속 출근 미션 클리어! 오늘의 승자는 바로 나 ⚡🔥',
};

function createSampleMotionCanvasDataUrl(): string {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 640;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 512, 640);
    g.addColorStop(0, '#FFE4EA');
    g.addColorStop(0.5, '#FFF3DF');
    g.addColorStop(1, '#DFF4FF');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 640);
    ctx.fillStyle = '#FF5376';
    ctx.beginPath();
    ctx.arc(256, 260, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('ToonDay Sample Cut', 120, 440);
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#4B4453';
    ctx.fillText('벚꽃 흩날리는 출근길', 142, 490);
  }
  return c.toDataURL('image/png');
}

export const StudioScreen: React.FC<StudioScreenProps> = ({
  initialPrompt = '',
  initialStyleKey = 'insta',
  initialCuts = 4,
  initialCharId,
  isPro = false,
  freeTicketsLeft = 1,
  characterPresets,
  onAddCharacterPreset,
  onSaveDraft,
  onNavigate,
  onStartGenerate,
  onOpenVoiceChat,
  onShowToast,
  isWebMode = false,
}) => {
  const [storyInput, setStoryInput] = useState(initialPrompt);
  const [selectedStyle, setSelectedStyle] = useState(initialStyleKey);
  const [selectedCuts, setSelectedCuts] = useState<4 | 8>(initialCuts);
  const [charTab, setCharTab] = useState<'preset' | 'custom'>('preset');
  const [selectedCharId, setSelectedCharId] = useState<string>(
    initialCharId || characterPresets[0]?.id || 'ch-seoyeon'
  );

  // Custom character builder state
  const [customCharName, setCustomCharName] = useState('');
  const [customCharDesc, setCustomCharDesc] = useState('');
  const [customCharAvatar, setCustomCharAvatar] = useState(TOONDAY_ASSETS.authorAvatar);
  const customCharFileRef = useRef<HTMLInputElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [lastSavedText, setLastSavedText] = useState('자동 저장 켜짐');
  const [isDraftSavedToast, setIsDraftSavedToast] = useState(false);

  // AI Compare Modal State
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareTab, setCompareTab] = useState<'cuts' | 'text'>('cuts');
  const [compareTone, setCompareTone] = useState<'comic' | 'healing' | 'action'>('comic');
  const [cutChoices, setCutChoices] = useState<Record<number, 'ai' | 'original'>>({
    1: 'ai',
    2: 'ai',
    3: 'original',
    4: 'ai',
  });

  // Video Motion Animation
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [motionPrompt, setMotionPrompt] = useState(
    '카메라가 부드럽게 줌인하며 벚꽃 잎과 머리카락이 바람에 흩날리는 몽환적인 파스텔 모션'
  );
  const [videoRatio, setVideoRatio] = useState<'9:16' | '16:9'>('9:16');
  const [isAnimating, setIsAnimating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [animateError, setAnimateError] = useState<string | null>(null);

  // Story BGM Music Generator
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [studioMusicTrack, setStudioMusicTrack] = useState<GeneratedMusicTrack | null>(null);

  useEffect(() => {
    if (initialPrompt) setStoryInput(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    if (initialStyleKey) setSelectedStyle(initialStyleKey);
  }, [initialStyleKey]);

  useEffect(() => {
    if (initialCuts) setSelectedCuts(initialCuts);
  }, [initialCuts]);

  useEffect(() => {
    if (initialCharId) setSelectedCharId(initialCharId);
  }, [initialCharId]);

  const handleLoad19Preset = () => {
    const preset =
      '오늘 점심시간에 팀원들과 매운 떡볶이 맛집에 갔는데, 매운맛 조절 실패로 눈물 콧물 쏟으며 회의에 복귀한 19화 대참사!';
    setStoryInput(preset);
    onShowToast('연재 19화 [점심시간 떡볶이 대첩] 콘티가 적용되었습니다 🥘');
  };

  const handleVoiceToggle = () => {
    if (onOpenVoiceChat) {
      onOpenVoiceChat();
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    window.setTimeout(() => {
      setStoryInput(
        '오늘 점심에 직장 동료들이랑 매운 떡볶이를 시켜 먹었는데, 팀장님이 맵기 조절 실패해서 눈물 콧물 쏟으며 회의 진행한 웃픈 이야기.'
      );
      setIsRecording(false);
      onShowToast('음성 일기가 텍스트로 변환되었습니다 🎙️');
    }, 1800);
  };

  const handleSaveDraft = () => {
    onSaveDraft({
      prompt: storyInput,
      styleKey: selectedStyle,
      cuts: selectedCuts,
    });
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setLastSavedText(`최근 저장: 방금 전 (${hh}:${mm})`);
    setIsDraftSavedToast(true);
    window.setTimeout(() => setIsDraftSavedToast(false), 3200);
  };

  const handleLoadDraft = () => {
    try {
      const saved = localStorage.getItem('toonday_draft_story');
      if (saved && saved.trim()) {
        setStoryInput(saved);
        onShowToast('임시저장된 일기를 불러왔습니다 📁');
        return;
      }
    } catch {
      // ignore
    }
    setStoryInput(
      '오늘 진짜 역대급 야근하고 나오는데 찬 바람 불어서 편의점에서 최애 맥주 사서 마심... 꿀꺽 한 모금에 하루 피로가 싹 날아가는 컷으로 엔딩!'
    );
    onShowToast('저장된 콘티 메모를 불러왔습니다 📁');
  };

  const activeCompareCuts = COMPARE_CUTS_BY_TONE[compareTone];
  const aiCount = Object.values(cutChoices).filter((v) => v === 'ai').length;
  const origCount = 4 - aiCount;

  const handleApplyComparison = () => {
    if (compareTab === 'text') {
      setStoryInput(REWRITTEN_TEXT_BY_TONE[compareTone]);
    } else {
      const assembled = activeCompareCuts
        .map((cut) => {
          const choice = cutChoices[cut.cutNum] || 'ai';
          return choice === 'ai' ? cut.ai : cut.orig;
        })
        .join(' → ');
      setStoryInput(assembled);
    }
    setIsCompareOpen(false);
    onShowToast('선택한 컷 & 톤앤매너 콘티가 입력창에 반영되었습니다 ✨');
  };

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomCharAvatar(reader.result);
        onShowToast('커스텀 캐릭터 참고 사진이 등록되었습니다 📸');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCustomChar = () => {
    const cleanName = customCharName.trim() || '나만의 캐릭터';
    const cleanDesc =
      customCharDesc.trim() || '단발 머리 · 크림 니트 · 밝고 엉뚱한 매력 고정';
    const styleObj = STUDIO_STYLES.find((s) => s.key === selectedStyle);
    const newPreset: CharacterPresetItem = {
      id: `ch-custom-${Date.now()}`,
      name: `${cleanName} (커스텀)`,
      style: `${styleObj?.title || '명랑 인스타툰'} 페이스락`,
      desc: cleanDesc,
      avatar: customCharAvatar,
    };
    onAddCharacterPreset(newPreset);
    setSelectedCharId(newPreset.id);
    setCustomCharName('');
    setCustomCharDesc('');
    setCharTab('preset');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setAnimateError('10MB 이하의 PNG, JPEG 또는 WebP 이미지를 업로드해주세요.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedImage(reader.result);
        setGeneratedVideoUrl(null);
        setAnimateError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleCut = () => {
    const sampleUrl = createSampleMotionCanvasDataUrl();
    setUploadedImage(sampleUrl);
    setGeneratedVideoUrl(null);
    setAnimateError(null);
    onShowToast('샘플 웹툰 컷을 불러왔습니다! 이제 모션 영상 생성이 가능해요 🎬');
  };

  const handleAnimateImage = async () => {
    if (!uploadedImage) {
      setAnimateError('먼저 이미지를 업로드하거나 [샘플 컷 불러오기]를 눌러주세요.');
      return;
    }
    setIsAnimating(true);
    setAnimateError(null);
    try {
      const res = await fetch('/api/studio/animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: uploadedImage,
          prompt: motionPrompt,
          aspectRatio: videoRatio,
        }),
      });
      const data = (await res.json()) as { videoUrl?: string; error?: string };
      if (!res.ok || !data.videoUrl) {
        setAnimateError(data.error || '영상 변환 중 문제가 발생했습니다.');
      } else {
        setGeneratedVideoUrl(data.videoUrl);
        onShowToast('사진 모션 릴스 영상이 완성되었습니다 🎬');
      }
    } catch {
      setAnimateError('서버와 통신하지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Top Daily Credit Status Banner */}
      <section className="px-4 py-3">
        <div
          className="relative overflow-hidden rounded-2xl p-[1px] shadow-lg"
          style={{
            background:
              'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166), rgb(255, 211, 165), rgb(186, 242, 187), rgb(141, 228, 255))',
            boxShadow: 'rgba(255, 83, 118, 0.2) 0px 8px 24px',
          }}
        >
          <div className="relative rounded-[15px] bg-surface-container-lowest/90 backdrop-blur-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl text-on-primary flex items-center justify-center shadow-md flex-shrink-0"
                  style={{
                    background:
                      'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166))',
                    color: 'white',
                  }}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    bolt
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-headline font-extrabold text-on-surface">
                      {isPro ? 'ToonDay PRO 패스 활성화' : '오늘의 무료 충전 티켓'}
                    </span>
                    <span
                      className="px-1.5 py-0.2 rounded-full text-[10px] font-bold tracking-tight shadow-sm"
                      style={{
                        background:
                          'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166))',
                        color: 'white',
                      }}
                    >
                      {isPro ? '무제한' : `${freeTicketsLeft}회 남음`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-[13px] text-primary">timer</span>
                    <span>{isPro ? '초고속 4K 렌더링 대기열 OFF' : '23:59:00 후 자동 충전'}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('subscription')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full font-headline font-bold text-xs transition-all shadow-sm group"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 83, 118, 0.15), rgba(141, 228, 255, 0.2))',
                  color: 'rgb(183, 25, 69)',
                  border: '1px solid rgba(255, 83, 118, 0.3)',
                }}
              >
                <span
                  className="material-symbols-outlined text-[14px] text-primary group-hover:scale-110 transition-transform"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
                <span>{isPro ? 'PRO 이용 중' : 'PRO 무제한'}</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/30">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
                </span>
                <span className="font-medium">
                  {isPro
                    ? '4K 노마크 & 8컷 롱폼 엔진 가동 ON'
                    : '기본 1080p 고해상도 & AI 작화 가속 엔진 ON'}
                </span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-primary">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>{isPro ? '∞ / 무제한' : `${freeTicketsLeft} / 1 회 사용 가능`}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace (2-column in Web mode, 1-column thumb flow in App mode) */}
      <div className={isWebMode ? 'px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' : ''}>
        <div className={isWebMode ? 'lg:col-span-7 flex flex-col gap-5' : ''}>
          {/* Step 1: Diary Story Input */}
          <section className={`${isWebMode ? 'pt-2' : 'px-4 pt-3'} flex flex-col gap-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166), rgb(255, 211, 165))',
                color: 'white',
                boxShadow: 'rgba(255, 83, 118, 0.35) 0px 2px 8px',
              }}
            >
              1
            </span>
            <h2 className="text-sm font-headline font-bold text-on-surface">
              오늘 하루 일기 &amp; 에피소드 입력
            </h2>
            <span className="px-1.5 py-0.2 rounded-full bg-secondary-container text-primary text-[10px] font-bold tracking-tight">
              #19화
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-primary">cloud_done</span>
              <span>{lastSavedText}</span>
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium">
              {storyInput.length} / 400자
            </span>
          </div>
        </div>

        {/* Quick Mood/Topic Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          <button
            type="button"
            onClick={handleLoad19Preset}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1"
            style={{
              background:
                'linear-gradient(135deg, rgba(255, 83, 118, 0.2), rgba(141, 228, 255, 0.25))',
              color: 'rgb(183, 25, 69)',
              border: '1.5px solid rgba(255, 83, 118, 0.5)',
            }}
          >
            <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
            <span>19화: 점심시간 떡볶이 대첩 🥘</span>
          </button>

          {TOPIC_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => setStoryInput(chip.prompt)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm"
              style={chip.style}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Textarea Box */}
        <div className="relative rounded-xl bg-surface-container-lowest p-3 shadow-md focus-within:shadow-[0_0_0_2px_#6750a4] transition-all">
          <textarea
            id="studio-story-input"
            rows={4}
            maxLength={400}
            value={storyInput}
            onChange={(e) => setStoryInput(e.target.value)}
            placeholder="예: 오늘 아침 늦잠 자서 지하철을 놓칠 뻔했는데, 눈앞에서 문이 닫히며 빵터진 출근길 이야기..."
            className="w-full bg-transparent text-on-surface text-sm placeholder:text-outline/60 resize-none outline-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isRecording
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-surface-container text-on-surface-variant hover:text-primary hover:bg-secondary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isRecording ? 'record_voice_over' : 'graphic_eq'}
              </span>
              <span>
                {isRecording ? '음성 인식 중... (말씀해주세요)' : 'AI 실시간 음성대화 (Live)'}
              </span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container text-primary hover:bg-secondary-container text-xs font-semibold transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[15px]">save</span>
                <span>임시저장</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCompareOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all"
                style={{
                  background:
                    'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 25%, rgb(255, 211, 165) 50%, rgb(186, 242, 187) 75%, rgb(141, 228, 255) 100%)',
                  color: 'rgb(27, 27, 37)',
                  fontWeight: 700,
                  boxShadow: 'rgba(255, 83, 118, 0.35) 0px 4px 14px',
                }}
              >
                <span className="material-symbols-outlined text-[15px]">magic_button</span>
                <span>AI로 위트있게 다듬기</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: Art Style Selection Carousel */}
      <section className={`${isWebMode ? 'pt-2' : 'pt-5'} flex flex-col gap-2.5`}>
        <div className={`${isWebMode ? '' : 'px-4'} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166), rgb(255, 211, 165))',
                color: 'white',
                boxShadow: 'rgba(255, 83, 118, 0.35) 0px 2px 8px',
              }}
            >
              2
            </span>
            <h2 className="text-sm font-headline font-bold text-on-surface">
              웹툰 작화 스타일 선택
            </h2>
          </div>
          <span className="text-xs font-semibold text-primary">총 6가지 화풍</span>
        </div>

        <div
          className={
            isWebMode
              ? 'grid grid-cols-2 sm:grid-cols-3 gap-3 pb-2'
              : 'flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none'
          }
        >
          {STUDIO_STYLES.map((style) => {
            const isSelected = selectedStyle === style.key;
            return (
              <div
                key={style.key}
                onClick={() => setSelectedStyle(style.key)}
                className={`${
                  isWebMode ? 'w-full' : 'flex-shrink-0 w-44'
                } rounded-xl p-2.5 bg-surface-container-lowest shadow-md cursor-pointer transition-all relative`}
                style={
                  isSelected
                    ? {
                        boxShadow:
                          'rgb(255, 83, 118) 0px 0px 0px 2.5px, rgba(255, 83, 118, 0.2) 0px 6px 16px',
                      }
                    : undefined
                }
              >
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-tight shadow ${style.badgeClass}`}
                    style={style.badgeStyle}
                  >
                    {style.badge}
                  </span>
                </div>
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-surface-container mb-2">
                  <img
                    className="w-full h-full object-cover"
                    alt={style.title}
                    referrerPolicy="no-referrer"
                    src={style.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent" />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-on-surface truncate">
                      {style.title}
                    </span>
                    <span className="text-[10px] text-on-surface-variant truncate">
                      {style.desc}
                    </span>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[18px] shrink-0 ${
                      isSelected ? 'text-primary' : 'text-outline'
                    }`}
                    style={
                      isSelected
                        ? { color: 'rgb(255, 83, 118)', fontVariationSettings: "'FILL' 1" }
                        : undefined
                    }
                  >
                    {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
        </div>

        <div className={isWebMode ? 'lg:col-span-5 flex flex-col gap-4' : ''}>
      {/* Step 3: Format & Character Avatar Settings */}
      <section className={`${isWebMode ? 'pt-2' : 'px-4 pt-5'} flex flex-col gap-2.5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166), rgb(255, 211, 165))',
                color: 'white',
                boxShadow: 'rgba(255, 83, 118, 0.35) 0px 2px 8px',
              }}
            >
              3
            </span>
            <h2 className="text-sm font-headline font-bold text-on-surface">
              웹툰 분량 &amp; 포맷 선택
            </h2>
          </div>
          <span className="text-xs font-semibold text-primary">
            {selectedCuts === 4 ? '4컷 일상툰 선택됨' : '8컷 스크롤 웹툰 선택됨'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div
            onClick={() => {
              setSelectedCuts(4);
              onShowToast('포맷 변경: [4컷 일상툰] 선택됨 (무료 1회 지원) ⚡');
            }}
            className="rounded-xl p-3 bg-surface-container-lowest cursor-pointer transition-all flex flex-col justify-between relative"
            style={
              selectedCuts === 4
                ? {
                    border: '2px solid rgb(255, 83, 118)',
                    boxShadow: 'rgba(255, 83, 118, 0.18) 0px 4px 14px',
                  }
                : { border: '1px solid rgba(203, 196, 210, 0.4)' }
            }
          >
            <div className="flex items-start justify-between mb-2">
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-extrabold"
                style={{
                  background: 'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166))',
                  color: 'white',
                }}
              >
                무료 1회 지원
              </span>
              <span
                className="material-symbols-outlined text-[18px]"
                style={
                  selectedCuts === 4
                    ? { color: 'rgb(255, 83, 118)', fontVariationSettings: "'FILL' 1" }
                    : { color: '#7a7582' }
                }
              >
                {selectedCuts === 4 ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-on-surface">⚡ 4컷 일상툰</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container font-semibold">
                  스토리형
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant leading-snug">
                소소하고 임팩트 있는 기승전결! 인스타 피드 &amp; 스토리에 딱 맞는 클래식 4컷
              </p>
            </div>
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-outline-variant/30 text-[10px] text-primary font-semibold">
              <span>약 15초 소요</span>
              <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-primary font-bold">
                1컷×4분할
              </span>
            </div>
          </div>

          <div
            onClick={() => {
              setSelectedCuts(8);
              onShowToast('포맷 변경: [8컷 롱폼 스크롤 웹툰] 선택됨 📜');
            }}
            className="rounded-xl p-3 bg-surface-container-lowest cursor-pointer transition-all flex flex-col justify-between relative"
            style={
              selectedCuts === 8
                ? {
                    border: '2px solid rgb(255, 83, 118)',
                    boxShadow: 'rgba(255, 83, 118, 0.18) 0px 4px 14px',
                  }
                : { border: '1px solid rgba(203, 196, 210, 0.4)' }
            }
          >
            <div className="flex items-start justify-between mb-2">
              <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-[10px] font-extrabold">
                PRO 무제한
              </span>
              <span
                className="material-symbols-outlined text-[18px]"
                style={
                  selectedCuts === 8
                    ? { color: 'rgb(255, 83, 118)', fontVariationSettings: "'FILL' 1" }
                    : { color: '#7a7582' }
                }
              >
                {selectedCuts === 8 ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-on-surface">📜 8컷 스크롤 웹툰</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant font-semibold">
                  롱폼
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant leading-snug">
                더 깊고 풍성한 스토리 전개! 네이버/카카오 웹툰 같은 세로 스크롤형 8컷
              </p>
            </div>
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-outline-variant/30 text-[10px] text-on-surface-variant font-medium">
              <span>약 30초 소요</span>
              <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-bold">
                세로 스크롤
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Series Continuity & Character Preset Bar */}
      <section className={`${isWebMode ? 'pt-1' : 'px-4 pt-4'} flex flex-col gap-3`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-on-primary text-[10px] font-bold shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166))',
                }}
              >
                #
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-on-surface text-[11px] truncate">
                  연재 시리즈 관리: [소연의 슬기로운 직장생활]
                </span>
                <span className="text-[10px] text-on-surface-variant truncate">
                  18화 출근 완료 ➔ 다음 19화 작성 대기 중
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLoad19Preset}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166))',
                color: 'white',
              }}
            >
              <span className="material-symbols-outlined text-[13px]">fast_forward</span>
              <span>19화 바로 생성</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-full py-2 px-3 rounded-xl bg-secondary-container text-on-secondary-container hover:opacity-90 active:scale-[0.98] font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[15px] text-primary">folder_open</span>
              <span>📁 19화 임시저장</span>
            </button>
            <button
              type="button"
              onClick={handleLoadDraft}
              className="w-full py-2 px-3 rounded-xl bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high active:scale-[0.98] font-headline font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">history</span>
              <span>불러오기</span>
            </button>
          </div>
        </div>

        {/* Preset Mode Tab Switch */}
        <div className="flex rounded-xl bg-surface-container p-1 gap-1">
          <button
            type="button"
            onClick={() => setCharTab('preset')}
            className={`flex-1 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition-all ${
              charTab === 'preset'
                ? 'font-bold text-primary bg-surface-container-lowest shadow-sm'
                : 'font-medium text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">stars</span>
            <span>기본 추천 캐릭터 ({characterPresets.length}종)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCharTab('custom');
              onShowToast('사진 업로드 기반 나만의 커스텀 캐릭터 모드로 전환했어요 💎');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition-all ${
              charTab === 'custom'
                ? 'font-bold text-primary bg-surface-container-lowest shadow-sm'
                : 'font-medium text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[14px] text-tertiary">diamond</span>
            <span>나만의 커스텀 캐릭터 (PRO 💎)</span>
          </button>
        </div>

        {/* Character Selection Content */}
        {charTab === 'preset' ? (
          <div className="grid grid-cols-2 gap-2">
            {characterPresets.map((ch) => {
              const isSelected = selectedCharId === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setSelectedCharId(ch.id);
                    onShowToast(`주인공 캐릭터 [${ch.name}] 적용 완료! 🎭`);
                  }}
                  className={`p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-all bg-surface-container-lowest ${
                    isSelected
                      ? 'ring-2 ring-primary shadow-sm'
                      : 'border border-outline-variant/40 hover:border-primary/40'
                  }`}
                >
                  <img
                    src={ch.avatar}
                    alt={ch.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-primary-fixed"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[11px] font-bold text-on-surface truncate">{ch.name}</p>
                      {isSelected && (
                        <span
                          className="material-symbols-outlined text-[14px] text-primary shrink-0"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-primary font-semibold truncate">{ch.style}</p>
                    <p className="text-[9px] text-outline truncate">{ch.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm border border-primary/25 flex flex-col gap-2.5">
            <input
              ref={customCharFileRef}
              type="file"
              accept="image/*"
              onChange={handleCustomAvatarUpload}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => customCharFileRef.current?.click()}
                className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary-container shrink-0 group"
                title="참고 사진 업로드"
              >
                <img
                  src={customCharAvatar}
                  alt="커스텀 캐릭터 미리보기"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center text-white opacity-90 group-hover:opacity-100">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </div>
              </button>
              <div className="flex-1 min-w-0 space-y-1.5">
                <input
                  type="text"
                  value={customCharName}
                  onChange={(e) => setCustomCharName(e.target.value)}
                  placeholder="캐릭터 이름 (예: 주말 집순이 루나)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-low text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  value={customCharDesc}
                  onChange={(e) => setCustomCharDesc(e.target.value)}
                  placeholder="특징 메모 (예: 동그란 안경, 핑크 니트 고정)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-low text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => customCharFileRef.current?.click()}
                className="px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant text-[11px] font-semibold"
              >
                사진 업로드
              </button>
              <button
                type="button"
                onClick={handleCreateCustomChar}
                className="flex-1 py-2 px-3 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm"
              >
                ✨ 페이스락 캐릭터 저장 및 적용
              </button>
            </div>
          </div>
        )}
      </section>

      {/* AI Image-to-Video Motion Animation Module (gemini-omni-1.2-flash) */}
      <section className={isWebMode ? 'pt-1' : 'px-4 pt-5'}>
        <div
          className="rounded-xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3 border border-outline-variant/40"
          style={{
            background:
              'linear-gradient(145deg, rgba(255, 240, 243, 0.55) 0%, rgba(255, 255, 255, 0.98) 55%, rgba(235, 250, 255, 0.65) 100%)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                style={{
                  background:
                    'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166), rgb(141, 228, 255))',
                }}
              >
                <span className="material-symbols-outlined text-[16px]">movie_filter</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-extrabold text-on-surface truncate">
                  AI 모션 릴스 영상 변환 (사진 → 영상)
                </h3>
                <p className="text-[10px] text-on-surface-variant truncate">
                  업로드한 일러스트/사진을 숏폼 모션 영상으로 생성
                </p>
              </div>
            </div>
            <div className="flex items-center bg-surface-container rounded-full p-0.5 shrink-0">
              {(['9:16', '16:9'] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setVideoRatio(ratio)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                    videoRatio === ratio
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border border-dashed border-primary/40 bg-surface-container-low/70 p-3 flex items-center gap-3 cursor-pointer hover:bg-surface-container-low transition-colors"
          >
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="업로드 이미지"
                className="w-16 h-16 rounded-lg object-cover shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">
                {uploadedImage ? '사진 업로드 완료 · 탭하여 변경' : '사진 업로드하기 (PNG / JPG / WebP)'}
              </p>
              <p className="text-[10px] text-on-surface-variant mt-0.5 leading-snug">
                선택한 {videoRatio} 비율에 맞춰 생동감 있는 카메라 모션을 생성합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUseSampleCut();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-[10px] font-bold text-primary shrink-0 hover:bg-secondary-container"
            >
              샘플 컷 불러오기
            </button>
          </div>

          <input
            type="text"
            value={motionPrompt}
            onChange={(e) => setMotionPrompt(e.target.value)}
            placeholder="움직임 연출 프롬프트 (예: 부드러운 카메라 줌인과 반짝이는 햇살)"
            className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          {animateError && (
            <div className="p-2.5 rounded-lg bg-error-container text-on-error-container text-[11px] font-medium leading-snug">
              {animateError}
            </div>
          )}

          {generatedVideoUrl && (
            <div className="flex flex-col gap-2">
              <div className="rounded-xl overflow-hidden bg-black shadow-md">
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full max-h-64 object-contain mx-auto"
                />
              </div>
              <a
                href={generatedVideoUrl}
                download="toonday_motion_reels.mp4"
                className="w-full py-2 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>모션 릴스 MP4 다운로드</span>
              </a>
            </div>
          )}

          <button
            type="button"
            disabled={isAnimating}
            onClick={handleAnimateImage}
            className="w-full py-2.5 px-4 rounded-xl bg-secondary-container text-on-secondary-container hover:opacity-95 disabled:opacity-60 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <span
              className={`material-symbols-outlined text-[16px] text-primary ${
                isAnimating ? 'animate-spin' : ''
              }`}
            >
              {isAnimating ? 'progress_activity' : 'movie'}
            </span>
            <span>
              {isAnimating
                ? 'AI 모션 영상 렌더링 중...'
                : '✨ 사진으로 모션 영상 만들기 (gemini-omni)'}
            </span>
          </button>
        </div>
      </section>

      {/* AI Soundtrack Composer Card (Lyria) */}
      <section className={isWebMode ? 'pt-1' : 'px-4 pt-3'}>
        <div
          className="rounded-xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-2.5 border border-outline-variant/40"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 240, 245, 0.6) 0%, rgba(255, 255, 255, 0.98) 55%, rgba(235, 248, 255, 0.65) 100%)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                style={{
                  background:
                    'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 179, 123), rgb(96, 165, 250))',
                }}
              >
                <span className="material-symbols-outlined text-[16px]">music_note</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-extrabold text-on-surface truncate">
                  스토리 맞춤 AI BGM 작곡 (Lyria)
                </h3>
                <p className="text-[10px] text-on-surface-variant truncate">
                  입력한 일기 내용과 작화 분위기에 어울리는 OST 생성
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMusicModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-bold shrink-0 shadow-xs active:scale-95 transition-all"
            >
              {studioMusicTrack ? '새 곡 만들기' : '🎵 BGM 만들기'}
            </button>
          </div>

          {studioMusicTrack && (
            <div className="p-2.5 rounded-xl bg-surface-container-low border border-primary/25 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="font-bold text-on-surface truncate">
                  {studioMusicTrack.mood} · {studioMusicTrack.title}
                </span>
                <a
                  href={studioMusicTrack.audioDataUrl}
                  download={`toonday_studio_bgm_${Date.now()}.mp3`}
                  className="text-primary font-bold shrink-0 hover:underline"
                >
                  MP3 저장
                </a>
              </div>
              <audio
                key={studioMusicTrack.audioDataUrl}
                controls
                loop
                src={studioMusicTrack.audioDataUrl}
                className="w-full h-8"
              />
            </div>
          )}
        </div>
      </section>

      {/* Bottom Floating Action CTA Container */}
      <section className={isWebMode ? 'pt-1 pb-2' : 'px-4 pt-6 pb-2'}>
        <div className="rounded-xl bg-surface-container-lowest p-4 shadow-xl flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 mb-1">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-full py-2.5 px-3 rounded-xl bg-secondary-container text-on-secondary-container hover:opacity-90 active:scale-[0.98] font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">folder_open</span>
              <span>📁 콘티 임시저장</span>
            </button>
            <button
              type="button"
              onClick={handleLoadDraft}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high active:scale-[0.98] font-headline font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>불러오기</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              onStartGenerate({
                prompt:
                  storyInput.trim() ||
                  '오늘 아침 늦잠 자서 지하철을 놓칠 뻔했는데, 문 닫히기 1초 전 세이프한 출근길 이야기!',
                styleKey: selectedStyle,
                cuts: selectedCuts,
                charId: selectedCharId,
              })
            }
            className="w-full py-4 px-6 rounded-xl font-headline font-extrabold text-sm tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            style={{
              background:
                'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 170, 166) 25%, rgb(255, 211, 165) 50%, rgb(186, 242, 187) 75%, rgb(141, 228, 255) 100%)',
              color: 'rgb(27, 27, 37)',
              fontWeight: 800,
              boxShadow:
                'rgba(255, 83, 118, 0.45) 0px 10px 25px -5px, rgba(141, 228, 255, 0.35) 0px 4px 12px',
            }}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_fix_high
            </span>
            <span>
              {selectedCuts === 4
                ? `✨ AI 웹툰 4컷 생성하기 (${isPro ? 'PRO 무제한' : '무료 1회 사용'})`
                : '✨ AI 웹툰 8컷 생성하기 (PRO 무제한)'}
            </span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-center">
            <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
            <span className="text-[11px] font-medium text-on-surface-variant">
              약 15초 소요 · 텍스트 감정 분석 및 {selectedCuts}컷 콘티 자동 구성
            </span>
          </div>
        </div>
      </section>
        </div>
      </div>

      {/* Draft Saved Toast */}
      {isDraftSavedToast && (
        <div
          className={`fixed bottom-20 z-50 w-[92%] max-w-[400px] ${
            isWebMode ? 'left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2' : 'left-1/2 -translate-x-1/2'
          }`}
        >
          <div className="p-3.5 rounded-xl bg-inverse-surface text-inverse-on-surface shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-primary-fixed-dim text-[20px] flex-shrink-0">
                check_circle
              </span>
              <div className="flex flex-col min-w-0">
                <p className="text-xs font-bold leading-snug truncate">
                  작성 중인 콘티가 안전하게 저장되었습니다!
                </p>
                <p className="text-[10px] text-inverse-on-surface/75 truncate">
                  내 보관함 &gt; 임시저장 콘티에서 언제든 이어 작성 가능
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsDraftSavedToast(false);
                onNavigate('drafts');
              }}
              className="px-2.5 py-1 rounded-lg bg-primary-container text-on-primary text-[11px] font-bold whitespace-nowrap flex-shrink-0 hover:opacity-90"
            >
              보관함 보기
            </button>
          </div>
        </div>
      )}

      {/* AI Compare Modal */}
      {isCompareOpen && (
        <div
          onClick={() => setIsCompareOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${
              isWebMode ? 'max-w-2xl' : 'max-w-[430px]'
            } bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden`}
          >
            <div className="px-4 py-3.5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[17px]">magic_button</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-headline font-bold text-on-surface">
                      AI 스토리 &amp; 4컷 콘티 추천 비교
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                      {compareTone === 'comic'
                        ? '위트/코믹형'
                        : compareTone === 'healing'
                          ? '감성 힐링형'
                          : '스릴 액션형'}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    원문 대비 컷별 연출과 대사를 생동감 있게 강화했습니다
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex flex-col gap-3.5 scrollbar-none">
              <div className="rounded-xl bg-surface-container-lowest p-3 border border-outline-variant/40 shadow-sm flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 mt-0.5">
                  auto_awesome
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <span className="font-bold text-primary">콘티 요약:</span> 입력하신 일기
                  원문에서 핵심 감정과 펀치라인을 살려 4컷 기승전결 콘티를 더 극적으로 다듬었어요.
                </p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-[15px] text-primary">tune</span>
                  톤앤매너 선택
                </span>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'comic' as const, label: '위트/코믹형' },
                    { id: 'healing' as const, label: '감성 힐링형' },
                    { id: 'action' as const, label: '스릴 넘치는 액션형' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCompareTone(t.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors ${
                        compareTone === t.id
                          ? 'font-bold bg-primary text-on-primary shadow-sm'
                          : 'font-medium bg-surface-container text-on-surface-variant hover:bg-secondary-container'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex rounded-lg bg-surface-container p-1">
                <button
                  type="button"
                  onClick={() => setCompareTab('cuts')}
                  className={`flex-1 py-1.5 rounded-md text-xs text-center transition-all ${
                    compareTab === 'cuts'
                      ? 'font-bold text-primary bg-surface-container-lowest shadow-sm'
                      : 'font-medium text-on-surface-variant'
                  }`}
                >
                  4컷 전체 비교
                </button>
                <button
                  type="button"
                  onClick={() => setCompareTab('text')}
                  className={`flex-1 py-1.5 rounded-md text-xs text-center transition-all ${
                    compareTab === 'text'
                      ? 'font-bold text-primary bg-surface-container-lowest shadow-sm'
                      : 'font-medium text-on-surface-variant'
                  }`}
                >
                  일기 문장 다듬기
                </button>
              </div>

              {compareTab === 'cuts' ? (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between px-1 py-0.5 text-[11px]">
                    <span className="text-on-surface-variant font-medium">
                      컷별로 원하는 연출만 골라 담아보세요
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCutChoices({ 1: 'ai', 2: 'ai', 3: 'ai', 4: 'ai' })
                        }
                        className="text-primary font-bold hover:underline"
                      >
                        전체 AI 채택
                      </button>
                      <span className="text-outline-variant">|</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCutChoices({
                            1: 'original',
                            2: 'original',
                            3: 'original',
                            4: 'original',
                          })
                        }
                        className="text-on-surface-variant hover:text-on-surface font-medium"
                      >
                        전체 원문 유지
                      </button>
                    </div>
                  </div>

                  {activeCompareCuts.map((cut) => {
                    const sel = cutChoices[cut.cutNum] || 'ai';
                    return (
                      <div
                        key={cut.cutNum}
                        className={`rounded-xl bg-surface-container-lowest p-3 shadow-sm flex flex-col gap-2.5 border ${
                          sel === 'ai' ? 'border-primary-container/40' : 'border-outline-variant/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-on-primary">
                              {cut.badge}
                            </span>
                            <span className="text-[10px] font-semibold text-primary px-1.5 py-0.2 rounded bg-secondary-container">
                              {cut.tag}
                            </span>
                          </div>
                          <div className="flex items-center bg-surface-container p-0.5 rounded-lg text-[10px]">
                            <button
                              type="button"
                              onClick={() =>
                                setCutChoices((prev) => ({ ...prev, [cut.cutNum]: 'original' }))
                              }
                              className={`px-2 py-1 rounded-md transition-all ${
                                sel === 'original'
                                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                                  : 'text-on-surface-variant font-medium'
                              }`}
                            >
                              {sel === 'original' ? '원문 유지' : '원문'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCutChoices((prev) => ({ ...prev, [cut.cutNum]: 'ai' }))
                              }
                              className={`px-2 py-1 rounded-md flex items-center gap-0.5 transition-all ${
                                sel === 'ai'
                                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                                  : 'text-on-surface-variant font-medium'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[11px]">
                                auto_awesome
                              </span>
                              <span>{sel === 'ai' ? 'AI 채택' : 'AI'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div
                            className={`p-2 rounded-lg flex flex-col gap-1 border ${
                              sel === 'original'
                                ? 'bg-secondary-container/40 border-primary-container/40'
                                : 'bg-surface-container-low/60 border-transparent'
                            }`}
                          >
                            <span
                              className={`text-[10px] font-bold flex items-center gap-0.5 ${
                                sel === 'original' ? 'text-primary' : 'text-outline'
                              }`}
                            >
                              {sel === 'original' ? '[원문 선택됨]' : '[원문 콘티]'}
                            </span>
                            <p
                              className={
                                sel === 'original'
                                  ? 'text-on-surface font-semibold leading-snug'
                                  : 'text-on-surface-variant leading-snug'
                              }
                            >
                              {cut.orig}
                            </p>
                          </div>

                          <div
                            className={`p-2 rounded-lg flex flex-col gap-1 border ${
                              sel === 'ai'
                                ? 'bg-secondary-container/40 border-primary-container/40'
                                : 'bg-surface-container-low/60 border-transparent opacity-75'
                            }`}
                          >
                            <span
                              className={`text-[10px] font-bold flex items-center gap-0.5 ${
                                sel === 'ai' ? 'text-primary' : 'text-outline'
                              }`}
                            >
                              [AI 추천]
                            </span>
                            <p
                              className={
                                sel === 'ai'
                                  ? 'text-on-surface font-semibold leading-snug'
                                  : 'text-on-surface-variant leading-snug'
                              }
                            >
                              {cut.ai}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-2">
                    <span className="text-xs font-bold text-outline">[원문 일기]</span>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {storyInput ||
                        '오늘 아침 늦잠 자서 지하철을 놓칠 뻔했는데, 눈앞에서 문이 닫히며 빵터진 출근길 이야기...'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary-container/40 border border-primary-container/40 flex flex-col gap-2">
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      [AI 추천 다듬은 일기]
                    </span>
                    <p className="text-xs font-semibold text-on-surface leading-relaxed">
                      &quot;{REWRITTEN_TEXT_BY_TONE[compareTone]}&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCompareOpen(false)}
                className="w-1/3 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-headline font-semibold text-xs transition-all"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleApplyComparison}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-primary via-primary-container to-secondary text-on-primary font-headline font-bold text-xs tracking-wide shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">magic_button</span>
                <span>
                  {compareTab === 'text'
                    ? '✨ AI 다듬은 문장 바로 적용하기'
                    : aiCount === 4
                      ? '✨ 4컷 전체 AI 추천으로 적용하기'
                      : origCount === 4
                        ? '전체 원문 콘티 유지하여 적용'
                        : `✨ 선택 컷 적용 (AI ${aiCount}개 · 원문 ${origCount}개)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <MusicGeneratorModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        sourceTitle={
          storyInput.trim()
            ? storyInput.trim().slice(0, 26)
            : '오늘의 스튜디오 새 웹툰 OST'
        }
        sourceStyle={
          STUDIO_STYLES.find((s) => s.key === selectedStyle)?.title || '명랑 인스타툰'
        }
        initialStorySummary={
          storyInput.trim() ||
          '오늘 아침 늦잠 자서 지하철을 놓칠 뻔했는데, 문 닫히기 1초 전 세이프한 출근길 이야기!'
        }
        generatedTrack={studioMusicTrack}
        onTrackGenerated={(track) => setStudioMusicTrack(track)}
        onShowToast={onShowToast}
      />
    </div>
  );
};
