import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Select } from "@/shared/ui/select"
import { Textarea } from "@/shared/ui/textarea"
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Mail,
  Clock,
  FileText,
  Paperclip,
  Send,
  AlertTriangle,
  Link as LinkIcon,
  Trash2,
  EyeOff,
  Sparkles,
  XCircle,
  Loader2,
  Plus
} from "lucide-react"
import { motion } from "motion/react"
import { getTicket, getTicketComments, getTicketHistory, updateTicket, hideTicket, deleteTicket, postTicketComment, getDepartments, adminGetTags, TicketDetailsResponse, Comment, HistoryEvent, Department, Tag } from "@/api/tickets"
import { fetchSimilarAppeals, mergeAppeals, type SimilarAppeal } from "@/entities/appeal"

export default function AppealDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [comment, setComment] = useState("")

  const [ticketData, setTicketData] = useState<TicketDetailsResponse | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [history, setHistory] = useState<HistoryEvent[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [similarAppeals, setSimilarAppeals] = useState<SimilarAppeal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMerging, setIsMerging] = useState(false)

  const refreshTicket = async () => {
    if (!id) return;
    try {
      const [ticketRes, commentsRes, historyRes, similarRes] = await Promise.all([
        getTicket(id),
        getTicketComments(id).catch(() => ({ comments: [] })),
        getTicketHistory(id).catch(() => []),
        fetchSimilarAppeals(id).catch(() => ({ similar: [] }))
      ])
      setTicketData(ticketRes)
      setComments(commentsRes.comments || [])
      setHistory(historyRes || [])
      setSimilarAppeals(similarRes.similar || [])
    } catch (error) {
      console.error("Failed to fetch ticket data:", error)
    }
  }

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [depsRes, tagsRes] = await Promise.all([
          getDepartments(),
          adminGetTags()
        ])
        setDepartments(depsRes.departments || [])
        setTags(tagsRes.tags || [])
      } catch (error) {
        console.error("Failed to fetch departments or tags", error)
      }
      await refreshTicket()
      setIsLoading(false)
    }

    fetchData()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!ticketData) {
    return (
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Обращение не найдено</h2>
        <p className="text-slate-500 mb-6">Возможно, оно было удалено или вы перешли по неверной ссылке.</p>
        <Button onClick={() => navigate('/crm/appeals')} className="bg-blue-600 hover:bg-blue-700">
          Вернуться к списку
        </Button>
      </div>
    )
  }

  const { ticket, details } = ticketData
  const detail = details[0] || {}

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'init': return 'Новое'
      case 'open': return 'В работе'
      case 'closed': return 'Решено'
      case 'rejected': return 'Отклонено'
      default: return s
    }
  }

  const handleHide = async () => {
    if (!id) return;
    try {
      await hideTicket(id);
      navigate('/crm/appeals');
    } catch (error) {
      console.error('Не удалось скрыть', error);
    }
  }

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteTicket(id);
      navigate('/crm/appeals');
    } catch (error) {
      console.error('Не удалось удалить', error);
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!id) return;
    try {
      await updateTicket(id, { status });
      await refreshTicket();
    } catch (error) {
      console.error('Не удалось обновить статус', error);
    }
  }

  const handleUpdateDepartment = async (department_id: string) => {
    if (!id) return;
    try {
      await updateTicket(id, { department_id: department_id ? parseInt(department_id) : null });
      await refreshTicket();
    } catch (error) {
      console.error('Не удалось изменить подразделение', error);
    }
  }

  const handleAddComment = async () => {
    if (!id || !comment.trim()) return;
    setIsSubmitting(true);
    try {
      await postTicketComment(id, { message: comment });
      setComment("");
      await refreshTicket();
    } catch (error) {
      console.error('Не удалось добавить комментарий', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleMergeDuplicate = async (duplicateId: string) => {
    if (!id) return;
    
    if (!confirm('Вы уверены, что хотите объединить эти обращения? Дубликат будет удален, а его данные перенесены в текущее обращение.')) {
      return;
    }
    
    setIsMerging(true);
    try {
      await mergeAppeals(id, [duplicateId]);
      alert('Обращения успешно объединены!');
      await refreshTicket();
    } catch (error: any) {
      console.error('Не удалось объединить обращения', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Неизвестная ошибка';
      alert(`Ошибка при объединении: ${errorMessage}`);
    } finally {
      setIsMerging(false);
    }
  }

  const handleAddTag = async (tagId: number) => {
    if (!id) return;
    try {
      await updateTicket(id, { add_tags: [tagId] });
      await refreshTicket();
    } catch (error) {
      console.error('Не удалось добавить тег', error);
      alert('Ошибка при добавлении тега');
    }
  }

  const handleRemoveTag = async (tagId: number) => {
    if (!id) return;
    try {
      await updateTicket(id, { remove_tags: [tagId] });
      await refreshTicket();
    } catch (error) {
      console.error('Не удалось удалить тег', error);
      alert('Ошибка при удалении тега');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto relative z-10"
    >
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/60">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/crm/appeals')} className="rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">Обращение #{ticket.id.substring(0, 8)}</h1>
            <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 hover:from-blue-200 hover:to-indigo-200 border-0 px-3 py-1 text-sm shadow-sm">{getStatusLabel(ticket.status)}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleHide} className="text-slate-600 border-slate-200 hover:bg-slate-50 rounded-xl transition-all">
            <EyeOff className="w-4 h-4 mr-2" /> Скрыть
          </Button>
          <Button variant="outline" onClick={handleDelete} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all">
            <Trash2 className="w-4 h-4 mr-2" /> Удалить
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 pb-4">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" /> Информация об обращении
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8 relative z-10">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
                  <div>
                    <span className="text-slate-400 block mb-1 text-xs uppercase tracking-wider font-semibold">Категория</span>
                    <span className="font-medium text-slate-900">{ticket.category_name || "Не указана"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1 text-xs uppercase tracking-wider font-semibold">Дата поступления</span>
                    <span className="font-medium text-slate-900">{new Date(ticket.created_at).toLocaleString('ru-RU')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1 text-xs uppercase tracking-wider font-semibold">Подкатегория</span>
                    <span className="font-medium text-slate-900">{ticket.subcategory_name || "Не указана"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1 text-xs uppercase tracking-wider font-semibold">Подразделение</span>
                    <span className="font-medium text-slate-900">{ticket.department_name || "Не распределено"}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100/50 pt-6">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Текст обращения</h4>
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/50 p-5 rounded-xl whitespace-pre-wrap leading-relaxed border border-slate-100/50 dark:border-slate-700/50 shadow-inner">
                    {ticket.description}
                  </p>
                </div>

                {detail.address && (
                  <div className="border-t border-slate-100/50 dark:border-slate-700/50 pt-6">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      Адрес
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-xl leading-relaxed border border-blue-100/50 dark:border-blue-900/50">
                      {detail.address}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {similarAppeals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -2 }}
            >
              <Card className="border-0 shadow-lg shadow-amber-500/10 dark:shadow-amber-500/5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-yellow-50/90 to-orange-50/90 dark:from-amber-950/40 dark:via-yellow-950/40 dark:to-orange-950/40 relative overflow-hidden backdrop-blur-md border border-amber-200/50 dark:border-amber-800/50">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2 text-lg">
                    <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-sm">
                      <Sparkles className="w-4 h-4 text-white animate-pulse-soft" />
                    </div>
                    Система ИИ обнаружила возможные дубликаты
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2 relative z-10 space-y-3">
                  <p className="text-sm text-amber-900/80 dark:text-amber-100/80 mb-4 leading-relaxed font-medium">
                    Найдены похожие обращения на основе семантического анализа текста. Вы можете объединить их для упрощения работы.
                  </p>
                  <div className="space-y-3">
                    {similarAppeals.map((similar) => (
                      <div
                        key={similar.id}
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border border-amber-200/50 dark:border-amber-800/50 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                #{similar.id.substring(0, 8)}
                              </span>
                              <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-0 text-xs">
                                {Math.round(similar.similarity_score * 100)}% совпадение
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {similar.description}
                            </p>
                            {similar.category_name && (
                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                {similar.category_name} → {similar.subcategory_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleMergeDuplicate(similar.id)}
                          disabled={isMerging}
                          className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 dark:shadow-orange-500/10 rounded-lg h-9 transition-all font-semibold"
                        >
                          {isMerging ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Объединение...
                            </>
                          ) : (
                            <>
                              <LinkIcon className="w-4 h-4 mr-2" />
                              Объединить
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 pb-4">
                <CardTitle className="text-lg text-slate-800">Комментарии и работа</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-slate-500 text-sm italic text-center py-4">Нет комментариев</div>
                  ) : comments.map((c) => (
                    <div key={c.id} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm text-slate-900">{c.user_name || "Неизвестный"}</span>
                        <span className="text-xs text-slate-400 font-medium">{c.created_at ? new Date(c.created_at).toLocaleString('ru-RU') : ""}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{c.message}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-slate-100/50 pt-6">
                  <Textarea
                    placeholder="Написать комментарий..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mb-3 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white resize-none min-h-[100px] transition-all focus:ring-blue-500/20"
                  />
                  <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm" className="rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                      <Paperclip className="w-4 h-4 mr-2" /> Прикрепить файл
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={isSubmitting || !comment.trim()}
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all">
                      {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      Отправить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="border-0 shadow-lg shadow-indigo-500/10 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 relative overflow-hidden backdrop-blur-md border border-indigo-100/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -mr-20 -mt-20 animate-blob"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl -ml-20 -mb-20 animate-blob animation-delay-2000"></div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-indigo-900 flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm">
                    <Sparkles className="w-4 h-4 text-white animate-pulse-soft" />
                  </div>
                  Помощник формирования ответа
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 relative z-10">
                <p className="text-sm text-indigo-900/80 mb-5 leading-relaxed font-medium">
                  Сгенерировать официальный ответ на основе шаблона и текста обращения. ИИ учтет все детали и подготовит документ.
                </p>
                <Button className="w-full bg-white/80 backdrop-blur-sm text-indigo-700 hover:bg-white border border-indigo-200 shadow-sm hover:shadow-md rounded-xl h-12 transition-all font-semibold">
                  Сгенерировать черновик ответа (Word)
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 pb-4">
                <CardTitle className="text-lg text-slate-800">Управление</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-slate-700">Статус</label>
                  <Select value={ticket.status} onChange={(e) => handleUpdateStatus(e.target.value)} className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-colors">
                    <option value="init">Новое</option>
                    <option value="open">В работе</option>
                    <option value="closed">Решено</option>
                    <option value="rejected">Отклонено</option>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-slate-700">Передать подразделению</label>
                  <Select value={ticket.department_id?.toString() || ""} onChange={(e) => handleUpdateDepartment(e.target.value)} className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-colors">
                    <option value="" disabled>Выберите подразделение</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id.toString()}>{d.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Внутренние теги</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(ticket.tag_names || []).map((tagName, index) => {
                      const tagId = ticket.tag_ids?.[index];
                      return (
                        <Badge 
                          key={tagId || index} 
                          variant="secondary" 
                          className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg py-1 px-2.5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
                        >
                          {tagName} 
                          <XCircle 
                            className="w-3.5 h-3.5 cursor-pointer hover:text-red-500 transition-colors" 
                            onClick={() => tagId && handleRemoveTag(tagId)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                  <Select 
                    value="" 
                    onChange={(e) => {
                      const tagId = parseInt(e.target.value);
                      if (tagId) {
                        handleAddTag(tagId);
                        e.target.value = "";
                      }
                    }}
                    className="h-11 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  >
                    <option value="" disabled>Добавить тег</option>
                    {tags.filter(tag => !ticket.tag_ids?.includes(tag.id)).map(tag => (
                      <option key={tag.id} value={tag.id}>{tag.name}</option>
                    ))}
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 pb-4">
                <CardTitle className="text-lg text-slate-800">Отправитель</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-3 rounded-full text-blue-600 shadow-sm border border-blue-100/50">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{detail.sender_name || "Анонимный заявитель"}</p>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Заявитель</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm bg-slate-50/80 p-4 rounded-xl border border-slate-100/50 shadow-sm">
                  {detail.sender_phone && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Phone className="w-4 h-4 text-slate-400" /> <span className="font-medium">{detail.sender_phone}</span>
                    </div>
                  )}
                  {detail.sender_email && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Mail className="w-4 h-4 text-slate-400" /> <span className="font-medium">{detail.sender_email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3 text-slate-700 pt-3 mt-3 border-t border-slate-200/60">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      {detail.latitude && detail.longitude ? (
                        <div className="font-medium leading-tight">
                          <span className="block mb-1">Координаты определены:</span>
                          <span className="bg-slate-200/50 px-2 py-1 rounded text-xs select-all">{detail.latitude.toFixed(5)}, {detail.longitude.toFixed(5)}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-slate-400 italic">Местоположение не указано</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 pb-4">
                <CardTitle className="text-lg text-slate-800">История</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-blue-200 before:to-transparent">
                  {history.length === 0 ? (
                    <div className="text-center text-slate-500 text-sm italic">История пуста</div>
                  ) : history.map((item) => (
                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-slate-200 group-[.is-active]:bg-gradient-to-br group-[.is-active]:from-blue-400 group-[.is-active]:to-indigo-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors duration-300"></div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-slate-100/50 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center justify-between space-x-2 mb-1.5">
                          <div className="font-semibold text-slate-900 text-xs">{item.action}</div>
                          <time className="text-xs font-medium text-slate-400">
                            {new Date(item.created_at).toLocaleString('ru-RU')}
                          </time>
                        </div>
                        <div className="text-slate-500 text-xs">{item.user_name || "Система"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
