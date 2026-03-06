import { useState, useEffect, React } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Users, Settings, Plus, Edit2, Trash2, Search, XCircle,
  Loader2, X, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Tag as TagIcon, Layers
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import {
  listAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser,
  AdminUser, CreateUserPayload, UpdateUserPayload,
  fetchCategories, Category,
  adminCreateCategory, adminCreateSubcategory,
  adminGetTags, adminCreateTag, Tag,
  getDepartments,
} from "@/api/tickets"



const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_RE = /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/

function validateEmail(v: string): string | null {
  if (!v.trim()) return "Email обязателен"
  if (!EMAIL_RE.test(v)) return "Введите корректный адрес, например user@mail.ru"
  if (v.length > 255) return "Email не может быть длиннее 255 символов"
  return null
}

function validateName(v: string, label: string, required = false): string | null {
  if (required && !v.trim()) return `${label} обязателен(а)`
  if (v.trim() && !NAME_RE.test(v)) return `${label} может содержать только буквы`
  if (v.length > 100) return `${label} не может быть длиннее 100 символов`
  return null
}

function validateDictName(v: string, label: string): string | null {
  if (!v.trim()) return `${label} не может быть пустым`
  if (v.trim().length < 2) return `${label} должен содержать минимум 2 символа`
  if (v.length > 100) return `${label} не может быть длиннее 100 символов`
  return null
}

// ─── FieldError ─────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg: string | null }) {
  if (!msg) return null
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500 font-medium"
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </motion.p>
  )
}

