const DiscordButton = () => {
  return (
    <a
      href="https://discord.gg/datawire"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-white hover:bg-gray-200 text-black px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-lg"
    >
      <i className='bx bxl-discord text-xl'></i>
      <span className="font-medium text-sm">Join Discord</span>
    </a>
  )
}

export default DiscordButton
