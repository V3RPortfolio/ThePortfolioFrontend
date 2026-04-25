
export class SessionService {

    get(key: string): string | null {
        return localStorage.getItem(key);
    }

    set(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    remove(key: string): void {
        localStorage.removeItem(key);
    }

    clear(): void {
        // Clears all localStorage entries. Use with caution as this affects all stored data.
        localStorage.clear();
    }

}

export default new SessionService();
