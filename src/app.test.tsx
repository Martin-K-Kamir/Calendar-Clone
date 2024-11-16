import { render } from "@testing-library/react";
import { App } from "./App";
import { describe, it, expect } from "vitest";

describe("App Component", () => {
    it("should render without crashing", () => {
        const { container } = render(<App />);
        expect(container).toBeDefined();
    });
});
