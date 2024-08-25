import { test, expect } from '../utils/fixtures'
import { VideoPage } from '../pages/video.page'
import { VIDEO_QUERY } from '../utils/graphqlQueries'
import type { Video } from '../utils/graphql.types'

const dragonVideoId = '6bd7c840-1576-4b2f-a69f-7c1f13c42b93'
let dragonVideo: Video
let videoPage: VideoPage

test.beforeAll(async ({ apiRequest }) => {
  const dragonVideoResponse = await apiRequest.post('',
    {
      data: {
        query: VIDEO_QUERY,
        variables: {
          videoId: dragonVideoId
        }
      }
    }
  )

  await expect(dragonVideoResponse.status(), 'Chaos Dragon video should be retrieved').toBe(200)
  const dragonVideoJson = await dragonVideoResponse.json()
  dragonVideo = dragonVideoJson.data.video
})

test.beforeEach(async ({ page }) => {
  videoPage = new VideoPage(page)
  await videoPage.goto(dragonVideo.title)
})

test.describe('Graphql data on Video page', () => {
  test('should display video information correctly', async () => {
    await expect.soft(videoPage.videoBreadcrumb).toBeVisible()
    await expect.soft(videoPage.videoBreadcrumb).toHaveText(dragonVideo.title)

    await expect.soft(videoPage.videoContainer).toBeVisible()
    await expect.soft(videoPage.videoContainer).toHaveAttribute('data-youtubeid', dragonVideo.youtubeId)

    await expect.soft(videoPage.videoTitle).toBeVisible()
    await expect.soft(videoPage.videoTitle).toHaveText(dragonVideo.title)

    await expect.soft(videoPage.publishDate).toBeVisible()
    const parsedDragonVideoDate = new Date(dragonVideo.publishDate)
    const formattedDragonVideoDate = parsedDragonVideoDate.toISOString().substring(0, 10)
    expect(await videoPage.formatPublishDate()).toBe(formattedDragonVideoDate)
  })

  test('should have a share button', async ({ browserName }) => {
    test.skip(browserName === 'webkit', 'webkit doesn\'t allow automated access to the clipboard')

    await expect(videoPage.shareButton).toBeVisible()
    await videoPage.shareButton.click()

    const shareButtonClipboard = await videoPage.getClipboardText()
    const dragonVideoUrl = new URL(dragonVideo.shareUrl)
    const shareButtonUrl = new URL(shareButtonClipboard)

    expect(shareButtonUrl.pathname.replace(/\/+$/, '')).toBe(dragonVideoUrl.pathname.replace(/\/+$/, ''))
  })

  test('should have a download link', async () => {
    await expect(videoPage.downloadButton).toBeVisible()
    const downloadButtonHref = await videoPage.downloadButton.getAttribute('href')
    if (downloadButtonHref === null) {
      throw new Error('videoPage.downloadButton.getAttribute(\'href\') is null')
    }

    const dragonVideoUrl = new URL(dragonVideo.paths.mp4)
    const downloadButtonUrl = new URL(downloadButtonHref)

    const dragonVideoPathSegment = dragonVideoUrl.pathname.split('/')[1]
    const downloadButtonPathSegment = downloadButtonUrl.pathname.split('/')[1]

    expect(`${downloadButtonUrl.origin}/${downloadButtonPathSegment}`).toBe(`${dragonVideoUrl.origin}/${dragonVideoPathSegment}`)
  })

  test('should have scripture references', async () => {
    await expect(videoPage.scriptureReferenceCloud).toBeVisible()
    const videoPageScripture = await videoPage.gatherScripture()
    const dragonVideoScripture = dragonVideo.scriptureReferences.map(ref => ref.scripture)

    expect(videoPageScripture).toStrictEqual(dragonVideoScripture)
  })
})

test.describe('Video page links validation', () => {
  test('should not generate HTTP errors', async ({ page }) => {
    await expect(videoPage.videoTitle).toBeVisible()
    const links = await videoPage.getPageLinks()

    for (const link of links) {
      const response = link.includes('.mp4') ? null : await page.goto(link, { waitUntil: 'domcontentloaded' })
      if (response !== null) {
        expect.soft(response.status()).toBeLessThan(400)
      }
    }
  })
})
