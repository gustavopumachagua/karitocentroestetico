import Hero from "./Hero";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
      <main className="flex-grow">
        <Hero />
      </main>
    </div>
  );
}
