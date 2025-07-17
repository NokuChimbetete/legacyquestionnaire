import React from "react";

const SuperSecretPage: React.FC = () => {
  const handleDownload = async () => {
    const res = await fetch("/api/export-responses");
    if (!res.ok) {
      alert("Failed to download CSV");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "responses.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-pink-200 to-purple-200 p-6">
      <div className="rounded-3xl border-2 border-yellow-400 bg-white/95 p-12 shadow-2xl backdrop-blur-lg">
        <p className="mb-6 text-center text-xl text-gray-700">
          Congratulations! You’ve unlocked the{" "}
          <span className="font-semibold text-pink-600">super secret</span>{" "}
          page.
          <br />
          You truly have the heart of a legend.
        </p>
        <div className="mb-8 flex justify-center text-4xl">
          {Array.from({ length: 10 }).map((_, i) => (
            <span className="mx-1" key={i}>
              ❤️
            </span>
          ))}
        </div>
        <p className="text-center text-base italic text-gray-500">
          (Password: <span className="font-mono">tenofhearts</span>)
        </p>
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleDownload}
            className="rounded-lg bg-gradient-to-r from-yellow-400 to-pink-400 px-6 py-3 font-bold text-white shadow-lg hover:from-yellow-500 hover:to-pink-500"
          >
            Download Responses CSV
          </button>
        </div>
      </div>
    </main>
  );
};

export default SuperSecretPage;
