export interface BlogEntry {
    slug: string;
    title: string;
    summary: string;
    date: string;
    category: string;
    threatLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
}

let blogIndexPromise: Promise<BlogEntry[]> | null = null;

export async function getBlogIndex(): Promise<BlogEntry[]> {
    if (!blogIndexPromise) {
        blogIndexPromise = fetch('/blog/blog-index.json').then((res) => {
            if (!res.ok) throw new Error('Failed to load blog index');
            return res.json();
        });
    }
    return blogIndexPromise;
}
