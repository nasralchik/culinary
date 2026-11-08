export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Кулинарная библиотека — на главную">
        <span className="brand-mark" aria-hidden="true">✳</span>
        <span><strong>Кулинарная</strong><small>библиотека</small></span>
      </a>
      <nav className="main-nav" aria-label="Главная навигация">
        <a className="active" href="#library">Библиотека</a><a href="#collections">Подборки</a><a href="#about">О проекте</a>
      </nav>
      <a className="nav-action" href="#library"><span aria-hidden="true">⌕</span><span className="nav-action-label">Найти рецепт</span></a>
    </header>
  )
}
