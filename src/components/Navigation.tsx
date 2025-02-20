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
        gap: "1rem",
      }}
    >
      {items.map((item) => (
        <a
          style={{
            backgroundColor: "$gray.700",
          }}
          href={item.href}
        >
          {item.name}
        </a>
      ))}
    </nav>
  );
}
