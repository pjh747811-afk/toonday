export type AppRoute =
  | 'home'
  | 'studio'
  | 'generating'
  | 'viewer'
  | 'library'
  | 'drafts'
  | 'search'
  | 'collection'
  | 'subscription';

export const TOONDAY_ASSETS = {
  logo: 'https://lh3.googleusercontent.com/aida/ALJJyrCbMNJXjyuKTFv4va9fPuy16AIzjrL9Yhms-g3-tIDDN1HXzHIIY-TDa_uFUJOzih8Bb0aZJHIyh9PsvouU6rw8EKS5kVzW3kgDW33hQwIXtKlfjnVw0HhGtkH1H4NtZeYxjK8qfmsc_ZW05be7HOaTboLuEOts5Vj7mT2TLgXHM0V_PzF-UZrIn74RtPEoH-rVY2imk7M5yFdHr3VCbtPgEVxg1AKX8oplaQu_0FID',
  userAvatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDtc9iIdJdJzcbHtXXwQJb27w_pqjDV5yfS60SvcM54LuzM14kwe5TBzaYlsui0b5gP3dn8IDA30jf9bJk1SnptEPM-HEN1sv2iS12YNSUoG8aVlHM5Yme5hMcyEiEYmsHuFaNCrGFHQNFN5XlfjhnF6xGr0StIfFn9VvnB-9Z4auQCryYim_zSQQ6YjzYfjjWLd_eThwhzSbs114Z4qLgkCdYtN7fmhHo5VQJQHDo',
  authorAvatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuChfl6yjqZ4Mq0PqSuf-40TEIQrgJbCVwrs0K6mLJIa6OFjHFCv00xc0tMR0nLZGF9dvp0xXtZvjzTYVAtXM9ifsaL8p8yesCQnkAfl2IwGgJZVh-Dgyn-v82vGu7G3Q9dTda37J65NNzY9hM-0680UjIGbxygZnEOgkvc95i9zWu4dZmX_K_28VZAucRXvtGJrjY5fU5UEDCqdN21kAT0m0X-XQwTlP2icmVHs7R8',
  reviewer1:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBYufwK8Xv64_xdB4ywr-gNZ_I3tAFkKwYtSRMa2UaFmxYf5f6OrhbbY7FHZWMp8A61aZHRYgz3K0gQH_ckFUKo7OJ0K29iMa9K__T3P0440fKN_jVLTqT-hsqWERIvYW2_6wpFT29AV_CeETZ5Spl4gUdM-14wannwT3L8En3kQ36ikWPzdg9cr9jPqJDFXHq0OFBm1qMFsugTdRDIJzYG39-T2_wH-U_bCTeG_n4',
  reviewer2:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDnjp4qyuz3LtSHR51aFARR-HD-qn9MiZjRSJeIpTVz4V47Ur1epotRzGF7rl4e6CSLQn67-bduLeLD5zpLprvMknY6KL3tWewIpGpGwseXJC8mSXMVgtRhEh6HLkzTDlmh_mMIqjoQpQfpwARVCuMB4NFaL-ay8ZyzYSDcwZQijA5768iFWwdXWwsfrfv5rP0FGZVZ5apBbljCojLzSsbjNs4Er84ZhjFxYuE0MA0',
  commentUser2:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDKM87skc7pONVx0LPpVYVFLBwUN9FG2LIF8v9pYWlfRpu9ZodWG7tXCvvkjzp5SXkfpSVmdiAcU20HAfFZml4om6sfybXvUZg3bvngHPwB7Q1XkwrSONtqHSVCrGDFarE1YG-bbHmwxiTIoL9rsWYXuZUxXhLX4Ata8bzUSFNkOMrKOdDoFprU3Is_ii2bkY2W4eWGpzme-1WDylUJ41TRp6iM29QBZEW66C1ujFs',
};

export interface ViewerPanel {
  id: string;
  cutLabel: string;
  timeLabel: string;
  image: string;
  alt: string;
  dialogue: string;
  bubbleAlign: 'right' | 'left';
  dialogueClass?: string;
  sfx?: string;
  sfxColor?: 'error' | 'tertiary' | 'surface';
  showWatermark?: boolean;
}

export interface WebtoonEpisode {
  epNum: number;
  title: string;
  subtitle: string;
  styleName: string;
  author: string;
  likes: string;
  likesNum: number;
  commentsCount: number;
  thumbnail: string;
  panels: ViewerPanel[];
  isProOnly?: boolean;
}

export interface DraftCutItem {
  label: string;
  caption: string;
  image: string | null;
}

export interface DraftItem {
  id: string;
  statusBadge: string;
  statusStyle: string;
  isComplete: boolean;
  updatedAt: string;
  title: string;
  tags: string[];
  step: string;
  memo: string;
  cuts: DraftCutItem[];
}

export interface LibraryWebtoonItem {
  id: string;
  title: string;
  date: string;
  styleLabel: string;
  styleBadgeClass: string;
  likes: number | null;
  isPrivate: boolean;
  episodeId: number;
  image: string;
}

export interface CharacterPresetItem {
  id: string;
  name: string;
  style: string;
  desc: string;
  avatar: string;
}

export const EPISODE_18_PANELS: ViewerPanel[] = [
  {
    id: 'ep18-p1',
    cutLabel: 'CUT #01',
    timeLabel: '08:45 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDAbP5bAtNS--GQxHRNiIfAIK2u7F1jO5ynGEPz-c477SLVnnOSF-a7uxP9sGDYA4-C0ZcVaVZ1QA7cDCUx2_aweP6KmwHM6FoHVp2eFpPmYC_vNDqhES9RI9CZ-VgaMfg8zeJ6AscQ7Ub3TeJyRba0HRcGkRBuaeicHeezw9dI9PGjNTngd8UO0ICMmEDf0b_HczVAi2fWgG0SG4F0zWjnHiOTuuenyMOcCXLUrUM',
    alt: '침대에서 놀라 일어나는 주인공 1컷',
    dialogue: '헉! 벌써 45분이라고?! 😱',
    bubbleAlign: 'right',
    sfx: '따르르릉-!!',
    sfxColor: 'error',
  },
  {
    id: 'ep18-p2',
    cutLabel: 'CUT #02',
    timeLabel: '08:52 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAZgMJze4x17lWSM74UOVbw5WcrtW-T4TYW1WMKDDrTGVXrF5Y2BHz2gYNkzfrvyJCc7lqh9NGMB-0gxTMicJTptlt25BnCGKPe1X5gRu0Nc5nCeFhuKL5mGcYgnHIJepLcGcndSamFxRXWbsbmxekpkCT8WcDpFJk1PM5h4vuoddeyv7FBvbD9XSG8fxID40tDjyuNLimvu7tlMHllZIu_o4m5W5KomdO7mkK9oRo',
    alt: '토스트 물고 계단을 뛰는 2컷',
    dialogue: '이번 열차 놓치면 지각 확정...! 🍞💦',
    bubbleAlign: 'left',
    sfx: '우다다다다!',
    sfxColor: 'tertiary',
  },
  {
    id: 'ep18-p3',
    cutLabel: 'CUT #03',
    timeLabel: '08:59:58 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXW2kZwaQXMUM8UNoqbBCZ6ej-fzK_kGE1l2zD1bMjUdonv3nQdE8agPtJWM_c__EaOgFoMYWkb9u8jVxH5-j_sjoCNuWBWFZIAUFyoLUWq6hillBX8XDisdFvhvmJqLIl8yfwrmiIRl7mZ7q7Bfe_DCZnQJs0SFEDWSN6LPyaavCk94m_8uyDRQfeVPj7BoQeWr3rT2T50YC5oEclkw_F75RM4TbFy-wQv5FNxmc',
    alt: '지하철 스크린도어 슬라이딩 3컷',
    dialogue: '제발 문 닫히지 마라아아아! 🔥⚡️',
    bubbleAlign: 'right',
    dialogueClass: 'font-extrabold text-error',
    sfx: '슈우우웅- 쾅!',
    sfxColor: 'surface',
  },
  {
    id: 'ep18-p4',
    cutLabel: 'CUT #04 · 완결',
    timeLabel: '09:00 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC3OKZIzRpzTpHoJSwtan7ODtLJiKckLDmSrGPXb-FBKwK7Id5zIe5oWsXE_WRR6jrgPLa4xdIxXPGmVn-LzMFyi60ZFYlqtmRSErenPsZTPxMRY7fFoCcV8I3AdoKAAo-dl9nmIlecyHfzZ2T__4On3PLez51cMWVA9Ok0CKFXjbezupUmLS8jietiUYRKrXDX2tH7S9XthL1N86bLyjMCzeubiCMghWt-KbvEG2U',
    alt: '지하철 좌석에 안도하며 앉은 4컷',
    dialogue: '후... 오늘 운은 여기서 다 썼네 ㅎㅎ ✌️😌',
    bubbleAlign: 'left',
    showWatermark: true,
  },
];

