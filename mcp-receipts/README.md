This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Set the server-only `MCP_SERVER_URL` environment variable to the ReceiptAI MCP
endpoint, for example `http://localhost:5144/mcp`. The browser calls the Next.js
route handlers under `/api/mcp`; MCP and Groq credentials are never sent to the
browser.

## MCP capability flow

- Tools are discovered separately and invoked through `/api/mcp/tools/call`.
- Static resources are read by exact URI through `/api/mcp/resources/read`.
- Resource templates collect and encode their URI variables before using the same
  resource-read route.
- Prompts are retrieved through `/api/mcp/prompts/get`; all returned prompt messages
  are then supplied to the chat workflow.

Mutation tools require explicit confirmation and are not automatically executed by
the chat model.

## Security

The ASP.NET MCP endpoint currently has no application identity or authorization
policy. It is enabled by default only in the Development environment. A non-development
host must explicitly set `Mcp:AllowUnauthenticated=true`, which should only be done
when another trusted network/authentication layer protects the endpoint. Production
deployment still requires a deliberate authentication design.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
