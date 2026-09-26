import './globals.css';

export const metadata = {
  title: 'Moon — информационная карточка',
  description: 'Минималистичная информационная карточка Moon'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
