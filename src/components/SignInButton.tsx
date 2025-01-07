"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function SignInButton() {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <div className="flex gap-4 ml-auto items-center">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || "用户"}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <p className="text-sky-600">{session.user.name}</p>
        <p className="text-green-600">余额: {session.user.balance}</p>
        <button onClick={() => signOut()} className="text-red-600">
          登出
        </button>
      </div>
    );
  }
  return (
    <button onClick={() => signIn("google")} className="text-green-600 ml-auto">
      登录
    </button>
  );
}