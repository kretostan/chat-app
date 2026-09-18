import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAuthForm } from "./useAuthForm";

describe("useAuthForm", () => {
  it("returns values and handleChange", () => {
    const initial = { username: "", password: "" };
    const { result } = renderHook(() => useAuthForm(initial));
    expect(result.current).toHaveProperty("values");
    expect(result.current).toHaveProperty("handleChange");
  });

  it("returns initial values", () => {
    const initial = { username: "alice", password: "password123" };
    const { result } = renderHook(() => useAuthForm(initial));
    expect(result.current.values).toEqual(initial);
  });

  it("updates values on handleChange for name=username", () => {
    const { result } = renderHook(() =>
      useAuthForm({ username: "", password: "" }),
    );

    expect(result.current.values).toEqual({ username: "", password: "" });

    act(() => {
      result.current.handleChange({
        target: { name: "username", value: "alice" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.values.username).toBe("alice");
    expect(result.current.values.password).toBe("");
  });

  it("updates values on handleChange for name=password", () => {
    const { result } = renderHook(() =>
      useAuthForm({ username: "alice", password: "oldPass" }),
    );

    expect(result.current.values).toEqual({
      username: "alice",
      password: "oldPass",
    });

    act(() => {
      result.current.handleChange({
        target: { name: "password", value: "newPass" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.values.password).toBe("newPass");
    expect(result.current.values.username).toBe("alice");
  });

  it("spreads update correctly without mutating previous values", () => {
    const { result } = renderHook(() =>
      useAuthForm({
        email: "alice@test.com",
        username: "alice",
        password: "abc",
        confirmPassword: "abc",
      }),
    );

    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "new@b.com" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.values.username).toBe("alice");
  });
});
