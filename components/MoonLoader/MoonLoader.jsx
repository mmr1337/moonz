'use client';

import { useEffect, useState } from 'react';
import './MoonLoader.css';

const games = [
  { id: 'c12d7a4a94f0d10c27f21ff462e781d5', name: 'Death Ball', image: '/gallery/death-ball.png' },
  { id: '3c8cbc7e049bf4f49bac804b6d20b337', name: 'Retro Tower Defense', image: '/gallery/retro-tower-defense.png' },
  { id: '2c7eb16a08c32a940d6df4fedceae130', name: 'Silly Defense', image: '/gallery/silly-defense.png' },
  { id: 'b64eaf788b0c15c54c17ee96a133bc7a', name: 'Violence District', image: '/gallery/violence-district.png' },
  { id: '9dd3ccd48c3e87b1a223d0a175fc6876', name: 'Basketball Zero', image: null },
  { id: 'e8eb78843c7babd4c1cf673c832ed54a', name: 'Sound Space', image: null },
  { id: '6aff1732647e82be5eeb8ebb108710a1', name: 'Last Contract (Tower Defense)', image: null }
];

const launcherFor = id => `moon_selected_id="${id}";loadstring(game:HttpGet("https://www.usemoon.pro/loader.lua"))()`;

async function copyText(value) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {}

  const input = document.createElement('textarea');
  input.value = value;
  input.readOnly = true;
  input.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
  document.body.appendChild(input);
  input.focus();
  input.select();

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch {}

  input.remove();
  return success;
}

export default function MoonLoader() {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [copyState, setCopyState] = useState('');
  const active = games[activeIndex];
  const launcher = launcherFor(active.id);

  useEffect(() => {
    if (!open) return;

    document.documentElement.classList.add('moon-loader-is-open');
    const closeOnEscape = event => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.documentElement.classList.remove('moon-loader-is-open');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!copyState) return;
    const timeout = setTimeout(() => setCopyState(''), 2400);
    return () => clearTimeout(timeout);
  }, [copyState]);

  const handleCopy = async (value, type) => {
    const success = await copyText(value);
    setCopyState(success ? type : 'error');
  };

  return (
    <>
      <button
        type="button"
        className="moon-loader-launch"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="moon-loader-launch__mark" aria-hidden="true">☾</span>
        <span>Open Loader</span>
        <span className="moon-loader-launch__arrow" aria-hidden="true">↗</span>
      </button>

      {open && (
        <div
          className="moon-loader-overlay"
          data-moon-loader
          onMouseDown={event => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            className="moon-loader-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="moon-loader-heading"
          >
            <header className="moon-loader-header">
              <div className="moon-loader-titleblock">
                <span className="moon-loader-eyebrow">MOON · LUARMOR</span>
                <h2 id="moon-loader-heading">Script Loader</h2>
                <p>Выбери скрипт и скопируй команду запуска.</p>
              </div>
              <button
                type="button"
                className="moon-loader-close"
                aria-label="Закрыть лоудер"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </header>

            <div className="moon-loader-main">
              <nav className="moon-loader-games" aria-label="Доступные игры">
                {games.map((game, index) => (
                  <button
                    key={game.id}
                    type="button"
                    className={`moon-loader-game${activeIndex === index ? ' is-active' : ''}`}
                    aria-current={activeIndex === index ? 'true' : undefined}
                    onClick={() => setActiveIndex(index)}
                  >
                    {game.image ? (
                      <img src={game.image} alt="" loading="lazy" />
                    ) : (
                      <span className="moon-loader-game__symbol" aria-hidden="true">
                        {game.name.slice(0, 1)}
                      </span>
                    )}
                    <span>{game.name}</span>
                    <span className="moon-loader-game__chevron" aria-hidden="true">›</span>
                  </button>
                ))}
              </nav>

              <div className="moon-loader-detail">
                <div className="moon-loader-detail__intro">
                  <span className="moon-loader-kicker">SELECTED SCRIPT</span>
                  <h3>{active.name}</h3>
                  <p>Luarmor Script ID</p>
                  <code className="moon-loader-id">{active.id}</code>
                </div>

                <div className="moon-loader-command">
                  <span>Команда для открытия Moon Loader в Roblox</span>
                  <code>{launcher}</code>
                  <button
                    type="button"
                    className="moon-loader-primary"
                    onClick={() => handleCopy(launcher, 'launcher')}
                  >
                    {copyState === 'launcher' ? 'Скопировано ✓' : 'Скопировать Loader'}
                  </button>
                </div>

                <div className="moon-loader-divider">или</div>

                <button
                  type="button"
                  className="moon-loader-secondary"
                  onClick={() => handleCopy(
                    `loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/${active.id}.lua"))()`,
                    'script'
                  )}
                >
                  {copyState === 'script' ? 'Скопировано ✓' : 'Скопировать прямой loadstring'}
                  <span aria-hidden="true">↗</span>
                </button>

                <p className="moon-loader-note">
                  Скрипты запускаются только в поддерживаемой среде Roblox. На сайте
                  ключ не запрашивается: проверка Luarmor выполняется игровым Loader.
                </p>
                {copyState === 'error' && (
                  <p className="moon-loader-error" role="status">
                    Не удалось скопировать — проверь разрешение браузера на буфер обмена.
                  </p>
                )}
                <a
                  className="moon-loader-docs"
                  href="https://docs.luarmor.net/luarmor-user-manual-and-f.a.q"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Документация Luarmor ↗
                </a>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
