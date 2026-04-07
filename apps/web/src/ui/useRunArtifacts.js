import { useMemo } from 'react';
export function useRunArtifacts(runDetail) {
    const videoArtifact = useMemo(() => runDetail?.artifacts?.find((a) => a.kind === 'video' || a.content_type === 'video/webm') ?? null, [runDetail]);
    const screenshotArtifacts = useMemo(() => runDetail?.artifacts?.filter((a) => a.kind?.startsWith('screenshot') ||
        a.content_type === 'image/png' ||
        a.content_type === 'image/webp') ?? [], [runDetail]);
    const subtitleArtifact = useMemo(() => runDetail?.artifacts?.find((a) => a.kind === 'subtitle' || a.content_type === 'text/srt') ?? null, [runDetail]);
    return { videoArtifact, screenshotArtifacts, subtitleArtifact };
}
