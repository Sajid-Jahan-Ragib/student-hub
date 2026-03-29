/**
 * Versioning and concurrency control utilities
 * Implements optimistic concurrency control for entity updates
 */

export class ConflictError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
    this.code = code;
    this.details = details;
  }
}

/**
 * Initialize entity with version and timestamp fields.
 * Called when first creating or normalizing entity data.
 */
export function initializeEntityVersion(entity, existingVersion = null) {
  return {
    ...entity,
    _version: existingVersion !== null ? existingVersion : 1,
    _lastModified: new Date().toISOString(),
  };
}

/**
 * Increment entity version.
 * Called when entity is successfully updated.
 */
export function incrementEntityVersion(entity) {
  return {
    ...entity,
    _version: (entity._version || 1) + 1,
    _lastModified: new Date().toISOString(),
  };
}

/**
 * Check version mismatch and throw ConflictError if needed.
 * Called before accepting any write from client.
 * If client omits _version, the write is allowed (backward compatibility).
 */
export function checkVersionConflict(incomingEntity, currentEntity, currentVersion) {
  if (incomingEntity._version === null || incomingEntity._version === undefined) {
    return;
  }

  if (incomingEntity._version !== currentVersion) {
    throw new ConflictError(
      'ENTITY_VERSION_CONFLICT',
      'Entity version mismatch. Update the entity and try again.',
      {
        requestedVersion: incomingEntity._version,
        currentVersion,
        lastModified: currentEntity._lastModified,
      }
    );
  }
}
