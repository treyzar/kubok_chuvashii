import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/shared/hooks';
import { Button } from './button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'dark') {
      return <Moon className="w-5 h-5" />;
    }
    return <Sun className="w-5 h-5" />;
  };

  const getLabel = () => {
    if (theme === 'dark') return 'Темная';
    if (theme === 'light') return 'Светлая';
    return 'Авто';
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative group"
      title={`Тема: ${getLabel()}`}
    >
      {getIcon()}
      <span className="sr-only">Переключить тему</span>
    </Button>
  );
}
