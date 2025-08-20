import React from "react";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "../../components/LoadingSpinner";

test("renders with default message", () => {
  render(<LoadingSpinner />);
  expect(screen.getByText("Carregando...")).toBeInTheDocument();
});

test("renders custom message", () => {
  render(<LoadingSpinner message="Loading data" fullScreen={false} />);
  expect(screen.getByText("Loading data")).toBeInTheDocument();
});
