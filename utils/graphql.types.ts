export interface Path {
  mp4: string
}

export interface ScriptureReference {
  scripture: string
}

export interface Video {
  paths: Path
  publishDate: string
  scriptureReferences: ScriptureReference[]
  shareUrl: string
  title: string
  youtubeId: string
}
