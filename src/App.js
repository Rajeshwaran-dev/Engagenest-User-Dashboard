import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import AppRoutes from "./routes";

function App() {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <BrowserRouter>
        <RouteScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </SnackbarProvider>
  );
}

export default App;
