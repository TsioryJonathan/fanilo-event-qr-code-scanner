"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Ticket, History, BarChart3 } from "lucide-react";
import clsx from "clsx";

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

export default function FloatingSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-5 top-1/2 -translate-y-1/2 w-16 h-fit bg-gray-800/50 backdrop-blur-md shadow-lg rounded-xl py-10 flex items-center justify-center animate-float z-50">
      <nav>
        <ul className="flex flex-col gap-10">
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
