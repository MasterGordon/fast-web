import Global from "~/lib/Global";
import { Icon } from "./Icon";
import { ChevronRight, RectangleVertical } from "lucide";
import { Link } from "./Link";

interface LayoutProps {
  children: JSX.Element | JSX.Element[];
}

const menuItems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Posts",
    href: "/posts",
  },
  {
    name: "About Me",
    href: "/about",
  },
];

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Global
        css={{
          body: {
            backgroundColor: "$black",
            color: "$fg",
            fontFamily: "$default",
          },
          "::selection": {
            backgroundColor: "$magenta",
            color: "black",
          },
        }}
      />
      <header
        style={{
          borderBottom: "2px solid",
          borderColor: "$magenta",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxW: "$page",
            mX: "auto",
            pX: "$4",
            pY: "$4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "start",
              gap: "$1",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: "$lg",
              }}
            >
              /home/MasterGordon
            </span>
            <span
              style={{
                fontSize: "$base",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon icon={ChevronRight} size="$4" color="$fg" />
              <Icon
                icon={RectangleVertical}
                size="$5"
                color="$fg"
                style={{
                  animation: "blink 1s infinite step-start",
                }}
              />
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1ch",
            }}
          >
            {menuItems.map((item) => (
              <Link
                style={{
                  "&:hover": {},
                  cursor: "pointer",
                  border: "2px solid",
                  borderColor: "$cyan",
                  borderRadius: "4px",
                  pX: "1ch",
                  pY: "0.5ch",
                }}
                href={item.href}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer></footer>
    </>
  );
}
