# Route Migration Map (P2.1)

## Purpose

This file maps existing screen keys to browser routes for route-based navigation.

## Screen to Route

| Screen Key | Route            |
| ---------- | ---------------- |
| home       | /                |
| admin      | /admin           |
| profile    | /profile         |
| results    | /results         |
| fees       | /fees            |
| attendance | /attendance      |
| routines   | /routines        |
| calendar   | /calendar        |
| downloads  | /downloads       |
| courses    | /courses         |
| present    | /courses/present |
| pending    | /courses/pending |

## Compatibility Strategy

- Existing components can continue calling setCurrentScreen(screenKey).
- App synchronizes state to URL and URL back to state.
- Direct URL open, browser back, and browser forward now map to the correct screen.

## Notes

- Unknown paths fall back to home.
- The route table currently lives in App.jsx for minimal-risk migration.

## Change Log

- 2026-03-28: Initial route migration map created for P2.1.
