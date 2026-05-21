import React from 'react';
import ReactPlayer from 'react-player';
import { normalizeTrailerUrl } from '../../utils/videoUtils';

/**
 * react-player v3 uses `src` (not `url`).
 */
const TrailerPlayer = ({
  trailerUrl,
  playing = true,
  muted = false,
  controls = true,
  className = '',
  width = '100%',
  height = '100%',
}) => {
  const src = normalizeTrailerUrl(trailerUrl);

  if (!src) {
    return null;
  }

  return (
    <ReactPlayer
      src={src}
      width={width}
      height={height}
      playing={playing}
      muted={muted}
      controls={controls}
      playsInline
      className={className}
      config={{
        youtube: {
          rel: 0,
          modestbranding: 1,
        },
      }}
    />
  );
};

export default TrailerPlayer;