export const EPISODE_17_PANELS: ViewerPanel[] = [
  {
    id: 'ep17-p1',
    cutLabel: 'CUT #01',
    timeLabel: '10:15 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDAetqK5j-ZXDlLIQ0rc8_S1p7341DxKRaK2kdfyt41SgfxR1Dt2qgYwbEStZvvZCo8w4MjbNX5wBnSrjfYoQPZVPtc7_Hc_jTtd-PGZSSu10UWZQxkynvJUsK9zh1CHBXMWdYdGzURkrP6ymaJGYqwoDSc3TUsOHnn6F9OqusreFWIfLnpCXDZFO1ZQ9sd0MHE6sqtKtEIrFIMBOzlKX4JjExsTdCnNCqEMbqWM1Q',
    alt: '주말 홈베이킹 재료 준비 1컷',
    dialogue: '오늘은 인스타 감성 수플레 팬케이크에 도전한다! 🥞',
    bubbleAlign: 'left',
    sfx: '두근두근-',
    sfxColor: 'tertiary',
  },
  {
    id: 'ep17-p2',
    cutLabel: 'CUT #02',
    timeLabel: '10:30 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDaAtojzuPdhYxqrCbQBVFhmd6wZ1OcJWcKLz1jaGxkt57XW8opuvfBOZt0p_Ev8R2WCYAre4b1P3tHkZ6zx0JsJnzxw7f--miUPp2F5B_k1KVAQhQO5W44CAQGAVUlcTLjyUMw9CouKzVpSZGBms5QJ8cWFtmJHRyNn49S6T7WW16dE5VfzI-_Gl_zpB6bwCRW5FAULSFaKOT7w-iUNIC0jfd08xY76lh9079UyOI',
    alt: '폭신한 머랭 거품 성공 2컷',
    dialogue: '오오! 머랭이 구름처럼 몽글몽글해졌어 ✨',
    bubbleAlign: 'right',
    sfx: '휘이잉~',
    sfxColor: 'surface',
  },
  {
    id: 'ep17-p3',
    cutLabel: 'CUT #03',
    timeLabel: '10:42 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAJkEpbVB8KhnyByUtO2haEvAmYBc9FgKYtF0k7ikKEo4MaB6QAAZ66w2_DTjlsfMazsg_fg468LGB4U1vvgPVjCYrlY3a1rgYnRFE7hGp_d-rxTRHI165LNnbCkygnKfjxrEuIz8pEIxzrCei3a0jc1LmljQzWpxFzP9zGHXZ1Q2ZTaGmGi5OiHUn1685vvKV5sB9tkRrWvJbwkRx06Dbn7F7ejD9FlvwlQnYlpgs',
    alt: '프라이팬에 타버린 팬케이크 3컷',
    dialogue: '잠깐 릴스 보고 온 사이에... 이게 무슨 일이야?! 🔥😱',
    bubbleAlign: 'right',
    dialogueClass: 'font-extrabold text-error',
    sfx: '치이익-!!',
    sfxColor: 'error',
  },
  {
    id: 'ep17-p4',
    cutLabel: 'CUT #04 · 완결',
    timeLabel: '10:55 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB9wOxt4UZcKTk601nwtclgD_PNIjNBQYa2DPd3EP7s944AIeo23Ee8EcDEIdzm9ycSova4sc8om1pfWpsXBdmpiXLbTivAQ8htu4PsLnqNgDaerycPW3qS7iztD7U3dg8VXnm0YQhnoBF5KTVMTXtcj4Ec20u5UsXF4j-dc8F0gShZeE9b7jks2_iSJMvIOypXcOedTwGumb1P7UtD42-qMz5FClxkjoxe_78bzGw',
    alt: '버터와 메이플 시럽으로 힐링 4컷',
    dialogue: '타버린 팬케이크도 버터랑 시럽 듬뿍이면 천국행! 🍯☕',
    bubbleAlign: 'left',
    showWatermark: true,
  },
];

