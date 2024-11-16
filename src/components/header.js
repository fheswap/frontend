import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Header = ({ address }) => {
  const [open, setOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const MobileMenu = () => (
    <div
      className={`
      fixed top-16 right-4 z-50 bg-[#020B20] border border-[#1E3A8A] rounded-lg p-4 shadow-lg
      transform transition-all duration-200 ease-in-out
      ${
        menuOpen
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 opacity-0 pointer-events-none"
      }
    `}
    >
      {address && (
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/5 justify-start"
            onClick={() => {
              setOpen(true);
              setMenuOpen(false);
            }}
          >
            Change Contract
          </Button>
          <div className="border border-[#1E3A8A] px-4 py-2 rounded text-white/80 font-mono text-sm">
            {address?.slice(0, 6)}...{address?.slice(-6)}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-4 md:px-12 pt-6">
        <div className="hidden md:flex items-center gap-4">
          <Image
            src="/inco-logo.svg"
            alt="Gentry Logo"
            width={139}
            height={40}
          />
          {/* <div className="flex items-center gap-2">
            <span className="text-[#72FF80] text-4xl">Confidential ERC-20</span>
          </div> */}
        </div>

        {/* Mobile Logo */}
        <div className="flex md:hidden items-center gap-2">
          <Image
            src="/inco-logo.svg"
            alt="Gentry Logo"
            width={100}
            height={30}
          />
          <span className="text-[#72FF80] text-xl">Rivest Testnet</span>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {address && (
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/5"
              onClick={() => setOpen(true)}
            >
              Change Contract
            </Button>
          )}

          {address && (
            <div className="border border-[#1E3A8A] px-4 py-2 rounded text-white/80 font-mono">
              {address?.slice(0, 6)}...{address?.slice(-6)}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/5"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <MobileMenu />
    </div>
  );
};

export default Header;
