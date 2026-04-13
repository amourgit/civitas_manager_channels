import { transcribeFirstAudio as transcribeFirstAudioImpl } from "civitas/plugin-sdk/media-runtime";

type TranscribeFirstAudio = typeof import("civitas/plugin-sdk/media-runtime").transcribeFirstAudio;

export async function transcribeFirstAudio(
  ...args: Parameters<TranscribeFirstAudio>
): ReturnType<TranscribeFirstAudio> {
  return await transcribeFirstAudioImpl(...args);
}
