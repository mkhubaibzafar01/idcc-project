# RepoLens - GitHub Profile Analyzer

A web app that analyzes any public GitHub profile using the GitHub REST API. Built with HTML, CSS and JavaScript for IDCC 2026 (Web Development, Open 18+).

**Live site:** https://mkhubaibzafar01.github.io/idcc-project/

## Features
- Search any GitHub username
- Profile summary: avatar, bio, location, join year
- Totals for public repos, stars, forks and followers
- Language breakdown chart built from the user's own repositories
- Top 6 repositories ranked by stars
- Clear error messages (user not found, API rate limit)
- Responsive layout, keyboard friendly, respects reduced motion

## How it works
1. The app calls `GET /users/{username}` and `GET /users/{username}/repos` with `fetch` and async/await.
2. JavaScript aggregates stars, forks and languages from the response.
3. The results are rendered into the page using safe DOM methods (`textContent`).

## Run locally
Open `index.html` in any browser. No build step or backend is needed.

## Notes
The GitHub API allows 60 unauthenticated requests per hour per IP address.