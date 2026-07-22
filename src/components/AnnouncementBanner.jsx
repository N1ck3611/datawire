import React from 'react'
import { X } from 'lucide-react'

const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = React.useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 pr-10">
        <span className="font-semibold text-sm md:text-base">
          ⚠️ Having issues with loading balance or payments? Join our Discord for support: 
          <a 
            href="https://discord.gg/breaches" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline font-bold hover:text-yellow-200 ml-1"
          >
            discord.gg/breaches
          </a>
        </span>
      </div>
    </div>
  )
}

export default AnnouncementBanner
