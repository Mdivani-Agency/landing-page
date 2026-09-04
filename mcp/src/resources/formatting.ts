/**
 * Renderer contract for `components/markdown.tsx` (react-markdown +
 * remark-gfm, no rehype plugins) and `app/blog/[slug]/page.tsx`.
 *
 * Keep this text in lockstep with those files. It is served as an MCP
 * resource and inlined into every write-tool description.
 */
export const FORMATTING_CONTRACT = `Blog Markdown formatting contract

The page already renders \`title\` as the document <h1> and \`description\` as the lede. \`content\` is the body only.

1. Start headings at ##. Never emit a # heading. The page owns the only h1. The renderer remaps leftover # to h2, which would look like a second title. Only h2 and h3 have styles; h4+ render as unstyled HTML headings.
2. Do not repeat the title as a heading in content.
3. No raw HTML. rehype-raw is deliberately absent, so <div>, <br>, <script>, and friends are not rendered. This is a security boundary — do not work around it.
4. No YAML frontmatter. remark-frontmatter is not installed, so a --- block renders as a stray horizontal rule and literal text.
5. GFM is available: tables, strikethrough, task lists, and autolinked bare URLs.
6. Links: use root-relative paths for internal links (/how-i-work, /work, /blog). Only http, https, mailto, irc, ircs, and xmpp survive the default URL transform; anything else (javascript:, data:) is blanked to an empty href.
7. Tables scroll horizontally inside their own box, so they never widen the page. Keep column counts low for mobile readability.
8. Code fences render inside a styled pre. There is no syntax highlighting (no rehype-highlight), so a language hint is documentation only.
9. Avoid inline images. Markdown ![]() produces an unstyled, unoptimised <img>. Only cover_image_url goes through next/image, and it must be a same-origin path starting with /.
10. Line breaks: a single newline is a soft break, not a <br>. Use a blank line to start a paragraph.
11. description is plain text, not Markdown. It feeds the post card, the SEO meta description, and the RSS feed.

Recommended body shape:

## Section heading

Opening paragraph.

- Bullet
- Bullet

## Another section

More prose.`;

export const FORMATTING_RESOURCE_URI = "blog://formatting";
