import { useMemo } from 'react';

export function useRunArtifacts(runDetail: any) {
  const videoArtifact = useMemo(
    () =>
      runDetail?.artifacts?.find(
        (a: any) => a.kind === 'video' || a.content_type === 'video/webm'
      ) ?? null,
    [runDetail]
  );

  const screenshotArtifacts = useMemo(
    () =>
      runDetail?.artifacts?.filter(
        (a: any) =>
          a.kind?.startsWith('screenshot') ||
          a.content_type === 'image/png' ||
          a.content_type === 'image/webp'
      ) ?? [],
    [runDetail]
  );

  const subtitleArtifact = useMemo(
    () =>
      runDetail?.artifacts?.find(
        (a: any) => a.kind === 'subtitle' || a.content_type === 'text/srt'
      ) ?? null,
    [runDetail]
  );

  return { videoArtifact, screenshotArtifacts, subtitleArtifact };
}
