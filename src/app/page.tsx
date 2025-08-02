import Link from 'next/link'

// Specify Edge Runtime for Cloudflare compatibility
export const runtime = 'edge'

// Generate metadata for the home page
export function generateMetadata() {
  return {
    title: '4-Wall Projection System - Immersive Harry Potter Experience',
    description:
      'Experience the magic with our 4-wall projection system featuring interactive Harry Potter scenes. Immersive 3D environments with real-time modifiers and synchronized multi-wall displays.',
    keywords: [
      '4-wall projection',
      'Harry Potter experience',
      'immersive projection',
      '3D scenes',
      'interactive display',
      'Forbidden Forest',
      'projection mapping',
    ],
    openGraph: {
      title: '4-Wall Projection System - Immersive Harry Potter Experience',
      description:
        'Experience the magic with our 4-wall projection system featuring interactive Harry Potter scenes and real-time modifiers.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '4-Wall Projection System - Immersive Experience',
      description:
        'Experience the magic with our 4-wall projection system featuring interactive Harry Potter scenes.',
    },
  }
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            4-Wall Projection System
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Immersive Harry Potter experience with interactive 3D scenes and
            real-time modifiers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map(wallNumber => (
            <div
              key={wallNumber}
              className="bg-black/30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/30"
            >
              <h3 className="text-xl font-semibold mb-4 text-center">
                Wall {wallNumber}
              </h3>
              <div className="space-y-3">
                <Link
                  href={`/service/programs/harry-potter-experience/forbidden-forest/${wallNumber}`}
                  className="block w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors text-center"
                >
                  Forbidden Forest
                </Link>
                <Link
                  href={`/service/programs/harry-potter-experience/forbidden-forest/${wallNumber}?modifiers=show_creatures:true,fog_density:0.8`}
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors text-center text-sm"
                >
                  Forest + Creatures
                </Link>
                <Link
                  href={`/service/programs/harry-potter-experience/forbidden-forest/${wallNumber}?modifiers=time_of_day:dawn,mystical_intensity:1.5`}
                  className="block w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors text-center text-sm"
                >
                  Dawn Scene
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-black/20 backdrop-blur-lg rounded-lg p-8 border border-blue-500/30">
          <h2 className="text-2xl font-bold mb-4">System Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-blue-400">
                🎭 Interactive Scenes
              </h3>
              <p className="text-gray-300">
                JSON-configured 3D scenes with layers, lighting, and particle
                systems
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-purple-400">
                🎮 Real-time Modifiers
              </h3>
              <p className="text-gray-300">
                URL-based modifiers for instant scene customization
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-400">
                🖥️ 4-Wall Setup
              </h3>
              <p className="text-gray-300">
                Synchronized views for north, south, east, and west walls
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-400">
          <p>Press Ctrl+D in any scene for developer panel</p>
        </div>
      </div>
    </div>
  )
}
