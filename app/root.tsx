import { Links, Meta, Outlet, Scripts, useLocation } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import styles from "./styles/global.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
  },
];

export default function App() {
  const path = useLocation().pathname;

  return (
    <html>
      <head>
        <title>Why? Exactly</title>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body className={path.includes("shuffle") ? "overflow-hidden" : ""}>
        <Outlet />

        <Scripts />
      </body>
    </html>
  );
}
