// Papercut skin demo: just the player, plus a small link to the source.
import { Video, VideoPlayer } from '@videojs/react/video';
import { VideoSkin } from './skin/video/skin';
import { DEMO_VIDEO_SRC } from '../../media';

export default function PapercutPage() {
  return (
    <div className="stage">
      <h1 className="visually-hidden">Papercut · Video.js skin</h1>
      <div className="stage__player">
        <VideoPlayer>
          <VideoSkin style={{ width: '100%', aspectRatio: '16 / 9' }}>
            <Video src={DEMO_VIDEO_SRC} playsInline />
          </VideoSkin>
        </VideoPlayer>
      </div>
      <a className="source-link" href="https://github.com/luzbas/papercut-player">
        GitHub
      </a>
    </div>
  );
}
