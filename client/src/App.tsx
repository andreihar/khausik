import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './libs/i18n';
import Translator from "./pages/Translator";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const theme = {
  primaryColor: 'blue',
  fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Noto Sans TC, Noto Sans SC, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji'
};

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <Navbar />
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Translator />} />
        </Routes>
        <Footer />
      </I18nextProvider>
    </MantineProvider>
  );
}
