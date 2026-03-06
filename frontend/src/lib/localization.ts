

export interface LocalizationStrings {
  common: {
    all: string;
    clear: string;
    search: string;
    loading: string;
    error: string;
    save: string;
    cancel: string;
    yes: string;
    no: string;
  };
  status: {
    init: string;
    open: string;
    closed: string;
    rejected: string;
  };
  filters: {
    allStatuses: string;
    allCategories: string;
    allSubcategories: string;
    allDepartments: string;
    clearFilters: string;
    dateFrom: string;
    dateTo: string;
    searchPlaceholder: string;
    applyFilters: string;
    activeFilters: string;
    noFilters: string;
  };
  dashboard: {
    title: string;
    totalAppeals: string;
    resolved: string;
    inProgress: string;
    executors: string;
    dynamicsTitle: string;
    categoriesTitle: string;
    received: string;
    weekTrend: string;
    monthTrend: string;
    byCategory: string;
    byStatus: string;
  };
  monitoring: {
    title: string;
    avgResponseTime: string;
    overdue: string;
    satisfactionIndex: string;
    departmentPerformance: string;
    criticalOverdue: string;
    days: string;
    day: string;
    viewAll: string;
    kpiMetrics: string;
    performance: string;
    period: string;
    week: string;
    month: string;
    year: string;
  };
  appealsList: {
    title: string;
    emptyList: string;
    noResults: string;
    filtersByTags: string;
    urgent: string;
    requiresVerification: string;
    transferredToDepartment: string;
    duplicate: string;
  };
  appealDetail: {
    backToList: string;
    hide: string;
    delete: string;
    status: string;
    assignToDepartment: string;
    selectDepartment: string;
    internalTags: string;
    addTag: string;
    sender: string;
    appealInfo: string;
    category: string;
    subcategory: string;
    dateReceived: string;
    department: string;
    notAssigned: string;
    appealText: string;
    comments: string;
    writeComment: string;
    attachFile: string;
    send: string;
    history: string;
    noComments: string;
    historyEmpty: string;
    updateSuccess: string;
    updateFailed: string;
  };
  errors: {
    loadFailed: string;
    updateFailed: string;
    invalidDateRange: string;
    networkError: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    serverError: string;
    tryAgain: string;
    retry: string;
  };
}


