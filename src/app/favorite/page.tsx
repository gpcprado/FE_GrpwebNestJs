import Link from "next/link";
import Image from "next/image";

export default function Favorite() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0a1e] via-[#1b0a4d] to-[#2d1b69] text-white flex flex-col items-center px-8 py-20">

      <h1 className="text-5xl font-extrabold mb-12">My Favorite Artist & Music</h1>

      <div className="max-w-4xl w-full space-y-16">

        <div className="flex flex-col md:flex-row items-center bg-[#2a144e] rounded-xl shadow-xl p-8 gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-semibold mb-3">Favorite Artist: Daniel Ceasar</h2>
            <p className="text-gray-300 italic mb-3">
              Ashton Dumar Norwill Simmonds born April 5, 1995, known professionally as Daniel Caesar, is a Canadian singer and songwriter.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">Favorite Songs</h2>
            <ul className="text-gray-300 space-y-2">
            <p className="text-gray-300 italic mb-1">- Loose</p>
            <p className="text-gray-300 italic mb-1">- Best Part</p>
            <p className="text-gray-300 italic mb-1">- Always</p>
            <p className="text-gray-300 italic mb-1">- Rearrange My World</p>
            <p className="text-gray-300 italic mb-1">- Super Power</p>
            </ul>
          </div>

          <div className="flex-1 relative w-full h-64 md:h-72">
            <Image
              src="/DC.jpg"
              alt="The Weeknd"
              fill
              className="rounded-lg shadow-2xl object-contain"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center bg-[#2a144e] rounded-xl shadow-xl p-8 gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-semibold mb-3">Favorite Artist: Drake</h2>
            <p className="text-gray-300 italic mb-3">
              Aubrey Drake Graham born October 24, 1986 is a Canadian rapper, singer, and actor. He is credited with popularizing R&B sensibilities in hip-hop music.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">Favorite Songs</h2>
            <ul className="text-gray-300 space-y-2">
            <p className="text-gray-300 italic mb-1">- God's Plan</p>
            <p className="text-gray-300 italic mb-1">- Best I Ever Had</p>
            <p className="text-gray-300 italic mb-1">- Not You Too</p>
            <p className="text-gray-300 italic mb-1">- Shot For Me</p>
            <p className="text-gray-300 italic mb-1">- Teenage Fever</p>
            </ul>
          </div>

          <div className="flex-1 relative w-full h-64 md:h-72">
            <Image
              src="/Drake.jpg"
              alt="The Weeknd"
              fill
              className="rounded-lg shadow-2xl object-contain"
            />
          </div>
        </div>

                <div className="flex flex-col md:flex-row items-center bg-[#2a144e] rounded-xl shadow-xl p-8 gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-semibold mb-3">Favorite Artist: Frank Ocean</h2>
            <p className="text-gray-300 italic mb-3">
              Christopher Edwin Breaux also known Frank Ocean an American singer and songwriter is born October 28, 1987.            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">Favorite Songs</h2>
            <ul className="text-gray-300 space-y-2">
            <p className="text-gray-300 italic mb-1">- Pink matter</p>
            <p className="text-gray-300 italic mb-1">- White Ferrari</p>
            <p className="text-gray-300 italic mb-1">- Ivy</p>
            <p className="text-gray-300 italic mb-1">- Moon River</p>
            <p className="text-gray-300 italic mb-1">- Chanel</p>
            </ul>
          </div>

          <div className="flex-1 relative w-full h-64 md:h-72">
            <Image
              src="/Frankk.jpg"
              alt="The Weeknd"
              fill
              className="rounded-lg shadow-2xl object-contain"
            />
          </div>
        </div>

      <Link href="/creator">
        <button className="bg-blue-500 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold shadow-lg transition">
          Back to Home
        </button>
      </Link>
    </div>
    </div>
  );
}
