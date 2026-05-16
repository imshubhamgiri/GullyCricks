export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-amber-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-300">
            GullyCricks
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Start your match in seconds</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Section - Info */}
          <div className="hidden md:block space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Create & Manage</h2>
              <p className="text-slate-300 leading-relaxed">
                Set up your cricket match in seconds. Configure players, overs, and match rules with our intuitive interface.
              </p>
            </div>
            <div className="space-y-3">
              {['Easy Setup', 'Real-time Scoring', 'Track Performance'].map((feature) => (
                <div key={feature} className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-8">New Match</h3>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-med ium text-slate-300 mb-2">
                  Your Name (Admin)
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  defaultValue="John Doe"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Total Overs
                </label>
                <input
                  type="number"
                  placeholder="Number of overs"
                  defaultValue="5"
                  min="1"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Total Players
                </label>
                <input
                  type="number"
                  placeholder="Number of players"
                  defaultValue="11"
                  min="2"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Wide Runs
                  </label>
                  <input
                    type="number"
                    defaultValue="1"
                    min="0"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    No Ball Runs
                  </label>
                  <input
                    type="number"
                    defaultValue="1"
                    min="0"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-amber-500/50 mt-2"
              >
                Start Match
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
