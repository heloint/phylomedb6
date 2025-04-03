export const LocalStorageCache = {
    setCache(key: string, value: any) {
        window.localStorage.setItem(key, JSON.stringify(value));
    },
    getCache(key: string): any | null {
        const cacheValue: string | null = window.localStorage.getItem(key);
        if (!cacheValue) {
            return null;
        }
        const parsedCacheValue: any = JSON.parse(cacheValue);
        return parsedCacheValue;
    },
};
