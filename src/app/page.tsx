import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between bg-white px-16 py-28 dark:bg-black sm:items-start">
        <div className="flex w-full flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl border border-black/[.08] bg-zinc-100 dark:border-white/[.145] dark:bg-zinc-900" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Vitrine</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">collect, permanently</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 text-center sm:items-start sm:text-left">
            <h1 className="max-w-xl text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              A small collection game built around progress that never goes backward.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Explore locations. Actions create events. Events unlock items. The collection is append-only.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full bg-black px-5 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 md:w-[170px]"
            href="/collection"
          >
            View collection
          </Link>

          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 text-base font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[170px]"
            href="/library"
          >
            Explore
          </Link>

          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 text-base font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[170px]"
            href="/login"
          >
            Login
          </Link>
        </div>

        <div className="w-full pt-10 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <span>Locations: Library, Museum, Cafe, Castle, Garden</span>
            <span>Rule: unlocks are permanent</span>
          </div>
        </div>
      </main>
    </div>
  );
}
