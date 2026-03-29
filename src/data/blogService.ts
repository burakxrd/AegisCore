export interface BlogEntry {
    slug: string;
    title: string;
    summary: string;
    date: string;
    category: string;
    threatLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
}

let blogIndexPromise: Promise<BlogEntry[]> | null = null;
let lastFetchTime = 0;
let isRevalidating = false;
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL

export async function getBlogIndex(): Promise<BlogEntry[]> {
    const now = Date.now();
    const isExpired = now - lastFetchTime > CACHE_TTL_MS;

    // First call or previous fetch failed — blocking fetch
    if (!blogIndexPromise) {
        lastFetchTime = now;
        blogIndexPromise = fetch('/blog/blog-index.json')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load blog index');
                return res.json();
            })
            .catch((err) => {
                blogIndexPromise = null;
                lastFetchTime = 0;
                throw err;
            });
        return blogIndexPromise;
    }

    // TTL expired — start background revalidation without nulling the existing promise
    if (isExpired && !isRevalidating) {
        isRevalidating = true;
        lastFetchTime = now;

        fetch('/blog/blog-index.json')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load blog index');
                return res.json();
            })
            .then((data) => {
                blogIndexPromise = Promise.resolve(data);
            })
            .catch(() => {
                // Keep serving stale cache on revalidation failure
            })
            .finally(() => {
                isRevalidating = false;
            });
    }

    return blogIndexPromise;
}
