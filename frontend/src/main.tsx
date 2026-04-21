import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from "./App.tsx";
import "./index.css";
import './config/i18n.config.ts';

// const originalConsoleError = console.error;

// console.error = (...args) => {
//   console.log("-->> Stack trace for console.error:", new Error().stack);
//   originalConsoleError.apply(console, args);
// };


const queryClient = new QueryClient();
  // defaultOptions: {
  //   queries: {c
  //     retry: false,           // Avoid retrying automatically if you want manual control over retries
  //     useErrorBoundary: false, // Don't use error boundary for queries (optional)
  //     refetchOnWindowFocus: false,
  //   },
  //   mutations: {
  //     useErrorBoundary: false, // Disable error boundary for mutations as well
  //     onError: () => {},       // Provide an empty function to disable default console logging
  //   },
  // },


ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <QueryClientProvider client={queryClient}>
          <App />
      {/* <ReactQueryDevtools /> */}
    </QueryClientProvider>
  // </React.StrictMode>
);
