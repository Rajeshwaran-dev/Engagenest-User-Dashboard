import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import AppRoutes from "./routes";
import { TicketProvider } from "./context/TicketContext";

function App() {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <BrowserRouter>
        <TicketProvider>
          <RouteScrollToTop />
          <AppRoutes />
        </TicketProvider>
      </BrowserRouter>
    </SnackbarProvider>
  );
}

export default App;