export const EPISODE_1_PANELS: ViewerPanel[] = [
  {
    id: 'ep1-p1',
    cutLabel: 'CUT #01',
    timeLabel: '07:30 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAUwpWJtP0fr9Cua8Jo5Y_XvLLRNKMKQlsShY8YVGMtaqWWN8zNavvBSfOojTpL7obl3UDRu5d8F1RC1m4mBkxgWd_FeCDiAkgfzgXfiucPKVU0fjEHCpeTwL6BU_cUh_uVLLW7es2X8nYW_xyGjxxSIK4-UkuozGGm56IGs31jpwP6e0lkgMhPTvIWEtXAJhK_DKeRfqjGITGoGl-RGJl475Z_Qp8IVrz_iIGe54k',
    alt: '첫 출근 아침 거울 앞에서 정장 체크',
    dialogue: '드디어 오늘이 첫 출근...! 떨려서 잠도 못 잤네 ☕✨',
    bubbleAlign: 'left',
    sfx: '두근두근',
    sfxColor: 'tertiary',
  },
  {
    id: 'ep1-p2',
    cutLabel: 'CUT #02',
    timeLabel: '08:15 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAoBstQF8ZpD94RpRvwMbgAk8BIHirP7LoUMIDvtkcG8jvK5yLIyywfuT3jyU8ekn7D8DQOUH9otcUwnVvySw-09RWsqRQlp7q_OTzo_HQiWTXsvDJeRhBJFwQUFk9Bi2psQiI20PJdIw1zfmUqpO1Z0arSJuOpcbI4FXIwDpqfbMKqBYAyYs9SHQNGoH6BEAoqWVULzQUcJ5iMnkB-lYnUOhn09-uswA4JGUbyAwA',
    alt: '모닝 아아메 한 잔 테이크아웃',
    dialogue: '신입사원 필수템 아이스 아메리카노 장착 완료!',
    bubbleAlign: 'right',
    sfx: '딸랑-',
    sfxColor: 'surface',
  },
  {
    id: 'ep1-p3',
    cutLabel: 'CUT #03',
    timeLabel: '08:50 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDksLIeFGtixT2x3uyVmssalWagzAXQq31A5bwMNhfpFUpd1voSLdDbrDh6JnEks2XTrrnEE-8iqJzOaNVks98CLwMAtDq9XsQG7zm6494Ba1t0KAPYJNT45HpPDKBxduREjpQukN_yswgYMB5H0WuhwaSpYTyV4ukZxupSvvvEszTOEWrwYHUp4QPTwm-t6HUzAU3DGiLQNKVUeaY81BPmhKuw18kZSme9o2m1YPw',
    alt: '사원증 받고 긴장한 모습',
    dialogue: '안녕하세요! 오늘 입사한 서연입니다! 잘 부탁드립니다!! 🙇‍♀️',
    bubbleAlign: 'left',
    sfx: '빠직-',
    sfxColor: 'error',
  },
  {
    id: 'ep1-p4',
    cutLabel: 'CUT #04 · 완결',
    timeLabel: '06:05 PM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDr4aq1Kvr8gJxNPlbQDT3fOzVoxk1iiJM7VW6KNZSJ7BqUguaANMkFhlechxZkA_6MXj4zSe3xs5BTbxYn5Ax_w-wGEEfnQFspCy7EChz2nEUfWojhoocC_05WjDbqlKzBEcR2LaZoCrUEKWwC2T7Lwy4QJZ1hStXeb8giqNp8uvWjv8I5hHD3kOxRA2E2-zin6WrvdExsVfEkZxbACeRKoyJdMxumJGjPzF_eV94',
    alt: '첫 퇴근길 뿌듯한 미소',
    dialogue: '첫날 무사 완주 성공! 내일도 파이팅이야 💪🌙',
    bubbleAlign: 'right',
    showWatermark: true,
  },
];

export const EPISODE_19_PANELS: ViewerPanel[] = [
  {
    id: 'ep19-p1',
    cutLabel: 'CUT #01 · PRO',
    timeLabel: '06:20 PM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCWJwdHJc_nqTuHRZH4v6kfasvS7zVDENa4IQEagjOAOYiwFLHKMH6RG60uB4C3sosCypTM7ux1JHgkDF2Jv1F-0-OW_Y6D1oyJycz4DcXlaqNMjaZXtxa_ekNqA1DkqXT-uHrY3i6auQwgkkgN0roixXCPJZkRlLA7KT32Cs5VxJ_ZNN7e86bcvfMJ0SrXFYC3mmVnYgGqwah3bcEfYt0Y84rCj0jSwgZ0zVQ0ew8',
    alt: '비 오는 날 야근 후 정류장 앞',
    dialogue: '하필 우산 안 가져온 날만 골라서 폭우 실화냐고... ☔😱',
    bubbleAlign: 'right',
    sfx: '쏴아아아-',
    sfxColor: 'error',
  },
  {
    id: 'ep19-p2',
    cutLabel: 'CUT #02 · PRO',
    timeLabel: '06:25 PM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCiZLJsCgmrC_kSatmwoDxBWoQcJWvRfG8UQpVu24YTmlbH2w9QQDtxT0uSIlPfuXhYlR_ND8oU_hPavRYw8GGBQ3myFgnR7fMd6jzfS5QuPeAUadxTzq6qs2jpd8FU0Mq5JCl8-d2ybi_ZpCjKEuHPAVF5pi168fWXYHKT_Ku0B-gb0Y8LySP_SPiLbvp2PUylD68qLC_SUdp6IByHmotpxGCpqnefFKyz9YA2r1M',
    alt: '버스 놓치고 좌절하다가 우산 챙겨온 동료 발견',
    dialogue: '저기 멀리서 달려오는 402번 버스... 기다려어억! 🚌💨',
    bubbleAlign: 'left',
    sfx: '첨벙첨벙!',
    sfxColor: 'tertiary',
  },
  {
    id: 'ep19-p3',
    cutLabel: 'CUT #03 · PRO',
    timeLabel: '06:40 PM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDoJqPNkiM-IH3A8KdEztw68YZpqFMrsHL2CwO90r-BY0qkNLWlm6bNXwlnVowzhUwFvzKpwuv1h935gYzCmnRK9Tv-mWT8dy7Bz-WJadogYsQGvt27XxP-gkDVjGFo9t80zLexsvRuXGSahX2OlPrfpqdkbche9pEOEujqJ1JSBIjihcsLZT45iAa1WzjEZaetCCa60qZldIzCP0rVcamieq54MOy341IOBkuAol8',
    alt: '편의점 앞에서 따뜻한 어묵과 맥주 발견',
    dialogue: '에라 모르겠다! 편의점 따끈한 어묵 국물로 긴급 힐링 🍢',
    bubbleAlign: 'right',
    sfx: '후루룩~',
    sfxColor: 'surface',
  },
  {
    id: 'ep19-p4',
    cutLabel: 'CUT #04 · PRO 완결',
    timeLabel: '07:10 PM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSzpdfik0IMk5MGqi7tJm17Vv7bVcge2CfoMNmGOBjtaIqCb7g0W2ZppzQ2EZ3CedCBc15Prrhfn3IZhFRczG4TnVEDfOs-NKzpTb-F2-B9r7Wo17md8JDvAoptbKmGLavZUxJcBD2TOG0fYPYPGaLjfywz9PhtcrV-p-N6Iiyh1OCsnxt-iBqscOQfFNvNPHt5opn-4aSKeJcZub5dSFoqOyOuLfHwVkVbSPuOxo',
    alt: '빗소리 들으며 집에서 쉬는 4컷',
    dialogue: '오늘도 무사 귀가 완료! 비 오는 밤엔 역시 집이 최고야 ✨',
    bubbleAlign: 'left',
    showWatermark: false,
  },
];