export const RU_LOCALIZATION: LocalizationStrings = {
  common: {
    all: 'Все',
    clear: 'Очистить',
    search: 'Поиск',
    loading: 'Загрузка...',
    error: 'Ошибка',
    save: 'Сохранить',
    cancel: 'Отмена',
    yes: 'Да',
    no: 'Нет',
  },
  status: {
    init: 'Новое',
    open: 'В работе',
    closed: 'Решено',
    rejected: 'Отклонено',
  },
  filters: {
    allStatuses: 'Все статусы',
    allCategories: 'Все категории',
    allSubcategories: 'Все подкатегории',
    allDepartments: 'Все департаменты',
    clearFilters: 'Очистить фильтры',
    dateFrom: 'Дата от',
    dateTo: 'Дата до',
    searchPlaceholder: 'Поиск по обращениям, авторам, комментариям...',
    applyFilters: 'Применить фильтры',
    activeFilters: 'Активные фильтры',
    noFilters: 'Нет активных фильтров',
  },
  dashboard: {
    title: 'Панель управления',
    totalAppeals: 'Всего обращений',
    resolved: 'Решено',
    inProgress: 'В работе',
    executors: 'Исполнителей',
    dynamicsTitle: 'Динамика обращений',
    categoriesTitle: 'По категориям',
    received: 'Поступило',
    weekTrend: 'за неделю',
    monthTrend: 'за месяц',
    byCategory: 'По категориям',
    byStatus: 'По статусам',
  },
  monitoring: {
    title: 'Мониторинг исполнения',
    avgResponseTime: 'Среднее время ответа',
    overdue: 'Просрочено',
    satisfactionIndex: 'Индекс удовлетворенности',
    departmentPerformance: 'Показатели подразделений',
    criticalOverdue: 'Критические просрочки',
    days: 'дня',
    day: 'день',
    viewAll: 'Смотреть все',
    kpiMetrics: 'Ключевые показатели',
    performance: 'Эффективность',
    period: 'Период',
    week: 'Неделя',
    month: 'Месяц',
    year: 'Год',
  },
  appealsList: {
    title: 'Обращения граждан',
    emptyList: 'Список обращений пуст',
    noResults: 'Нет результатов по заданным фильтрам',
    filtersByTags: 'Фильтры по тегам',
    urgent: 'Срочно',
    requiresVerification: 'Требует проверки',
    transferredToDepartment: 'Передано в департамент',
    duplicate: 'Дубликат',
  },
  appealDetail: {
    backToList: 'Вернуться к списку',
    hide: 'Скрыть',
    delete: 'Удалить',
    status: 'Статус',
    assignToDepartment: 'Передать подразделению',
    selectDepartment: 'Выберите подразделение',
    internalTags: 'Внутренние теги',
    addTag: 'Добавить тег',
    sender: 'Отправитель',
    appealInfo: 'Информация об обращении',
    category: 'Категория',
    subcategory: 'Подкатегория',
    dateReceived: 'Дата поступления',
    department: 'Подразделение',
    notAssigned: 'Не распределено',
    appealText: 'Текст обращения',
    comments: 'Комментарии и работа',
    writeComment: 'Написать комментарий...',
    attachFile: 'Прикрепить файл',
    send: 'Отправить',
    history: 'История',
    noComments: 'Нет комментариев',
    historyEmpty: 'История пуста',
    updateSuccess: 'Обновлено успешно',
    updateFailed: 'Не удалось обновить',
  },
  errors: {
    loadFailed: 'Не удалось загрузить данные',
    updateFailed: 'Не удалось обновить',
    invalidDateRange: 'Дата окончания не может быть раньше даты начала',
    networkError: 'Не удалось загрузить данные. Проверьте подключение к интернету.',
    unauthorized: 'Требуется авторизация',
    forbidden: 'Недостаточно прав доступа',
    notFound: 'Данные не найдены',
    serverError: 'Ошибка сервера. Попробуйте позже.',
    tryAgain: 'Попробуйте снова',
    retry: 'Повторить',
  },
};


export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    init: RU_LOCALIZATION.status.init,
    open: RU_LOCALIZATION.status.open,
    closed: RU_LOCALIZATION.status.closed,
    rejected: RU_LOCALIZATION.status.rejected,
  };
  
  return statusMap[status] || status;
}


export function getStatusOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'init', label: RU_LOCALIZATION.status.init },
    { value: 'open', label: RU_LOCALIZATION.status.open },
    { value: 'closed', label: RU_LOCALIZATION.status.closed },
    { value: 'rejected', label: RU_LOCALIZATION.status.rejected },
  ];
}


export function getErrorMessage(error: any): string {
  if (!error) {
    return RU_LOCALIZATION.common.error;
  }

  
  if (error.response) {
    const status = error.response.status;
    switch (status) {
      case 400:
        return error.response.data?.message || RU_LOCALIZATION.errors.updateFailed;
      case 401:
        return RU_LOCALIZATION.errors.unauthorized;
      case 403:
        return RU_LOCALIZATION.errors.forbidden;
      case 404:
        return RU_LOCALIZATION.errors.notFound;
      case 500:
      case 502:
      case 503:
        return RU_LOCALIZATION.errors.serverError;
      default:
        return RU_LOCALIZATION.errors.loadFailed;
    }
  }

  
  if (error.request) {
    return RU_LOCALIZATION.errors.networkError;
  }

  
  return error.message || RU_LOCALIZATION.common.error;
}


export default RU_LOCALIZATION;
