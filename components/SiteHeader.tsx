// Site-wide header — logo links home, sits above every page.

import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="px-4 py-3">
        <Link href="/" className="inline-block">
          <Image
            src="/logo.png"
            alt="TownWatch"
            width={1857}
            height={847}
            priority
            className="h-12 w-auto"
          />
        </Link>
      </div>
    </header>
  );
}
