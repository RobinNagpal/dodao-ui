import EllipsisDropdown, {
  EllipsisDropdownItem,
} from "@dodao/web-core/components/core/dropdowns/EllipsisDropdown";
import { isAdmin } from "@/utils/auth/isAdmin";
import React from "react";

export interface PrivateEllipsisDropdownProps {
  items: EllipsisDropdownItem[];
  className?: string;
  onSelect: (item: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function PrivateEllipsisDropdown(
  props: PrivateEllipsisDropdownProps
) {
  return isAdmin() ? <EllipsisDropdown {...props} /> : null;
}
