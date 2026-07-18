import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const Skeleton = ({ className, ...props }) => {
  return (
    <motion.div
      className={cn(
        'rounded-xl bg-white/[0.05]',
        'animate-pulse',
        className
      )}
      {...props}
    />
  )
}

export default Skeleton
