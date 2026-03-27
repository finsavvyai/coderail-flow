/**
 * Artifact upload orchestration for flow execution.
 *
 * Prepares and uploads all run artifacts (report, subtitles, video, screenshots) to R2.
 */

import { uploadArtifacts, type ArtifactUpload } from './r2';

export async function uploadFlowArtifacts(
  r2Bucket: R2Bucket,
  orgId: string,
  projectId: string,
  runId: string,
  artifacts: {
    report: string;
    subtitles: string;
    screenshots: Array<{ stepIndex: number; bytes: Uint8Array }>;
    video?: Uint8Array;
  }
): Promise<Array<{ kind: string; r2_key: string; bytes: number; sha256: string }>> {
  const uploads: Array<{ kind: string; extension: string; artifact: ArtifactUpload }> = [];

  uploads.push({
    kind: 'report',
    extension: 'json',
    artifact: {
      kind: 'report',
      content: artifacts.report,
      contentType: 'application/json',
    },
  });

  uploads.push({
    kind: 'subtitle',
    extension: 'srt',
    artifact: {
      kind: 'subtitle',
      content: artifacts.subtitles,
      contentType: 'text/srt',
    },
  });

  if (artifacts.video) {
    uploads.push({
      kind: 'video',
      extension: 'webm',
      artifact: {
        kind: 'video',
        content: artifacts.video,
        contentType: 'video/webm',
      },
    });
  }

  for (let i = 0; i < artifacts.screenshots.length; i++) {
    uploads.push({
      kind: `screenshot-${i}`,
      extension: 'webp',
      artifact: {
        kind: 'screenshot',
        content: artifacts.screenshots[i].bytes,
        contentType: 'image/webp',
      },
    });
  }

  const results = await uploadArtifacts(r2Bucket, orgId, projectId, runId, uploads);

  return results.map((r) => ({
    kind: r.kind,
    r2_key: r.key,
    bytes: r.bytes,
    sha256: r.sha256,
  }));
}
