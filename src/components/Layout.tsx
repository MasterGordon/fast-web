import Global from "~/lib/Global";
import Navigation from "./Navigation";

interface LayoutProps {
  children: JSX.Element | JSX.Element[];
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginX: "auto",
        paddingX: "$4",
        marginTop: "$2",
        maxWidth: "1100px",
        gap: "$4",
      }}
    >
      <Global
        css={{
          body: {
            backgroundColor: "$gray.950",
            color: "$gray.50",
            fontFamily: "$sans",
          },
        }}
      />
      <header>Header</header>
      <Navigation />
      {children}
    </div>
  );
}
