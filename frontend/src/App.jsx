import { createBrowserRouter } from "react-router-dom";
import "./App.css";
import Signup from "./components/Signup";
import MainLayout from "./components/MainLayout";
import Login from "./components/Login";
import { RouterProvider } from "react-router";
import Profile from "./components/Profile";
import Home from "./components/Home";

function App() {
  const browserRouter = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/profile",
          element: <Profile />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
  ]);
  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;
