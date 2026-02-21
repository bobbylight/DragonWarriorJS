# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project is a clone of the original Dragon Warrior game on the NES. It tries to be as
authentic to the source as possible, with just a couple of quality-of-life improvements.

It's written in vanilla TypeScript, renders on `canvas` and is built with vite.

## Project Structure

- `src/` - Game source code
- `src/app/dw/mapLogic` - Classes representing the "logic" of every map in the game.
- `public/res/` - Static assets (graphics, sounds, etc.)
- `updater-lambda/` - Node.js AWS Lambda that scrapes Yahoo Finance and generates JSON data

## Common Commands

### Frontend (run from `app/` directory)

```bash
npm install                # Install dependencies
npm run dev                # Start dev server
npm run build              # Build to dist/
npm run serve              # Build to dist/ and serve locally for testing prod build
npm run test:unit          # Run unit tests with coverage (currently fails, no tests)
npm run lint               # Lint without fixing (CI mode, fails on warnings)
npm run lint:fix           # Lint and fix issues
npm run test               # Runs unit tests
npm run tsc                # Runs typecheck
```

## High-Level Architecture

* The game uses an open-source library called [gtp](https://github.com/bobbylight/gtp) that
  provides basic support for game states, resource loading, tilesets, audio, etc.
* A top-level entry point is "state" classes. The game is always running a state -
  `LoadingState`, `RoamingState`, `BattleState`, etc.
* The player's game state is also (confusingly) stored in `DwGameState`. But this part of the
  game isn't well fleshed out yet. Typically, "state" refers to the game state classes
  mentioned in the prior point.
* Being an old-school RPG, there are lots of text and menu bubbles. These are all implemented
  as subclasses of a base `Bubble` class. See e.g. `TextBubble`, `SpellBubble` and others.
* Map data is created in Tiled(https://www.mapeditor.org/) and exported as JSON. The map data
  is in `public/res/maps/`. Each map contains layers for NPCs, warps, collisions, and enemy
  spawns.
* Each map has a corresponding "map logic" file that lives in `src/app/dw/mapLogic`. These
  logic files define the NPC text on the map as well as any other special events.

## Submitting PRs

- Use conventional commit syntax (feat:, fix:, chore:, docs:, refactor:, test:, etc.)
- Ensure tests pass before committing and fix anything if necessary. If any tests
  needed fixing, let me review the changes before proceeding with the commit.`
- Commit messages don't need to mention tests being added. Only mention tests when a
  large amount of tests were added for previously uncovered code, or there was a
  major refactoring of test code.
- Always amend the current commit if the current PR is still in draft.

