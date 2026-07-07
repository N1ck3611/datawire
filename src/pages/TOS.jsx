import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const TOS = () => {
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
            <i className='bx bx-file-blank text-white'></i>
            <span className="text-sm text-white">Terms of Service</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold text-osint-secondary mb-4">Terms of Service</h1>
          <p className="text-base text-osint-muted">Please read these terms carefully before using our services.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-check text-white'></i>
              Acceptance of Terms
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              By accessing or using DataWire.cc and our Discord bots, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-user text-white'></i>
              User Responsibility
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              You are solely responsible for how you use the DataWire bots and any information obtained through them. DataWire.cc and its operators are not responsible for any actions taken by users based on information provided by our bots.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-gavel text-white'></i>
              Legal Compliance
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              Users must ensure that their use of our services complies with all applicable laws and regulations. This includes but is not limited to laws regarding data privacy, harassment, stalking, and unauthorized access to computer systems. Users are responsible for understanding and complying with laws in their jurisdiction.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-block text-white'></i>
              Prohibited Uses
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed mb-3">
              You may not use our services for:
            </p>
            <ul className="text-sm text-osint-muted space-y-2">
              <li className="flex items-start gap-2">
                <i className='bx bx-x text-gray-400 mt-0.5 flex-shrink-0'></i>
                <span>Illegal activities or purposes</span>
              </li>
              <li className="flex items-start gap-2">
                <i className='bx bx-x text-gray-400 mt-0.5 flex-shrink-0'></i>
                <span>Harassment, stalking, or threatening individuals</span>
              </li>
              <li className="flex items-start gap-2">
                <i className='bx bx-x text-gray-400 mt-0.5 flex-shrink-0'></i>
                <span>Unauthorized access to systems or data</span>
              </li>
              <li className="flex items-start gap-2">
                <i className='bx bx-x text-gray-400 mt-0.5 flex-shrink-0'></i>
                <span>Violating any applicable laws or regulations</span>
              </li>
              <li className="flex items-start gap-2">
                <i className='bx bx-x text-gray-400 mt-0.5 flex-shrink-0'></i>
                <span>Infringing on the rights of others</span>
              </li>
            </ul>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-shield-quarter text-white'></i>
              Disclaimer of Liability
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              DataWire.cc and its operators are not responsible for how customers use this bot. Users are solely responsible for their actions and any consequences resulting from the use of our services. We provide information "as is" without any warranties, express or implied.
            </p>
            <p className="text-sm text-osint-muted leading-relaxed mt-2">
              In no event shall DataWire.cc or its operators be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from the use or inability to use our services.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-info-circle text-white'></i>
              Accuracy of Information
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              The information provided by our bots is obtained from third-party sources and may not be accurate, complete, or up-to-date. Users should verify information independently before making decisions based on it. We are not responsible for any errors or omissions in the information provided.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-link-external text-white'></i>
              Third-Party Services
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              Our bots integrate with third-party OSINT and intelligence services. Users are subject to the terms of service of those third-party providers. We are not responsible for the availability, accuracy, or legality of third-party services.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-server text-white'></i>
              Service Availability
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              We do not guarantee uninterrupted or error-free service. We reserve the right to modify, suspend, or discontinue our services at any time without notice.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-hand text-white'></i>
              Indemnification
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              You agree to indemnify and hold harmless DataWire.cc and its operators from any claims, damages, or expenses arising from your use of our services or violation of these terms.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-scales text-white'></i>
              Governing Law
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              These terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved in the appropriate courts.
            </p>
          </section>

          <section className="bg-osint-card border border-osint-border rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-osint-secondary mb-3 flex items-center gap-2">
              <i className='bx bx-edit text-white'></i>
              Changes to Terms
            </h2>
            <p className="text-sm text-osint-muted leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.
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

export default TOS
