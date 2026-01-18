import { ThumbsUp, Crown } from 'lucide-react'

export default function VotePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brown-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full mb-6">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-brown-900 mb-4">
            Cast Your Vote
          </h1>
          <p className="text-xl text-brown-600 max-w-3xl mx-auto">
            Support your favorite contestant in the Classic Queen International pageant. 
            Every vote brings them closer to the crown! 👑
          </p>
        </div>

        {/* Temporary Content Box */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-brown-200">
          <div className="text-center py-12">
            <ThumbsUp className="h-16 w-16 text-gold-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-brown-900 mb-4">
              Voting Interface Coming Soon
            </h2>
            <p className="text-brown-600 mb-8">
              We're putting the finishing touches on the live voting system. 
              Soon you'll be able to browse contestants and vote for your favorite directly from this page.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/candidates"
                className="inline-flex items-center justify-center space-x-2 bg-brown-600 hover:bg-brown-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                <span>Browse Contestants</span>
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center space-x-2 border-2 border-brown-600 text-brown-700 hover:bg-brown-50 font-bold py-3 px-8 rounded-lg transition-colors"
              >
                <span>Back to Home</span>
              </a>
            </div>
          </div>
          
          {/* Info Note */}
          <div className="mt-8 p-4 bg-brown-50 rounded-lg border border-brown-200">
            <p className="text-brown-700 text-sm">
              <strong>Note:</strong> The final voting page will integrate with payment platforms (Paystack/PayPal) 
              and display a live leaderboard of all contestants.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}