export const EPISODE_DATA: Record<number, WebtoonEpisode> = {
  19: {
    epNum: 19,
    title: '비 오는 날 깜짝 야근과 버스 놓친 썰 ☔',
    subtitle: 'PRO 선공개 · 4컷 완결',
    styleName: '명랑 인스타툰 (PRO 에디션)',
    author: '@seoyeon_toon',
    likes: '2,180',
    likesNum: 2180,
    commentsCount: 41,
    isProOnly: true,
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCWJwdHJc_nqTuHRZH4v6kfasvS7zVDENa4IQEagjOAOYiwFLHKMH6RG60uB4C3sosCypTM7ux1JHgkDF2Jv1F-0-OW_Y6D1oyJycz4DcXlaqNMjaZXtxa_ekNqA1DkqXT-uHrY3i6auQwgkkgN0roixXCPJZkRlLA7KT32Cs5VxJ_ZNN7e86bcvfMJ0SrXFYC3mmVnYgGqwah3bcEfYt0Y84rCj0jSwgZ0zVQ0ew8',
    panels: EPISODE_19_PANELS,
  },
  18: {
    epNum: 18,
    title: '월요일 아침의 기적: 지하철 세이프 대작전',
    subtitle: '오늘의 일상툰 · 4컷 완결',
    styleName: '명랑 인스타툰 (파스텔 팝)',
    author: '@ming_toon',
    likes: '1,420',
    likesNum: 1420,
    commentsCount: 28,
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDRVKwCEZMkWtXi4g_h0HeISHiIXdzLIXrQ4a6KQA-NGce5RgVAqBrSffzqqBXJWFDur8a6vwEnv4YwPwBeRFCnl0mwPepgs2vK0J9YQiQV9tmmW9sN6TBQP-osimEkvFAxeMKrukRpOkQHw74OVeBQQZbodcejuzsFvdQaDBMSVt2KUj8aDHoQOZIn397n3NvoP-fqMQja1NCn_UTygdq6FOu6JUxB1xyRqUzhuuU',
    panels: EPISODE_18_PANELS,
  },
  17: {
    epNum: 17,
    title: '주말 홈카페와 소소한 홈베이킹의 낭만',
    subtitle: '주말 힐링툰 · 4컷 완결',
    styleName: '감성 수채화 일기',
    author: '@seoyeon_toon',
    likes: '980',
    likesNum: 980,
    commentsCount: 15,
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB9wOxt4UZcKTk601nwtclgD_PNIjNBQYa2DPd3EP7s944AIeo23Ee8EcDEIdzm9ycSova4sc8om1pfWpsXBdmpiXLbTivAQ8htu4PsLnqNgDaerycPW3qS7iztD7U3dg8VXnm0YQhnoBF5KTVMTXtcj4Ec20u5UsXF4j-dc8F0gShZeE9b7jks2_iSJMvIOypXcOedTwGumb1P7UtD42-qMz5FClxkjoxe_78bzGw',
    panels: EPISODE_17_PANELS,
  },
  1: {
    epNum: 1,
    title: '두근두근 신입사원의 첫 출근길 ☕',
    subtitle: '시리즈 1화 · 4컷 완결',
    styleName: '명랑 인스타툰 (파스텔 팝)',
    author: '@seoyeon_toon',
    likes: '3,190',
    likesNum: 3190,
    commentsCount: 64,
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAUwpWJtP0fr9Cua8Jo5Y_XvLLRNKMKQlsShY8YVGMtaqWWN8zNavvBSfOojTpL7obl3UDRu5d8F1RC1m4mBkxgWd_FeCDiAkgfzgXfiucPKVU0fjEHCpeTwL6BU_cUh_uVLLW7es2X8nYW_xyGjxxSIK4-UkuozGGm56IGs31jpwP6e0lkgMhPTvIWEtXAJhK_DKeRfqjGITGoGl-RGJl475Z_Qp8IVrz_iIGe54k',
    panels: EPISODE_1_PANELS,
  },
};

export const INITIAL_CHARACTER_PRESETS: CharacterPresetItem[] = [
  {
    id: 'ch-seoyeon',
    name: '서연 (본캐 · 직장인)',
    style: '명랑 인스타툰 페이스락 ON',
    desc: '라벤더 후드티 · 웨이브 단발 · 아메리카노 소품 고정',
    avatar: TOONDAY_ASSETS.authorAvatar,
  },
  {
    id: 'ch-cheese',
    name: '치즈냥 (반려묘)',
    style: '90s 하이틴 애니 고정',
    desc: '통통한 치즈태비 고양이 · 핑크 목걸이',
    avatar: TOONDAY_ASSETS.reviewer1,
  },
  {
    id: 'ch-manager',
    name: '부장님 (서브 캐릭터)',
    style: '명랑 인스타툰',
    desc: '안경 & 사원증 · 회식 좋아하는 유쾌한 상사',
    avatar: TOONDAY_ASSETS.reviewer2,
  },
  {
    id: 'ch-dahee',
    name: '다희 (찐친 동료)',
    style: '반짝 순정만화',
    desc: '단발 포니테일 · 맛집 정보통 베스트 프렌드',
    avatar: TOONDAY_ASSETS.userAvatar,
  },
];

export const HOME_TOP_RANKING = [
  {
    rank: 1,
    rankGradient: 'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(254, 210, 164) 100%)',
    badgeText: '4컷 완결',
    badgeClass: 'bg-surface-container-lowest/90 backdrop-blur text-primary',
    views: '8.2만',
    title: '월요일 아침 8시 45분 지각 대작전',
    authorInitial: 'M',
    authorColor: 'bg-secondary-container text-primary',
    author: '@ming_toon',
    likes: '1.4만',
    category: '직장인 공감',
    episodeId: 18,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDSCACuAsC33TryfMS1QeHUEx9Ma_tpP740M1K8GwAeuCJ6m3wPkgvIWS0a5HUVvYLZGOpk8_OpAsxAdstSEEys2mscEwdlaWjUbEqw5cvgEWYr-cYJgOyyw74Wcv8gdRvZ8O2PoAPvURK-VnSjgZi4SHEsUZ-3uQCa8DqPwdoGNb6WQ93NM9QHGbbJLYGSe7-B0L4E02TfMly8x1UM4oUg7LB27kNxFn5o1a5r0OI',
  },
  {
    rank: 2,
    rankGradient: 'linear-gradient(135deg, rgb(254, 210, 164) 0%, rgb(65, 157, 182) 100%)',
    badgeText: '직장인 1위',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    views: '5.4만',
    title: '퇴근 10분 전 회의 소집 실화?',
    authorInitial: 'O',
    authorColor: 'bg-primary-fixed text-primary',
    author: '@off_work',
    likes: '9.8천',
    category: '직장인 공감',
    episodeId: 18,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDksLIeFGtixT2x3uyVmssalWagzAXQq31A5bwMNhfpFUpd1voSLdDbrDh6JnEks2XTrrnEE-8iqJzOaNVks98CLwMAtDq9XsQG7zm6494Ba1t0KAPYJNT45HpPDKBxduREjpQukN_yswgYMB5H0WuhwaSpYTyV4ukZxupSvvvEszTOEWrwYHUp4QPTwm-t6HUzAU3DGiLQNKVUeaY81BPmhKuw18kZSme9o2m1YPw',
  },
  {
    rank: 3,
    rankGradient: 'linear-gradient(135deg, rgb(134, 239, 172) 0%, rgb(56, 189, 248) 100%)',
    badgeText: '펫툰',
    badgeClass: 'bg-surface-container-lowest/90 backdrop-blur text-primary',
    views: '4.9만',
    title: '강아지가 내 과제를 먹어버렸다',
    authorInitial: 'C',
    authorColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
    author: '@choco_paw',
    likes: '8.5천',
    category: '반려동물',
    episodeId: 17,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD-ymPDmlura6fkPRjNVCCioLAu6am3O0CVjIBX-DhxbCgHaGS2e1XwWgwBXWhIhiOrwdjqHuK8INPL_yySymYdxSw1UT5godhLkov6B36v6Oos3qUICfEYNyV9rC4dwD0b6d2lOeu42dGWwasBzPtYLDVYecJoadpAlimldmDCBugCeEZ1gbQAL8n1Ap4qJKz_flNE_WslxHumn0Yqpt4UGnYYRD6TvS65rQBpOPY',
  },
];

