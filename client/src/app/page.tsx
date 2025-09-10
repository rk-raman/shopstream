import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-4">
            ShopStream
          </h1>
          <p className="text-lg text-muted-foreground">
            Modern E-commerce Platform for Buyers and Sellers
          </p>
        </div>

        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Welcome to ShopStream - Your complete e-commerce solution
          </li>
          <li className="tracking-[-.01em]">
            Built with Next.js 15, React 19, and TypeScript
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/shop"
          >
            Start Shopping
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="/seller/signup"
          >
            Become a Seller
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/shop/categories"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="Categories icon"
            width={16}
            height={16}
          />
          Categories
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/account"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Account icon"
            width={16}
            height={16}
          />
          My Account
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/about"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="About icon"
            width={16}
            height={16}
          />
          About ShopStream →
        </a>
      </footer>
    </div>
  );
}
