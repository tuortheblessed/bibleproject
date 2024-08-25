/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { expect, type Locator, type Page } from '@playwright/test'

export class VideoPage {
  readonly page: Page
  readonly videoBreadcrumb: Locator
  readonly videoTitle: Locator
  readonly publishDate: Locator
  readonly shareButton: Locator
  readonly downloadButton: Locator
  readonly videoContainer: Locator
  readonly scriptureReferenceCloud: Locator

  constructor(page: Page) {
    this.page = page
    this.videoBreadcrumb = page.locator('span.video-breadcrumb.video-breadcrumb--current')
    this.videoContainer = page.locator('iframe.video-container-video')
    this.videoTitle = page.getByRole('heading', { name: 'Chaos Dragon' })
    this.publishDate = page.locator('div.video-meta > span.video-meta-item:nth-of-type(3)')
    this.shareButton = page.getByRole('button', { name: 'Share' })
    this.downloadButton = page.getByRole('link', { name: 'Download', exact: true })
    this.scriptureReferenceCloud = page.locator('.tag-cloud')
  }

  async goto(videoTitle: string) {
    await this.page.goto(`/explore/video/${videoTitle.toLowerCase().replace(/\s+/g, '-')}`)
  }

  async formatPublishDate() {
    const elementDate = await this.publishDate.textContent()
    if (elementDate === null || elementDate === '') {
      throw new Error('Publish date element not found')
    }

    const parsedDate = new Date(`${elementDate} 00:00:00`)
    const formattedDate = parsedDate.toISOString().substring(0, 10)
    return formattedDate
  }

  async gatherScripture() {
    const scriptureReferences = this.scriptureReferenceCloud.locator('.tag .bib-ref')
    await expect(scriptureReferences.first()).toBeVisible()

    const scripture = await scriptureReferences.evaluateAll(elements =>
      elements.map(element => element.getAttribute('data-query'))
    )
    return scripture
  }

  async getClipboardText() {
    return await this.page.evaluate(async () => {
      return await navigator.clipboard.readText()
    })
  }

  async getPageLinks() {
    return await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(anchor => anchor.href)
    })
  }
}
