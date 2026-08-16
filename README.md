# Aleg — Design Prototypes

Static HTML and CSS prototypes for the Aleg restaurant platform: the customer menu, the
panel login, the super-admin console and the marketing landing page.

These are design explorations, built before the production application and used to settle
layout, spacing, colour and component structure ahead of implementation. The working
software lives in [aleg-agent](https://github.com/aliikrhnn/aleg-agent) and the platform
repositories.

## What is in here

| Path | Contents |
| --- | --- |
| `Aleg Menu.html` | Customer-facing QR menu |
| `Aleg Panel Login.html` | Operator login screen |
| `Aleg Super Admin.html` | Platform admin console layout |
| `landing/` | Marketing page, plus React component drafts (`hero`, `footer`, `map`) |
| `src/`, `src-admin/` | Shared stylesheets and assets |
| `screenshots/`, `refs/` | Renders and visual references |

## Viewing them

Open any `.html` file directly in a browser — they are self-contained, with no build step.

## Why prototype in plain HTML

Fast. No build, no component API to design before knowing what the screen should look
like, and the CSS moves into the real application almost unchanged. The cost is that the
prototypes drift from production once the app is live — which is why these are a record
of a stage, not a maintained design system.
