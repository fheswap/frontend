import { useState, useCallback } from "react";
import { Terminal, Lock, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CodeSnippets = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  const getPlainCode = (key) => {
    if (key === "overview") {
      return `function _mint(uint64 mintedAmount) public virtual {
    // Add the minted amount to the sender's balance in a secure, encrypted way
    balances[msg.sender] = TFHE.add(balances[msg.sender], mintedAmount);
    // Grant access to the sender's balance for this contract, the owner, and the sender themselves
    TFHE.allow(balances[msg.sender], address(this));
    TFHE.allow(balances[msg.sender], owner());
    TFHE.allow(balances[msg.sender], msg.sender);
    // Update the total supply of tokens
    *totalSupply = *totalSupply + mintedAmount;
    // Emit an event for minting, logging the sender and the amount minted
    emit Mint(msg.sender, mintedAmount);
}`;
    }
    return `// Returns the balance handle (encrypted balance) of the specified wallet address
function balanceOf(address wallet) public view virtual returns (euint64) {
    return balances[wallet];
}`;
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(getPlainCode(activeTab));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }, [activeTab]);

  const snippets = {
    overview: {
      title: "Mint Function",
      icon: <Terminal className="w-4 h-4" />,
      description:
        "Mints new tokens to the sender's address with secure encryption and access control. Updates total supply and emits an event.",
      code: (
        <div>
          <span className="text-red-400">function </span>
          <span className="text-slate-300">_mint(</span>
          <span className="text-red-400">uint64 </span>
          <span className="text-slate-300">mintedAmount) </span>
          <span className="text-red-400">public virtual </span>
          <span className="text-slate-300">{"{"}</span>
          <br />
          {"    "}
          <span className="text-yellow-300">
            // Add the minted amount to the sender's balance in a secure and
          </span>
          <br />
          {"    "}
          <span className="text-yellow-300">// encrypted way</span>
          <br />
          {"    "}
          <span className="text-green-400">balances</span>
          <span className="text-slate-300">[</span>
          <span className="text-blue-400">msg</span>
          <span className="text-slate-300">.sender] = </span>
          <span className="text-blue-400">TFHE</span>
          <span className="text-slate-300">.add(balances[</span>
          <span className="text-blue-400">msg</span>
          <span className="text-slate-300">.sender], mintedAmount);</span>
          <br />
          {"    "}
          <span className="text-yellow-300">
            // Grant access to the sender's balance for this contract, the
            owner,
          </span>
          <br />
          {"    "}
          <span className="text-yellow-300">// and the sender themselves</span>
          <br />
          {"    "}
          <span className="text-blue-400">TFHE</span>
          <span className="text-slate-300">.allow(balances[</span>
          <span className="text-blue-400">msg</span>
          <span className="text-slate-300">.sender], address(this));</span>
          <br />
          {"    "}
          <span className="text-blue-400">TFHE</span>
          <span className="text-slate-300">.allow(balances[</span>
          <span className="text-blue-400">msg</span>
          <span className="text-slate-300">.sender], owner());</span>
          <br />
          {"    "}
          <span className="text-blue-400">TFHE</span>
          <span className="text-slate-300">.allow(balances[</span>
          <span className="text-blue-400">msg</span>
          <span className="text-slate-300">.sender], </span>
          <span className="text-blue-400">msg</span>
          <span className="text-slate-300">.sender);</span>
          <br />
          {"    "}
          <span className="text-yellow-300">
            // Update the total supply of tokens
          </span>
          <br />
          {"    "}
          <span className="text-slate-300">
            *totalSupply = *totalSupply + mintedAmount;
          </span>
          <br />
          {"    "}
          <span className="text-yellow-300">
            // Emit an event for minting, logging the sender and the amount
            minted
          </span>
          <br />
          {"    "}
          <span className="text-red-400">emit </span>
          <span className="text-green-400">Mint</span>
          <span className="text-slate-300">(</span>
          <span className="text-blue-400">msg</span>
          <span className="text-slate-300">.sender, mintedAmount);</span>
          <br />
          <span className="text-slate-300">{"}"}</span>
        </div>
      ),
    },
    balance: {
      title: "Balance Check",
      icon: <Lock className="w-4 h-4" />,
      description:
        "Returns the encrypted balance handle for a specified wallet address, which can be used in the client application to re-encrypt the balance using the gateway and fhevmjs.",
      code: (
        <div>
          <span className="text-yellow-300">
            // Returns the balance handle (encrypted balance) of the
          </span>
          <br />
          <span className="text-yellow-300">// specified wallet address</span>
          <br />
          <span className="text-red-400">function </span>
          <span className="text-slate-300">balanceOf(</span>
          <span className="text-red-400">address </span>
          <span className="text-slate-300">wallet) </span>
          <span className="text-red-400">public view virtual </span>
          <span className="text-red-400">returns </span>
          <span className="text-slate-300">(</span>
          <span className="text-red-400">euint64</span>
          <span className="text-slate-300">) </span>
          <br />
          {"    "}
          <span className="text-red-400">return </span>
          <span className="text-slate-300">balances[wallet];</span>
          <br />
          <span className="text-slate-300">{"}"}</span>
        </div>
      ),
    },
  };

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 border-b border-slate-700">
        {Object.entries(snippets).map(([key, { title, icon }]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`pb-2 flex items-center space-x-2 px-2 transition-colors ${
              activeTab === key
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            <span>{icon}</span>
            <span className="text-sm sm:text-base">{title}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <p className="text-slate-400 text-sm px-2 sm:px-0">
          {snippets[activeTab].description}
        </p>

        <div className="relative">
          <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed">
            <code>{snippets[activeTab].code}</code>
          </pre>
          <div className="absolute top-3 right-3 flex space-x-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
          </div>
        </div>

        <div className="flex justify-end px-2 sm:px-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className={`flex items-center gap-2 transition-all duration-200 text-xs sm:text-sm hover:bg-slate-700 ${
              copied
                ? "bg-green-500/10 border-green-500/20 text-green-400 hover:text-white/80"
                : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-300"
            }`}
          >
            {copied ? (
              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippets;
