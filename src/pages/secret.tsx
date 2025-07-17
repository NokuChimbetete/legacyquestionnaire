import React from "react";

import { useEffect } from "react";

const SecretPage: React.FC = () => {
  useEffect(() => {
    window.localStorage.setItem("minervaSecretUnlocked", "true");
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 p-6">
      <div className="rounded-3xl border border-gray-200 bg-white/90 p-10 shadow-2xl backdrop-blur-lg">
        <h1 className="mb-6 text-center text-4xl font-bold text-purple-700">
          🎉 Secret Unlocked! 🎉
        </h1>
        <p className="mb-4 text-center text-lg text-gray-700">
          You found the hidden page!
          <br />
          Thanks for spreading the love. 💜
        </p>
        <div className="mb-2 text-center text-2xl">❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️</div>
        <p className="text-center text-base italic text-gray-500">
          (You clicked the heart 10 times!)
        </p>
        <div className="mt-8 text-center text-sm text-gray-400">
          — Minerva Vibe Check Team
        </div>
      </div>
    </main>
  );
};

export default SecretPage;
