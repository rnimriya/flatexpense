export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            SplitNest
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Financial harmony for shared living.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
