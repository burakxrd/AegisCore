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
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL

export async function getBlogIndex(): Promise<BlogEntry[]> {
    const now = Date.now();
    
    // Re-fetch if cache is empty or TTL has expired
    if (!blogIndexPromise || (now - lastFetchTime > CACHE_TTL_MS)) {
        lastFetchTime = now;
        
        blogIndexPromise = fetch('/blog/blog-index.json')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load blog index');
                return res.json();
            })
            .catch((err) => {
                blogIndexPromise = null;
                lastFetchTime = 0; // reset on error
                throw err;
            });
    }
    
    return blogIndexPromise;
}
