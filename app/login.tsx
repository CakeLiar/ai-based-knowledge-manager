'use client';

import Image from "next/image";
import { handleSend } from "./buttonfunctions";
import React from "react";
import {login} from "./buttonfunctions";

export default function Login() {
  return (
    <main className="flex items-center justify-center h-screen">
      <div>
        Sign in please
        <button onClick={login}>Send</button>
        <br />
      </div>
    </main>
  );
}