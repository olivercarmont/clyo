import { ThemeToggle } from "@/components/theme-toggle";
import { ErrorBoundary } from "react-error-boundary";
import { OptionContractsDisplay } from "@/components/OptionContractsDisplay";

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col'>
      <nav className='w-full flex flex-row items-center justify-between px-6 py-3 border-b'>
        <h1 className='text-xl font-bold'></h1>
        <ThemeToggle />
      </nav>

      <main className="flex-1 flex items-start sm:items-center justify-center px-4 pt-11 sm:pt-8">
        <div className="w-full max-w-3xl">
          <ErrorBoundary
            fallback={
              <span className='text-sm text-red-600'>
                Error with API 😅 - Please try again later.
              </span>
            }>
            <OptionContractsDisplay />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}