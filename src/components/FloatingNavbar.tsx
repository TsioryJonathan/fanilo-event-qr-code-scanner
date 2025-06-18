"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Ticket, History, BarChart3 } from "lucide-react";

const navItems = [
  { label: "Scanner", href: "/", icon: <Ticket className="w-7 h-7" /> },
  {
    label: "Historique",
    href: "/historique",
    icon: <History className="w-7 h-7" />,
  },
  {
    label: "Statistiques",
    href: "/stats",
    icon: <BarChart3 className="w-7 h-7" />,
  },
];

export default function FloatingNavbar() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-2 left-1/2 -translate-x-1/2 md:left-20 md:top-1/2 md:-translate-y-1/2 h-fit bg-gray-800/30 backdrop-blur-md shadow-lg rounded-xl flex items-center justify-center animate-float z-50 px-10 py-4 md:px-5 md:py-10">
      <nav>
        <ul className="flex flex-row md:flex-col gap-20">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                title={item.label}
                aria-label={item.label}
                className={`text-gray-400 hover:text-blue-500 transition-colors duration-300 ${
                  pathname == item.href ? "!text-blue-500" : ""
                }`}
              >
                {item.icon}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
