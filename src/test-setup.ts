import { vi } from 'vitest';

/**
 * Provides a guaranteed in-memory localStorage implementation for all test files.
 *
 * Node.js 22+ experimentally exposes localStorage as a native global backed by
 * sqlite. On some platforms (notably Ubuntu in CI), jsdom cannot override it,
 * which causes localStorage.clear() to be missing or non-functional. Explicitly
 * stubbing it here ensures consistent behaviour across all environments.
 *
 * With Node 25+ this might be removable if we update the tests to use
 * --localstorage-file
 */
class InMemoryStorage implements Storage {

    // Allow string-indexed access to satisfy the Storage interface
    [name: string]: unknown;

    private readonly store = new Map<string, string>();

    get length(): number {
        return this.store.size;
    }

    clear(): void {
        this.store.clear();
    }

    getItem(key: string): string | null {
        return this.store.get(key) ?? null;
    }

    key(index: number): string | null {
        return [ ...this.store.keys() ][index] ?? null;
    }

    removeItem(key: string): void {
        this.store.delete(key);
    }

    setItem(key: string, value: string): void {
        this.store.set(key, value);
    }
}

vi.stubGlobal('localStorage', new InMemoryStorage());
