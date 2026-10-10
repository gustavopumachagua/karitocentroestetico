import Hero from "./Hero";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col text-slate-100">
      <main className="flex-grow">
        <Hero />
      </main>
    </div>
  );
}
