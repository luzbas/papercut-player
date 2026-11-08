// Papercut collage demo: just the player, plus a small link to the source.
import { VideoPlayer } from '@videojs/react/video';
import { HlsVideo } from '@videojs/react/media/hls-video';
import { CollageVideoSkin } from './collage/collage-skin';
import { DEMO_CHAPTERS, DEMO_HLS, DEMO_POSTER, DEMO_TITLE } from '../../media';

export default function PapercutPage() {
  return (
    <div className="stage">
      <h1 className="visually-hidden">Papercut · Video.js skin</h1>
      <div className="stage__player">
        <VideoPlayer poster={DEMO_POSTER}>
          <CollageVideoSkin title={DEMO_TITLE}>
            {/* crossOrigin lets the chapters track load. */}
            <HlsVideo src={DEMO_HLS} playsInline crossOrigin="">
              <track kind="chapters" label="English" srcLang="en" src={DEMO_CHAPTERS} default />
            </HlsVideo>
          </CollageVideoSkin>
        </VideoPlayer>
      </div>
      <a className="source-link" href="https://github.com/luzbas/papercut-player">
        GitHub
      </a>
    </div>
  );
}
