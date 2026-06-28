import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/modules/auth";
import { router } from "@/router";

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
