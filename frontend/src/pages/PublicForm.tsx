import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Select } from "@/shared/ui/select"
import { Checkbox } from "@/shared/ui/checkbox"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card"
import { CheckCircle2, MapPin, AlertCircle, ArrowRight } from "lucide-react"
import { motion } from "motion/react"

import { fetchCategories, createTicket, Category } from "@/api/tickets"


const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 11 && cleaned.startsWith('7')
}

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validateName = (name: string): boolean => {
  return name.trim().length >= 3 && /^[а-яА-ЯёЁa-zA-Z\s-]+$/.test(name)
}


const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length === 0) return ''
  if (cleaned.length <= 1) return `+${cleaned}`
  if (cleaned.length <= 4) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1)}`
  if (cleaned.length <= 7) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`
  if (cleaned.length <= 9) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`
}

export default function PublicForm() {
  const navigate = useNavigate()
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [categoryTree, setCategoryTree] = React.useState<Category[]>([])
  const [categoryId, setCategoryId] = useState("")
  const [subcategoryId, setSubcategoryId] = useState("")

  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [senderName, setSenderName] = useState("")
  const [senderPhone, setSenderPhone] = useState("")
  const [senderEmail, setSenderEmail] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [isLoading, setIsLoading] = useState(false)
  const [ticketNumber, setTicketNumber] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  React.useEffect(() => {
    fetchCategories().then(setCategoryTree).catch(console.error)
  }, [])

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    setSenderPhone(formatted)
    if (touched.senderPhone) {
      validateField('senderPhone', formatted)
    }
  }

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'address':
        if (!value.trim()) {
          newErrors.address = 'Укажите адрес'
        } else if (value.trim().length < 10) {
          newErrors.address = 'Адрес слишком короткий (минимум 10 символов)'
        } else {
          delete newErrors.address
        }
        break
      case 'description':
        if (!value.trim()) {
          newErrors.description = 'Опишите проблему'
        } else if (value.trim().length < 20) {
          newErrors.description = 'Описание слишком короткое (минимум 20 символов)'
        } else {
          delete newErrors.description
        }
        break
      case 'senderName':
        if (!isAnonymous) {
          if (!value.trim()) {
            newErrors.senderName = 'Введите ФИО'
          } else if (!validateName(value)) {
            newErrors.senderName = 'ФИО должно содержать минимум 3 символа и только буквы'
          } else {
            delete newErrors.senderName
          }
        } else {
          delete newErrors.senderName
        }
        break
      case 'senderPhone':
        if (!isAnonymous) {
          if (!value.trim()) {
            newErrors.senderPhone = 'Введите телефон'
          } else if (!validatePhone(value)) {
            newErrors.senderPhone = 'Неверный формат телефона'
          } else {
            delete newErrors.senderPhone
          }
        } else {
          delete newErrors.senderPhone
        }
        break
      case 'senderEmail':
        if (value.trim() && !validateEmail(value)) {
          newErrors.senderEmail = 'Неверный формат email'
        } else {
          delete newErrors.senderEmail
        }
        break
    }

    setErrors(newErrors)
  }

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true })
    const value = field === 'address' ? address :
      field === 'description' ? description :
        field === 'senderName' ? senderName :
          field === 'senderPhone' ? senderPhone :
            field === 'senderEmail' ? senderEmail : ''
    validateField(field, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()


    setTouched({
      address: true,
      description: true,
      senderName: true,
      senderPhone: true,
      senderEmail: true,
    })


    validateField('address', address)
    validateField('description', description)
    if (!isAnonymous) {
      validateField('senderName', senderName)
      validateField('senderPhone', senderPhone)
      validateField('senderEmail', senderEmail)
    }


    if (Object.keys(errors).length > 0) {
      return
    }

    if (!subcategoryId) {
      alert('Пожалуйста, выберите категорию и подкатегорию')
      return
    }

    if (!address.trim()) {
      alert('Пожалуйста, укажите адрес')
      return
    }

    setIsLoading(true)

    try {


      let lat = 56.1326;
      let lng = 47.2357;

      try {
        let cleanAddress = address.trim();
        if (cleanAddress.toLowerCase().startsWith('г. чебоксары')) {
          cleanAddress = cleanAddress.substring(12).trim();
        } else if (cleanAddress.toLowerCase().startsWith('чебоксары')) {
          cleanAddress = cleanAddress.substring(9).trim();
        }

        cleanAddress = cleanAddress.replace(/^,/, '').trim();

        // Use a structured query targeting Cheboksary specifically for much higher precision
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.append("city", "Чебоксары");
        url.searchParams.append("street", cleanAddress);
        url.searchParams.append("format", "json");
        url.searchParams.append("limit", "1");

        const geoRes = await fetch(url.toString());
        const geoData = await geoRes.json();

        if (geoData && geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lng = parseFloat(geoData[0].lon);
        } else {
          console.warn("Could not geocode exact address, falling back to default.", cleanAddress);
        }
      } catch (e) {
        console.error("Geocoding failed", e);
      }

      const payload = {
        description: `${description}\n\nАдрес: ${address}`,
        sender_name: isAnonymous ? "Анонимный заявитель" : senderName,
        sender_phone: isAnonymous ? undefined : senderPhone.replace(/\D/g, ''),
        sender_email: isAnonymous ? undefined : senderEmail,
        longitude: lng,
        latitude: lat,
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
                setSenderName("")
                setSenderPhone("")
                setSenderEmail("")
                setCategoryId("")
                setSubcategoryId("")
                setErrors({})
                setTouched({})
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
      { }
      <div className="relative lg:w-5/12 bg-slate-950 text-white overflow-hidden flex flex-col justify-between p-8 lg:p-16">
        { }
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
                  Алгоритм анализирует текст обращения и автоматически определяет категорию, исключая дубликаты.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      { }
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

                { }
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

                { }
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Адрес <span className="text-red-500">*</span></label>
                  <Input
                    placeholder="г. Чебоксары, ул. Ленина, д. 1"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value)
                      if (touched.address) validateField('address', e.target.value)
                    }}
                    onBlur={() => handleBlur('address')}
                    className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors ${touched.address && errors.address ? 'border-red-400 focus:border-red-400' : ''
                      }`}
                    required
                  />
                  {touched.address && errors.address && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.address}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Укажите полный адрес: город, улица, дом</p>
                </div>

                { }
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Описание проблемы <span className="text-red-500">*</span></label>
                  <Textarea
                    placeholder="Подробно опишите суть проблемы..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      if (touched.description) validateField('description', e.target.value)
                    }}
                    onBlur={() => handleBlur('description')}
                    className={`min-h-[140px] rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors resize-none p-4 ${touched.description && errors.description ? 'border-red-400 focus:border-red-400' : ''
                      }`}
                    required
                  />
                  {touched.description && errors.description && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Минимум 20 символов</p>
                </div>

                { }
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
                        <Input
                          value={senderName}
                          onChange={(e) => {
                            setSenderName(e.target.value)
                            if (touched.senderName) validateField('senderName', e.target.value)
                          }}
                          onBlur={() => handleBlur('senderName')}
                          placeholder="Иванов Иван Иванович"
                          required={!isAnonymous}
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white ${touched.senderName && errors.senderName ? 'border-red-400 focus:border-red-400' : ''
                            }`}
                        />
                        {touched.senderName && errors.senderName && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.senderName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Телефон <span className="text-red-500">*</span></label>
                        <Input
                          value={senderPhone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          onBlur={() => handleBlur('senderPhone')}
                          type="tel"
                          placeholder="+7 (999) 000-00-00"
                          required={!isAnonymous}
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white ${touched.senderPhone && errors.senderPhone ? 'border-red-400 focus:border-red-400' : ''
                            }`}
                        />
                        {touched.senderPhone && errors.senderPhone && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.senderPhone}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <Input
                          value={senderEmail}
                          onChange={(e) => {
                            setSenderEmail(e.target.value)
                            if (touched.senderEmail) validateField('senderEmail', e.target.value)
                          }}
                          onBlur={() => handleBlur('senderEmail')}
                          type="email"
                          placeholder="ivanov@example.com"
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white ${touched.senderEmail && errors.senderEmail ? 'border-red-400 focus:border-red-400' : ''
                            }`}
                        />
                        {touched.senderEmail && errors.senderEmail && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.senderEmail}
                          </p>
                        )}
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
