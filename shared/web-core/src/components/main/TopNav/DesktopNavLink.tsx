import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./DesktopNavLink.module.scss";

export function DesktopNavLink({
  label,
  href,
}: {
  label: string;
  isActive?: boolean;
  href: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={
        isActive
          ? `${styles.isActive} inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium`
          : `${styles.isInactive} inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium hover:border-gray-300 hover:text-gray-700`
      }
    >
      {label}
    </Link>
  );
}
