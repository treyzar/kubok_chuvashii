import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Settings, Plus, Edit2, Trash2, Search, XCircle } from "lucide-react"
import { motion } from "motion/react"

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users")

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 relative z-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">Панель администратора</h1>
      </div>

      <div className="flex space-x-6 border-b border-slate-200/60">
        <button
          className={`pb-4 px-2 font-medium text-sm border-b-2 transition-all relative ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveTab('users')}
        >
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 transition-colors ${activeTab === 'users' ? 'text-blue-600' : 'text-slate-400'}`} /> 
            Пользователи и роли
          </div>
          {activeTab === 'users' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          className={`pb-4 px-2 font-medium text-sm border-b-2 transition-all relative ${activeTab === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveTab('settings')}
        >
          <div className="flex items-center gap-2">
            <Settings className={`w-4 h-4 transition-colors ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`} /> 
            Справочники
          </div>
          {activeTab === 'settings' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>

      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50/30 border-b border-slate-100/50 pb-4 gap-4">
              <CardTitle className="text-lg text-slate-800">Управление пользователями</CardTitle>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-10 px-4 shadow-md shadow-blue-500/20 transition-all">
                <Plus className="w-4 h-4 mr-2" /> Добавить пользователя
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 border-b border-slate-100/50 bg-white/50">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input 
                      placeholder="Поиск по имени или email..." 
                      className="pl-10 h-11 bg-slate-50/80 border-slate-200 rounded-xl focus:bg-white transition-colors" 
                    />
                  </div>
                  <Select className="w-full sm:w-48 h-11 bg-slate-50/80 border-slate-200 rounded-xl focus:bg-white transition-colors">
                    <option value="all">Все роли</option>
                    <option value="admin">Администратор</option>
                    <option value="org">Организация</option>
                    <option value="executor">Исполнитель</option>
                  </Select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/30 border-b border-slate-100/50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Пользователь</th>
                      <th className="px-6 py-4 font-semibold">Роль</th>
                      <th className="px-6 py-4 font-semibold">Подразделение</th>
                      <th className="px-6 py-4 font-semibold">Статус</th>
                      <th className="px-6 py-4 font-semibold text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50">
                    <tr className="bg-white/50 hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Иванов А.А.</div>
                        <div className="text-xs text-slate-500 mt-0.5">admin@cheb.ru</div>
                      </td>
                      <td className="px-6 py-4"><Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 hover:from-blue-200 hover:to-indigo-200 border-0 shadow-sm">Администратор</Badge></td>
                      <td className="px-6 py-4 text-slate-700 font-medium">Администрация г. Чебоксары</td>
                      <td className="px-6 py-4"><Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-200 hover:to-teal-200 border-0 shadow-sm">Активен</Badge></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-white/50 hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Петров В.С.</div>
                        <div className="text-xs text-slate-500 mt-0.5">petrov@gkh.ru</div>
                      </td>
                      <td className="px-6 py-4"><Badge variant="secondary" className="bg-slate-100/80 text-slate-700 hover:bg-slate-200 border-0 shadow-sm">Организация</Badge></td>
                      <td className="px-6 py-4 text-slate-700 font-medium">Управление ЖКХ</td>
                      <td className="px-6 py-4"><Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-200 hover:to-teal-200 border-0 shadow-sm">Активен</Badge></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-white/50 hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Смирнова Е.В.</div>
                        <div className="text-xs text-slate-500 mt-0.5">smirnova@dorogi.ru</div>
                      </td>
                      <td className="px-6 py-4"><Badge variant="secondary" className="bg-slate-100/80 text-slate-700 hover:bg-slate-200 border-0 shadow-sm">Организация</Badge></td>
                      <td className="px-6 py-4 text-slate-700 font-medium">Управление дорог</td>
                      <td className="px-6 py-4"><Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-200 hover:to-teal-200 border-0 shadow-sm">Активен</Badge></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-white/50 hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Козлов Д.И.</div>
                        <div className="text-xs text-slate-500 mt-0.5">kozlov@transport.ru</div>
                      </td>
                      <td className="px-6 py-4"><Badge variant="secondary" className="bg-slate-100/80 text-slate-700 hover:bg-slate-200 border-0 shadow-sm">Организация</Badge></td>
                      <td className="px-6 py-4 text-slate-700 font-medium">Транспорт</td>
                      <td className="px-6 py-4"><Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-700 hover:from-red-200 hover:to-rose-200 border-0 shadow-sm">Заблокирован</Badge></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-white/50 hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Морозова А.П.</div>
                        <div className="text-xs text-slate-500 mt-0.5">morozova@blago.ru</div>
                      </td>
                      <td className="px-6 py-4"><Badge variant="secondary" className="bg-slate-100/80 text-slate-700 hover:bg-slate-200 border-0 shadow-sm">Организация</Badge></td>
                      <td className="px-6 py-4 text-slate-700 font-medium">Благоустройство</td>
                      <td className="px-6 py-4"><Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-200 hover:to-teal-200 border-0 shadow-sm">Активен</Badge></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between bg-slate-50/30 border-b border-slate-100/50 pb-4">
                <CardTitle className="text-lg text-slate-800">Категории</CardTitle>
                <Button size="sm" variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"><Plus className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-center justify-between p-3 hover:bg-blue-50/50 rounded-xl border border-slate-100/50 transition-colors group shadow-sm">
                    <span className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors">ЖКХ</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </li>
                  <li className="flex items-center justify-between p-3 hover:bg-blue-50/50 rounded-xl border border-slate-100/50 transition-colors group shadow-sm">
                    <span className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors">Дороги</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between bg-slate-50/30 border-b border-slate-100/50 pb-4">
                <CardTitle className="text-lg text-slate-800">Внутренние теги</CardTitle>
                <Button size="sm" variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"><Plus className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-sm py-1.5 px-3 flex items-center gap-2 rounded-lg border-slate-200/50 text-slate-700 bg-slate-50/80 hover:bg-slate-100 transition-colors shadow-sm">
                    Срочно <XCircle className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-red-500 transition-colors" />
                  </Badge>
                  <Badge variant="outline" className="text-sm py-1.5 px-3 flex items-center gap-2 rounded-lg border-slate-200/50 text-slate-700 bg-slate-50/80 hover:bg-slate-100 transition-colors shadow-sm">
                    Требует проверки <XCircle className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-red-500 transition-colors" />
                  </Badge>
                  <Badge variant="outline" className="text-sm py-1.5 px-3 flex items-center gap-2 rounded-lg border-slate-200/50 text-slate-700 bg-slate-50/80 hover:bg-slate-100 transition-colors shadow-sm">
                    Дубликат <XCircle className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-red-500 transition-colors" />
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
