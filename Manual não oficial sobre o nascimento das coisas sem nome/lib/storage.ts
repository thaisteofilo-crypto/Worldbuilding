export const STORAGE_PREFIX = 'mythquill-';
export const OLD_PREFIX = 'o-entre-';

export function loadKey<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        console.error(`Error loading key ${key}:`, e);
        return fallback;
    }
}

export function saveKey<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (e) {
        console.error(`Error saving key ${key}:`, e);
    }
}

export function migrateKeys(map: Record<string, string>): void {
    if (typeof window === 'undefined') return;

    Object.entries(map).forEach(([oldKeySuffix, newKeySuffix]) => {
        const oldKey = `${OLD_PREFIX}${oldKeySuffix}`;
        const newKey = `${STORAGE_PREFIX}${newKeySuffix}`;

        const oldValue = localStorage.getItem(oldKey);
        if (oldValue && !localStorage.getItem(newKey)) {
            localStorage.setItem(newKey, oldValue);
            // Optional: Backup/Delete old key
            // localStorage.removeItem(oldKey); // As per request: "apagar as chaves antigas (ou manter como backup, mas não usar)"
            console.log(`Migrated ${oldKey} to ${newKey}`);
        }
    });
}
