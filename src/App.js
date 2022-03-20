import Header from  "./components/Header";
import Home from  "./components/Home";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { WalletContextProvider } from "./components/WalletContext";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <WalletContextProvider>
      <Container>
        <Row><Header /></Row>
        <Home />
      </Container>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </WalletContextProvider>
  );
}

export default App;