import React, { useEffect, useMemo, useRef, useState, RefObject } from 'react';
import { Box } from '@chakra-ui/react';

// 1. Définition des props typées
export interface ScrollBarProps {
  scrollRef: RefObject<HTMLElement | null>;
  orientation?: 'x' | 'y';
  minThumb?: number;
  trackCrossSize?: number;
  thumbCrossSize?: number;
  thumbColor?: string;
  thumbRadius?: string;
  zIndex?: number;
  bottom?: number | string;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  onVisibilityChange?: (isVisible: boolean) => void;
}

interface ScrollState {
  scrollPos: number;
  scrollSize: number;
  clientSize: number;
  trackSize: number;
}

interface DragState {
  dragging: boolean;
  start: number;
  startScroll: number;
}

export default function ScrollBar({
  scrollRef,
  orientation = 'x',
  minThumb = 28,
  trackCrossSize = 6,
  thumbCrossSize = 1,
  thumbColor = '#90CDF4',
  thumbRadius = '999px',
  zIndex = 10,
  bottom = -3,
  top = undefined,
  left = 0,
  right = 0,
  onVisibilityChange,
}: ScrollBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState>({ dragging: false, start: 0, startScroll: 0 });
  const [state, setState] = useState<ScrollState>({
    scrollPos: 0,
    scrollSize: 0,
    clientSize: 0,
    trackSize: 0,
  });

  const isX = String(orientation || 'x').toLowerCase() !== 'y';

  const computed = useMemo(() => {
    const hasOverflow = state.scrollSize > state.clientSize + 1;
    const maxScroll = Math.max(0, state.scrollSize - state.clientSize);
    const trackSize = Math.max(0, state.trackSize);
    const thumbSize = hasOverflow && trackSize
      ? Math.max(minThumb, Math.round((state.clientSize / state.scrollSize) * trackSize))
      : 0;
    const denom = Math.max(1, trackSize - thumbSize);
    const thumbPos = hasOverflow && maxScroll ? Math.round((state.scrollPos / maxScroll) * denom) : 0;
    return {
      hasOverflow,
      maxScroll,
      trackSize,
      thumbSize,
      denom,
      thumbPos,
    };
  }, [state, minThumb]);

  useEffect(() => {
    onVisibilityChange?.(computed.hasOverflow);
  }, [computed.hasOverflow, onVisibilityChange]);

  useEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;

    const update = () => {
      const el2 = scrollRef?.current;
      if (!el2) return;
      const track = trackRef.current;
      setState({
        scrollPos: isX ? el2.scrollLeft : el2.scrollTop,
        scrollSize: isX ? el2.scrollWidth : el2.scrollHeight,
        clientSize: isX ? el2.clientWidth : el2.clientHeight,
        trackSize: isX ? (track?.clientWidth ?? el2.clientWidth) : (track?.clientHeight ?? el2.clientHeight),
      });
    };

    update();
    const raf = window.requestAnimationFrame(update);

    const onScroll = () => update();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);

    let ro: ResizeObserver | undefined;
    try {
      ro = new ResizeObserver(update);
      ro.observe(el);
      if (trackRef.current) ro.observe(trackRef.current);
    } catch {
      // ignore
    }

    let mo: MutationObserver | undefined;
    try {
      mo = new MutationObserver(update);
      mo.observe(el, { childList: true, subtree: true, characterData: true, attributes: true });
    } catch {
      // ignore
    }

    return () => {
      window.cancelAnimationFrame(raf);
      try {
        el.removeEventListener('scroll', onScroll);
      } catch {
        // ignore
      }
      window.removeEventListener('resize', update);
      try {
        ro?.disconnect?.();
      } catch {
        // ignore
      }
      try {
        mo?.disconnect?.();
      } catch {
        // ignore
      }
    };
  }, [scrollRef, isX]);

  if (!computed.hasOverflow) return null;

  const onTrackMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const el = scrollRef?.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const rect = track.getBoundingClientRect();
    const x = isX ? (e.clientX - rect.left) : (e.clientY - rect.top);
    const targetPos = x - computed.thumbSize / 2;
    const ratio = computed.denom ? Math.min(1, Math.max(0, targetPos / computed.denom)) : 0;
    const next = ratio * computed.maxScroll;

    if (isX) el.scrollTo({ left: next, behavior: 'auto' });
    else el.scrollTo({ top: next, behavior: 'auto' });
  };

  const onThumbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const el = scrollRef?.current;
    if (!el) return;

    dragRef.current = {
      dragging: true,
      start: isX ? e.clientX : e.clientY,
      startScroll: isX ? el.scrollLeft : el.scrollTop,
    };

    const onMove = (ev: MouseEvent) => {
      const cur = dragRef.current;
      const el2 = scrollRef?.current;
      if (!cur.dragging || !el2) return;
      const dx = (isX ? ev.clientX : ev.clientY) - cur.start;
      const ratio = computed.denom ? dx / computed.denom : 0;
      const next = cur.startScroll + ratio * computed.maxScroll;
      if (isX) el2.scrollTo({ left: next, behavior: 'auto' });
      else el2.scrollTo({ top: next, behavior: 'auto' });
    };

    const onUp = () => {
      dragRef.current = { dragging: false, start: 0, startScroll: 0 };
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const trackStyle = isX
    ? {
        position: 'absolute' as const,
        left,
        right,
        bottom,
        zIndex,
        height: `${trackCrossSize}px`,
      }
    : {
        position: 'absolute' as const,
        top,
        bottom: bottom === -3 ? 0 : bottom,
        right,
        zIndex,
        width: `${trackCrossSize}px`,
      };

  const thumbStyle = isX
    ? {
        position: 'absolute' as const,
        top: `${-1}px`,
        left: `${computed.thumbPos}px`,
        height: `${thumbCrossSize}px`,
        width: `${computed.thumbSize}px`,
      }
    : {
        position: 'absolute' as const,
        left: `${-1}px`,
        top: `${computed.thumbPos}px`,
        width: `${thumbCrossSize}px`,
        height: `${computed.thumbSize}px`,
      };

  return (
    <Box
      ref={trackRef}
      onMouseDown={onTrackMouseDown}
      sx={{ userSelect: 'none' }}
      {...trackStyle}
    >
      <Box
        bg={thumbColor}
        borderRadius={thumbRadius}
        onMouseDown={onThumbMouseDown}
        _active={{ cursor: 'grabbing' }}
        {...thumbStyle}
      />
    </Box>
  );
}
