import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { UploadCloud, CheckCircle2, MapPin, AlertCircle, ArrowRight, LocateFixed } from "lucide-react"
import { motion } from "motion/react"

import { fetchCategories, createTicket, Category } from "@/api/tickets"

// Will use dynamic categories instead of hardcoded
// const CATEGORIES = { ... };

export default function PublicForm() {
  const navigate = useNavigate()
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [categoryTree, setCategoryTree] = React.useState<Category[]>([])
  const [categoryId, setCategoryId] = useState("")
  const [subcategoryId, setSubcategoryId] = useState("")

  const [address, setAddress] = useState("")
  const [latitude, setLatitude] = useState<number | "">("")
  const [longitude, setLongitude] = useState<number | "">("")
  const [isLocating, setIsLocating] = useState(false)
  const [description, setDescription] = useState("")
  const [senderName, setSenderName] = useState("")
  const [senderPhone, setSenderPhone] = useState("")
  const [senderEmail, setSenderEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [ticketNumber, setTicketNumber] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  React.useEffect(() => {
    fetchCategories().then(setCategoryTree).catch(console.error)
  }, [])

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Геолокация не поддерживается вашим браузером")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setIsLocating(false)
      },
      (error) => {
        console.error("Ошибка получения геолокации", error)
        alert("Не удалось определить местоположение. Пожалуйста, разрешите доступ к геоданным.")
        setIsLocating(false)
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (latitude === "" || longitude === "") {
      alert("Пожалуйста, поделитесь вашей геолокацией перед отправкой (кнопка 'Определить мое местоположение').")
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        description,
        sender_name: isAnonymous ? "Анонимный заявитель" : senderName,
        sender_phone: isAnonymous ? undefined : senderPhone,
        sender_email: isAnonymous ? undefined : senderEmail,
        longitude: Number(longitude),
        latitude: Number(latitude),
        subcategory_id: parseInt(subcategoryId, 10),
      }

      const res = await createTicket(payload)
      const ticketId = res.ticket?.id || Math.floor(Math.random() * 90000 + 10000).toString()
      setTicketNumber(ticketId.toString().substring(0, 8))
      setIsSubmitted(true)
    } catch (error) {
      console.error("Failed to create ticket", error)
      alert("Произошла ошибка при отправке обращения. Пожалуйста, попробуйте позже.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px] animate-float"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-emerald-400/10 blur-[80px] animate-float-delayed"></div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="w-full text-center border-0 shadow-2xl shadow-blue-900/5 bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500"></div>
            <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Обращение принято</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Ваше обращение успешно зарегистрировано в системе. Вы можете отслеживать его статус по номеру <strong className="text-slate-900 bg-slate-100/80 px-2 py-1 rounded-md shadow-sm">#{ticketNumber}</strong>.
              </p>
              <Button onClick={() => {
                setIsSubmitted(false)
                setDescription("")
                setAddress("")
                setLatitude("")
                setLongitude("")
              }} className="w-full h-12 text-base rounded-xl mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all">
                Отправить еще одно
              </Button>
              <Button variant="ghost" onClick={() => navigate('/crm')} className="w-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">
                Войти в CRM (для сотрудников)
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Panel - Hero / Branding */}
      <div className="relative lg:w-5/12 bg-slate-950 text-white overflow-hidden flex flex-col justify-between p-8 lg:p-16">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen animate-float"></div>
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[100px] mix-blend-screen animate-float-delayed"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[80px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Городской Портал</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Сделаем наш<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                город лучше
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              Интеллектуальная система обработки обращений граждан. Опишите проблему, а мы автоматически направим её нужному специалисту.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 mt-12 lg:mt-0">
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="glass-dark rounded-2xl p-6 border-slate-800/50 shadow-2xl shadow-blue-900/20"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl text-blue-400 shrink-0 border border-blue-500/20 shadow-inner">
                <AlertCircle className="w-6 h-6 animate-pulse-soft" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1 tracking-wide">Умная маршрутизация</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  ИИ анализирует текст обращения и автоматически определяет категорию, исключая дубликаты.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 lg:p-12 bg-slate-50/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-400/5 blur-[100px] animate-float"></div>
          <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-400/5 blur-[120px] animate-float-delayed"></div>
        </div>
        <motion.div
          className="w-full max-w-2xl relative z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden hover:shadow-blue-500/5 transition-shadow duration-500">
            <form onSubmit={handleSubmit}>
              <CardHeader className="px-8 pt-8 pb-6 border-b border-slate-100/50 bg-white/50">
                <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Новое обращение</CardTitle>
                <CardDescription className="text-base mt-2">Заполните форму ниже. Поля со звездочкой обязательны.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">

                {/* Category Selection */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">Категория <span className="text-red-500">*</span></label>
                    <Select
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(e.target.value)
                        setSubcategoryId("")
                      }}
                      required
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    >
                      <option value="" disabled>Выберите категорию</option>
                      {categoryTree.map(cat => (
                        <option key={cat.category_info.id} value={cat.category_info.id}>
                          {cat.category_info.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">Подкатегория <span className="text-red-500">*</span></label>
                    <Select
                      value={subcategoryId}
                      onChange={(e) => setSubcategoryId(e.target.value)}
                      required
                      disabled={!categoryId}
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors disabled:opacity-50"
                    >
                      <option value="" disabled>Выберите подкатегорию</option>
                      {categoryTree.find(c => c.category_info.id.toString() === categoryId)?.subcategories.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Geolocation */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">Местоположение <span className="text-red-500">*</span></label>
                    {latitude !== "" && longitude !== "" ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Координаты определены: {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => { setLatitude(""); setLongitude(""); }} className="h-8 hover:bg-emerald-100 text-emerald-800 rounded-lg">
                          Сбросить
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        className="w-full h-12 rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors bg-blue-50/50"
                      >
                        <LocateFixed className="w-5 h-5 mr-2" />
                        {isLocating ? "Определение..." : "Определить мое местоположение"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Описание проблемы <span className="text-red-500">*</span></label>
                  <Textarea
                    placeholder="Подробно опишите суть проблемы..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[140px] rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors resize-none p-4"
                    required
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Фото или видео</label>
                  <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-slate-200 border-dashed rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer bg-slate-50 group">
                    <div className="space-y-2 text-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex text-sm text-slate-600 justify-center mt-4">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Выберите файлы</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                        </label>
                        <p className="pl-1">или перетащите их сюда</p>
                      </div>
                      <p className="text-xs text-slate-400">PNG, JPG, MP4 до 20MB</p>
                    </div>
                  </div>
                </div>

                {/* Personal Info Section */}
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">Контактные данные</h3>
                    <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <Checkbox
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <label htmlFor="anonymous" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                        Отправить анонимно
                      </label>
                    </div>
                  </div>

                  {!isAnonymous && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 gap-5 sm:grid-cols-2"
                    >
                      <div className="space-y-3 sm:col-span-2">
                        <label className="text-sm font-medium text-slate-700">ФИО <span className="text-red-500">*</span></label>
                        <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Иванов Иван Иванович" required={!isAnonymous} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Телефон <span className="text-red-500">*</span></label>
                        <Input value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} type="tel" placeholder="+7 (999) 000-00-00" required={!isAnonymous} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <Input value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} type="email" placeholder="ivanov@example.com" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                      </div>
                    </motion.div>
                  )}
                </div>

              </CardContent>
              <CardFooter className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 px-8 py-6 bg-slate-50/80 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => navigate('/crm')} className="w-full sm:w-auto text-slate-500 hover:text-slate-900">
                  Вход для сотрудников
                </Button>
                <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-base">
                  {isLoading ? "Отправка..." : <><span className="mr-2">Отправить обращение</span><ArrowRight className="w-4 h-4" /></>}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
