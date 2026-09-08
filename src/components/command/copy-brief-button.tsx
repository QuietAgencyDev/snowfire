"use client";

import { useState } from "react";

type CopyBriefButtonProps = {
  text: string;
};

export function CopyBriefButton({ text }: CopyBriefButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="h-12 rounded-xl bg-sky-600 px-5 font-black text-white hover:bg-sky-700"
    >
      {copied ? "Copied to clipboard" : "Copy crew brief"}
    </button>
  );
}
