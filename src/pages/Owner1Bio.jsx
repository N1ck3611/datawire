import { Link } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'

const Owner1Bio = () => {
  return (
    <div className="pt-14 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-500 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-osint-card border border-osint-border p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-16 h-16 bg-white/10 border border-white/30 rounded flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-osint-secondary mb-1">Owner 1</h1>
              <p className="text-white text-sm font-medium mb-3">Lead Developer</p>
              <p className="text-osint-muted text-sm leading-relaxed">
                Specialist in OSINT tools and Discord bot development with extensive experience in building intelligence gathering platforms. Passionate about open-source intelligence and creating tools that make data accessible.
              </p>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-osint-card border border-osint-border p-6 mb-6">
          <h2 className="text-lg font-bold text-osint-secondary mb-4">Skills</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Discord Bot Development",
              "OSINT Tool Creation",
              "API Integration",
              "Data Analysis",
              "Security Research",
              "Full-Stack Development"
            ].map((skill, index) => (
              <div key={index} className="text-xs text-osint-muted">
                • {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Contributions Section */}
        <div className="bg-osint-card border border-osint-border p-6">
          <h2 className="text-lg font-bold text-osint-secondary mb-4">Contributions</h2>
          <div className="space-y-4">
            <div className="border-l-2 border-white pl-3">
              <h3 className="font-semibold text-sm text-osint-secondary mb-1">OsintCat Development</h3>
              <p className="text-xs text-osint-muted">Lead developer of the OsintCat bot, implementing core OSINT functionalities and API integrations.</p>
            </div>
            <div className="border-l-2 border-white pl-3">
              <h3 className="font-semibold text-sm text-osint-secondary mb-1">DataWire Platform</h3>
              <p className="text-xs text-osint-muted">Architected the overall DataWire intelligence platform and infrastructure.</p>
            </div>
            <div className="border-l-2 border-white pl-3">
              <h3 className="font-semibold text-sm text-osint-secondary mb-1">Security Research</h3>
              <p className="text-xs text-osint-muted">Conducts ongoing research into data breaches and threat intelligence methodologies.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Owner1Bio