export const HOME_STYLE_PRESETS = [
  {
    key: 'insta',
    tag: '공감툰 최적',
    title: '명랑 인스타툰',
    desc: '일상의 소소한 재미를 담아내요',
    btnGradient: 'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(254, 210, 164) 100%)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAG6AphcRZrM7vRIaPkulI8SycYBWiJu9xIq0FP3G5vknBe-Isc5FFPa9ndwanZVibwYsMLcNr5-sDwYUdeBcB1XlmeLE3KdAcvVxQV7rOMk1Ldfke1pUBonTTRaJ_WPulmOtgBEO2FdGcgJ8akmY04m5xHVstZ3EpNx0gga3fY8xpmUgAdkupCKHb65Xx91d8fjLSm_cIlp5d1SiTVnCCr1-Wwu5kZDPjoGxPYQfs',
  },
  {
    key: 'romance',
    tag: '로맨스 추천',
    title: '반짝 순정만화',
    desc: '설레는 감정과 눈빛을 연출해요',
    btnGradient: 'linear-gradient(135deg, rgb(255, 83, 118) 0%, rgb(123, 210, 237) 100%)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDl_TBTis31x80reEyGc0C5jZzj9AQlpNUE3FE5iEOEjNSc8dFRQHcG8vDnYias9o0HKSJfQn93pUPQdsMdjUJ3ztczD0h_K86KFyGvVTOcn1bBrQoBbUWQURZoJgkw9eRBvGQXRgHCMNqPiqfCCG0KnuhhfGfHXPyXvjvbj-J65Pr6bTNqWn3XlQR16YqOkuWld3YSspSWU0GJ9k6qCST571QN9-9J52bcLKk65PE',
  },
  {
    key: 'retro',
    tag: '레트로 감성',
    title: '90s 하이틴 애니',
    desc: '그 시절 빈티지 청춘 애니 감성',
    btnGradient: 'linear-gradient(135deg, rgb(254, 210, 164) 0%, rgb(56, 189, 248) 100%)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC60MXMEYI4CJ0QueeTJhjjN20dGwAr1bLR1z-pQt-iC0uPqtUmKOiWn4uXdJw7JojM0WDEvSJputgBvVzn9fZE4aH7caZ5RPtj_eaL1OOMgY0FF8QnqP4yXZ-dfKAKCyvbxh7ErHhp-CqPihOYUp334_AYEnpXkdTSXQ2v7HZWaFP9YuiqIvb_DBVTKkpSOtmmlui7STprsAhLkDpOYDg1XY8az1Li1oek-NWeqxU',
  },
  {
    key: 'watercolor',
    tag: '힐링 일기',
    title: '감성 수채화 일기',
    desc: '물기 어린 붓터치와 따뜻한 온기',
    btnGradient: 'linear-gradient(135deg, rgb(134, 239, 172) 0%, rgb(56, 189, 248) 100%)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCr7_3rbH0uqwhqIDOu9HAmv8pVz6QBt6yVJA2ZZM7RjpAh2hW3z2dXGLDrl4MLVmKUwm-_BWtfac5pWvyqL7SMcHelJb3qaQFDYEjSzxUkYZw_qRGfKegfBYEHOCuyXNXOM-dskn63mNtT1GLFDNowtU4E1NrdsokdHt1NrP6V6ksMYMSCMIOQvZdJ6eVljH5UKPDMQq4HBjQGbnytUnDx2FjOgdKqy0wdXMhV8XI',
  },
];

export const COMMUNITY_BEST_CUTS = [
  {
    id: 'com-1',
    cutCount: '2컷',
    title: '아아메 없으면 하루 시작 불가 ☕️',
    authorInitial: '수',
    avatarBg: 'bg-secondary-container text-on-secondary-container',
    author: '수달작가',
    likes: '324',
    comments: '42',
    category: '직장인 공감',
    episodeId: 18,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAoBstQF8ZpD94RpRvwMbgAk8BIHirP7LoUMIDvtkcG8jvK5yLIyywfuT3jyU8ekn7D8DQOUH9otcUwnVvySw-09RWsqRQlp7q_OTzo_HQiWTXsvDJeRhBJFwQUFk9Bi2psQiI20PJdIw1zfmUqpO1Z0arSJuOpcbI4FXIwDpqfbMKqBYAyYs9SHQNGoH6BEAoqWVULzQUcJ5iMnkB-lYnUOhn09-uswA4JGUbyAwA',
  },
  {
    id: 'com-2',
    cutCount: '4컷',
    title: '키보드는 왜 고양이 침대인가',
    authorInitial: '냥',
    avatarBg: 'bg-primary-fixed text-primary',
    author: '냥집사',
    likes: '892',
    comments: '95',
    category: '반려동물',
    episodeId: 17,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDBe1nLocnsaoYVY9FEpwQX2FxuqVrUltGHIlyXTUTjbZ3zsfFyuK5ttpELWRKl5tphtTCFPI4R5m8yCuXHXJY5zabZFGdlnsWccBUt1BhckuNWzDLK-v9ACqieBk0Q-s2dpsOyVR_vi537uuFMmXLpgMqq_Mj-TSf1ZlhdyXYrAmFc9whB7Gbqgt2sTc_EVwOIeoC8aj4rG8Z_nFFCORin6tPzWCuClceSoCrb2Is',
  },
  {
    id: 'com-3',
    cutCount: '1컷',
    title: '새벽 1시 냉장고 앞 나의 모습 🍕',
    authorInitial: '야',
    avatarBg: 'bg-tertiary-container text-on-tertiary-container',
    author: '야식요정',
    likes: '516',
    comments: '38',
    category: '자취/일상',
    episodeId: 17,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDEkgPA3YHdd6WoQxdN49kst8FHiArtGRrQp1g7ai0lynaGf2iYKo6lQCNbpWa8JoZslBeQFA-mt4lGkZvHxtZd_XAaR95lCpTrvfLTQrwx8YCy0ycpLByqdBlqRBYCAyZsNkUyyog0255xEOrCU320xNN_Z5d6cTWdG56Fc3n5lXEQq1W1q84TDYvCG3ZzlkEBpj20_Ra2PuXlv1r8ft9N8_PsRSMVGi_MzgoXNJY',
  },
  {
    id: 'com-4',
    cutCount: '4컷',
    title: '비 오는 날 우산 씌워준 선배 ☔️',
    authorInitial: '달',
    avatarBg: 'bg-secondary-fixed text-on-secondary-fixed',
    author: '달콤한밤',
    likes: '1.2천',
    comments: '144',
    category: '연애/로맨스',
    episodeId: 18,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCiZLJsCgmrC_kSatmwoDxBWoQcJWvRfG8UQpVu24YTmlbH2w9QQDtxT0uSIlPfuXhYlR_ND8oU_hPavRYw8GGBQ3myFgnR7fMd6jzfS5QuPeAUadxTzq6qs2jpd8FU0Mq5JCl8-d2ybi_ZpCjKEuHPAVF5pi168fWXYHKT_Ku0B-gb0Y8LySP_SPiLbvp2PUylD68qLC_SUdp6IByHmotpxGCpqnefFKyz9YA2r1M',
  },
];

