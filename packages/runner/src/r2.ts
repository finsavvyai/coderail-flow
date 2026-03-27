/**
 * R2 Artifact Upload Utilities
 *
 * Handles uploading artifacts (video, SRT, screenshots, reports) to Cloudflare R2.
 */

export interface ArtifactUpload {
  kind: 'video' | 'subtitle' | 'screenshot' | 'report';
  content: Uint8Array | string;
  contentType: string;
}

/**
 * Generate R2 key path for an artifact
 * Format: org/{orgId}/project/{projectId}/run/{runId}/{kind}.{ext}
 */
export function generateR2Key(
  orgId: string,
  projectId: string,
  runId: string,
  kind: string,
  extension: string
): string {
  return `org/${orgId}/project/${projectId}/run/${runId}/${kind}.${extension}`;
}

/**
 * Upload artifact to R2
 */
export async function uploadArtifact(
  r2Bucket: R2Bucket,
  key: string,
  artifact: ArtifactUpload
): Promise<{ key: string; bytes: number; sha256: string }> {
  // Convert content to Uint8Array if it's a string
  let contentBytes: Uint8Array;
  if (typeof artifact.content === 'string') {
    contentBytes = new TextEncoder().encode(artifact.content);
  } else {
    contentBytes = artifact.content;
  }

  // Calculate SHA256 hash
  const sha256 = await calculateSHA256(contentBytes);

  // Upload to R2
  await r2Bucket.put(key, contentBytes, {
    httpMetadata: {
      contentType: artifact.contentType,
    },
    customMetadata: {
      kind: artifact.kind,
      sha256,
    },
  });

  return {
    key,
    bytes: contentBytes.length,
    sha256,
  };
}

/**
 * Calculate SHA256 hash of content
 */
async function calculateSHA256(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as unknown as ArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generate presigned download URL for R2 artifact
 * Note: R2 presigned URLs require using S3-compatible API
 * For now, we'll use the R2 public URL (if bucket is public) or implement presigning later
 */
export function generateDownloadURL(r2Key: string, bucketPublicUrl?: string): string {
  if (bucketPublicUrl) {
    return `${bucketPublicUrl}/${r2Key}`;
  }

  // For private buckets, we'd need to implement S3-compatible presigned URLs
  // This is a placeholder - implement proper presigning in production
  return `/api/artifacts/download/${encodeURIComponent(r2Key)}`;
}

/**
 * Batch upload multiple artifacts
 */
export async function uploadArtifacts(
  r2Bucket: R2Bucket,
  orgId: string,
  projectId: string,
  runId: string,
  artifacts: Array<{ kind: string; extension: string; artifact: ArtifactUpload }>
): Promise<Array<{ kind: string; key: string; bytes: number; sha256: string }>> {
  const results = [];

  for (const { kind, extension, artifact } of artifacts) {
    const key = generateR2Key(orgId, projectId, runId, kind, extension);
    const result = await uploadArtifact(r2Bucket, key, artifact);
    results.push({ kind, ...result });
  }

  return results;
}
