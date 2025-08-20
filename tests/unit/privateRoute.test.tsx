import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "../../components/PrivateRoute";
import { AuthProvider, useAuth } from "../../hooks/useAuth";

const Protected = () => <div>Protected</div>;
const Login = () => <div>Login</div>;

// Helper to force auth state
const WithAuthState: React.FC<{ children: React.ReactNode; authenticated: boolean }> = ({
  children,
  authenticated,
}) => {
  const ForceAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { login, logout } = useAuth();
    React.useEffect(() => {
      (async () => {
        if (authenticated) {
          await login("u", "p");
        } else {
          await logout();
        }
      })();
    }, [authenticated]);
    return <>{children}</>;
  };
  return (
    <AuthProvider>
      <ForceAuth>{children}</ForceAuth>
    </AuthProvider>
  );
};

test("redirects unauthenticated users to login", () => {
  const { getByText } = render(
    <WithAuthState authenticated={false}>
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/admin" element={<Protected />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </WithAuthState>
  );
  expect(getByText("Login")).toBeInTheDocument();
});
