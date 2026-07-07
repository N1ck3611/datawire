import { useEffect, useRef } from 'react'

const SnowBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let snowflakes = []

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createSnowflakes = () => {
      snowflakes = []
      const flakeCount = Math.min(150, Math.floor((canvas.width * canvas.height) / 10000))
      
      for (let i = 0; i < flakeCount; i++) {
        snowflakes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          speed: Math.random() * 1 + 0.5,
          wind: Math.random() * 0.5 - 0.25,
          opacity: Math.random() * 0.5 + 0.3
        })
      }
    }

    const drawSnowflakes = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      snowflakes.forEach(flake => {
        // Update position
        flake.y += flake.speed
        flake.x += flake.wind

        // Reset if off screen
        if (flake.y > canvas.height) {
          flake.y = -flake.radius
          flake.x = Math.random() * canvas.width
        }
        if (flake.x > canvas.width) {
          flake.x = -flake.radius
        } else if (flake.x < -flake.radius) {
          flake.x = canvas.width
        }

        // Draw snowflake
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`
        ctx.fill()
      })
    }

    const animate = () => {
      drawSnowflakes()
      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    createSnowflakes()
    animate()

    const handleResize = () => {
      resizeCanvas()
      createSnowflakes()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}

export default SnowBackground
