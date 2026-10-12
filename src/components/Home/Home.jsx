import Hero from "./Hero";

export default function Home() {
  return (
    <div className="flex min-w-0 flex-col text-slate-100">
      <div className="min-w-0 flex-grow">
        <Hero />
      </div>
    </div>
  );
}
