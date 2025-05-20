import '../styles/globals.css';
import { AnimatePresence } from 'framer-motion';
import UseScrollToTop from '../hooks/useScrollToTop';
import DefaultLayout from '../components/layout/DefaultLayout';

function MyApp({ Component, pageProps }) {
  // Permite que cada página defina su propio layout (o ninguno)
  const getLayout = Component.getLayout || ((page) => (
    <DefaultLayout>{page}</DefaultLayout>
  ));

  return (
    <AnimatePresence>
      <div className="bg-secondary-light dark:bg-primary-dark transition duration-300">
        {getLayout(<Component {...pageProps} />)}
        <UseScrollToTop />
      </div>
    </AnimatePresence>
  );
}

export default MyApp;
