import { render } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  it("renders with the given text", async () => {
    const { container } = render(<Button disabled={false} text="Zaloguj" />);
    const button = container.querySelector("button");
    expect(button?.textContent?.trim()).toBe("Zaloguj");
  });

  it("displays disabled styles when disabled is true", async () => {
    const { container } = render(<Button disabled={true} text="Wyslij" />);
    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(button).toHaveClass("disabled:bg-surface-elevated");
    expect(button).toHaveClass("disabled:cursor-not-allowed");
  });

  it("displays enabled styles when disabled is false", async () => {
    const { container } = render(
      <Button disabled={false} text="Zarejestruj" />,
    );
    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(button).toHaveClass("bg-primary");
  });
});
