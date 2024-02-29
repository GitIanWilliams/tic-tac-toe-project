import { test, expect, Page } from '@playwright/test';

test('two players can join a game and see each others moves', async ({ browser }) => {
  const playerOneContext = await browser.newContext();
  const playerTwoContext = await browser.newContext();

  try {
    const pageOne = await playerOneContext.newPage();
    const pageTwo = await playerTwoContext.newPage();
    await pageOne.goto('/');
    expect(await pageOne.locator('h1').innerText()).toContain('Tic Tac Go!');

    await pageTwo.goto('/');
    expect(await pageOne.locator('button').innerText()).toContain('Find A Match!');

    await pageOne.locator('button:has-text("Find A Match!")').click();
    // User One Joins Lobby
    await expect(pageOne.locator('button:has-text("Cancel")')).toHaveCount(1);
    await expect(pageOne.locator('h1:has-text("Looking for Match...")')).toHaveCount(1);

    // User Two Joins Lobby
    await pageTwo.locator('button:has-text("Find A Match!")').click();

    // User One Redirects
    await pageOne.waitForURL(/d*[a-zA-Z][a-zA-Z0-9]*$/);
    const trailingSlash = pageOne.url().lastIndexOf('/');
    const id = pageOne.url().slice(trailingSlash + 1);
    await expect(id.length).toBeGreaterThan(0);

    // User Two Redirects to Same Page
    await pageTwo.waitForURL(/d*[a-zA-Z][a-zA-Z0-9]*$/);
    await expect(pageTwo.url()).toContain(id);

    // wait for ready to play
    await pageOne.waitForSelector('h1:has-text("Current Turn:")');

    const clickableBoxLocator = '#tic-tac-toe-board > .cursor-pointer';
    const clickableCellOne = pageOne.locator(clickableBoxLocator);
    const clickableCellTwo = pageTwo.locator(clickableBoxLocator);

    const players: { X?: Page; O?: Page} = {};

    if (await clickableCellOne.count()) {
      await expect(clickableCellTwo).not.toBeAttached();
      players.X = pageOne;
      players.O = pageTwo;

    } else {
      expect(await clickableCellTwo.count()).toBeGreaterThan(0);
      players.X = pageTwo;
      players.O = pageOne;
    }
    const squares = '#tic-tac-toe-board > div';

    // Both boards empty
    await expect(players.X.locator(squares).nth(0)).not.toHaveText('X');
    await expect(players.O.locator(squares).nth(0)).not.toHaveText('X');

    // X Turn
    await players.X.locator(squares).nth(0).click();

    // Both boards updated
    await expect(players.X.locator(squares).nth(0)).toHaveText('X');
    await expect(players.O.locator(squares).nth(0)).toHaveText('X');


    await expect(players.O.locator(squares).nth(1)).not.toHaveText('O');
    await expect(players.X.locator(squares).nth(1)).not.toHaveText('O');

    // O Turn
    await players.O.locator(squares).nth(1).click();

    // Both boards updated
    await expect(players.X.locator(squares).nth(1)).toHaveText('O');
    await expect(players.O.locator(squares).nth(1)).toHaveText('O');

  } catch(err) {
    console.log(err);
  }

});
