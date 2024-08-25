export const VIDEO_QUERY = `
  query VideoQuery($videoId: ID!) {
    video(videoId: $videoId) {
      paths {
        mp4
      }
      publishDate
      scriptureReferences {
        scripture
      }
      shareUrl
      title
      youtubeId
    }
  }
`
