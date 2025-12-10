import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0a1e] via-[#1b0a4d] to-[#2d1b69] flex flex-col bg-gradient-to-b items-center py-10 px-6 text-center">
      <h1 className="text-5xl font-extrabold text-white drop-shadow-md">
        About Me
      </h1>
      <p className="mt-3 text-lg max-w-xl leading-relaxed text-white">
        Hi! I’m <b>Greg Philip Prado</b>, I am a motivated and curious individual with a passion for learning and personal growth. 
        I value integrity, perseverance, and continuous improvement.
      </p>
      <div className="flex flex-col md:flex-row items-center gap-10 max-w-5xl">
        <Image
          src="/grgp.png"
          alt="Greg Philip Prado"
          width={240}
          height={240}
          className="rounded-3xl shadow-2xl border-4 border-[#2a144e] bg-[#2a144e]"
        />

        <div className="flex flex-col gap-6 text-left">
          <div className="flex flex-col md:flex-row items-center bg-[#2a144e] rounded-xl shadow-xl p-8 gap-8 mt-14">
            <h2 className="text-3xl font-extrabold text-white">Background</h2>
            <p className="text-white mt-3">
              I'm Greg Philip Prado BSIT Student in Naga College Foundation and I came from Castillo, Cabusao, 20yrs old. 
              Over the years, I developed a little bit improvement in coding and i study hard for more improvements to come.
              Throughout my journey, I have cultivated qualities like problem-solving, teamwork, or adaptability, 
              which have helped me overcome challenges and achieve meaningful results. I am passionate about continuous learning and personal growth.
              My journey has shaped me into a dedicated and adaptable individual, ready to take on new challenges.
            </p>
          </div>
          <Link href="/creator">
          <Button className="px-6 py-3 text-lg bg-blue-500 shadow-md hover:bg-blue-700">
            Back to Home
          </Button>
        </Link>
          </div>
        </div>
      </div>
  );
}
