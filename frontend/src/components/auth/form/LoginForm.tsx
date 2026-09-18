import { useNavigate } from "@tanstack/react-router";
import { type SubmitEvent, useState } from "react";
import { type LoginFormValues, loginFormSchema } from "shared";
import { UAParser } from "ua-parser-js";
import { useAuthForm } from "@/hooks";
import Alert from "../Alert";
import Button from "./Button";
import Input from "./Input";

const LoginForm = () => {
  const [error, setError] = useState<string>("");
  const navigate = useNavigate({ from: "/auth/login" });

  const { values, handleChange } = useAuthForm({ username: "", password: "" });
  const isValid = loginFormSchema.safeParse(values).success;

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parser = new UAParser();

    const device = parser.getDevice().type;
    const deviceName = `${device ? device : ""} ${parser.getOS()} ${parser.getBrowser().name}`;

    const stored = localStorage.getItem("sessions");
    const recentUsers: Record<
      number,
      { username: string; sessionUuid: string }
    > = stored ? JSON.parse(stored) : {};

    const loginKey = (values as LoginFormValues).username;
    const matchedEntry = Object.entries(recentUsers).find(
      ([_, user]) => user.username === loginKey,
    );
    const sessionUuid = matchedEntry
      ? matchedEntry[1].sessionUuid
      : crypto.randomUUID();

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        deviceName,
        sessionUuid,
      }),
    });

    const data = await response.json();
    if (!response.ok) return setError(data.message);

    const { username, userId } = data;
    const existingSession = Object.values(recentUsers).find(
      (entry) => entry.sessionUuid === sessionUuid,
    );
    if (!recentUsers[userId] || existingSession) {
      recentUsers[userId] = { username, sessionUuid };
      localStorage.setItem("sessions", JSON.stringify(recentUsers));
    }

    navigate({ to: "/app", replace: true });
  };

  const fields = [
    {
      name: "username",
      type: "text",
      placeholder: "jane_doe",
      children: "Username",
    },
    {
      name: "password",
      type: "password",
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      children: "Password",
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-10 w-full"
    >
      <div className="flex flex-col gap-4 max-w-xs w-full">
        {fields.map((field) => (
          <Input
            key={field.name}
            onChange={handleChange}
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            autoComplete={field.name === "password" ? "new-password" : "off"}
            value={(values as Record<string, string>)[field.name]}
          >
            {field.children}
          </Input>
        ))}
      </div>
      {error && <Alert description={error} />}
      <Button disabled={!isValid} text="Log in" />
    </form>
  );
};

export default LoginForm;
