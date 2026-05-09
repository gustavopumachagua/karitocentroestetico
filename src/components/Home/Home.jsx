import Hero from "./Hero";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col text-slate-100">
      <main className="flex-grow">
        <Hero />
      </main>
    </div>
  );
}
