# Tic Tac Go!

## Project Description

This is a Tic-Tac-Toe multiplayer game built with the following stack:

  * Next FE in the `client` directory.
  * Nest BE in the `server` directory for Websocket Gateways.
  * Socket.io for managing the Websockets
  * Playwright in `client` for testing the basic multiplayer capability.
  * Currently, no DB or cache server is being used.

## Run Instructions

To run the full project:
  1. Pull the project into your local environment
  2. Open two terminal windows
    1. In one window, cd into `client`, install packages, and run `npm run dev`
    2. In the second window, cd into `server`, install packages, and run `npm run start:dev`

To run Playwright:
  1. Run the `server` using the above steps
  2. In a separate terminal, `cd` into `client` and use `npx playwright test` to run the e2e test.

## Future Enhancements

  * Add Redis server to store connections. This will allow for horizontal scaling and a failsafe in case BE service goes down.
  * Add Login functionality and track previous games in a DB. This could lead to creating leaderboards & pairing users based on ability.
  * Add Invite functionality to allow users to choose their opponents.
  * Add more E2E tests to validate edge case behavior around reloading, finishing games, navigation, etc...
  * Add BE & FE unit tests (current functionality is being tested by e2e)
  * Refine CICD process
  * Add more logging to BE
  * Use a monorepo framework to share types (currently they are duplicated) and allow e2e test to be fully integrated
  * the timer functionality is slightly buggy
  * Add better connectivity error handling

## Project Notes

I used this task as an opportunity to learn a bit -- The following was new to me:

  * I'd never developed anything more robust than a sample app using Websockets. It was a coinflip for me to choose `socket.io` over `ws` -- can't really <i>know</i> the benefits until you try it. My main annoyance with `socket.io` is that all examples in their docs and other articles use `socket.id` to manage connections yet <i>elsewhere in their own docs</i>, `socket.io` says not to use `socket.id` to manage connections (the id is ephemeral and doesn't persist through reloads). Session management was somewhat frustrating, and I'm not fully satisfied with my current implementation.
  * For the Websockets Gateway, I could've used a simple `express` server, but I was curious about the `NestJS` Gateway functionality (which support `socket.io` out of the box). The `Nest` Gateways are really easy to set up and use, the only thing I'd say is that they don't support middleware very nicely (they have interceptors and adapters but those don't seem to work well). This added to the Session management challenge.
  * I had not used `Next` before, and was curious to try it out. Pretty straightforward, althought I'm not a big fan of `React`'s Server Components wich `Next`'s App router uses. I want it to be smarter: I should think it could determine what can be rendered on server on its own -- other frameworks like SvelteKit do. There was no need for application-wide state management besides using `localStorage`.
  * I'd used `Cypress` before but chose here to use `Playwright`, which I had not used. `Cypress` doesn't support multiple browser instances like `Playwright` does. There are workarounds that `Cypress` suggests, but it was nice that `Playwright` was straightforward.


