// Papercut skin page — the naive construction-paper skin, then the same paper laid out for the iPhone Duo.
// The main skin's source lives in skins-src/papercut (its own workbench). Edit it there, then run
// `npm run sync-skin -- papercut` to copy it into ./skin. The Duo variant lives in ./duo and reuses ./skin's controls.
import { Video, VideoPlayer } from '@videojs/react/video';
import { VideoSkin } from './skin/video/skin';
import { DuoSimulation } from './duo/duo-simulation';
import { DEMO_VIDEO_SRC, DUO_DEMO_CHAPTERS, DUO_DEMO_HLS, DUO_DEMO_POSTER } from '../../media';

export default function PapercutPage() {
  return (
    <section className="skin-page">
      <header className="skin-page__header">
        <h1>Papercut</h1>
        <p>A naive construction-paper skin: wobbly scissor cuts, a pinking-shear control strip and a googly-eye playhead.</p>
      </header>

      <div className="skin-page__player">
        <VideoPlayer>
          <VideoSkin style={{ width: '100%', aspectRatio: '16 / 9' }}>
            <Video src={DEMO_VIDEO_SRC} playsInline />
          </VideoSkin>
        </VideoPlayer>
      </div>

      <header className="skin-page__header skin-page__header--sub">
        <h2>Papercut · Duo layout</h2>
        <p>
          The same paper on the iPhone Duo. Open it, close it, turn it: the player follows you from the inner display to
          the outer one and re-lays itself out for each, without stopping the video.
        </p>
      </header>

      <DuoSimulation src={DUO_DEMO_HLS} poster={DUO_DEMO_POSTER} chapters={DUO_DEMO_CHAPTERS} />
    </section>
  );
}
