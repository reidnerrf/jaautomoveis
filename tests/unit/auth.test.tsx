import React from "react";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../hooks/useAuth";

describe("Auth hook", () => {
  it("initializes not authenticated", () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
  });
});
