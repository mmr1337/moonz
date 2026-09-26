import './globals.css';

export const metadata = {
  title: 'moon',
  description: 'moon'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
