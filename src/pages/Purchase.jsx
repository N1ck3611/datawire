import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AnnouncementBanner from '../components/AnnouncementBanner'

const API_BASE = 'https://datawirecc-api.mynameisntnick0.workers.dev'

const Purchase = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState('0.00')
  const [plan, setPlan] = useState(null)
  const [planExpiresAt, setPlanExpiresAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('credits')
  const [selectedCoin, setSelectedCoin] = useState('BTC')
  const [depositAmount, setDepositAmount] = useState('')
  const [depositAddress, setDepositAddress] = useState('')
  const [cryptoAmount, setCryptoAmount] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [toast, setToast] = useState(null)
  const [modal, setModal] = useState(null)
  
  // Plan purchase state
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [planCoin, setPlanCoin] = useState('BTC')
  const [senderAddress, setSenderAddress] = useState('')
  const [planPurchaseAddress, setPlanPurchaseAddress] = useState('')
  const [planCryptoAmount, setPlanCryptoAmount] = useState('')
  const [planPurchaseId, setPlanPurchaseId] = useState('')
  const [verifyingPlan, setVerifyingPlan] = useState(false)

  const PAYMENT_ADDRESSES = {
    BTC: 'bc1qpl22tu5gqre7frpz22jzgdkhvrsr4vjpc034ea',
    LTC: 'LYfjiJSiMZA9xmmUiN2t8fcUh4Esc3ymVk',
    ETH: '0xE5cE7596fD4a9D3659E19fd55E862602E81ECbf3',
    SOL: 'sDqQQKvQktKxL6aHmwcg1fhtwQ2Lc9MHQsQFcSnjaBf',
    USDT: '0xE5cE7596fD4a9D3659E19fd55E862602E81ECbf3'
  }

  const PLAN_PRICING = {
    weekly: { price: 10, name: 'Weekly', duration: '7 days', dailyRequests: 50, intelxUses: 0 },
    monthly: { price: 25, name: 'Monthly', duration: '30 days', dailyRequests: 250, intelxUses: 20 },
    lifetime: { price: 80, name: 'Lifetime', duration: 'Lifetime', dailyRequests: 1000, intelxUses: 100 }
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const showModal = (title, content, type = 'info') => {
    setModal({ title, content, type })
  }

  const closeModal = () => {
    setModal(null)
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('auth_token')
      if (!token) {
        navigate('/login?return=/purchase')
        return
      }
      
      const headers = { 'Authorization': `Bearer ${token}` }
      
      const [profileRes, balanceRes] = await Promise.all([
        fetch(`${API_BASE}/api/user/profile`, { headers }),
        fetch(`${API_BASE}/api/user/balance`, { headers })
      ])

      if (profileRes.status === 401 || balanceRes.status === 401) {
        localStorage.removeItem('auth_token')
        navigate('/login?return=/purchase')
        return
      }

      const profileData = await profileRes.json()
      const balanceData = await balanceRes.json()

      if (profileData.success) setUser(profileData.user)
      if (balanceData.success) {
        setBalance(balanceData.balance)
        setPlan(balanceData.plan)
        setPlanExpiresAt(balanceData.planExpiresAt)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      showToast('Failed to load user data', 'error')
      navigate('/login?return=/purchase')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < 1) {
      showToast('Minimum deposit is $1.00', 'error')
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE}/api/deposit/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ coin: selectedCoin, amount: depositAmount })
      })

      const data = await response.json()
      
      if (data.success) {
        setDepositAddress(data.address)
        setCryptoAmount(data.cryptoAmount)
        showModal(
          'Deposit Created',
          `Send ${data.cryptoAmount} ${selectedCoin} to the address below:`,
          'success'
        )
      } else {
        showToast(data.error || 'Failed to create deposit', 'error')
      }
    } catch (error) {
      showToast('Failed to create deposit', 'error')
    }
  }

  const handleVerifyPayment = async () => {
    if (!depositAddress) {
      showToast('Create a deposit first', 'error')
      return
    }

    setVerifying(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE}/api/deposit/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ depositId: 'latest' })
      })

      const data = await response.json()
      
      if (data.success) {
        if (data.status === 'completed') {
          showToast('Payment confirmed! Balance updated.', 'success')
          fetchUserData()
          setDepositAddress('')
          setCryptoAmount('')
        } else if (data.status === 'detected') {
          showToast(`Payment detected! ${data.confirmations}/${data.required} confirmations. Please wait...`, 'info')
        } else {
          showToast('Payment not yet detected on blockchain. Please check back in a few minutes.', 'info')
        }
      } else {
        showToast(data.error || 'Failed to verify payment', 'error')
      }
    } catch (error) {
      showToast('Failed to verify payment', 'error')
    } finally {
      setVerifying(false)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress)
    showToast('Address copied to clipboard', 'success')
  }

  const handleCreatePlanPurchase = async () => {
    if (!selectedPlan) {
      showToast('Please select a plan', 'error')
      return
    }

    if (!senderAddress.trim()) {
      showToast('Please enter your sender address for blockchain verification', 'error')
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE}/api/plan/purchase`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          planType: selectedPlan, 
          coin: planCoin,
          senderAddress: senderAddress.trim()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setPlanPurchaseAddress(data.receiverAddress)
        setPlanCryptoAmount(data.cryptoAmount)
        setPlanPurchaseId(data.purchaseId)
        showModal(
          'Plan Purchase Created',
          `Send ${data.cryptoAmount} ${planCoin} from ${senderAddress} to the address below:`,
          'success'
        )
      } else {
        showToast(data.error || 'Failed to create plan purchase', 'error')
      }
    } catch (error) {
      showToast('Failed to create plan purchase', 'error')
    }
  }

  const handleVerifyPlanPurchase = async () => {
    if (!planPurchaseId) {
      showToast('Create a plan purchase first', 'error')
      return
    }

    setVerifyingPlan(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE}/api/plan/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ purchaseId: planPurchaseId })
      })

      const data = await response.json()
      
      if (data.success) {
        if (data.status === 'completed') {
          showToast('Plan activated successfully!', 'success')
          fetchUserData()
          setPlanPurchaseAddress('')
          setPlanCryptoAmount('')
          setPlanPurchaseId('')
          setSenderAddress('')
          setSelectedPlan(null)
        } else if (data.status === 'detected') {
          showToast(`Payment detected! ${data.confirmations}/${data.required} confirmations. Please wait...`, 'info')
        } else {
          showToast('Payment not yet detected on blockchain. Please check back in a few minutes.', 'info')
        }
      } else {
        showToast(data.error || 'Failed to verify plan purchase', 'error')
      }
    } catch (error) {
      showToast('Failed to verify plan purchase', 'error')
    } finally {
      setVerifyingPlan(false)
    }
  }

  const copyPlanAddress = () => {
    navigator.clipboard.writeText(planPurchaseAddress)
    showToast('Address copied to clipboard', 'success')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-osint-bg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-osint-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-osint-bg text-osint-secondary pt-20 px-6">
      <AnnouncementBanner />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-3 group"
          >
            <i className='bx bx-arrow-back group-hover:-translate-x-1 transition-transform'></i>
            Back to Dashboard
          </motion.button>
          <div className="flex items-center gap-3 mb-3">
            <motion.img 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              src="https://i.ibb.co/wFrNvxt5/Chat-GPT-Image-Jul-6-2026-09-02-01-PM-removebg-preview.png" 
              alt="Datawire.cc" 
              className="w-12 h-12"
            />
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold mb-1"
              >Purchase</motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-osint-muted text-sm"
              >Add credits or upgrade to a plan</motion.p>
            </div>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('credits')}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                activeTab === 'credits'
                  ? 'bg-white text-black'
                  : 'bg-osint-bg/50 text-gray-500 hover:text-white border border-osint-border'
              }`}
            >
              Purchase Credits
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                activeTab === 'plans'
                  ? 'bg-white text-black'
                  : 'bg-osint-bg/50 text-gray-500 hover:text-white border border-osint-border'
              }`}
            >
              Upgrade Plan
            </button>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5 mb-6 border border-osint-border hover:border-white/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-osint-muted mb-1">Current Balance</p>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-4xl font-bold text-white"
              >${balance}</motion.div>
              {plan && (
                <p className="text-sm text-osint-muted mt-2 capitalize">{plan} Plan {planExpiresAt && `(Expires: ${new Date(planExpiresAt).toLocaleDateString()})`}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-osint-muted mb-1">Logged in as</p>
              <p className="text-osint-secondary font-medium">{user?.global_name || user?.username || 'User'}</p>
            </div>
          </div>
        </motion.div>

        {/* Credits Tab */}
        {activeTab === 'credits' && (
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-5 border border-osint-border hover:border-white/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.i
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className='bx bx-bitcoin text-2xl text-white'
            ></motion.i>
            <h2 className="text-lg font-semibold">Create Deposit</h2>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-osint-muted mb-2">Select Cryptocurrency</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.keys(PAYMENT_ADDRESSES).map(coin => (
                <button
                  key={coin}
                  onClick={() => setSelectedCoin(coin)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedCoin === coin
                      ? 'border-white bg-white/10 text-white'
                      : 'border-osint-border text-gray-500 hover:border-white/50'
                  }`}
                >
                  <i className={`bx ${
                    coin === 'BTC' ? 'bx-bitcoin' :
                    coin === 'ETH' ? 'bx-cube' :
                    coin === 'LTC' ? 'bx-coin' :
                    coin === 'SOL' ? 'bx-sun' : 'bx-dollar'
                  } text-xl block mb-1`}></i>
                  <span className="text-xs font-medium">{coin}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-osint-muted mb-2">Amount (USD)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Min $1.00"
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all text-sm"
            />
          </div>

          {depositAddress && (
            <div className="mb-4 p-3 bg-osint-bg/50 rounded-lg border border-osint-border">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-osint-muted">Send to:</label>
                <button
                  onClick={copyAddress}
                  className="text-xs text-white hover:text-gray-300 flex items-center gap-1"
                >
                  <i className='bx bx-copy'></i> Copy
                </button>
              </div>
              <div className="font-mono text-xs text-white break-all mb-2">{depositAddress}</div>
              {cryptoAmount && (
                <div className="text-xs text-osint-muted">
                  Amount to send: <span className="text-osint-secondary font-medium">{cryptoAmount} {selectedCoin}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCreateDeposit}
              className="flex-1 px-4 py-2 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-white/25 transition-all text-sm"
            >
              Create Deposit
            </button>
            {depositAddress && (
              <button
                onClick={handleVerifyPayment}
                disabled={verifying}
                className="px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {verifying ? (
                  <span className="flex items-center gap-2">
                    <i className='bx bx-loader-alt animate-spin'></i> Verifying
                  </span>
                ) : (
                  'Verify Payment'
                )}
              </button>
            )}
          </div>

          <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/20">
            <div className="flex items-start gap-2">
              <i className='bx bx-info-circle text-white mt-0.5 text-sm'></i>
              <div className="text-xs text-osint-muted">
                <p className="mb-1"><strong className="text-osint-secondary">Important:</strong></p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Minimum deposit: $1.00 USD</li>
                  <li>Payments are verified on the blockchain</li>
                  <li>Confirmations required: BTC(2), LTC(6), ETH(12), SOL(32), USDT(12)</li>
                  <li>Balance updates automatically after confirmation</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <>
            {/* Plan Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card rounded-2xl p-5 mb-6 border border-osint-border hover:border-white/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <i className='bx bx-crown text-2xl text-white'></i>
                <h2 className="text-lg font-semibold">Select a Plan</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {Object.entries(PLAN_PRICING).map(([key, plan]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPlan(key)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPlan === key
                        ? 'border-white bg-white/10'
                        : 'border-osint-border hover:border-white/50'
                    }`}
                  >
                    <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                    <div className="text-2xl font-bold mb-1">${plan.price}</div>
                    <p className="text-xs text-osint-muted mb-3">{plan.duration}</p>
                    <div className="text-left space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-osint-muted">Daily Requests:</span>
                        <span className="text-white font-medium">{plan.dailyRequests}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-osint-muted">IntelX Uses:</span>
                        <span className="text-white font-medium">{plan.intelxUses}</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Plan Purchase Form */}
            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card rounded-2xl p-5 border border-osint-border hover:border-white/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <i className='bx bx-shopping-cart text-2xl text-white'></i>
                  <h2 className="text-lg font-semibold">Purchase {PLAN_PRICING[selectedPlan].name} Plan</h2>
                </div>

                <div className="mb-4">
                  <label className="block text-xs text-osint-muted mb-2">Select Cryptocurrency</label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.keys(PAYMENT_ADDRESSES).map(coin => (
                      <button
                        key={coin}
                        onClick={() => setPlanCoin(coin)}
                        className={`p-3 rounded-lg border transition-all ${
                          planCoin === coin
                            ? 'border-white bg-white/10 text-white'
                            : 'border-osint-border text-gray-500 hover:border-white/50'
                        }`}
                      >
                        <i className={`bx ${
                          coin === 'BTC' ? 'bx-bitcoin' :
                          coin === 'ETH' ? 'bx-cube' :
                          coin === 'LTC' ? 'bx-coin' :
                          coin === 'SOL' ? 'bx-sun' : 'bx-dollar'
                        } text-xl block mb-1`}></i>
                        <span className="text-xs font-medium">{coin}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs text-osint-muted mb-2">
                    Your Sender Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    placeholder="Enter the address you'll send from"
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all text-sm"
                  />
                  <p className="text-xs text-osint-muted mt-1">
                    Required for blockchain verification. This is the address you will send the payment from.
                  </p>
                </div>

                {planPurchaseAddress && (
                  <div className="mb-4 p-3 bg-osint-bg/50 rounded-lg border border-osint-border">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-osint-muted">Send {planCryptoAmount} {planCoin} from {senderAddress} to:</label>
                      <button
                        onClick={copyPlanAddress}
                        className="text-xs text-white hover:text-gray-300 flex items-center gap-1"
                      >
                        <i className='bx bx-copy'></i> Copy
                      </button>
                    </div>
                    <div className="font-mono text-xs text-white break-all mb-2">{planPurchaseAddress}</div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleCreatePlanPurchase}
                    className="flex-1 px-4 py-2 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-white/25 transition-all text-sm"
                  >
                    Create Purchase
                  </button>
                  {planPurchaseAddress && (
                    <button
                      onClick={handleVerifyPlanPurchase}
                      disabled={verifyingPlan}
                      className="px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {verifyingPlan ? (
                        <span className="flex items-center gap-2">
                          <i className='bx bx-loader-alt animate-spin'></i> Verifying
                        </span>
                      ) : (
                        'Verify Payment'
                      )}
                    </button>
                  )}
                </div>

                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/20">
                  <div className="flex items-start gap-2">
                    <i className='bx bx-info-circle text-white mt-0.5 text-sm'></i>
                    <div className="text-xs text-osint-muted">
                      <p className="mb-1"><strong className="text-osint-secondary">Important:</strong></p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>You must send from the exact sender address provided</li>
                        <li>Payments are verified on the blockchain</li>
                        <li>Confirmations required: BTC(2), LTC(6), ETH(12), SOL(32), USDT(12)</li>
                        <li>Plan activates automatically after confirmation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Custom Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-lg z-50 ${
              toast.type === 'success' ? 'bg-white/20 border border-white/50 text-white' :
              toast.type === 'error' ? 'bg-red-500/20 border border-red-500/50 text-red-400' :
              'bg-osint-card border border-osint-border text-osint-secondary'
            }`}
          >
            <div className="flex items-center gap-3">
              <motion.i
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className={`bx ${
                  toast.type === 'success' ? 'bx-check-circle' :
                  toast.type === 'error' ? 'bx-x-circle' : 'bx-info-circle'
                } text-xl`}
              ></motion.i>
              <span>{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 border border-osint-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-osint-secondary">{modal.title}</h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="text-osint-muted hover:text-osint-secondary transition-colors"
                >
                  <i className='bx bx-x text-2xl'></i>
                </motion.button>
              </div>
              <div className="mb-4">
                <p className="text-osint-secondary mb-4">{modal.content}</p>
                {depositAddress && (
                  <div className="p-4 bg-osint-bg/50 rounded-xl border border-osint-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-osint-muted">Address:</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyAddress}
                        className="text-xs text-white hover:text-gray-300 flex items-center gap-1"
                      >
                        <i className='bx bx-copy'></i> Copy
                      </motion.button>
                    </div>
                    <div className="font-mono text-sm text-white break-all">{depositAddress}</div>
                    {cryptoAmount && (
                      <div className="mt-2 text-sm text-osint-muted">
                        Amount: <span className="text-osint-secondary font-medium">{cryptoAmount} {selectedCoin}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={closeModal}
                className="w-full px-6 py-3 bg-white hover:bg-gray-200 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-white/25 transition-all"
              >
                Got it
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default Purchase
