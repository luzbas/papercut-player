/** @jsxImportSource react */

'use client';

// iPhone Duo fold simulation for the papercut Duo player: open / tabletop / closed, vertical / horizontal, with a
// hinge you can drag or animate. The device is cut from card in CSS 3D. The live player sits on whichever display
// faces you and never stops playing while the phone moves (the kit's continuity rule).
//
// The simulation doesn't tell the player which layout to use. It feeds the same values a real foldable reports
// (device posture + viewport segments, see src/foldable) through <SimulatedFoldable>, and the skin picks its layout
// from those, exactly as it would on an iPhone Duo.
//
// Geometry is in "device units" (--u): 1u is one inner-display point, so the open device is 890 × 626 pt of screen
// inside a 22 u bezel. Loosely after jadon7/iphone-duo (MIT); no Apple assets are used.
import './simulation.css';
import { HlsVideo } from '@videojs/react/media/hls-video';
import { VideoPlayer } from '@videojs/react/video';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import { SimulatedFoldable, type SimulatedFoldableValue } from '../../../foldable/use-foldable';
import { DuoVideoSkin, SimulatedFullscreen, fullscreenOrientationFor, type SimulatedFullscreenValue } from './duo-skin';

type Orientation = 'vertical' | 'horizontal';

/** Device size in u. Horizontal: hinge runs top to bottom; vertical: the same phone turned a quarter turn. */
const DEVICE = { horizontal: { w: 934, h: 670 }, vertical: { w: 670, h: 934 } } as const;
/** Inner display size in u (= pt), per orientation. */
const INNER = { horizontal: { w: 890, h: 626 }, vertical: { w: 626, h: 890 } } as const;
const OPEN = 180;
const CLOSED = 0;
const TABLETOP = 105;
/** Hinge angles at which a vertical phone counts as propped up in tabletop and shows its live split layout. */
const TABLETOP_RANGE = [45, 165] as const;
/** The outer display is 466 pt wide drawn 430 u wide: its points are a little smaller than the inner display's. */
const OUTER_PT = 430 / 466;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface DuoSimulationProps {
  /** An HLS or Mux stream; adaptive sources fill the quality, audio and captions menus. */
  src: string;
  poster?: string;
  /** A WebVTT chapters file for the timeline and the title tile. */
  chapters?: string;
}

