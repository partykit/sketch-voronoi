import Link from "next/link"
import SharedSpace from "./shared-space"
import CursorsContextProvider from "./cursors-context"

export default function Home() {
  return (
    <main className="flex flex-col gap-4 min-h-screen p-6 overflow-hidden select-none">
      <div className="absolute top-3 right-3 text-sm">
        Made with <Link className="underline" href="https://partykit.io">PartyKit</Link>
      </div>

      <CursorsContextProvider>
        <SharedSpace />
      </CursorsContextProvider>
    </main>
  )
}
