# :chart: Activity Trends

# Contents
- [About](#about)
- [Getting Started](#getting-started)
- [NPM Scripts](#npm-scripts)
- [Technology Documentation](#technology-documentation)

## About
A dashboard style interface visualising the data collected from my Apple Watch.
The main two sources are the native iOS [Activity](https://support.apple.com/en-gb/guide/watch/apd3bf6d85a6/watchos) 
app which I used to record my gym workouts and cardio sessions and the 3rd party iOS app, [Pillow](https://pillow.app/),
that I used to record my sleep.

As a back-end developer who, only occasionally, works with front-end codebases, I wanted a personal project that I
could use to learn [ReactJS](https://reactjs.org/) and all the other relevant industry-standard technologies that are
commonly found in front-end stacks. I've had experience working with [D3js](https://d3js.org/)
and [Recharts](https://recharts.org/en-US/) provides a nice React wrapper for it.

## Getting Started
For development, you will only need NodeJS and environment variables configured.

### NodeJS Installation on Windows
Just go to the [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

## NPM Scripts

| Name     | Description                                                          |
|----------|----------------------------------------------------------------------|
| `dev`    | Serves the application locally at `localhost:3000`.                  |
| `build`  | Builds the application into the `.next` directory in the root.       |
| `start`  | Starts a NodeJS server that supports hyrbid pages (static & SSR)     |
| `export` | Exports all pages as static `.html` files.                           |
| `deploy` | Builds, exports, commits, pushes and subtrees for GitHub pages.      |

## Technology Documentation
- [NextJS](https://nextjs.org/docs/getting-started)
- [React Bootstrap](https://react-bootstrap.github.io/layout/grid/)
- [Papa Parse](https://www.papaparse.com/docs)
- [Recharts](https://recharts.org/en-US/api)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Font Awesome](https://fontawesome.com/how-to-use/on-the-web/using-with/react)
- [SASS](https://sass-lang.com/documentation/syntax#scss)
- [MomentJS](https://momentjs.com/docs/)