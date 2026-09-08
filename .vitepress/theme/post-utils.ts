export interface Post {
  url: string
  title: string
  date: string
  tags: string[]
  description: string
}

export function postCategory(post: Post): 'ai' | 'remote' | 'terminal' {
  if (post.tags.some(tag => ['ssh', 'proxy', 'network', 'debug', 'debugging', 'remote', 'vscode'].includes(tag))) return 'remote'
  if (post.tags.some(tag => ['ai', 'claude-code', 'cursor', 'mcp', 'herdr'].includes(tag))) return 'ai'
  return 'terminal'
}

export function postPath(url: string): string {
  return url.replace(/\.(html|md)$/, '').replace(/\/$/, '')
}
