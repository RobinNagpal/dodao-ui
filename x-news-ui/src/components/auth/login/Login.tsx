"use client";

import Button from "@dodao/web-core/components/core/buttons/Button";
import Input from "@dodao/web-core/components/core/input/Input";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Loginpage() {
  const [key, setKey] = useState<string>("");
  const [upserting, setUpserting] = useState<boolean>(false);
  const router = useRouter();

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpserting(true);
    const response = await fetch(`/api/login-as-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
      }),
    });
    setUpserting(false);
    if (response?.ok) {
      const key = await response.json();
      localStorage.setItem("adminKey", key);
      router.push("/");
    } else {
      alert("Failed to login.");
    }
  };
  return (
    <div className="">
      <form onSubmit={handleKeySubmit}>
        <Input
          id="key"
          modelValue={key}
          onUpdate={(e) => (e ? setKey(e.toString()) : setKey(""))}
          required
          label={"Admin Key"}
        />
        <div className="w-full flex justify-center">
          <Button
            type="submit"
            primary
            variant={"contained"}
            className="mt-4"
            loading={upserting}
          >
            Login
          </Button>
        </div>
      </form>
    </div>
  );
}
