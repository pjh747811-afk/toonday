import React, { useState } from 'react';
import { TOONDAY_ASSETS } from '../../data/toondayData';

interface SubscriptionScreenProps {
  isPro?: boolean;
  onShowToast: (msg: string) => void;
  onSuccessSubscribe?: (planLabel?: string) => void;
  isWebMode?: boolean;
}

const POLICY_DOCS: Record<'terms' | 'privacy' | 'refund', { title: string; body: string }> = {
  terms: {
    title: 'ToonDay 서비스 이용약관',
    body: 'ToonDay PRO 멤버십은 개인 및 SNS 상업적 연재(인스타툰, 블로그, 숏폼 릴스 등)에 활용 가능한 4K 노마크 이미지 및 모션 비디오 생성 권한을 제공합니다. 생성된 웹툰의 저작권과 업로드 권한은 제작한 크리에이터 본인에게 귀속됩니다.',
  },
  privacy: {
    title: '개인정보처리방침 안내',
    body: '캐릭터 페이스 락 및 웹툰 생성을 위해 업로드한 참고 사진과 스토리 일기 텍스트는 AI 렌더링 완료 즉시 암호화되어 안전하게 보호되며, 사용자 본인의 보관함 외 제3자 학습에 무단 사용되지 않습니다.',
  },
  refund: {
    title: '구독 및 환불 정책',
    body: '연간 플랜 7일 무료 체험 기간 종료 24시간 전까지 앱 내 [보관함 > 구독 관리]에서 위약금 없이 원클릭 해지가 가능합니다. 유료 결제 이후에도 7일 이내 미사용 시 전액 환불이 보장됩니다.',
  },
};

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  isPro = false,
  onShowToast,
  onSuccessSubscribe,
  isWebMode = false,
}) => {
  const [activePlan, setActivePlan] = useState<'annual' | 'monthly'>('annual');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<'kakao' | 'naver' | 'card' | 'phone'>('kakao');
  const [agreed, setAgreed] = useState(true);
  const [policyModal, setPolicyModal] = useState<'terms' | 'privacy' | 'refund' | null>(null);

  const confirmSubscription = () => {
    if (!agreed) {
      onShowToast('정기 결제 및 이용약관에 동의해주세요.');
      return;
    }
    const planLabel =
      activePlan === 'annual' ? 'PRO 연간 플랜 (7일 무료체험)' : 'PRO 월간 멤버십';
    setIsPaymentOpen(false);
    onShowToast(
      activePlan === 'annual'
        ? '0원 7일 무료 체험이 시작되었습니다! ToonDay PRO 혜택이 적용됩니다 ✨'
        : 'ToonDay PRO 월간 구독이 활성화되었습니다! ✨'
    );
    onSuccessSubscribe?.(planLabel);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Glowing Hero / Value Prop Banner */}
      <section
        className="relative px-5 pt-4 pb-6 overflow-hidden mb-5"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 83, 118, 0.08) 0%, rgba(255, 155, 155, 0.08) 25%, rgba(255, 206, 160, 0.12) 50%, rgba(199, 249, 204, 0.12) 75%, rgba(177, 235, 255, 0.12) 100%)',
          borderBottom: '1px solid rgba(255, 83, 118, 0.1)',
        }}
      >
        <div className="absolute -top-12 -left-10 w-44 h-44 rounded-full bg-primary-fixed blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute top-8 -right-12 w-52 h-52 rounded-full bg-secondary-container blur-3xl opacity-50 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-white shadow-sm mb-3 font-semibold text-xs tracking-wide"
            style={{
              background:
                'linear-gradient(90deg, rgb(255, 83, 118) 0%, rgb(255, 146, 138) 25%, rgb(255, 175, 123) 50%, rgb(124, 228, 149) 75%, rgb(110, 212, 248) 100%)',
            }}
          >
            <span
              className="material-symbols-outlined text-[15px] text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stars
            </span>
            <span className="uppercase font-bold text-white drop-shadow-xs">
              ToonDay PRO Exclusive
            </span>
          </div>

          {isPro && (
            <div className="mb-3 px-3.5 py-1.5 rounded-full bg-surface-container-lowest border border-primary/40 shadow-xs text-[11px] font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>현재 PRO 멤버십 이용 중 ✨ · 무제한 생성 &amp; 19화 선공개 활성</span>
            </div>
          )}

          <h2 className="text-2xl font-extrabold text-on-surface tracking-tight leading-snug mb-2 font-headline">
            매일 일상을 고퀄리티
            <br />
            <span
              className="bg-clip-text text-transparent font-extrabold"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgb(255, 69, 101) 0%, rgb(255, 127, 102) 30%, rgb(255, 158, 83) 60%, rgb(0, 158, 184) 100%)',
              }}
            >
              4컷 웹툰으로 무제한 기록
            </span>
            하세요
          </h2>

          <p className="text-xs text-on-surface-variant font-medium leading-relaxed max-w-[280px]">
            하루 1회 제한 없이, 나만의 고유한 캐릭터와
            <br />
            프리미엄 감성 작화로 자유롭게 연재해보세요.
          </p>

          {/* Mini Visual Preview Bento Row */}
          <div className="grid grid-cols-3 gap-2 w-full mt-5">
            <div className="flex flex-col items-center p-2 rounded-xl bg-surface-container-lowest shadow-sm border border-[#FF879A]/20">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white mb-1 shadow-xs"
                style={{
                  background: 'linear-gradient(135deg, #FF5376 0%, #FFA4A4 100%)',
                }}
              >
                <span className="material-symbols-outlined text-[18px]">all_inclusive</span>
              </div>
              <span className="text-[11px] font-bold text-on-surface">무제한 생성</span>
              <span className="text-[9px] text-on-surface-variant">초고속 렌더링</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-xl bg-surface-container-lowest shadow-sm border border-[#FFCE9E]/30">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#784300] mb-1 shadow-xs"
                style={{
                  background: 'linear-gradient(135deg, #FFC085 0%, #FFE194 100%)',
                }}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  face_retouching_natural
                </span>
              </div>
              <span className="text-[11px] font-bold text-on-surface">페이스 락</span>
              <span className="text-[9px] text-on-surface-variant">동일 인물 유지</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-xl bg-surface-container-lowest shadow-sm border border-[#7BD2ED]/30">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#004e5e] mb-1 shadow-xs"
                style={{
                  background: 'linear-gradient(135deg, #99F2A6 0%, #7BD2ED 100%)',
                }}
              >
                <span className="material-symbols-outlined text-[18px]">high_quality</span>
              </div>
              <span className="text-[11px] font-bold text-on-surface">4K + 노마크</span>
              <span className="text-[9px] text-on-surface-variant">인쇄용 해상도</span>
            </div>
          </div>
        </div>
      </section>

      {/* Billing Cycle Switcher */}
      <section className="px-5 mb-4">
        <div className="p-1 rounded-full bg-surface-container-high flex relative items-center">
          <button
            type="button"
            onClick={() => setActivePlan('annual')}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activePlan === 'annual'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant'
            }`}
          >
            <span>연간 플랜</span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-xs"
              style={{
                background: 'linear-gradient(90deg, rgb(255, 83, 118) 0%, rgb(255, 168, 110) 100%)',
              }}
            >
              45% 특가 🔥
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActivePlan('monthly')}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center ${
              activePlan === 'monthly'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant'
            }`}
          >
            <span>월간 플랜</span>
          </button>
        </div>
      </section>

      {/* Subscription Plan Cards */}
      <section
        className={`px-5 mb-6 ${
          isWebMode ? 'grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch' : 'space-y-3'
        }`}
      >
        {/* Annual Card */}
        <div
          onClick={() => setActivePlan('annual')}
          className={`relative p-4 rounded-xl transition-all cursor-pointer ${
            activePlan === 'annual'
              ? 'bg-surface-container-lowest shadow-md ring-2 ring-primary'
              : 'bg-surface-container-low shadow-sm'
          }`}
          style={
            activePlan === 'annual'
              ? {
                  border: '2px solid rgb(255, 83, 118)',
                  background:
                    'linear-gradient(rgba(255, 83, 118, 0.04) 0%, rgba(255, 206, 160, 0.04) 40%, rgb(255, 255, 255) 100%)',
                }
              : undefined
          }
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="text-xs font-black px-2 py-0.5 rounded-full bg-primary text-on-primary"
                  style={{
                    background:
                      'linear-gradient(90deg, rgb(255, 83, 118) 0%, rgb(255, 141, 114) 100%)',
                    color: 'rgb(255, 255, 255)',
                  }}
                >
                  BEST 인기
                </span>
                <span className="text-[11px] font-semibold text-primary font-headline">
                  첫 7일간 100% 무료
                </span>
              </div>
              <h3 className="text-base font-extrabold text-on-surface font-headline">
                ToonDay PRO 연간 구독
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                연 82,800원 일시불 (월 6,900원 환산)
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-primary font-headline">월 6,900원</div>
              <div className="text-[10px] text-outline line-through font-medium">정가 월 12,900원</div>
            </div>
          </div>

          <div className="mt-3 pt-3 flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
              <span className="text-xs font-medium text-on-surface">
                무제한 생성 + 모션 비디오 내보내기 전체 포함
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                activePlan === 'annual'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-variant text-on-surface-variant opacity-40'
              }`}
              style={
                activePlan === 'annual'
                  ? {
                      background:
                        'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 175, 123) 100%)',
                      color: 'rgb(255, 255, 255)',
                    }
                  : undefined
              }
            >
              <span className="material-symbols-outlined text-[14px]">check</span>
            </div>
          </div>
        </div>

        {/* Monthly Card */}
        <div
          onClick={() => setActivePlan('monthly')}
          className={`relative p-4 rounded-xl transition-all cursor-pointer ${
            activePlan === 'monthly'
              ? 'bg-surface-container-lowest shadow-md ring-2 ring-primary'
              : 'bg-surface-container-low shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant">
                  자유 결제
                </span>
                <span className="text-[11px] font-semibold text-on-surface-variant">
                  언제든 해지 가능
                </span>
              </div>
              <h3 className="text-base font-bold text-on-surface font-headline">
                ToonDay PRO 월간 구독
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">월 단위 자동 갱신 결제</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold text-on-surface font-headline">월 12,900원</div>
              <div className="text-[10px] text-on-surface-variant">월정액</div>
            </div>
          </div>
          <div className="mt-3 pt-3 flex items-center justify-between bg-surface-container-highest px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                check_circle
              </span>
              <span className="text-xs font-medium text-on-surface-variant">
                부담 없이 1개월 단위로 가볍게 이용
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                activePlan === 'monthly'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-variant text-on-surface-variant opacity-40'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">check</span>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Feature Perks & Reviews (2-col in Web mode) */}
      <div
        className={
          isWebMode ? 'px-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mb-6' : ''
        }
      >
      <section className={isWebMode ? 'lg:col-span-7' : 'px-5 mb-6'}>
        <div className="p-4 rounded-xl bg-surface-container-low shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3">
            <div
              className="text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgb(255, 69, 101) 0%, rgb(0, 124, 146) 100%)',
              }}
            >
              Membership Perks
            </div>
            <div className="text-[11px] font-bold text-on-surface-variant">
              Free vs <span className="text-primary font-black">PRO</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {[
              {
                icon: 'bolt',
                title: '무제한 4컷 & 스크롤 웹툰 생성',
                badge: '무제한',
                desc: '무료는 1일 1회 제한 / PRO는 대기열 없는 초고속 렌더',
              },
              {
                icon: 'person_pin',
                fill: true,
                title: '고정 캐릭터 페이스 락 (Face-Lock)',
                badge: '영구 유지',
                desc: '에피소드가 바뀌어도 같은 얼굴, 헤어, 체형을 그대로',
              },
              {
                icon: 'palette',
                fill: true,
                title: '캐릭터 커스텀 프리셋 무제한 저장',
                badge: 'PRO 전용 (20개)',
                desc: '헤어, 의상, 표정, 안경/악세서리 맞춤 프리셋 최대 20개 저장 및 원클릭 적용',
              },
              {
                icon: 'imagesmode',
                title: '프리미엄 작화 스타일 15종 해금',
                badge: '전체 열림',
                desc: '로판, 명랑순정, 수채화, 하이틴 애니 등 독점 필터',
              },
              {
                icon: 'branding_watermark',
                title: '워터마크 제거 & 4K 인쇄 해상도',
                badge: '클린 4K',
                desc: '개인 굿즈 제작, 독립출판, SNS 연재에 최적화',
              },
              {
                icon: 'movie_filter',
                title: '숏폼 릴스용 모션 비디오 추출',
                badge: 'MP4 변환',
                desc: '패널별 줌인 & 자동 사운드가 들어간 세로 쇼츠 생성',
              },
            ].map((perk) => (
              <div key={perk.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-lowest shadow-xs flex items-center justify-center shrink-0 text-primary">
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={perk.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {perk.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-on-surface">{perk.title}</span>
                    <span className="text-[11px] font-black text-primary shrink-0">
                      {perk.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Social Proof Mini Cards */}
      <section className={isWebMode ? 'lg:col-span-5' : 'px-5 mb-6'}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-on-surface">인스타툰 작가들의 실사용 리뷰</span>
            <div className="flex items-center text-tertiary text-[11px] font-bold">
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="ml-0.5">4.9</span>
            </div>
          </div>
          <span className="text-[11px] text-on-surface-variant">누적 120,000+ 생성</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          <div className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-3">
            <img
              className="w-10 h-10 rounded-full object-cover shrink-0"
              alt="@ming_toon"
              referrerPolicy="no-referrer"
              src={TOONDAY_ASSETS.reviewer1}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">인스타툰 @ming_toon</span>
                <div className="flex text-tertiary">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className="material-symbols-outlined text-[12px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                “매일 피드 올리는 게 일이었는데, ToonDay PRO 쓴 뒤로 하루 15분 만에 완결합니다.
                캐릭터 페이스 락 기능이 진짜 사기예요! 팔로워 2만 찍었습니다 😭”
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-3">
            <img
              className="w-10 h-10 rounded-full object-cover shrink-0"
              alt="@haru_cut"
              referrerPolicy="no-referrer"
              src={TOONDAY_ASSETS.reviewer2}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">일상 일기 작가 @haru_cut</span>
                <div className="flex text-tertiary">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className="material-symbols-outlined text-[12px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                “워터마크 없이 인쇄용 4K로 다운받아서 커플 기념일 웹툰북 만들었어요. 일러스트
                퀄리티가 스튜디오 수준입니다.”
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* CTA Area */}
      <section className="px-5">
        <div className="p-4 rounded-xl bg-surface-container-low shadow-sm flex flex-col items-center text-center">
          <button
            type="button"
            onClick={() => {
              if (isPro) {
                onSuccessSubscribe?.('ToonDay PRO 플랜');
              } else {
                setIsPaymentOpen(true);
              }
            }}
            className="w-full py-4 px-6 rounded-xl bg-primary text-on-primary font-headline font-extrabold text-base shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            style={{
              background:
                'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 137, 107) 50%, rgb(255, 176, 133) 100%)',
              color: 'rgb(255, 255, 255)',
              boxShadow: 'rgba(255, 83, 118, 0.4) 0px 8px 24px -4px',
            }}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span>
              {isPro
                ? 'PRO 멤버십 이용 중 · 스튜디오로 이동'
                : activePlan === 'annual'
                  ? '7일 무료 체험 후 시작 (월 6,900원)'
                  : '월간 멤버십 바로 시작 (월 12,900원)'}
            </span>
          </button>

          <p className="text-[11px] text-on-surface-variant mt-2.5 font-medium flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-primary">security</span>
            체험 기간 종료 24시간 전 위약금 없이 언제든 원클릭 해지
          </p>

          <div className="mt-4 pt-3 flex items-center justify-center gap-2 flex-wrap">
            {['카카오페이', '네이버페이', 'Apple Pay', '국내 전 카드 무이자'].map((chip) => (
              <div
                key={chip}
                className="px-2 py-1 rounded bg-surface-container-lowest text-[10px] font-bold text-on-surface shadow-xs"
              >
                {chip}
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-outline">
            <button type="button" onClick={() => setPolicyModal('terms')} className="hover:underline">
              이용약관
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setPolicyModal('privacy')}
              className="hover:underline"
            >
              개인정보처리방침
            </button>
            <span>·</span>
            <button type="button" onClick={() => setPolicyModal('refund')} className="hover:underline">
              구독 및 환불 안내
            </button>
          </div>
        </div>
      </section>

      {/* Policy Detail Sheet Modal */}
      {policyModal && (
        <div
          onClick={() => setPolicyModal(null)}
          className="fixed inset-0 bg-black/55 z-50 flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-surface rounded-t-2xl p-5 pb-7 shadow-2xl space-y-3"
          >
            <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto" />
            <div className="flex items-center justify-between border-b border-surface-container pb-2.5">
              <h3 className="text-sm font-bold text-on-surface">
                {POLICY_DOCS[policyModal].title}
              </h3>
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {POLICY_DOCS[policyModal].body}
            </p>
            <button
              type="button"
              onClick={() => setPolicyModal(null)}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal Sheet */}
      {isPaymentOpen && (
        <div
          onClick={() => setIsPaymentOpen(false)}
          className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center transition-opacity"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-surface rounded-t-2xl p-5 pb-8 shadow-2xl"
          >
            <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-4">
              <h3 className="text-base font-extrabold font-headline text-on-surface">
                결제 수단 선택
              </h3>
              <button
                type="button"
                onClick={() => setIsPaymentOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-primary-fixed/40 border border-primary/20 mb-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span>7일 동안 0원 무료 체험</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {activePlan === 'annual'
                  ? '7일 동안 0원, 이후 연 82,800원(월 6,900원) 결제 • 언제든 위약금 없이 해지 가능'
                  : '월 12,900원 정기결제 • 언제든 위약금 없이 해지 가능'}
              </p>
            </div>

            <div className="space-y-2.5 mb-5">
              {[
                {
                  id: 'kakao' as const,
                  badge: '카카오페이',
                  badgeClass: 'bg-[#FEE500] text-[#191919]',
                  label: '머니/카드 원클릭 간편결제',
                },
                {
                  id: 'naver' as const,
                  badge: '네이버페이',
                  badgeClass: 'bg-[#03C75A] text-white',
                  label: '네이버페이 포인트 최대 3% 적립',
                },
                {
                  id: 'card' as const,
                  icon: 'credit_card',
                  label: 'Apple Pay / 신용·체크카드',
                },
                {
                  id: 'phone' as const,
                  icon: 'phone_iphone',
                  label: '휴대폰 소액결제',
                },
              ].map((m) => {
                const selected = payMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayMethod(m.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all text-left ${
                      selected
                        ? 'bg-surface-container-lowest border-2 border-primary shadow-xs'
                        : 'bg-surface-container-low border border-outline-variant/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-4 h-4 rounded-full bg-surface ${
                          selected ? 'border-4 border-primary' : 'border border-outline'
                        }`}
                      />
                      <div className="flex items-center gap-2">
                        {m.badge ? (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${m.badgeClass}`}>
                            {m.badge}
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px] text-on-surface">
                            {m.icon}
                          </span>
                        )}
                        <span
                          className={`text-xs text-on-surface ${
                            selected ? 'font-bold' : 'font-medium'
                          }`}
                        >
                          {m.label}
                        </span>
                      </div>
                    </div>
                    {selected && (
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mb-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-xs text-on-surface font-semibold">
                  [필수] 정기 결제 및 이용약관 동의
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={confirmSubscription}
              className="w-full py-4 px-6 rounded-xl bg-primary text-on-primary font-headline font-extrabold text-base shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              style={{
                background:
                  'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(255, 137, 107) 50%, rgb(255, 176, 133) 100%)',
                color: 'rgb(255, 255, 255)',
                boxShadow: 'rgba(255, 83, 118, 0.35) 0px 8px 20px -4px',
              }}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock
              </span>
              <span>
                {activePlan === 'annual'
                  ? '0원으로 7일 무료 체험 시작하기'
                  : '월간 PRO 멤버십 시작하기'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
