// Seed voice catalog.
// TODO(backend): replace with a `GET /v1/voices` endpoint that returns the
// provider-curated list; for now these IDs mirror the ones the LiveKit agent
// runner accepts.

export type VoiceGender = "feminine" | "masculine" | "neutral";

export interface Voice {
  id: string;
  name: string;
  provider: string;
  gender: VoiceGender;
  locale: string;
  accent: string;
  styles: string[];
  useCases: string[];
}

export const VOICES: Voice[] = [
  {
    id: "aura-2-asteria-en",
    name: "Asteria",
    provider: "Deepgram",
    gender: "feminine",
    locale: "en-US",
    accent: "American",
    styles: ["Clear", "Confident", "Energetic"],
    useCases: ["Advertising", "Customer service"],
  },
  {
    id: "aura-2-apollo-en",
    name: "Apollo",
    provider: "Deepgram",
    gender: "masculine",
    locale: "en-US",
    accent: "American",
    styles: ["Confident", "Comfortable"],
    useCases: ["Casual chat"],
  },
  {
    id: "aura-2-hera-en",
    name: "Hera",
    provider: "Deepgram",
    gender: "feminine",
    locale: "en-US",
    accent: "American",
    styles: ["Smooth", "Warm", "Professional"],
    useCases: ["Informative"],
  },
  {
    id: "aura-2-zeus-en",
    name: "Zeus",
    provider: "Deepgram",
    gender: "masculine",
    locale: "en-US",
    accent: "American",
    styles: ["Deep", "Trustworthy", "Smooth"],
    useCases: ["IVR"],
  },
  {
    id: "aura-2-luna-en",
    name: "Luna",
    provider: "Deepgram",
    gender: "feminine",
    locale: "en-US",
    accent: "American",
    styles: ["Friendly", "Natural"],
    useCases: ["IVR"],
  },
  {
    id: "aura-2-draco-en",
    name: "Draco",
    provider: "Deepgram",
    gender: "masculine",
    locale: "en-GB",
    accent: "British",
    styles: ["Warm", "Trustworthy", "Baritone"],
    useCases: ["Storytelling"],
  },
];

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "hi", label: "Hindi" },
  { code: "pt", label: "Portuguese" },
];

export const LLM_MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini", provider: "OpenAI" },
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 mini", provider: "OpenAI" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", provider: "Anthropic" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "Anthropic" },
];

export const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];
