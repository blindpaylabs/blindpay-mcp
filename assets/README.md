# Brand assets for MCP store listings

Every directory asks for a logo and a description. Take them from here so every listing matches.
Copy for the text fields lives in [LISTING.md](./LISTING.md).

Colors: `#09090B` (dark) and `#F7F8F8` (light). The mark comes from the dashboard favicon (`apps/app/public/favicon.svg` in blindpay-v2) and stays inside the circle a store may crop to.

## Files

| File | What it is | Use it for |
| --- | --- | --- |
| `icon-square-1024.png` | Dark full-bleed square, no rounded corners | Stores that apply their own mask: OpenAI Apps, Claude connectors directory, Smithery, Docker Hub |
| `icon-square-{512,256,128,64,32,16}.png` | Same, smaller | Upload forms with a size limit, favicons |
| `icon-square.svg` | Same, vector | Forms that accept SVG |
| `icon.svg`, `icon-{512,256,128,64}.png` | Dark tile with rounded corners | Glama, PulseMCP, mcp.so, Cursor directory, anywhere shown as-is |
| `icon-light.svg`, `icon-light-{512,256,128,64}.png` | Light tile with rounded corners | Dark UIs where the dark tile disappears |
| `mark-black.svg`, `mark-black-512.png` | Transparent mark, dark | Light backgrounds with no tile |
| `mark-white.svg`, `mark-white-512.png` | Transparent mark, light | Dark backgrounds with no tile |
| `wordmark-black.svg/png`, `wordmark-white.svg/png` | Mark plus "BlindPay" | Banners, marketplace headers |
| `favicon.ico` | 16, 32 and 64 px | Hosted pages |
| `logo-512.png`, `logo-64.svg` | Earlier tile, used by the repo README | Keep for the README |

## Where each listing gets its icon

| Listing | Field | File |
| --- | --- | --- |
| Official MCP Registry | `icons` in `server.json` | `icon.svg`, `icon-512.png`, `icon-light-512.png` (raw GitHub URLs) |
| Claude connectors directory | Logo upload | `icon-square-1024.png` |
| OpenAI Apps (ChatGPT) | App icon | `icon-square-1024.png` |
| Smithery | Server icon | `icon-square-512.png` |
| Glama, PulseMCP, mcp.so | Claimed listing logo | `icon-512.png` |
| Cursor directory | Logo | `icon-512.png` |
| Docker MCP registry | `about.icon` | `icon-512.png` raw GitHub URL |
| Claude Code plugin marketplace | none (the manifest has no icon field) | n/a |

Raw URL pattern: `https://raw.githubusercontent.com/blindpaylabs/blindpay-mcp/main/assets/<file>`
