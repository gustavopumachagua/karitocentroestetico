import heroImage from "../../assets/Home.avif";
import AccessButton from "../AccesButon/AccessButton";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col-reverse lg:flex-row items-center justify-between px-6 lg:px-20 py-16 bg-gray-800 text-gray-100 h-dvh"
    >
      <div className="flex-1 max-w-xl text-center lg:text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-white">
          Panel Administrativo
        </h1>

        <p className="text-base md:text-lg text-gray-400 mb-8">
          Accede al sistema de gestión interna del centro estético. Diseñado
          para trabajadores y administradores, con herramientas que facilitan el
          control y la organización diaria.
        </p>
      </div>

      <div className="flex-1 mb-10 lg:mb-0 lg:ml-16 flex flex-col items-center">
        <img
          src={heroImage}
          alt="Panel administrativo"
          className="rounded-2xl shadow-2xl object-cover max-w-[220px] sm:max-w-[280px] lg:max-w-sm"
        />

        <div className="mt-6 w-full flex justify-center lg:hidden">
          <AccessButton />
        </div>
      </div>
    </section>
  );
}
