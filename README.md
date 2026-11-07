# Papercut · Video.js skin

A naive construction-paper skin for [Video.js v10](https://videojs.org): wobbly scissor cuts, a pinking-shear control strip and a googly-eye playhead.

Made for the Video.js Skins Design Challenge.

## Live demo

https://luzbas.github.io/papercut-player/

## Use the skin

The skin is React + CSS on top of `@videojs/react`. Copy `src/skins/papercut/skin` into your project, install `@videojs/react`, `@videojs/core` and `cn`, then:

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { VideoSkin } from './skins/papercut/skin/video/skin';

<VideoPlayer>
  <VideoSkin style={{ width: '100%', aspectRatio: '16 / 9' }}>
    <Video src="https://example.com/video.mp4" playsInline />
  </VideoSkin>
</VideoPlayer>
```

## Run locally

```bash
npm install
npm run dev
```

The demo site deploys to GitHub Pages on every push to `main` (`.github/workflows/deploy.yml`).

## License

Apache License 2.0, same as Video.js. See [LICENSE](LICENSE).
