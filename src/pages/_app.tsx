import { type AppType } from "next/dist/shared/lib/utils";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import "~/styles/globals.css";
import Head from "next/head";
import {Open_Sans, Kalam} from "next/font/google";
import { animationVariants } from "~/utils/animationUtils";

const opensans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const kalam = Kalam({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();
  return (
    <main className={opensans.className}>
      <style jsx global>{`
        :root {
          --font-kalam: ${kalam.style.fontFamily};
        }
      `}</style>
      <Head>
        <title>Minerva Identity</title>
        <meta name="description" content="Your Minerva Identity" />
        <link rel="icon" href="/minerva.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <AnimatePresence 
        mode="wait" 
        initial={false}
        onExitComplete={() => {
          // Smooth scroll to top on page change
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <motion.div
          key={router.route}
          variants={animationVariants.pageTransition}
          initial="initial"
          animate="enter"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="min-h-screen"
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </main>
  )
};

export default MyApp;
