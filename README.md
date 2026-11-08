# Papercut · Video.js skin

A construction-paper collage skin for [Video.js v10](https://videojs.org). There's no control bar: the video is a photo taped down in the middle of a scrapbook spread, and every control is a scrap pinned around it. Play is a paper-clipped red circle, seeking is a pair of ticket stubs, and the playhead is a googly eye on a torn paper strip. On narrow screens the scraps re-pin themselves into a phone layout.

Made for the Video.js Skins Design Challenge.

## Live demo

https://luzbas.github.io/papercut-player/

## Use the skin

The skin is React + CSS on top of `@videojs/react`. Copy `src/skins/papercut` into your project (the collage uses the controls in `skin/`), install `@videojs/react`, `@videojs/core` and `cn`, then:

```tsx
import { VideoPlayer } from '@videojs/react/video';
import { HlsVideo } from '@videojs/react/media/hls-video';
import { CollageVideoSkin } from './skins/papercut/collage/collage-skin';

<VideoPlayer poster="https://example.com/poster.jpg">
  <CollageVideoSkin title="My video">
    <HlsVideo src="https://example.com/video.m3u8" playsInline crossOrigin="" />
  </CollageVideoSkin>
</VideoPlayer>
```

A plain `<Video src="…mp4" />` works in place of `HlsVideo` too.

## Run locally

```bash
npm install
npm run dev
```

The demo site deploys to GitHub Pages on every push to `main` (`.github/workflows/deploy.yml`).

## License

Apache License 2.0, same as Video.js. See [LICENSE](LICENSE).
