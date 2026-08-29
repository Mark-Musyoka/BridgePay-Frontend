export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold">BridgePay</h1>
      <p className="max-w-md text-gray-600 dark:text-gray-400">
        A learning-project payments platform. See{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-800">
          PLAN.md
        </code>{" "}
        for the roadmap.
      </p>
    </main>
  );
}