export const STUDIO_STYLES = [
  {
    key: 'insta',
    badge: '인기 PICK',
    badgeClass: 'bg-primary text-on-primary',
    badgeStyle: {
      background: 'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166))',
      color: 'white',
    },
    title: '명랑 인스타툰',
    desc: '파스텔톤 귀여운 일상체',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAGPZd10hii18TduQ0ucSPD3y8mzF6v56F4LOdmVL0w7eN9uVSD_ASm9_ptsTqTcq2IYCwXL0jRsH453g3J-koE9rzsS5a7LMVuQ7mHfcYK4dkW2hnIIPv1K7cTu2qjKTDW7rI39EevrjWqIMrYEocGtY-g1FfxGu6yjnNoqYEQGBXNN9h76WfUOLZdD82pW7b_h8BsQGhQWbvMtZXjujfLxC9hJsj4P80xkz8uOFA',
  },
  {
    key: 'romance',
    badge: '로판 무드',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    title: '순정 로맨스툰',
    desc: '화려한 반짝임 웹소설풍',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ_Znieb2aiGHtMgG5u1lR1REEAWoOsAmUuKpXfDgo4a-E4YosQl7gnRd4zXgrKyBb7X7olktSLgrzO5J39h3ioH984W5TQTyRBUzHotuMsWMocD-e4O64LxxdbqpXC1YnWOKBa813EMhwVh2sx7P00HSdJ86_ZVgD3IgIgGoOiONPdm8iu8gSVNvlU0BxJPwKBWnd5cqgi7qCSdtsGpCOOSbSA8bxfv-L5B5ELXU',
  },
  {
    key: 'action',
    badge: 'HOT',
    badgeClass: 'bg-error text-on-error',
    title: '소년 액션/판타지툰',
    desc: '강렬한 이펙트 & 다이내믹 펜선',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASFyi2Mjq4zb_FlEjw8Yp8AEPj36XEFWrxR2q1D1fII-mhcj5jDjLgKMopgZ9nrE0cfI_mjmo7LntKQlfta3OstqqiPXPmkOLSPtRo11-yWV3CVrlaNEe1mw1oJxpR_aPTnbcfqmJqwbOYHUDC3VQamdBy9ZpVvjVIu5kafmwblMSncc981khJyS7Kdti_FzXMR2TiC1m5NtBXjVZKDvEBIRTnKejB5my7isidoy8',
  },
  {
    key: 'watercolor',
    badge: '힐링 감성',
    badgeClass: 'bg-tertiary text-on-tertiary',
    title: '감성 수채화/힐링툰',
    desc: '따뜻한 몽글몽글 파스텔 무드',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzgzZk9PBLVKQnETVHD163EcaqpH6g70QCIcITOzycG46yF3sut0w8jcZOnJ29pwTaxJ4uswoeW7okYVZPrvcijFlCgYzYv4GQXikdu6EZdb7fRoJ5UQz2Yv0ALBvKhZqc1-jPtcpQB7scPeVE9IdhsJ0ppZIMXbwiHcXRUJTv-6BDlP2qCd2q63DFE8nthiDwAzW4FM1qmbhIQxcfa6HMooWaB-Y3daoBPqiCgpU',
  },
  {
    key: 'flat',
    badge: 'NEW',
    badgeClass: 'bg-primary-container text-on-primary',
    title: '모던 미니멀/플랫툰',
    desc: '깔끔한 라인 & 이모티콘 감성',
    image:
      'https://lh3.googleusercontent.com/aida/ALJJyrCbMNJXjyuKTFv4va9fPuy16AIzjrL9Yhms-g3-tIDDN1HXzHIIY-TDa_uFUJOzih8Bb0aZJHIyh9PsvouU6rw8EKS5kVzW3kgDW33hQwIXtKlfjnVw0HhGtkH1H4NtZeYxjK8qfmsc_ZW05be7HOaTboLuEOts5Vj7mT2TLgXHM0V_PzF-UZrIn74RtPEoH-rVY2imk7M5yFdHr3VCbtPgEVxg1AKX8oplaQu_0FID',
  },
  {
    key: 'retro',
    badge: '90s 레트로',
    badgeClass: 'bg-inverse-surface text-inverse-on-surface',
    title: '레트로 90s 순정만화',
    desc: '빈티지 아날로그 스크린톤',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBsYfaPoJFcIcyNVvjiLWlY-QGFJCvWCCHYxCoVkTAkKXRdUjHV_02yd_hmg_TKzqAw95wv33Y5VjvjvjSDbPwUdjyAcKTjXZukpwP4QZh9Uo_2bvd_zytscHhlGrssZrxgYCjiLgLEcyAme6oyhR3AgGKmLdRU51g3lzIqr1ZVctIgkeBvU7bKuafT07LfJ26lu1Dc-t-GnxPnfHFiYcCfEnX4LB-A2lLGE9xpIvc',
  },
];

export const LIBRARY_WEBTOONS: LibraryWebtoonItem[] = [
  {
    id: 'lib-1',
    title: '월요일 아침의 기적: 지하철 세이프',
    date: '2024.11.18 · 공개',
    styleLabel: '명랑 인스타툰',
    styleBadgeClass: 'bg-primary/85 text-on-primary',
    likes: 142,
    isPrivate: false,
    episodeId: 18,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCimOts9BeL7nte8M6i0Lm_vLi_DKla1ymFn7HDmeiQKCNGa-fPUMKgxAt4bNoK0HWOV0E0isdrsNZeAztr1-UdbQM4dFI9e6Rq9sNMm7ktCeYO3onMtE4_q6CJxeICH_gLwSwQN3fmDrnMurnvRBgtqdD4561pnx42CN2Jw1DAitDUs46hJ-xGh5HJ4spasmHPgdk5XtlxH7eFljpZd6gxNwV5DDO7nKnL5kRbXfw',
  },
  {
    id: 'lib-2',
    title: '주말 홈카페와 크로플의 비극',
    date: '2024.11.16 · 나만보기',
    styleLabel: '감성 수채화',
    styleBadgeClass: 'bg-secondary/85 text-on-secondary',
    likes: null,
    isPrivate: true,
    episodeId: 17,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBcOANAHWfB90JfNL8ZTKGjtnryQBOvytUbmmPbFkC_vp1xEEcvGWzQRDgK8CJI3K3rwZQfI2IXaFdfnc_BQnMObNealityHUgAcSG2E8q1hx6hBAOkAgIYy3siyok_c7FkIxc3QNUAov0HbbBl9Av3XxNUUOVANkwZW5_2BITuGm_TH0lzn7VZeNR7rLeQGmxcYCPVNpoXNloFy2fC2WBZHGL94B6RgP5V-RI8i_w',
  },
  {
    id: 'lib-3',
    title: '야근 중 마주친 편의점 야옹이',
    date: '2024.11.14 · 공개',
    styleLabel: '90s 하이틴',
    styleBadgeClass: 'bg-tertiary-container/90 text-on-tertiary-container',
    likes: 388,
    isPrivate: false,
    episodeId: 18,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSzpdfik0IMk5MGqi7tJm17Vv7bVcge2CfoMNmGOBjtaIqCb7g0W2ZppzQ2EZ3CedCBc15Prrhfn3IZhFRczG4TnVEDfOs-NKzpTb-F2-B9r7Wo17md8JDvAoptbKmGLavZUxJcBD2TOG0fYPYPGaLjfywz9PhtcrV-p-N6Iiyh1OCsnxt-iBqscOQfFNvNPHt5opn-4aSKeJcZub5dSFoqOyOuLfHwVkVbSPuOxo',
  },
  {
    id: 'lib-4',
    title: '첫눈 오는 날 붕어빵 3천원어치',
    date: '2024.11.11 · 공개',
    styleLabel: '반짝 순정',
    styleBadgeClass: 'bg-primary-container/85 text-on-primary-container',
    likes: 512,
    isPrivate: false,
    episodeId: 17,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB2xAoLaryyAFkXcwpM_2y41SstxL73jgR_P-gE3FtNuhmCo_3mMldiUiYIq7POj0owtOzdFQax2gA9dtzMfODTv3X8WChPu95LzATIefyteo1CMAYog3I60jED_zpkzGV3poJEFSxCjCrPVhC3CAQ941tTL703NqSbLC8HMnu9tQnSzSMbA1OVlZkiQ-QVEC1nf30Mdv22VzJnDzEJgXEjRFESiD5UM4zwR5nQRLc',
  },
];

