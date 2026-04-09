import "../app/globals.css";

export const references = {
  font: ["Inter", "Segoe UI", "system-ui"],
  icons: ["lucide-react"]
};

export default function App({ Component, pageProps }: { Component: React.FC<any>, pageProps: any }) {
  return <Component {...pageProps} />;
}