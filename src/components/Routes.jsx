import { createBrowserRouter } from "react-router-dom";
import Login from "./Login";
import LandingPage from "./LandingPage";
import ErrorPage from "./ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />
  },
  {
    path: "/landingpage",
    element: <LandingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/error",
    element: <ErrorPage />,
    errorElement: <ErrorPage />
  }
]);

export default router;