export const DRAFTS_LIST: DraftItem[] = [
  {
    id: 'draft-1',
    statusBadge: '콘티 3/4컷 작성 중',
    statusStyle: 'bg-secondary-container text-on-secondary-container',
    isComplete: false,
    updatedAt: '2시간 전 수정',
    title: '야근 후 편의점 맥주 한캔의 힐링',
    tags: ['#90s 하이틴 애니', '#4컷 세로 스크롤', '일상·힐링'],
    step: 'Step 4: 컷별 콘티 미리보기 & 연출 메모',
    memo: '“오늘 진짜 역대급 야근하고 나오는데 찬 바람 불어서 편의점에서 최애 맥주 사서 마심... 꿀꺽 한 모금에 하루 피로가 싹 날아가는 컷으로 엔딩!”',
    cuts: [
      {
        label: '1컷',
        caption: '퇴근길 엘베',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDr4aq1Kvr8gJxNPlbQDT3fOzVoxk1iiJM7VW6KNZSJ7BqUguaANMkFhlechxZkA_6MXj4zSe3xs5BTbxYn5Ax_w-wGEEfnQFspCy7EChz2nEUfWojhoocC_05WjDbqlKzBEcR2LaZoCrUEKWwC2T7Lwy4QJZ1hStXeb8giqNp8uvWjv8I5hHD3kOxRA2E2-zin6WrvdExsVfEkZxbACeRKoyJdMxumJGjPzF_eV94',
      },
      {
        label: '2컷',
        caption: '편의점 불빛',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDNTxX1kyeqQw55J08BJys-BRo5SYJYkptjXU-j_1fnM78-5e0abbfbTqrwttGO0kQVBp61FXmXU-FGD7KbzonzHAey1YFYoW9eUktLncEzhOk2YoaqJFdFdUrG451kWnM55f_v72BrMcGMU12w9oriyLnkZfsUh2XK8AN9kD6lw-kVdpiIrmqDk4te_kw7YW8FUOdkRIrfVqqadWiRdQD1OL3Jwi6-Kt0WFZV0kNs',
      },
      {
        label: '3컷',
        caption: '시원한 맥주',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDoJqPNkiM-IH3A8KdEztw68YZpqFMrsHL2CwO90r-BY0qkNLWlm6bNXwlnVowzhUwFvzKpwuv1h935gYzCmnRK9Tv-mWT8dy7Bz-WJadogYsQGvt27XxP-gkDVjGFo9t80zLexsvRuXGSahX2OlPrfpqdkbche9pEOEujqJ1JSBIjihcsLZT45iAa1WzjEZaetCCa60qZldIzCP0rVcamieq54MOy341IOBkuAol8',
      },
      {
        label: '4컷',
        caption: '미작성',
        image: null,
      },
    ],
  },
  {
    id: 'draft-2',
    statusBadge: '콘티 4/4컷 완성 (생성 대기)',
    statusStyle: 'bg-tertiary-fixed text-on-tertiary-fixed',
    isComplete: true,
    updatedAt: '어제 수정',
    title: '주말 브런치 팬케이크 대참사',
    tags: ['#감성 수채화 일기', '#정사각형 피드', '요리·코믹'],
    step: '콘티 4컷 전체 검토',
    memo: '“유튜브 보고 따라한 수플레 팬케이크가 프라이팬에 눌어붙어 납작 만두가 되어버렸다... 그래도 메이플 시럽 뿌려 먹으니 꿀맛!”',
    cuts: [
      {
        label: '1컷',
        caption: '레시피 정독',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDAetqK5j-ZXDlLIQ0rc8_S1p7341DxKRaK2kdfyt41SgfxR1Dt2qgYwbEStZvvZCo8w4MjbNX5wBnSrjfYoQPZVPtc7_Hc_jTtd-PGZSSu10UWZQxkynvJUsK9zh1CHBXMWdYdGzURkrP6ymaJGYqwoDSc3TUsOHnn6F9OqusreFWIfLnpCXDZFO1ZQ9sd0MHE6sqtKtEIrFIMBOzlKX4JjExsTdCnNCqEMbqWM1Q',
      },
      {
        label: '2컷',
        caption: '머랭 대성공',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDaAtojzuPdhYxqrCbQBVFhmd6wZ1OcJWcKLz1jaGxkt57XW8opuvfBOZt0p_Ev8R2WCYAre4b1P3tHkZ6zx0JsJnzxw7f--miUPp2F5B_k1KVAQhQO5W44CAQGAVUlcTLjyUMw9CouKzVpSZGBms5QJ8cWFtmJHRyNn49S6T7WW16dE5VfzI-_Gl_zpB6bwCRW5FAULSFaKOT7w-iUNIC0jfd08xY76lh9079UyOI',
      },
      {
        label: '3컷',
        caption: '프라이팬 연기',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAJkEpbVB8KhnyByUtO2haEvAmYBc9FgKYtF0k7ikKEo4MaB6QAAZ66w2_DTjlsfMazsg_fg468LGB4U1vvgPVjCYrlY3a1rgYnRFE7hGp_d-rxTRHI165LNnbCkygnKfjxrEuIz8pEIxzrCei3a0jc1LmljQzWpxFzP9zGHXZ1Q2ZTaGmGi5OiHUn1685vvKV5sB9tkRrWvJbwkRx06Dbn7F7ejD9FlvwlQnYlpgs',
      },
      {
        label: '4컷',
        caption: '납작만두 탄생',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDriaZU_g-4XIRGQM28LC3a5xZefEIBViBXYiZNo6Htw7h0-7qU0XddFfl4rK0omas4guxLEUrZE8VXP8OdalGFGE0sUEP6HY_z844Pcep0y1MbSfn4jqrrsfzRExTwuBRXhSjRd0KBeLaNiF2DcyPC_9qKc1mQDH95Fa16c2KH87N7IsvvfqndlP1vQ1S-sUoSKBvpwye-si6Wfzhfba-HLU6NIreVRVriWzdJ-f4',
      },
    ],
  },
];

