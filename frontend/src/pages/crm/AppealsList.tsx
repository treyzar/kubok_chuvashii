import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, AlertCircle, CheckCircle2, Clock, XCircle, MapPin, Loader2, ListTree, X, ChevronDown } from "lucide-react"
import { motion } from "motion/react"
import { fetchTickets, fetchCategories, Ticket, Category } from "@/api/tickets"
import { useDebounce } from "@/hooks/useDebounce"
import { formatDateTime } from "@/lib/dateUtils"
import RU_LOCALIZATION from "@/lib/localization"

const getStatusBadge = (status: string) => {
  switch (status) {
    case "init": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 shadow-sm"><AlertCircle className="w-3 h-3 mr-1" /> {RU_LOCALIZATION.status.init}</Badge>
    case "open": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 shadow-sm"><Clock className="w-3 h-3 mr-1" /> {RU_LOCALIZATION.status.open}</Badge>
    case "closed": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 shadow-sm"><CheckCircle2 className="w-3 h-3 mr-1" /> {RU_LOCALIZATION.status.closed}</Badge>
    case "rejected": return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 shadow-sm"><XCircle className="w-3 h-3 mr-1" /> {RU_LOCALIZATION.status.rejected}</Badge>
    default: return <Badge>{status}</Badge>
  }
}

// Convert status logic for styling
const getStatusTheme = (status: string) => {
  switch (status) {
    case 'init': return { gradient: 'from-blue-400 to-blue-600', glow: 'bg-blue-500' }
    case 'open': return { gradient: 'from-amber-400 to-amber-600', glow: 'bg-amber-500' }
    case 'closed': return { gradient: 'from-emerald-400 to-emerald-600', glow: 'bg-emerald-500' }
    default: return { gradient: 'from-slate-400 to-slate-600', glow: 'bg-slate-500' }
  }
}

// Get tag styling based on tag name
const getTagStyle = (tag: string) => {
  const tagLower = tag.toLowerCase()
  
  if (tagLower.includes('срочн') || tagLower.includes('urgent')) {
    return {
      className: 'hover:bg-red-50 border-red-200 text-red-700 rounded-lg py-1',
      activeClassName: 'bg-red-100 border-red-300',
      dotClassName: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
    }
  }
  
  if (tagLower.includes('проверк') || tagLower.includes('verification')) {
    return {
      className: 'hover:bg-amber-50 border-amber-200 text-amber-700 rounded-lg py-1',
      activeClassName: 'bg-amber-100 border-amber-300',
      dotClassName: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
    }
  }
  
  if (tagLower.includes('департамент') || tagLower.includes('передан')) {
    return {
      className: 'hover:bg-blue-50 border-blue-200 text-blue-700 rounded-lg py-1',
      activeClassName: 'bg-blue-100 border-blue-300',
      dotClassName: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
    }
  }
  
  if (tagLower.includes('дубликат') || tagLower.includes('duplicate')) {
    return {
      className: 'hover:bg-slate-100 border-slate-300 text-slate-700 rounded-lg py-1',
      activeClassName: 'bg-slate-200 border-slate-400',
      dotClassName: 'bg-slate-500'
    }
  }
  
  // Default style for other tags
  return {
    className: 'hover:bg-purple-50 border-purple-200 text-purple-700 rounded-lg py-1',
    activeClassName: 'bg-purple-100 border-purple-300',
    dotClassName: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]'
  }
}

