"use client";

import Scanner from "../components/Scanner";

export default function Home() {
  return (
    <div className="p-50">
      <Scanner onScanSuccess={(data) => alert(data)}></Scanner>
    </div>
  );
}
