import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Privacy = () => {
  return (
    <div className="pt-16 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-500 hover:text-white text-sm transition-colors group"
          >
            <i className='bx bx-arrow-back text-lg group-hover:-translate-x-1 transition-transform'></i>
            <span>Back to Home</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6"
          >
            <i className='bx bx-shield text-white'></i>
            <span className="text-sm text-white">Privacy Policy</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold text-osint-secondary mb-4">Privacy Policy</h1>
          <p className="text-base text-osint-muted">Your privacy is important to us. Learn how we handle your data.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-data text-white'></i>
              Information Collection
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              DataWire.cc does not collect, store, or process any personal data. Our website is a static informational site that does not require user registration or account creation. We do not use cookies, tracking scripts, or analytics services that collect personal information.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bxl-discord text-white'></i>
              Bot Usage Data
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              The DataWire Discord bots operate on Discord's platform. Any data processed by our bots is handled in accordance with Discord's Terms of Service and Privacy Policy. We do not independently store user data from Discord bot interactions beyond what is necessary for the bot's functionality.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-link-external text-white'></i>
              Third-Party Services
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              Our bots integrate with various third-party OSINT and intelligence services. Users of our bots are subject to the privacy policies of those third-party services. We are not responsible for the data practices of external services.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-lock text-white'></i>
              Data Security
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              We implement reasonable security measures to protect any data we process. However, no method of transmission over the internet is completely secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-child text-white'></i>
              Children's Privacy
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-edit text-white'></i>
              Changes to This Policy
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              We may update this privacy policy from time to time. We will notify users of any material changes by posting the new policy on this page.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-message text-white'></i>
              Contact Us
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              If you have questions about this privacy policy, please contact us through our Discord server.
            </p>
          </section>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-osint-muted mt-8 text-center"
        >
          Last updated: January 2024
        </motion.p>
      </div>
    </div>
  )
}

export default Privacy
