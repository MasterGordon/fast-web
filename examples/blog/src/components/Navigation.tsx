interface NavigationItem {
  name: string;
  href: string;
}

const items: NavigationItem[] = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
];

export default function Navigation() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        margin: "auto",
        gap: "$2",
      }}
    >
      {items.map((item) => (
        <a
          style={{
            _hover: {
              backgroundColor: "$gray.900",
            },
            fontWeight: "$semibold",
            paddingY: "$2",
            paddingX: "$4",
            borderRadius: "$md",
          }}
          href={item.href}
        >
          {item.name}
        </a>
      ))}
    </nav>
  );
}
