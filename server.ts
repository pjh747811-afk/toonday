import 'dotenv/config';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import fs from 'fs/promises';
import http from 'http';
import path from 'path';
import { fileURLToPath, URL } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { Modality, type LiveServerMessage, type Session } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PUBLISH_STORE_PATH = path.resolve(__dirname, '.toonday-instagram-records.json');

interface ServerInstagramRecord {
  episodeId: number;
  title: string;
  postId: string;
  postedAt: string;
  caption: string;
  imageUrl: string;
}

let instagramRecordsCache: Record<string, ServerInstagramRecord> | null = null;

async function readInstagramRecords(): Promise<Record<string, ServerInstagramRecord>> {
  if (instagramRecordsCache) return instagramRecordsCache;
  try {
    const raw = await fs.readFile(PUBLISH_STORE_PATH, 'utf-8');
    instagramRecordsCache = JSON.parse(raw) as Record<string, ServerInstagramRecord>;
  } catch {
    instagramRecordsCache = {};
  }
  return instagramRecordsCache;
}

async function writeInstagramRecords(records: Record<string, ServerInstagramRecord>) {
  instagramRecordsCache = records;
  try {
    await fs.writeFile(PUBLISH_STORE_PATH, JSON.stringify(records, null, 2), 'utf-8');
  } catch {
    // ignore read-only disk environments gracefully
  }
}

function isPublicHttpUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return false;
    return true;
  } catch {
    return false;
  }
}

async function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  const { GoogleGenAI, Type } = await import('@google/genai');
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return { ai, Type };
}

