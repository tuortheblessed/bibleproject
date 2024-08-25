import { test as base, type APIRequestContext, request } from '@playwright/test'

export interface APIRequestOptions {
  apiBaseURL: string
}

interface APIRequestFixture {
  apiRequest: APIRequestContext
}

// This fixture will override baseURL with apiBaseURL from playwright.config.ts when making API calls with playwright
export const test = base.extend<APIRequestOptions & APIRequestFixture>({
  apiBaseURL: ['', { option: true }],

  apiRequest: async ({ apiBaseURL }, use) => {
    const apiRequestContext = await request.newContext({
      baseURL: apiBaseURL
    })
    await use(apiRequestContext)
    await apiRequestContext.dispose()
  }
})

export { expect } from '@playwright/test'
