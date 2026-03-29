export function clearAutoSaveTimer(timerRef) {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

export function scheduleJsonAutoSave(timerRef, sequenceRef, rawText, autoSaveHandler) {
  sequenceRef.current += 1;
  const nextSequence = sequenceRef.current;
  clearAutoSaveTimer(timerRef);

  timerRef.current = setTimeout(() => {
    autoSaveHandler(rawText, nextSequence);
  }, 750);
}

export function isStaleAutoSave(sequenceRef, sequence) {
  return sequence !== sequenceRef.current;
}
