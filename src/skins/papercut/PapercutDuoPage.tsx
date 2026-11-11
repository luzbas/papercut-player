// Papercut · Duo page — the papercut skin laid out for the iPhone Duo, inside the fold simulator.
import { DuoSimulation } from '../../duo-kit/duo-simulation';
import { DEMO_CHAPTERS, DEMO_HLS, DEMO_POSTER, DEMO_TITLE } from '../../media';
import { DuoVideoSkin } from './duo/duo-skin';
// The Duo skin builds on the papercut paper styles, which the main skin normally brings in. Import them here too so
// the page stands on its own (Vite loads each stylesheet once, however many places import it).
import './skin/styles/video/base.css';
import './skin/styles/papercut.css';

export default function PapercutDuoPage() {
  return (
    <main className="duo-page">
      <header className="duo-page__header">
        <h1>Papercut · Duo</h1>
        <p>
          The same paper on the iPhone Duo. Open it, close it, turn it: the player follows you from the inner display to
          the outer one and re-lays itself out for each, without stopping the video.
        </p>
        <p className="duo-page__links">
          <a href="../">Player</a>
          <a href="https://github.com/luzbas/papercut-player">GitHub</a>
        </p>
      </header>

      <DuoSimulation
        src={DEMO_HLS}
        poster={DEMO_POSTER}
        chapters={DEMO_CHAPTERS}
        renderSkin={(media) => <DuoVideoSkin title={DEMO_TITLE}>{media}</DuoVideoSkin>}
      />
    </main>
  );
}