export function DuoSimulation({ src, poster, chapters }: DuoSimulationProps) {
  const [orientation, setOrientation] = useState<Orientation>('vertical');
  const [angle, setAngleState] = useState<number>(OPEN);
  const [animating, setAnimating] = useState(false);
  const [unit, setUnit] = useState(0.5);

  const areaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const coverCanvasRef = useRef<HTMLCanvasElement>(null);
  const bodyCanvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef<number>(OPEN);
  const frameRef = useRef(0);
  const prevOrientation = useRef<Orientation>(orientation);
  // Simulated fullscreen, and the pose to go back to when it ends.
  const [fullscreen, setFullscreen] = useState(false);
  const beforeFullscreen = useRef<{ orientation: Orientation; angle: number } | null>(null);

  const device = DEVICE[orientation];
  const inner = INNER[orientation];
  const isOpen = angle === OPEN;
  const isClosed = angle === CLOSED;
  const inTabletop =
    orientation === 'vertical' && !animating && angle >= TABLETOP_RANGE[0] && angle <= TABLETOP_RANGE[1];
  const live = isOpen || isClosed || inTabletop;

  // What a real foldable would report right now.
  const reported: SimulatedFoldableValue = (() => {
    if (isClosed) {
      return { posture: 'continuous', split: 'none', segments: [], display: orientation === 'horizontal' ? 'outer-p' : 'outer-l' };
    }
    if (isOpen) return { posture: 'continuous', split: 'none', segments: [], display: 'inner' };
    const w = inner.w * unit;
    const h = inner.h * unit;
    const segments =
      orientation === 'vertical'
        ? [
            { top: 0, left: 0, width: w, height: h / 2 },
            { top: h / 2, left: 0, width: w, height: h / 2 },
          ]
        : [
            { top: 0, left: 0, width: w / 2, height: h },
            { top: 0, left: w / 2, width: w / 2, height: h },
          ];
    return { posture: 'folded', split: orientation === 'vertical' ? 'vertical' : 'horizontal', segments, display: 'inner' };
  })();

  // While the player is hidden mid-fold it keeps its last layout, so nothing reflows behind the moving cover.
  const [shown, setShown] = useState<SimulatedFoldableValue>(reported);
  const reportedKey = JSON.stringify(reported);
  useEffect(() => {
    if (live) setShown(JSON.parse(reportedKey) as SimulatedFoldableValue);
  }, [live, reportedKey]);
  const foldable = live ? reported : shown;
  const screen = foldable.display === 'inner' ? (orientation === 'vertical' ? 'inner-p' : 'inner-l') : foldable.display;

  const setAngle = (value: number) => {
    angleRef.current = value;
    setAngleState(value);
  };

  // Fit the device to the page: as wide as the column allows, never taller than ~720 px.
  useLayoutEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const measure = () => {
      const maxHeight = Math.min(720, window.innerHeight - 140);
      setUnit(Math.max(0.2, Math.min(area.clientWidth / device.w, maxHeight / device.h)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(area);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [device.w, device.h]);

  // Turning the phone: the new pose starts a quarter turn back, so it reads as the old one rotating into place.
  useLayoutEffect(() => {
    if (prevOrientation.current === orientation) return;
    prevOrientation.current = orientation;
    stageRef.current?.animate([{ rotate: orientation === 'vertical' ? '-90deg' : '90deg' }, { rotate: '0deg' }], {
      duration: prefersReducedMotion() ? 0 : 560,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
  }, [orientation]);

  // Tabletop is a vertical pose; turning the phone sideways mid-fold opens it flat.
  useEffect(() => {
    if (orientation === 'horizontal' && angleRef.current !== OPEN && angleRef.current !== CLOSED) foldTo(OPEN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  /**
   * Freeze the current frame onto both halves, so the picture travels with the cover. Open, the player is full
   * screen, so one frame is split across the halves at the fold (side by side, or stacked when vertical).
   */
  const snapshot = () => {
    const video = areaRef.current?.querySelector('video');
    const halves = [coverCanvasRef.current, bodyCanvasRef.current];
    if (!video || !halves[0] || !halves[1]) return;
    const [cover] = halves as HTMLCanvasElement[];
    const ratio = window.devicePixelRatio || 1;
    for (const canvas of halves as HTMLCanvasElement[]) {
      canvas.width = Math.max(1, Math.round(canvas.offsetWidth * ratio));
      canvas.height = Math.max(1, Math.round(canvas.offsetHeight * ratio));
    }
    const stacked = orientation === 'vertical';
    const screenW = stacked ? cover.width : cover.width * 2;
    const screenH = stacked ? cover.height * 2 : cover.height;
    const scale = video.videoWidth ? Math.min(screenW / video.videoWidth, screenH / video.videoHeight) : 0;
    const w = video.videoWidth * scale;
    const h = video.videoHeight * scale;
    (halves as HTMLCanvasElement[]).forEach((canvas, index) => {
      const context = canvas.getContext('2d');
      if (!context) return;
      context.fillStyle = '#000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      if (!scale) return;
      const x = (screenW - w) / 2 - (stacked ? 0 : index * cover.width);
      const y = (screenH - h) / 2 - (stacked ? index * cover.height : 0);
      try {
        context.drawImage(video, x, y, w, h);
      } catch {
        // A frame that can't be drawn just leaves the half black.
      }
    });
  };

  const beginMove = () => {
    cancelAnimationFrame(frameRef.current);
    snapshot();
  };

  function foldTo(target: number) {
    beginMove();
    const from = angleRef.current;
    if (from === target) return;
    const duration = prefersReducedMotion() ? 0 : 1000 * (Math.abs(target - from) / 180);
    const start = performance.now();
    setAnimating(true);
    const step = (now: number) => {
      const k = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      setAngle(k === 1 ? target : from + (target - from) * eased);
      if (k < 1) frameRef.current = requestAnimationFrame(step);
      else setAnimating(false);
    };
    frameRef.current = requestAnimationFrame(step);
  }

  /**
   * Fullscreen on the phone: turn it to suit the video (sideways for wide video, upright for a tall 9:16 clip) and open
   * it flat. If it is already that way, nothing moves; the controls simply get out of the way as usual. Leaving
   * fullscreen puts the phone back the way it was.
   */
  const toggleFullscreen = () => {
    if (fullscreen) {
      const previous = beforeFullscreen.current;
      beforeFullscreen.current = null;
      setFullscreen(false);
      if (previous) {
        setOrientation(previous.orientation);
        if (previous.angle !== angleRef.current) foldTo(previous.angle);
      }
      return;
    }
    const video = areaRef.current?.querySelector('video');
    const target: Orientation = fullscreenOrientationFor(video) === 'portrait' ? 'vertical' : 'horizontal';
    beforeFullscreen.current = { orientation, angle: angleRef.current };
    setFullscreen(true);
    setOrientation(target);
    if (angleRef.current !== OPEN) foldTo(OPEN);
  };

  /** Moving the phone by hand ends fullscreen where it is, without snapping back. */
  const leaveFullscreen = () => {
    beforeFullscreen.current = null;
    setFullscreen(false);
  };

  const fullscreenValue = useMemo<SimulatedFullscreenValue>(
    () => ({ active: fullscreen, toggle: toggleFullscreen }),
    // toggleFullscreen reads refs and current state; recreate it when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fullscreen, orientation, angle],
  );

  const fold = 1 - angle / OPEN;
  const pose = isOpen ? 'open' : isClosed ? 'closed' : Math.round(angle) === TABLETOP ? 'tabletop' : null;

  return (
    <div className={'pcd-sim'} data-orientation={orientation}>
      <div className={'pcd-sim-controls'}>
        <div className={'pcd-seg'} role="group" aria-label="Fold">
          <button type="button" aria-pressed={pose === 'open'} onClick={() => (leaveFullscreen(), foldTo(OPEN))}>
            Open
          </button>
          <button
            type="button"
            aria-pressed={pose === 'tabletop'}
            disabled={orientation === 'horizontal'}
            title={orientation === 'horizontal' ? 'Tabletop is a vertical pose' : undefined}
            onClick={() => (leaveFullscreen(), foldTo(TABLETOP))}
          >
            Tabletop
          </button>
          <button type="button" aria-pressed={pose === 'closed'} onClick={() => (leaveFullscreen(), foldTo(CLOSED))}>
            Closed
          </button>
        </div>
        <div className={'pcd-seg'} role="group" aria-label="Orientation">
          <button type="button" aria-pressed={orientation === 'vertical'} onClick={() => (leaveFullscreen(), setOrientation('vertical'))}>
            Vertical
          </button>
          <button
            type="button"
            aria-pressed={orientation === 'horizontal'}
            onClick={() => (leaveFullscreen(), setOrientation('horizontal'))}
          >
            Horizontal
          </button>
        </div>
        <label className={'pcd-hinge'}>
          <span>Hinge</span>
          <input
            type="range"
            min={CLOSED}
            max={OPEN}
            step={1}
            value={Math.round(angle)}
            aria-valuetext={`${Math.round(angle)} degrees`}
            onPointerDown={() => (leaveFullscreen(), beginMove())}
            onKeyDown={() => (leaveFullscreen(), beginMove())}
            onChange={(event) => setAngle(Number(event.currentTarget.value))}
          />
          <output>{Math.round(angle)}°</output>
        </label>
      </div>

      <div ref={areaRef} className={'pcd-sim-area'}>
        <div
          ref={stageRef}
          className={'pcd-stage'}
          style={{ '--u': `${unit}px`, width: device.w * unit, height: device.h * unit } as CSSProperties}
        >
          <div className={'pcd-dev'} style={{ '--fold': fold } as CSSProperties}>
            <div className={'pcd-dev-body'}>
              <div className={'pcd-face pcd-face--body'}>
                <canvas ref={bodyCanvasRef} className={'pcd-face-canvas'} />
              </div>
            </div>
            <div className={'pcd-dev-cover'}>
              <div className={'pcd-face pcd-face--cover'}>
                <canvas ref={coverCanvasRef} className={'pcd-face-canvas'} />
              </div>
              <div className={'pcd-face pcd-face--outer'}>
                <div className={'pcd-outer-glass'}>
                  <span className={'pcd-outer-rail'} />
                  <span className={'pcd-outer-camera'} />
                </div>
              </div>
            </div>

            <div
              className={'pcd-dev-screen'}
              data-screen={screen}
              data-visible={live ? '' : undefined}
              data-tabletop={live && inTabletop ? '' : undefined}
              inert={!live}
              style={{ '--pcd-sim-pt': `${unit * (screen.startsWith('outer') ? OUTER_PT : 1)}px` } as CSSProperties}
            >
              <SimulatedFoldable.Provider value={foldable}>
                <SimulatedFullscreen.Provider value={fullscreenValue}>
                  <VideoPlayer poster={poster}>
                    <DuoVideoSkin title="Cosmic Dawn">
                      {/* crossOrigin lets the chapters track load and the fold animation copy video frames. */}
                      <HlsVideo src={src} playsInline crossOrigin="">
                        {chapters ? <track kind="chapters" label="English" srcLang="en" src={chapters} default /> : null}
                      </HlsVideo>
                    </DuoVideoSkin>
                  </VideoPlayer>
                </SimulatedFullscreen.Provider>
              </SimulatedFoldable.Provider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
