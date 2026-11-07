// Shared demo video for all skins (from the Video.js CLI install plan).
// Swap for your own Mux playback URL to earn the Mux bonus point.
export const DEMO_VIDEO_SRC =
  'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4';

// The Duo phone demo needs media that exercises every control: an adaptive Mux stream (quality levels, English and
// Japanese subtitles, a Japanese dubbed audio track) plus a chapters file (the one from the papercut workbench).
export const DUO_DEMO_HLS = 'https://stream.mux.com/83EzHOvVzVN01AsrD01BCpiH02Pj3S8mfzBOu101w2nHC5s.m3u8';
export const DUO_DEMO_POSTER =
  'https://image.mux.com/83EzHOvVzVN01AsrD01BCpiH02Pj3S8mfzBOu101w2nHC5s/thumbnail.webp?time=69';
export const DUO_DEMO_CHAPTERS = `${import.meta.env.BASE_URL}duo/cosmic-dawn-chapters.vtt`;
