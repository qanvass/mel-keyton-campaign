import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { Suspense } from "react";


function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={__BASE_PATH__}>
        <Suspense fallback={<div className="min-h-screen bg-[#f7f9f4] flex items-center justify-center"><i className="ri-loader-4-line text-4xl text-dark-green animate-spin" /></div>}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
