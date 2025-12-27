import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json';
// import { request } from 'http';

test.beforeEach(async({page}) =>{
  await page.route('*/**/api/tags', async route=>{
  await route.fulfill({
  body: JSON.stringify(tags)
       })
  })

  await page.goto('https://conduit.bondaracademy.com/');
  
})  
  

test.only('has title and mocks tag names', async ({page})=>{
   await page.route('*/**/api/articles*', async route=>{
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is a Mock test title"
    responseBody.articles[0].description = "This is a Mock description"

    await route.fulfill({
      body: JSON.stringify(responseBody)
      
    })
  })

  await page.getByText('Global Feed').click()
  await expect (page.locator('.navbar-brand')).toHaveText('conduit')
  await expect(page.locator('app-article-list h1').first()).toHaveText('This is a Mock test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a Mock description')
  // await page.waitForTimeout(1000)
})


test('delete article', async ({page, request})=>{
//   const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', 
//     {data: {"user":{"email":"best1234@best.com","password":"Passcode4321"}
//   }
// })

//   const responseBody = await response.json()
//   const accessToken = responseBody.user.token
//
  // console.log(responseBody)
  // await request.post('')
  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      // "article":{"title":"This is a Mock test title","description":"This is a Mock description","body":"This is a Mock body","tagList":[]},
      "article":{"title":"Test title","description":"Test description","body":"Test body","tagList":[]},
    },
    
    })
    console.log(articleResponse)
  expect(articleResponse.status()).toEqual(201)

    await page.getByText('Global Feed').click()
    await page.getByText('Test title').click()
    await page.getByRole('button', {name: 'Delete Article'}).first().click()
    await page.getByText('Global Feed').click()

    await expect(page.locator('app-article-list h1').first()).not.toContainText('Test title')

})


test('create article manually then deletes its through api call', async({page, request})=>{
  await page.getByText('New Article').click()
  await page.getByRole('textbox', {name: 'Article Title'}).fill('This is test title from new project')
  await page.getByRole('textbox', {name: 'What\'s this article about?'}).fill('This is about playwright')
  await page.getByRole('textbox', {name: 'Write your article (in markdown)'}).fill('This is test body')
  await page.getByRole('button', {name: 'Publish Article'}).click()

  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug

  await expect(page.locator('.article-page h1')).toContainText('This is test title from new project')
  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()
  await expect(page.locator('app-article-list h1').first()).toContainText('This is test title from new project')

// NOTE: get the request after
// commiting to the actual manual flow then get its articles response to get slugId
  // const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', 
  //   {data: {"user":{"email":"best1234@best.com","password":"Passcode4321"}
  // }
// })

  // const responseBody = await response.json()
  // const accessToken = responseBody.user.token

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${process.env.SLUGID}`)
    // ,{
    // headers: {
    //   Authorization: `Token ${accessToken}`
    // }
  // })

expect(deleteArticleResponse.status()).toEqual(204)

})