export const SEARCH_CARDS = [
  {
    id: 's1',
    title: '월요일 아침 8시 45분 지각 대작전',
    author: '@ming_toon',
    badgeTop: '4컷 완결',
    badgeTopStyle: {
      background: 'linear-gradient(135deg, rgb(255, 83, 118), rgb(255, 170, 166))',
      color: 'rgb(255, 255, 255)',
    },
    tagRight: '인기 1위',
    tagRightStyle: { background: 'rgb(255, 229, 232)', color: 'rgb(255, 51, 102)' },
    views: '8.2만',
    viewsNum: 82000,
    likes: '1.4만',
    likesNum: 14000,
    recentRank: 2,
    episodeId: 18,
    tags: ['#직장인공감', '#지각대작전'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD-0TWP9LljxzIsC9t_83tJN2o31nvs2gAZbe4lLGnC6Zoli0PN-RW4b6lZTzBPA3eUY87y1kIwpHDvU-rU5-szC1qp10pNAqi2Ym-1P0JCmpQpZ6mH6pyaGRZgERHjzisj1o-4SyJon86mYaE82xJeEKIiLrsaVhXw8FphL66Ze9PS9Q0VocuPMyJk9XTwfAAE5ciAo-DpNu98Ax9KM_CBnMMBgDZ7Eav26WTn5MQ',
  },
  {
    id: 's2',
    title: '출근길 지하철 2호선 생존기',
    author: '@subway_life',
    badgeTop: '4컷 완결',
    badgeTopStyle: {
      background: 'linear-gradient(135deg, rgb(124, 219, 197), rgb(186, 242, 187))',
      color: 'rgb(4, 79, 64)',
    },
    tagRight: '공감폭발',
    views: '5.4만',
    viewsNum: 54000,
    likes: '9,200',
    likesNum: 9200,
    recentRank: 1,
    episodeId: 18,
    tags: ['#직장인공감', '#지각대작전', '#소소한멘붕'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADoTLGlw622wqdhqWU9qCoO8CaI88g5mzOC7JiCkDuKPzaoKNOr4XeSZ62bzq643f8FEijmhExjm2Dn9waN4Suh7gdy9mYdL4ZAK5Zbo-IhMka4wAXhCaUst_M9wgvvs4ghMh9nstWp_wzw1-H7EsJK_rRXUL9G2T0naf5wZBpMlSk-HOMraQK-Cgl7sByaEb-YWG7FR8XyOvFBnpxF49YGnGXyrmDujxJ5YRES9M',
  },
  {
    id: 's3',
    title: '월요병을 이기는 아이스 아메리카노',
    author: '@coffee_fairy',
    badgeTop: '2컷 짧툰',
    badgeTopStyle: {
      background: 'linear-gradient(135deg, rgb(255, 211, 165), rgb(255, 170, 166))',
      color: 'rgb(109, 46, 11)',
    },
    tagRight: '힐링',
    views: '3.1만',
    viewsNum: 31000,
    likes: '5,100',
    likesNum: 5100,
    recentRank: 4,
    episodeId: 17,
    tags: ['#맛집탐방', '#순정로맨스'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD_Zt0ghv5YJftarLZlWJatqyLCKvv4EtY6aK1xhcmXXCI6XT-AqucNJJZl2XMOqE9YFXfdcL_JUYkNf2loVrCBOdFDu8LvTA-jVgpjmaGo515fJO8XGKVcIq2BN9emSF9Xub9piGIOYt2gv0OjXffxVZ4Kin4-vNt1x5JRcDp5k73z6bqfVNriuw3iAFaYTsIKluhmLjEr-6R2qWBeOTibfUoVIOlHAV6v2MNKNGw',
  },
  {
    id: 's4',
    title: '알람 5개 맞추고 일어난 사람의 최후',
    author: '@sleepy_bear',
    badgeTop: '4컷 완결',
    badgeTopStyle: {
      background: 'linear-gradient(135deg, rgb(141, 228, 255), rgb(186, 242, 187))',
      color: 'rgb(0, 77, 99)',
    },
    tagRight: '현실밀착',
    views: '6.8만',
    viewsNum: 68000,
    likes: '1.1만',
    likesNum: 11000,
    recentRank: 3,
    episodeId: 1,
    tags: ['#소소한멘붕', '#반려묘일상'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBeRjURB2YraTWDqTDeHeR43vxkeOFeXK82uZW3VaU1ESFLkFYZ-YP3vrDk0wwpuPXmpE2RMOBNWzM0XP0jFOusBSEP4of7oL1XNiuobpwu0rHOAy87LC8tPZB-6fMH5LdXIqPq9YRZ7CYUw5T-FUf84CIqqo-Sx5o4P5YBC_c2Kc6g_OMbf-oHtXm5hx1fu7QjAxRv7U-Lzuwz8V3tXe-Ahu6bwoNb1kSSwGqw2ZE',
  },
];

export const SEARCH_CREATORS = [
  {
    id: 'c1',
    initial: 'M',
    avatarBg: 'bg-secondary-container text-on-secondary-container',
    name: '밍툰 (@ming_toon)',
    specialty: '직장공감 4컷 전문',
    followers: '2.4만',
    latestTitle: '월요일 아침 8시 45분 지각 대작전',
    episodeId: 18,
  },
  {
    id: 'c2',
    initial: 'S',
    avatarBg: 'bg-tertiary-fixed text-on-tertiary-fixed',
    name: '지하철생존기 (@subway_life)',
    specialty: '2호선 일러스트레이터',
    followers: '1.8만',
    latestTitle: '출근길 지하철 2호선 생존기',
    episodeId: 18,
  },
  {
    id: 'c3',
    initial: '서',
    avatarBg: 'bg-primary-fixed text-primary',
    name: '서연 일상툰 (@seoyeon_toon)',
    specialty: '주말 홈카페 & 자취 힐링툰',
    followers: '1.2만',
    latestTitle: '주말 홈카페와 소소한 홈베이킹의 낭만',
    episodeId: 17,
  },
];

export const SEARCH_STYLE_SPOTLIGHT_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDekEcVrbvZ-OoE0sTde-jrzs3sgSlbg5-FLoJt3D7EA9RVaZlOHIX7EMiJCeQs7ohfViFWELCl90F4Fj6DqJuOHdPDroM6np5vG34ikBd8AaUpdKW0T6yGy5pmOSiVul1Do46NmAA1ogu6VzC3MepDSe_rgnROy7m_hEqXdiTvR8t9KOKg-JMaEAufCzM4uOwGGY8fWghTQgb5hXLmT_OBGpuWk5iTSmkEt9etU5M';

export const GEN_CUT1_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCeYvXrqrEeZzHLeXPDcK90Wd3utuamt8E36HSYbTiOHecPi5HIIFxUXj2_ZwkyBp5zHbuemJ7WDTcyRPwP1yUKeU8DPit3WMUpz8E2X60jG2Gv0CamBvYfVXibZax4wqlQY1gd4_C9IyW7yTMHOP5WbxKsTS_dT0XCN7VYTEwsXR3_ekTKYQgLzxSfxw7yCtXtWBmj2au8M_llTJSpBCIJFgsOJSIT2wIYvj0fW48';

export const VIEWER_EP1_THUMB =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAUwpWJtP0fr9Cua8Jo5Y_XvLLRNKMKQlsShY8YVGMtaqWWN8zNavvBSfOojTpL7obl3UDRu5d8F1RC1m4mBkxgWd_FeCDiAkgfzgXfiucPKVU0fjEHCpeTwL6BU_cUh_uVLLW7es2X8nYW_xyGjxxSIK4-UkuozGGm56IGs31jpwP6e0lkgMhPTvIWEtXAJhK_DKeRfqjGITGoGl-RGJl475Z_Qp8IVrz_iIGe54k';

export const VIEWER_EP19_THUMB =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCWJwdHJc_nqTuHRZH4v6kfasvS7zVDENa4IQEagjOAOYiwFLHKMH6RG60uB4C3sosCypTM7ux1JHgkDF2Jv1F-0-OW_Y6D1oyJycz4DcXlaqNMjaZXtxa_ekNqA1DkqXT-uHrY3i6auQwgkkgN0roixXCPJZkRlLA7KT32Cs5VxJ_ZNN7e86bcvfMJ0SrXFYC3mmVnYgGqwah3bcEfYt0Y84rCj0jSwgZ0zVQ0ew8';
