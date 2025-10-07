import React, { useState } from "react";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLInputElement>
  ): void => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");

      // Reset after 3 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Stay in the Loop
        </h2>

        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Get the latest updates, exclusive content, and special offers
          delivered straight to your inbox.
        </p>

        {/* Form */}
        <div className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              disabled={status === "loading" || status === "success"}
              onKeyPress={handleKeyPress}
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSubmit}
              disabled={status === "loading" || status === "success"}
              className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </div>

          {/* Status Messages */}
          {status === "success" && (
            <div className="mt-4 flex items-center justify-center gap-2 text-white bg-white/10 backdrop-blur-sm py-3 px-4 rounded-lg transition-all duration-300 ease-out">
              <CheckCircle className="w-5 h-5" />
              <span>Successfully subscribed! Check your inbox.</span>
            </div>
          )}

          {status === "error" && (
            <div className="mt-4 flex items-center justify-center gap-2 text-white bg-red-500/20 backdrop-blur-sm py-3 px-4 rounded-lg transition-all duration-300 ease-out">
              <AlertCircle className="w-5 h-5" />
              <span>Please enter a valid email address.</span>
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <p className="mt-6 text-sm text-white/70">
          We respect your privacy. Unsubscribe at any time.
        </p>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">
              10K+
            </div>
            <div className="text-sm text-white/80">Subscribers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">
              Weekly
            </div>
            <div className="text-sm text-white/80">Updates</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">
              100%
            </div>
            <div className="text-sm text-white/80">Free</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