async function getGeminiLiveClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return { ai };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/studio/generate', async (req: Request, res: Response) => {
    try {
      const { prompt, tone, panelCount } = req.body as {
        prompt?: string;
        tone?: string;
        panelCount?: number;
      };

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        res.status(400).json({ error: '스토리보드를 생성할 장면 설명을 입력해주세요.' });
        return;
      }

      const gemini = await getGeminiClient();
      if (!gemini) {
        res.status(503).json({
          error: 'GEMINI_API_KEY가 Settings > Secrets에 설정되어 있지 않습니다.',
        });
        return;
      }
      const { ai, Type } = gemini;

      const count = Math.min(Math.max(Number(panelCount) || 3, 1), 5);
      const selectedTone = tone || '파스텔 트와일라잇 & 코랄';

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `다음 장면 아이디어를 바탕으로 세로 스크롤 웹툰 ${count}컷 콘티를 한국어로 작성해주세요: "${prompt.trim()}". 비주얼 및 감정 톤: "${selectedTone}". 각 컷이 자연스럽게 이어지도록 카메라 구도, 시각적 연출, 짧은 내레이션, 생동감 있는 캐릭터 대사를 작성해주세요.`,
        config: {
          systemInstruction:
            '당신은 수석 웹툰 콘티 디렉터이자 스토리 작가입니다. 모든 출력(제목, 장면 묘사, 내레이션, 화자, 대사)을 자연스럽고 감성적인 한국어 웹툰 톤으로 작성하세요.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              episodeTitle: {
                type: Type.STRING,
                description: 'Concise episode or scene title.',
              },
              panels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    shotType: {
                      type: Type.STRING,
                      description: 'Camera framing such as Wide Establishing, Close-Up Portrait, Over-the-Shoulder, or Sky Pan.',
                    },
                    sceneDescription: {
                      type: Type.STRING,
                      description: 'Concise visual direction for the panel artwork.',
                    },
                    narration: {
                      type: Type.STRING,
                      description: 'Optional short poetic narration box text, or empty string if none.',
                    },
                    speaker: {
                      type: Type.STRING,
                      description: 'Character name speaking in this panel.',
                    },
                    dialogue: {
                      type: Type.STRING,
                      description: 'Crisp spoken line for the speech bubble.',
                    },
                    sfx: {
                      type: Type.STRING,
                      description: 'Short comic sound effect like 두근, 팔랑, or 반짝, or empty string.',
                    },
                    auraColor: {
                      type: Type.STRING,
                      description: 'One of: coral, peach, mint, cyan.',
                    },
                    artworkKey: {
                      type: Type.STRING,
                      description: 'One of: cafe, rooftop, studio, starlight, horizon, alchemy, tempo.',
                    },
                  },
                },
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : '스토리보드 생성에 실패했습니다.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/studio/animate', async (req: Request, res: Response) => {
    try {
      const { imageDataUrl, prompt, aspectRatio } = req.body as {
        imageDataUrl?: string;
        prompt?: string;
        aspectRatio?: string;
      };

      if (!imageDataUrl || typeof imageDataUrl !== 'string') {
        res.status(400).json({ error: '영상으로 변환할 이미지를 업로드해주세요.' });
        return;
      }

      const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!match) {
        res.status(400).json({ error: '올바른 이미지 데이터 형식(PNG/JPEG/WebP)이 아닙니다.' });
        return;
      }

      const mimeType = match[1];
      const base64ImageBytes = match[2];
      const validAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
      const motionPrompt =
        prompt && prompt.trim()
          ? prompt.trim()
          : 'Smooth subtle cinematic camera motion, gentle wind and glowing pastel atmosphere.';

      const gemini = await getGeminiClient();
      if (!gemini) {
        res.status(503).json({
          error:
            'GEMINI_API_KEY가 Settings > Secrets에 설정되어 있지 않습니다. 이미지-영상 변환(gemini-omni-1.2-flash)에는 결제 계정이 연결된 API 키가 필요합니다.',
        });
        return;
      }
      const { ai } = gemini;

      const interaction = await ai.interactions.create(
        {
          model: 'gemini-omni-1.2-flash',
          input: [
            {
              type: 'image',
              mime_type: mimeType,
              data: base64ImageBytes,
            },
            {
              type: 'text',
              text: motionPrompt,
            },
          ],
          background: false,
          store: false,
          stream: false,
          response_format: {
            type: 'video',
            aspect_ratio: validAspectRatio,
          },
        },
        { timeout: 300000 }
      );

      let videoData = interaction.output_video?.data;
      let videoMime = interaction.output_video?.mime_type || 'video/mp4';
      let videoUri = interaction.output_video?.uri;

      if (!videoData && !videoUri && Array.isArray(interaction.steps)) {
        for (const step of interaction.steps) {
          if (step.type === 'model_output' && Array.isArray(step.content)) {
            const vid = step.content.find((c) => c.type === 'video');
            if (vid && 'data' in vid && vid.data) {
              videoData = vid.data;
              videoMime = ('mime_type' in vid && vid.mime_type) || 'video/mp4';
              break;
            }
            if (vid && 'uri' in vid && vid.uri) {
              videoUri = vid.uri;
              videoMime = ('mime_type' in vid && vid.mime_type) || 'video/mp4';
              break;
            }
          }
        }
      }

      if (videoData) {
        res.json({
          videoUrl: `data:${videoMime};base64,${videoData}`,
          mimeType: videoMime,
          aspectRatio: validAspectRatio,
        });
        return;
      }

      if (videoUri) {
        res.json({
          videoUrl: videoUri,
          mimeType: videoMime,
          aspectRatio: validAspectRatio,
        });
        return;
      }

      res.status(502).json({ error: '생성된 영상 데이터를 받지 못했습니다.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : '영상 생성 중 오류가 발생했습니다.';
      const lower = message.toLowerCase();
      if (lower.includes('403') || lower.includes('permission') || lower.includes('billing') || lower.includes('quota') || lower.includes('429')) {
        res.status(402).json({
          error:
            'gemini-omni-1.2-flash 영상 생성 모델은 유료(결제 활성화) API 키가 필요합니다. Settings > Secrets에서 유료 API 키를 설정한 뒤 다시 시도해주세요.',
        });
        return;
      }
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/reader/translate', async (req: Request, res: Response) => {
    try {
      const { targetLanguage, episodeTitle, panels } = req.body as {
        targetLanguage?: string;
        episodeTitle?: string;
        panels?: Array<{
          id: string;
          narration?: string;
          sfx?: string;
          bubbles: Array<{ id: string; speaker: string; text: string }>;
        }>;
      };

      if (!targetLanguage || !Array.isArray(panels)) {
        res.status(400).json({ error: 'targetLanguage and panels array are required.' });
        return;
      }

      const gemini = await getGeminiClient();
      if (!gemini) {
        res.status(503).json({
          error: 'GEMINI_API_KEY가 Settings > Secrets에 설정되어 있지 않습니다.',
        });
        return;
      }
      const { ai, Type } = gemini;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Translate this webtoon episode ("${episodeTitle || 'Episode'}") naturally into ${targetLanguage}, preserving comic tone, character voice, and concise speech bubble length.\n\nInput JSON:\n${JSON.stringify(panels)}`,
        config: {
          systemInstruction:
            'You are a professional webtoon localization translator. Return natural, idiomatic dialogue suitable for speech bubbles while keeping exact panel and bubble IDs intact.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedTitle: { type: Type.STRING },
              panels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    narration: { type: Type.STRING },
                    sfx: { type: Type.STRING },
                    bubbles: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          speaker: { type: Type.STRING },
                          text: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : '번역에 실패했습니다.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/music/generate', async (req: Request, res: Response) => {
    try {
      const {
        prompt,
        episodeTitle,
        styleName,
        mood,
        modelMode,
        imageDataUrl,
      } = req.body as {
        prompt?: string;
        episodeTitle?: string;
        styleName?: string;
        mood?: string;
        modelMode?: 'clip' | 'pro';
        imageDataUrl?: string;
      };

      const cleanPrompt = (prompt || '').trim();
      const cleanTitle = (episodeTitle || '').trim();

      if (!cleanPrompt && !cleanTitle) {
        res.status(400).json({ error: '음악을 생성할 웹툰 내용이나 에피소드 제목을 입력해주세요.' });
        return;
      }

      const gemini = await getGeminiLiveClient();
      if (!gemini) {
        res.status(503).json({
          error: 'GEMINI_API_KEY가 Settings > Secrets에 설정되어 있지 않습니다.',
        });
        return;
      }
      const { ai } = gemini;

      const selectedModel =
        modelMode === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

      const selectedMood = mood && mood !== 'AI 자동 추천' ? mood : '스토리 분위기에 자연스럽게 어울리는 감성적인 사운드트랙';
      const musicDirection = [
        `Create an original background soundtrack (BGM) tailored to a Korean webtoon episode.`,
        cleanTitle ? `Episode title: "${cleanTitle}".` : '',
        styleName ? `Webtoon art & visual tone: ${styleName}.` : '',
        `Musical mood & genre preference: ${selectedMood}.`,
        cleanPrompt ? `Webtoon scenes and dialogue context: ${cleanPrompt}` : '',
        `Compose cohesive instrumentation, clear melody, and polished dynamics matching the emotional arc of the comic panels.`,
      ]
        .filter(Boolean)
        .join('\n');

      const parts: Array<
        | { text: string }
        | { inlineData: { data: string; mimeType: string } }
      > = [{ text: musicDirection }];

      if (imageDataUrl && typeof imageDataUrl === 'string') {
        const imgMatch = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (imgMatch) {
          parts.push({
            inlineData: {
              mimeType: imgMatch[1],
              data: imgMatch[2],
            },
          });
        }
      }

      const stream = await ai.models.generateContentStream({
        model: selectedModel,
        contents: [{ parts }],
      });

      const audioChunks: Buffer[] = [];
      const textParts: string[] = [];
      let mimeType = 'audio/mpeg';

      for await (const chunk of stream) {
        const candidateParts = chunk.candidates?.[0]?.content?.parts ?? [];
        for (const part of candidateParts) {
          if (part.inlineData?.data) {
            if (part.inlineData.mimeType && mimeType === 'audio/mpeg') {
              mimeType = part.inlineData.mimeType;
            }
            audioChunks.push(Buffer.from(part.inlineData.data, 'base64'));
          } else if (part.text) {
            textParts.push(part.text);
          }
        }
      }

      if (audioChunks.length === 0) {
        res.status(502).json({
          error: 'AI 음악 오디오 데이터를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.',
        });
        return;
      }

      const audioBase64 = Buffer.concat(audioChunks).toString('base64');
      res.json({
        audioDataUrl: `data:${mimeType};base64,${audioBase64}`,
        mimeType,
        lyrics: textParts.join('').trim(),
        model: selectedModel,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI 음악 생성 중 오류가 발생했습니다.';
      const lower = message.toLowerCase();
      if (
        lower.includes('402') ||
        lower.includes('403') ||
        lower.includes('429') ||
        lower.includes('permission') ||
        lower.includes('billing') ||
        lower.includes('paid') ||
        lower.includes('quota')
      ) {
        res.status(402).json({
          error:
            'Lyria 음악 생성 모델(lyria-3-clip-preview / lyria-3-pro-preview)은 유료(결제 활성화) API 키가 필요하거나 현재 무료 API 키 한도를 초과했습니다. Settings > Secrets에 유료 API 키를 설정하면 바로 작곡할 수 있습니다.',
        });
        return;
      }
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/instagram/status', async (_req: Request, res: Response) => {
    const records = await readInstagramRecords();
    const webhookUrl = (process.env.N8N_INSTAGRAM_WEBHOOK_URL || '').trim();
    const webhookSecret = (process.env.N8N_WEBHOOK_SECRET || '').trim();
    const defaultImage = (process.env.DEFAULT_INSTAGRAM_IMAGE_URL || '').trim();

    res.json({
      ok: true,
      webhookConfigured: isPublicHttpUrl(webhookUrl),
      secretConfigured: Boolean(webhookSecret),
      defaultImageConfigured: isPublicHttpUrl(defaultImage),
      records,
    });
  });

  app.post('/api/instagram/publish', async (req: Request, res: Response) => {
    try {
      const {
        episodeId,
        title,
        caption,
        imageUrl,
        tags,
      } = req.body as {
        episodeId?: number;
        title?: string;
        caption?: string;
        imageUrl?: string;
        tags?: string[];
      };

      const epNum = Number(episodeId);
      const cleanTitle = (title || '').trim();
      const cleanCaption = (caption || '').trim();

      if (!Number.isFinite(epNum) || !cleanTitle) {
        res.status(400).json({ error: '게시할 웹툰 에피소드 번호와 제목이 필요합니다.' });
        return;
      }

      const records = await readInstagramRecords();
      const existing = records[String(epNum)];
      if (existing) {
        res.status(409).json({
          error: '이미 인스타그램에 게시된 웹툰입니다.',
          postId: existing.postId,
          postedAt: existing.postedAt,
        });
        return;
      }

      const envDefaultImage = (process.env.DEFAULT_INSTAGRAM_IMAGE_URL || '').trim();
      const candidateImage = isPublicHttpUrl(imageUrl)
        ? (imageUrl as string).trim()
        : isPublicHttpUrl(envDefaultImage)
          ? envDefaultImage
          : '';

      if (!candidateImage) {
        res.status(400).json({
          error:
            '인스타그램 Graph API는 공개 HTTP(S) 이미지 URL만 받을 수 있습니다. Settings > Secrets에 DEFAULT_INSTAGRAM_IMAGE_URL을 설정하거나 공개 이미지 주소를 입력해주세요.',
        });
        return;
      }

      const webhookUrl = (process.env.N8N_INSTAGRAM_WEBHOOK_URL || '').trim();
      if (!isPublicHttpUrl(webhookUrl)) {
        res.status(503).json({
          error:
            'N8N_INSTAGRAM_WEBHOOK_URL이 서버 환경변수(Settings > Secrets)에 설정되어 있지 않습니다. n8n 연동 가이드에서 5노드 워크플로 JSON을 받아 Publish한 뒤 Webhook URL을 설정해주세요.',
          needsSetup: true,
        });
        return;
      }

      const tagList = Array.isArray(tags) && tags.length > 0 ? tags : ['ToonDay', '인스타툰', '일상툰'];
      const formattedTags = tagList
        .map((t) => (t.startsWith('#') ? t : `#${t.replace(/\s+/g, '')}`))
        .join(' ');
      const finalCaption = cleanCaption.includes('#ToonDay')
        ? cleanCaption
        : `${cleanTitle}\n\n${cleanCaption || '오늘의 하루를 4컷 AI 웹툰으로 기록했어요.'}\n\n${formattedTags}`;

      const webhookSecret = (process.env.N8N_WEBHOOK_SECRET || '').trim();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (webhookSecret) {
        headers['x-toonday-secret'] = webhookSecret;
        headers['x-ieoga-secret'] = webhookSecret;
      }

      const n8nResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          image_url: candidateImage,
          caption: finalCaption,
          episode_id: epNum,
          title: cleanTitle,
          source: 'toonday-app',
        }),
        signal: AbortSignal.timeout(60000),
      });

      const responseText = await n8nResponse.text();
      let parsedBody: Record<string, unknown> = {};
      try {
        parsedBody = JSON.parse(responseText) as Record<string, unknown>;
      } catch {
        // non-JSON response
      }

      if (!n8nResponse.ok) {
        const errMsg =
          (typeof parsedBody.message === 'string' && parsedBody.message) ||
          (typeof parsedBody.error === 'string' && parsedBody.error) ||
          `n8n Webhook 호출 실패 (HTTP ${n8nResponse.status})`;
        res.status(502).json({ error: errMsg });
        return;
      }

      const postId =
        String(parsedBody.id || parsedBody.postId || parsedBody.instagram_post_id || '').trim() ||
        `ig_${Date.now()}`;
      const postedAt = new Date().toISOString();

      const nextRecord: ServerInstagramRecord = {
        episodeId: epNum,
        title: cleanTitle,
        postId,
        postedAt,
        caption: finalCaption,
        imageUrl: candidateImage,
      };
      records[String(epNum)] = nextRecord;
      await writeInstagramRecords(records);

      res.json({
        ok: true,
        id: postId,
        postId,
        postedAt,
        caption: finalCaption,
        imageUrl: candidateImage,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '인스타그램 자동 게시 요청 중 오류가 발생했습니다.';
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/n8n/workflow-template', (_req: Request, res: Response) => {
    const workflow = {
      name: 'ToonDay_인스타_자동_게시',
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'toonday-instagram',
            authentication: 'headerAuth',
            responseMode: 'responseNode',
            options: {},
          },
          id: 'webhook-trigger',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 2,
          position: [240, 300],
          webhookId: 'toonday-instagram',
        },
        {
          parameters: {
            assignments: {
              assignments: [
                {
                  id: 'field-image-url',
                  name: 'image_url',
                  value: '={{ $json.body.image_url }}',
                  type: 'string',
                },
                {
                  id: 'field-caption',
                  name: 'caption',
                  value: '={{ $json.body.caption }}',
                  type: 'string',
                },
              ],
            },
            options: {},
          },
          id: 'edit-fields',
          name: 'Edit Fields',
          type: 'n8n-nodes-base.set',
          typeVersion: 3.4,
          position: [480, 300],
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://graph.facebook.com/{{ $vars.IG_ID || "YOUR_17_DIGIT_IG_ID" }}/media',
            authentication: 'genericCredentialType',
            genericAuthType: 'httpBearerAuth',
            sendBody: true,
            specifyBody: 'json',
            jsonBody:
              '={\n  "image_url": "{{ $json.image_url }}",\n  "caption": "{{ $json.caption }}"\n}',
            options: {},
          },
          id: 'ig-media-container',
          name: 'Instagram Media Container',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.2,
          position: [720, 300],
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://graph.facebook.com/{{ $vars.IG_ID || "YOUR_17_DIGIT_IG_ID" }}/media_publish',
            authentication: 'genericCredentialType',
            genericAuthType: 'httpBearerAuth',
            sendBody: true,
            specifyBody: 'json',
            jsonBody: '={\n  "creation_id": "{{ $json.id }}"\n}',
            options: {},
          },
          id: 'ig-media-publish',
          name: 'Instagram Media Publish',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.2,
          position: [960, 300],
        },
        {
          parameters: {
            respondWith: 'firstIncomingItem',
            options: {},
          },
          id: 'respond-webhook',
          name: 'Respond to Webhook',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1.1,
          position: [1200, 300],
        },
      ],
      connections: {
        Webhook: {
          main: [[{ node: 'Edit Fields', type: 'main', index: 0 }]],
        },
        'Edit Fields': {
          main: [[{ node: 'Instagram Media Container', type: 'main', index: 0 }]],
        },
        'Instagram Media Container': {
          main: [[{ node: 'Instagram Media Publish', type: 'main', index: 0 }]],
        },
        'Instagram Media Publish': {
          main: [[{ node: 'Respond to Webhook', type: 'main', index: 0 }]],
        },
      },
      settings: {
        timezone: 'Asia/Seoul',
      },
    };
    res.setHeader('Content-Disposition', 'attachment; filename="toonday-instagram-workflow.json"');
    res.json(workflow);
  });

  app.get('/api/n8n/supabase-migration', (_req: Request, res: Response) => {
    const sql = `-- ToonDay: 인스타그램 자동 게시 기록 칼럼 & RLS 수정 권한 규칙
ALTER TABLE public.contents
  ADD COLUMN IF NOT EXISTS instagram_post_id text,
  ADD COLUMN IF NOT EXISTS instagram_posted_at timestamptz;

DROP POLICY IF EXISTS "내 작품만 수정 가능" ON public.contents;
CREATE POLICY "내 작품만 수정 가능"
  ON public.contents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(sql);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vitePromise = import('vite').then(({ createServer: createViteServer }) =>
      createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      })
    );
    app.use((req: Request, res: Response, next: NextFunction) => {
      vitePromise
        .then((vite) => vite.middlewares(req, res, next))
        .catch(next);
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    try {
      const reqUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
      if (reqUrl.pathname === '/api/live') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    } catch {
      socket.destroy();
    }
  });

  wss.on('connection', async (clientWs: WebSocket, request: http.IncomingMessage) => {
    const reqUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const requestedVoice = reqUrl.searchParams.get('voice') || 'Kore';
    const allowedVoices = new Set(['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr']);
    const voiceName = allowedVoices.has(requestedVoice) ? requestedVoice : 'Kore';

    const sendJson = (payload: Record<string, unknown>) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    const gemini = await getGeminiLiveClient();
    if (!gemini) {
      sendJson({
        type: 'error',
        error: 'GEMINI_API_KEY가 Settings > Secrets에 설정되어 있지 않습니다.',
      });
      clientWs.close(1011, 'Missing API key');
      return;
    }

    const { ai } = gemini;
    let closed = false;
    let liveSession: Session | null = null;
    const pendingInputs: Array<
      | { type: 'audio'; data: string }
      | { type: 'text'; text: string }
    > = [];

    const sessionPromise = ai.live
      .connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction:
            '당신은 일상 AI 웹툰 플랫폼 ToonDay의 따뜻하고 센스 있는 웹툰 스토리 코치입니다. 사용자와 자연스러운 한국어 음성 대화를 나누며 오늘 있었던 일이나 웹툰 아이디어를 4컷 구성(기·승·전·결)으로 재미있게 다듬어 주세요. 실시간 음성 대화이므로 답변은 2~3문장 이내로 밝고 간결하게 말해주세요.',
        },
        callbacks: {
          onopen: () => {
            sendJson({ type: 'ready', voiceName });
          },
          onmessage: (message: LiveServerMessage) => {
            const content = message.serverContent;
            if (content?.inputTranscription?.text) {
              sendJson({ type: 'inputTranscript', text: content.inputTranscription.text });
            }
            if (content?.outputTranscription?.text) {
              sendJson({ type: 'outputTranscript', text: content.outputTranscription.text });
            }
            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                sendJson({ type: 'audio', data: part.inlineData.data });
              }
            }
            if (content?.interrupted) {
              sendJson({ type: 'interrupted' });
            }
            if (content?.turnComplete) {
              sendJson({ type: 'turnComplete' });
            }
          },
          onerror: (errEvent) => {
            const msg =
              errEvent instanceof Error
                ? errEvent.message
                : (errEvent as { message?: string })?.message || 'Live API 연결 중 오류가 발생했습니다.';
            sendJson({ type: 'error', error: msg });
          },
          onclose: () => {
            if (!closed) {
              sendJson({ type: 'closed' });
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.close();
              }
            }
          },
        },
      })
      .then((session) => {
        if (closed) {
          session.close();
          return null;
        }
        liveSession = session;
        while (pendingInputs.length > 0) {
          const item = pendingInputs.shift();
          if (!item) continue;
          if (item.type === 'audio') {
            session.sendRealtimeInput({
              audio: { data: item.data, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (item.type === 'text') {
            session.sendRealtimeInput({ text: item.text });
          }
        }
        return session;
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Gemini Live API 세션을 시작하지 못했습니다.';
        sendJson({ type: 'error', error: msg });
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.close(1011, 'Live session failed');
        }
        return null;
      });

    clientWs.on('message', (raw) => {
      try {
        const parsed = JSON.parse(raw.toString()) as {
          type?: string;
          audio?: string;
          data?: string;
          text?: string;
        };
        const audioData = parsed.data || parsed.audio;
        if (audioData && typeof audioData === 'string') {
          if (liveSession) {
            liveSession.sendRealtimeInput({
              audio: { data: audioData, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (pendingInputs.length < 25) {
            pendingInputs.push({ type: 'audio', data: audioData });
          }
          return;
        }
        if (parsed.type === 'text' && parsed.text && parsed.text.trim()) {
          const cleanText = parsed.text.trim();
          if (liveSession) {
            liveSession.sendRealtimeInput({ text: cleanText });
          } else {
            pendingInputs.push({ type: 'text', text: cleanText });
          }
        }
      } catch {
        // ignore malformed client frame
      }
    });

    clientWs.on('close', () => {
      closed = true;
      sessionPromise
        .then((session) => {
          session?.close();
        })
        .catch(() => {});
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Chromatic Dreamscape server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