function FormField({ label, error, children }: { label: string; error: string | null; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className={`transition-all ${error ? "ring-2 ring-red-400/50 rounded-xl" : ""}`}>
        {children}
      </div>
      <AnimatePresence mode="wait">
        {error && <FieldError msg={error} />}
      </AnimatePresence>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = { admin: "Администратор", org: "Организация", executor: "Исполнитель" }
const ROLE_BADGE: Record<string, string> = {
  admin: "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0 shadow-sm",
  org: "bg-slate-100/80 text-slate-700 border-0 shadow-sm",
  executor: "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border-0 shadow-sm",
}
const STATUS_BADGE: Record<string, string> = {
  active: "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0 shadow-sm",
  blocked: "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-0 shadow-sm",
}

function getUserDisplayName(u: AdminUser) {
  const parts = [u.last_name, u.first_name, u.middle_name].filter(Boolean)
  return parts.length > 0 ? parts.join(" ") : u.email
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ toast }: { toast: { type: "success" | "error"; msg: string } | null }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className={`fixed top-6 left-1/2 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}
        >
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── UserModal ───────────────────────────────────────────────────────────────

interface UserModalProps { user: AdminUser | null; onClose: () => void; onSave: (u: AdminUser) => void }

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const isEdit = !!user
  const [email, setEmail] = useState(user?.email ?? "")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<CreateUserPayload["role"]>(user?.role ?? "executor")
  const [status, setStatus] = useState<UpdateUserPayload["status"]>(user?.status ?? "active")
  const [departmentId, setDepartmentId] = useState<number | undefined>(user?.department_id ?? undefined)
  const [firstName, setFirstName] = useState(user?.first_name ?? "")
  const [lastName, setLastName] = useState(user?.last_name ?? "")
  const [middleName, setMiddleName] = useState(user?.middle_name ?? "")
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Load departments on mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await getDepartments()
        setDepartments(res.departments)
      } catch (err) {
        console.error('Failed to load departments:', err)
      }
    }
    loadDepartments()
  }, [])

  const validate = () => {
    const e: Record<string, string | null> = {}
    if (!isEdit) {
      e.email = validateEmail(email)
      if (password && password.length < 6) {
        e.password = "Пароль должен содержать минимум 6 символов"
      }
    }
    e.firstName = validateName(firstName, "Имя")
    e.lastName = validateName(lastName, "Фамилия")
    e.middleName = validateName(middleName, "Отчество")
    return e
  }

  const visibleErrors = (e: Record<string, string | null>) =>
    Object.fromEntries(Object.entries(e).map(([k, v]) => [k, touched[k] ? v : null]))

  const errs = visibleErrors(validate())
  const hasErrors = Object.values(validate()).some(Boolean)

  const touch = (field: string) => setTouched(p => ({ ...p, [field]: true }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true, firstName: true, lastName: true, middleName: true })
    if (hasErrors) return
    setServerError(null); setIsSaving(true)
    try {
      if (isEdit && user) {
        const saved = await updateAdminUser(user.id, {
          role, status,
          department_id: departmentId,
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          middle_name: middleName || undefined,
        })
        onSave(saved)
      } else {
        const saved = await createAdminUser({
          email, role,
          password: password || undefined,
          department_id: departmentId,
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          middle_name: middleName || undefined,
        })
        onSave(saved)
      }
    } catch (err: any) {
      setServerError(err?.response?.data?.detail ?? "Ошибка при сохранении")
    } finally { setIsSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white rounded-2xl shadow-2xl shadow-slate-900/15 w-full max-w-md z-10 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">{isEdit ? "Редактировать пользователя" : "Новый пользователь"}</h2>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!isEdit && (
              <>
                <FormField label="Email *" error={errs.email ?? null}>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={() => touch("email")}
                    placeholder="user@example.com"
                    className={`h-11 rounded-xl bg-slate-50 border-slate-200 ${errs.email ? "border-red-400 focus-visible:ring-red-300" : ""}`} />
                </FormField>
                <FormField label="Пароль (необязательно)" error={errs.password ?? null}>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} onBlur={() => touch("password")}
                    placeholder="Минимум 6 символов"
                    className={`h-11 rounded-xl bg-slate-50 border-slate-200 ${errs.password ? "border-red-400 focus-visible:ring-red-300" : ""}`} />
                </FormField>
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Фамилия" error={errs.lastName ?? null}>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} onBlur={() => touch("lastName")}
                  placeholder="Иванов"
                  className={`h-11 rounded-xl bg-slate-50 border-slate-200 ${errs.lastName ? "border-red-400" : ""}`} />
              </FormField>
              <FormField label="Имя" error={errs.firstName ?? null}>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} onBlur={() => touch("firstName")}
                  placeholder="Иван"
                  className={`h-11 rounded-xl bg-slate-50 border-slate-200 ${errs.firstName ? "border-red-400" : ""}`} />
              </FormField>
            </div>
            <FormField label="Отчество" error={errs.middleName ?? null}>
              <Input value={middleName} onChange={e => setMiddleName(e.target.value)} onBlur={() => touch("middleName")}
                placeholder="Иванович"
                className={`h-11 rounded-xl bg-slate-50 border-slate-200 ${errs.middleName ? "border-red-400" : ""}`} />
            </FormField>
            <FormField label="Роль *" error={null}>
              <Select value={role} onChange={e => setRole(e.target.value as any)}
                className="w-full h-11 rounded-xl bg-slate-50 border-slate-200">
                <option value="executor">Исполнитель</option>
                <option value="org">Организация</option>
                <option value="admin">Администратор</option>
              </Select>
            </FormField>
            <FormField label="Департамент" error={null}>
              <Select 
                value={departmentId?.toString() ?? ""} 
                onChange={e => setDepartmentId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full h-11 rounded-xl bg-slate-50 border-slate-200"
              >
                <option value="">Не выбран (только для админа)</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </Select>
            </FormField>
            {isEdit && (
              <FormField label="Статус" error={null}>
                <Select value={status} onChange={e => setStatus(e.target.value as any)}
                  className="w-full h-11 rounded-xl bg-slate-50 border-slate-200">
                  <option value="active">Активен</option>
                  <option value="blocked">Заблокирован</option>
                </Select>
              </FormField>
            )}
            {serverError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{serverError}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl border-slate-200">Отмена</Button>
              <Button type="submit" disabled={isSaving}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}



function ConfirmDelete({ user, onCancel, onConfirm }: { user: AdminUser; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-2xl shadow-slate-900/15 w-full max-w-sm z-10 p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Удалить пользователя?</h3>
            <p className="text-sm text-slate-500 mt-1">{getUserDisplayName(user)} ({user.email})</p>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={onCancel} className="flex-1 h-11 rounded-xl border-slate-200">Отмена</Button>
            <Button onClick={onConfirm}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white">
              Удалить
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}



function InlineAddForm({ placeholder, onAdd, onCancel }: {
  placeholder: string; onAdd: (name: string) => Promise<void>; onCancel: () => void
}) {
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateDictName(value, placeholder)
    if (err) { setError(err); return }
    setSaving(true)
    try { await onAdd(value.trim()); setValue("") }
    catch { setError("Ошибка при сохранении. Возможно, такое название уже существует.") }
    finally { setSaving(false) }
  }

  return (
    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }} onSubmit={handleSubmit} className="overflow-hidden">
      <div className="flex gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-100 mt-2">
        <div className="flex-1">
          <Input value={value} onChange={e => { setValue(e.target.value); setError(null) }}
            placeholder={placeholder} autoFocus
            className={`h-9 text-sm rounded-lg bg-white border-slate-200 ${error ? "border-red-400" : ""}`} />
          <AnimatePresence mode="wait">{error && <FieldError msg={error} />}</AnimatePresence>
        </div>
        <Button type="submit" size="sm" disabled={saving}
          className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Добавить"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}
          className="h-9 w-9 p-0 rounded-lg text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.form>
  )
}



function CategoriesCard({ showToast }: { showToast: (t: "success" | "error", m: string) => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddCat, setShowAddCat] = useState(false)
  const [expandedCat, setExpandedCat] = useState<number | null>(null)
  const [addSubFor, setAddSubFor] = useState<number | null>(null)

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => showToast("error", "Не удалось загрузить категории")).finally(() => setIsLoading(false))
  }, [])

  const handleAddCategory = async (name: string) => {
    const created = await adminCreateCategory(name)
    setCategories(prev => [...prev, { category_info: created, subcategories: [] }])
    setShowAddCat(false)
    showToast("success", "Категория добавлена")
  }

  const handleAddSubcategory = async (catId: number, name: string) => {
    const sub = await adminCreateSubcategory(catId, name)
    setCategories(prev => prev.map(c =>
      c.category_info.id === catId
        ? { ...c, subcategories: [...c.subcategories, sub] }
        : c
    ))
    setAddSubFor(null)
    showToast("success", "Подкатегория добавлена")
  }

  return (
    <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50/30 border-b border-slate-100/50 pb-4">
        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-500" /> Категории
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowAddCat(v => !v)}
          className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors gap-1">
          <Plus className="w-4 h-4" /> Добавить
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <AnimatePresence>
          {showAddCat && (
            <InlineAddForm placeholder="Название категории" onAdd={handleAddCategory} onCancel={() => setShowAddCat(false)} />
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Категории не найдены</p>
        ) : (
          <ul className="space-y-1.5 mt-3">
            {categories.map(cat => (
              <li key={cat.category_info.id}>
                <div
                  className="flex items-center justify-between p-3 hover:bg-blue-50/50 rounded-xl border border-slate-100/50 transition-colors group cursor-pointer shadow-sm"
                  onClick={() => setExpandedCat(expandedCat === cat.category_info.id ? null : cat.category_info.id)}
                >
                  <div className="flex items-center gap-2">
                    <motion.div animate={{ rotate: expandedCat === cat.category_info.id ? 90 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </motion.div>
                    <span className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors">{cat.category_info.name}</span>
                    <Badge variant="outline" className="text-xs border-slate-200 text-slate-500 ml-1">{cat.subcategories.length}</Badge>
                  </div>
                  <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setAddSubFor(cat.category_info.id); setExpandedCat(cat.category_info.id) }}
                    className="h-7 px-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity text-xs gap-1">
                    <Plus className="w-3 h-3" /> Подкатегория
                  </Button>
                </div>

                <AnimatePresence>
                  {expandedCat === cat.category_info.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden pl-6 mt-1 space-y-1">
                      {cat.subcategories.map(sub => (
                        <div key={sub.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          {sub.name}
                        </div>
                      ))}
                      <AnimatePresence>
                        {addSubFor === cat.category_info.id && (
                          <InlineAddForm placeholder="Название подкатегории"
                            onAdd={(name) => handleAddSubcategory(cat.category_info.id, name)}
                            onCancel={() => setAddSubFor(null)} />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}



function TagsCard({ showToast }: { showToast: (t: "success" | "error", m: string) => void }) {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    adminGetTags().then(r => setTags(r.tags)).catch(() => showToast("error", "Не удалось загрузить теги")).finally(() => setIsLoading(false))
  }, [])

  const handleAdd = async (name: string) => {
    const tag = await adminCreateTag(name)
    setTags(prev => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)))
    setShowAdd(false)
    showToast("success", "Тег добавлен")
  }

  return (
    <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50/30 border-b border-slate-100/50 pb-4">
        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-violet-500" /> Внутренние теги
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(v => !v)}
          className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors gap-1">
          <Plus className="w-4 h-4" /> Добавить
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <AnimatePresence>
          {showAdd && (
            <InlineAddForm placeholder="Название тега" onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>
        ) : (
          <div className="flex flex-wrap gap-2 mt-3">
            <AnimatePresence>
              {tags.length === 0 && !isLoading && (
                <p className="text-sm text-slate-400 w-full text-center py-4">Теги не добавлены</p>
              )}
              {tags.map(tag => (
                <motion.div key={tag.id}
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                  <Badge variant="outline" className="text-sm py-1.5 px-3 flex items-center gap-2 rounded-lg border-violet-200/70 text-violet-700 bg-violet-50/80 hover:bg-violet-100 transition-colors shadow-sm cursor-default">
                    <TagIcon className="w-3 h-3" />
                    {tag.name}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState("")
  const [filterRole, setFilterRole] = useState("")
  const [modalUser, setModalUser] = useState<AdminUser | null | "new">(undefined as any)
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const res = await listAdminUsers({ email: searchEmail || undefined, role: filterRole || undefined, limit: 50 })
      setUsers(res.users); setTotalUsers(res.total)
    } catch { showToast("error", "Не удалось загрузить пользователей") }
    finally { setIsLoading(false) }
  }

  useEffect(() => { if (activeTab === "users") loadUsers() }, [activeTab, filterRole])
  useEffect(() => {
    const t = setTimeout(() => { if (activeTab === "users") loadUsers() }, 400)
    return () => clearTimeout(t)
  }, [searchEmail])

  const handleSaveUser = (saved: AdminUser) => {
    setUsers(prev => {
      const idx = prev.findIndex(u => u.id === saved.id)
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n }
      return [saved, ...prev]
    })
    const isNew = modalUser === "new"
    setModalUser(undefined as any)
    showToast("success", isNew ? "Пользователь создан" : "Пользователь обновлён")
  }

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return
    try {
      await deleteAdminUser(deleteUser.id)
      setUsers(prev => prev.filter(u => u.id !== deleteUser.id))
      setTotalUsers(n => n - 1)
      showToast("success", "Пользователь удалён")
    } catch { showToast("error", "Ошибка при удалении") }
    finally { setDeleteUser(null) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 relative z-10">
      <Toast toast={toast} />

      <AnimatePresence>
        {(modalUser === "new" || (modalUser && modalUser !== "new")) && (
          <UserModal user={modalUser === "new" ? null : modalUser as AdminUser}
            onClose={() => setModalUser(undefined as any)} onSave={handleSaveUser} />
        )}
        {deleteUser && (
          <ConfirmDelete user={deleteUser} onCancel={() => setDeleteUser(null)} onConfirm={handleDeleteConfirm} />
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
          Панель администратора
        </h1>
      </div>

      {}
      <div className="flex space-x-6 border-b border-slate-200/60">
        {[
          { key: "users", label: "Пользователи и роли", Icon: Users },
          { key: "settings", label: "Справочники", Icon: Settings },
        ].map(({ key, label, Icon }) => (
          <button key={key}
            className={`pb-4 px-2 font-medium text-sm border-b-2 transition-all relative ${activeTab === key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            onClick={() => setActiveTab(key)}>
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 transition-colors ${activeTab === key ? "text-blue-600" : "text-slate-400"}`} />
              {label}
            </div>
            {activeTab === key && <motion.div layoutId="activeTabIndicator" className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        ))}
      </div>

      {}
      {activeTab === "users" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50/30 border-b border-slate-100/50 pb-4 gap-4">
              <CardTitle className="text-lg text-slate-800">
                Управление пользователями
                {!isLoading && <span className="ml-2 text-sm font-normal text-slate-400">({totalUsers})</span>}
              </CardTitle>
              <Button size="sm" onClick={() => setModalUser("new")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-10 px-4 shadow-md shadow-blue-500/20">
                <Plus className="w-4 h-4 mr-2" /> Добавить пользователя
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 border-b border-slate-100/50 bg-white/50">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input placeholder="Поиск по email..." value={searchEmail}
                      onChange={e => setSearchEmail(e.target.value)}
                      className="pl-10 h-11 bg-slate-50/80 border-slate-200 rounded-xl focus:bg-white transition-colors" />
                  </div>
                  <Select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                    className="w-full sm:w-48 h-11 bg-slate-50/80 border-slate-200 rounded-xl focus:bg-white transition-colors">
                    <option value="">Все роли</option>
                    <option value="admin">Администратор</option>
                    <option value="org">Организация</option>
                    <option value="executor">Исполнитель</option>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Users className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">Пользователи не найдены</p>
                </div>
              ) : (
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
                      <AnimatePresence initial={false}>
                        {users.map((user, idx) => (
                          <motion.tr key={user.id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }} transition={{ delay: idx * 0.03 }}
                            className="bg-white/50 hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{getUserDisplayName(user)}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={ROLE_BADGE[user.role] ?? ""}>{ROLE_LABELS[user.role] ?? user.role}</Badge>
                            </td>
                            <td className="px-6 py-4 text-slate-700 font-medium">
                              {user.department_name ?? <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={STATUS_BADGE[user.status] ?? ""}>{user.status === "active" ? "Активен" : "Заблокирован"}</Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" onClick={() => setModalUser(user)}
                                  className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                {user.role !== "admin" && (
                                  <Button variant="ghost" size="icon" onClick={() => setDeleteUser(user)}
                                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {}
      {activeTab === "settings" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategoriesCard showToast={showToast} />
          <TagsCard showToast={showToast} />
        </motion.div>
      )}
    </motion.div>
  )
}
