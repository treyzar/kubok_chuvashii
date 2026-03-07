import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Inbox,
  Activity,
  Settings,
  LogOut,
  User,
  Map,
  Bell
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { motion } from "motion/react"
import { fetchTickets } from "@/api/tickets"
import { useAuthStore } from "@/store/auth"
import { ThemeToggle } from "@/shared/ui/theme-toggle"

const navigation = [
  { name: 'Дашборд', href: '/crm/dashboard', icon: LayoutDashboard },
  { name: 'Обращения', href: '/crm/appeals', icon: Inbox },
  { name: 'Мониторинг', href: '/crm/monitoring', icon: Activity },
  { name: 'Тепловая карта', href: '/crm/heatmap', icon: Map },
  { name: 'Админ-панель', href: '/crm/admin', icon: Settings, adminOnly: true },
]

export default function CRMLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [ticketCount, setTicketCount] = useState<number>(0)

  const user = useAuthStore((state) => state.user)
  const getFullName = useAuthStore((state) => state.getFullName)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/crm/login')
  }

  
  const activeNavItem = navigation.find(n => location.pathname.startsWith(n.href))

  
  useEffect(() => {
    const loadTicketCount = async () => {
      try {
        const response = await fetchTickets({ limit: 1 })
        setTicketCount(response.total)
      } catch (error) {
        console.error('Failed to fetch ticket count:', error)
      }
    }

    loadTicketCount()
  }, [])

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      {}
      <div className="hidden md:flex md:w-72 md:flex-col border-r border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-20 relative">
        <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
              <Map className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 tracking-tight">Городской Портал</span>
          </div>

          <div className="px-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-blue-950/30 rounded-2xl border border-slate-100/80 dark:border-slate-700/80 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-slate-100 dark:border-slate-700">
                <User className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {getFullName() || 'Пользователь'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.role === 'admin' ? 'Администратор' : user?.role === 'org' ? 'Организатор' : 'Исполнитель'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-grow flex flex-col px-4">
            <nav className="flex-1 space-y-2">
              {navigation.filter(item => !item.adminOnly || user?.role === 'admin').map((item) => {
                
                const isActive = item.href === '/crm/dashboard'
                  ? location.pathname === item.href
                  : location.pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      isActive
                        ? 'bg-blue-50/80 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 shadow-sm border border-blue-100/50 dark:border-blue-900/50'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent',
                      'group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300',
                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-300'
                      )}
                      aria-hidden="true"
                    />
                    <span className="relative z-10">{item.name}</span>
                    {item.name === 'Обращения' && ticketCount > 0 && (
                      <span className="ml-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-0.5 px-2.5 rounded-full text-xs font-bold shadow-sm">
                        {ticketCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex-shrink-0 px-4 mt-8 space-y-2">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Настройки</span>
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-300 border border-transparent hover:border-red-100 dark:hover:border-red-900"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-500" /> Выйти
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="flex flex-col w-0 flex-1 overflow-hidden relative mesh-bg">

        {}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 dark:opacity-30 animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 dark:opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 dark:opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {}
        <header className="glass-colorful border-b border-white/40 dark:border-slate-700/40 h-16 flex items-center justify-between px-8 shrink-0 z-10 relative">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300">
            {activeNavItem?.name || 'CRM'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 shadow-sm border border-white/60 dark:border-slate-700/60">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm animate-pulse"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 relative z-10 overflow-y-auto focus:outline-none">
          <div className="py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
