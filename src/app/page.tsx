import Link from "next/link";
import SharedSpace from "./shared-space";
import CursorsContextProvider from "./cursors-context";

export default function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // when hosted in an iframe on the partykit website, don't render link to the site
  const isPartyKitWebsite = searchParams?.host === "io";
  const room =
    typeof searchParams?.room === "string" ? searchParams.room : "voronoi-room";
  return (
    <main className="flex flex-col gap-4 min-h-screen p-6 overflow-hidden select-none">
      {isPartyKitWebsite ? null : (
        <div className="absolute top-3 right-3 text-sm">
          Made with{" "}
          <Link className="underline" href="https://partykit.io">
            PartyKit
          </Link>
        </div>
      )}

      <CursorsContextProvider room={room}>
        <SharedSpace />
      </CursorsContextProvider>
    </main>
  );
}