export default function AppealsList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "")
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || "")
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || "")
  const [subcategoryFilter, setSubcategoryFilter] = useState(searchParams.get('subcategory') || "")
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tagsParam = searchParams.get('tags')
    return tagsParam ? tagsParam.split(',') : []
  })
  
  // UI states
  const [showCategoryBrowser, setShowCategoryBrowser] = useState(true)
  
  // Data states
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [allTickets, setAllTickets] = useState<Ticket[]>([]) // Store all tickets for client-side filtering
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  
  // Available tags from loaded tickets
  const availableTags = Array.from(
    new Set(
      allTickets.flatMap(ticket => ticket.tag_names || [])
    )
  ).sort()
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories()
        setCategories(data)
      } catch (error) {
        console.error("Failed to load categories", error)
      }
    }
    loadCategories()
  }, [])

  // Get subcategories for selected category
  const availableSubcategories = categoryFilter
    ? categories.find(c => c.category_info.id.toString() === categoryFilter)?.subcategories || []
    : []

  // Reset subcategory when category changes
  useEffect(() => {
    if (categoryFilter && !availableSubcategories.find(s => s.id.toString() === subcategoryFilter)) {
      setSubcategoryFilter("")
    }
  }, [categoryFilter, availableSubcategories, subcategoryFilter])

  // Load tickets when filters change
  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true)
      try {
        const params: any = { limit: 50 }
        
        // Add search query
        if (debouncedSearchTerm) {
          params.query = debouncedSearchTerm
        }
        
        // Add status filter
        if (statusFilter && statusFilter !== "none") {
          params.status_id = statusFilter
        }
        
        // Add subcategory filter (more specific than category)
        if (subcategoryFilter) {
          params.subcategory_id = parseInt(subcategoryFilter)
        }
        
        const res = await fetchTickets(params)
        const fetchedTickets = res.tickets || []
        setAllTickets(fetchedTickets)
        
        // Apply client-side tag filtering
        let filteredTickets = fetchedTickets
        if (selectedTags.length > 0) {
          filteredTickets = fetchedTickets.filter(ticket => {
            const ticketTags = ticket.tag_names || []
            return selectedTags.every(tag => ticketTags.includes(tag))
          })
        }
        
        setTickets(filteredTickets)
        setTotal(filteredTickets.length)
        
        // Update URL params
        const newParams = new URLSearchParams()
        if (searchTerm) newParams.set('search', searchTerm)
        if (statusFilter) newParams.set('status', statusFilter)
        if (categoryFilter) newParams.set('category', categoryFilter)
        if (subcategoryFilter) newParams.set('subcategory', subcategoryFilter)
        if (selectedTags.length > 0) newParams.set('tags', selectedTags.join(','))
        setSearchParams(newParams)
      } catch (error) {
        console.error("Failed to load tickets", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTickets()
  }, [debouncedSearchTerm, statusFilter, subcategoryFilter, selectedTags])

  // Check if any filters are active
  const hasActiveFilters = searchTerm || statusFilter || categoryFilter || subcategoryFilter || selectedTags.length > 0

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
    setCategoryFilter("")
    setSubcategoryFilter("")
    setSelectedTags([])
    setSearchParams(new URLSearchParams())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 relative z-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
            {RU_LOCALIZATION.appealsList.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? RU_LOCALIZATION.common.loading : `Найдено: ${total} обращений`}
          </p>
        </div>
        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            variant="outline"
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            {RU_LOCALIZATION.filters.clearFilters}
          </Button>
        )}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-md rounded-2xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder={RU_LOCALIZATION.filters.searchPlaceholder}
                  className="pl-11 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-blue-400/20 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 shrink-0">
                <Select
                  className="w-40 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">{RU_LOCALIZATION.filters.allStatuses}</option>
                  <option value="init">{RU_LOCALIZATION.status.init}</option>
                  <option value="open">{RU_LOCALIZATION.status.open}</option>
                  <option value="closed">{RU_LOCALIZATION.status.closed}</option>
                  <option value="rejected">{RU_LOCALIZATION.status.rejected}</option>
                </Select>
                <Select
                  className="w-48 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
                  value={categoryFilter}
                  onChange={(e: any) => setCategoryFilter(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">{RU_LOCALIZATION.filters.allCategories}</option>
                  {categories.map(cat => (
                    <option key={cat.category_info.id} value={cat.category_info.id}>
                      {cat.category_info.name}
                    </option>
                  ))}
                </Select>
                {categoryFilter && (
                  <Select
                    className="w-48 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
                    value={subcategoryFilter}
                    onChange={(e: any) => setSubcategoryFilter(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">{RU_LOCALIZATION.filters.allSubcategories}</option>
                    {availableSubcategories.map(subcat => (
                      <option key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
            </div>

            {/* Category and Subcategory Browser */}
            {categories.length > 0 && (
              <div className="mt-6 border-t pt-6">
                <button
                  onClick={() => setShowCategoryBrowser(!showCategoryBrowser)}
                  className="w-full flex items-center justify-between mb-4 text-left hover:text-blue-600 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <ListTree className="w-4 h-4" />
                    Обзор по категориям
                    <Badge className="bg-slate-100 text-slate-600 text-xs">
                      {categories.length} категорий
                    </Badge>
                  </h3>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${
                    showCategoryBrowser ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {showCategoryBrowser && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {categories.map(category => {
                      const categoryTickets = allTickets.filter(t => 
                        t.category_name === category.category_info.name
                      )
                      const isSelectedCategory = categoryFilter === category.category_info.id.toString()
                      
                      return (
                        <div key={category.category_info.id} className="space-y-2">
                          <button
                            onClick={() => {
                              if (isSelectedCategory) {
                                setCategoryFilter("")
                                setSubcategoryFilter("")
                              } else {
                                setCategoryFilter(category.category_info.id.toString())
                                setSubcategoryFilter("")
                              }
                            }}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                              isSelectedCategory
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-semibold ${
                                isSelectedCategory ? 'text-blue-700' : 'text-slate-700'
                              }`}>
                                {category.category_info.name}
                              </span>
                              <Badge className={`${
                                isSelectedCategory 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {categoryTickets.length}
                              </Badge>
                            </div>
                          </button>
                          
                          {isSelectedCategory && category.subcategories.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4 space-y-1"
                            >
                              {category.subcategories.map(subcat => {
                                const subcatTickets = categoryTickets.filter(t => 
                                  t.subcategory_name === subcat.name
                                )
                                const isSelectedSubcat = subcategoryFilter === subcat.id.toString()
                                
                                return (
                                  <button
                                    key={subcat.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (isSelectedSubcat) {
                                        setSubcategoryFilter("")
                                      } else {
                                        setSubcategoryFilter(subcat.id.toString())
                                      }
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                                      isSelectedSubcat
                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          isSelectedSubcat ? 'bg-blue-500' : 'bg-slate-400'
                                        }`}></span>
                                        {subcat.name}
                                      </span>
                                      <span className={`text-xs ${
                                        isSelectedSubcat ? 'text-blue-600' : 'text-slate-500'
                                      }`}>
                                        {subcatTickets.length}
                                      </span>
                                    </div>
                                  </button>
                                )
                              })}
                            </motion.div>
                          )}
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-slate-500 mr-2 flex items-center gap-2">
                <Filter className="w-4 h-4" /> {RU_LOCALIZATION.appealsList.filtersByTags}:
              </span>
              {availableTags.length === 0 ? (
                <span className="text-sm text-slate-400">Нет доступных тегов</span>
              ) : (
                availableTags.map((tag: string) => {
                  const isSelected = selectedTags.includes(tag)
                  const tagStyle = getTagStyle(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="inline-flex items-center"
                    >
                      <Badge
                        variant="outline"
                        className={`cursor-pointer transition-all ${tagStyle.className} ${
                          isSelected ? tagStyle.activeClassName : ''
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mr-2 ${tagStyle.dotClassName}`}></span>
                        {tag}
                        {isSelected && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    </button>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            {hasActiveFilters ? RU_LOCALIZATION.appealsList.noResults : RU_LOCALIZATION.appealsList.emptyList}
          </div>
        ) : tickets.map((ticket, index) => {
          const theme = getStatusTheme(ticket.status)
          return (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.01, y: -2 }}
            >
              <Card
                className="border-0 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm group relative overflow-hidden rounded-2xl"
                onClick={() => navigate(`/crm/appeals/${ticket.id}`)}
              >
                {/* Status Indicator Line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2 bg-gradient-to-b ${theme.gradient}`} />

                {/* Subtle background glow on hover */}
                <div className={`absolute right-0 top-0 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none -mr-20 -mt-20 ${theme.glow}`}></div>

                <CardContent className="p-5 sm:p-6 pl-6 sm:pl-8 relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">#{ticket.id.substring(0, 8)}</span>
                        {getStatusBadge(ticket.status)}
                        <Badge variant="secondary" className="bg-slate-100/80 text-slate-700 hover:bg-slate-200 border-0">{ticket.category_name}</Badge>
                        <span className="text-sm text-slate-300">•</span>
                        <span className="text-sm text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {formatDateTime(ticket.created_at)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {ticket.description}
                      </h3>
                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <ListTree className="w-4 h-4 text-slate-400" /> {ticket.subcategory_name}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <MapPin className="w-4 h-4 text-slate-400" /> {ticket.department_name || RU_LOCALIZATION.appealDetail.notAssigned}
                        </span>
                      </div>
                      {ticket.tag_names && ticket.tag_names.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {ticket.tag_names.map((tag: string) => {
                            const tagStyle = getTagStyle(tag)
                            return (
                              <button
                                key={tag}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleTag(tag)
                                }}
                                className="inline-flex items-center"
                              >
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs rounded-md shadow-sm cursor-pointer ${tagStyle.className}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${tagStyle.dotClassName}`}></span>
                                  {tag}
                                </Badge>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
