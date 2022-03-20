import ConnectWalletButton from "./ConnectWalletButton";
import AddTokenButton from "./AddTokenButton";
import { Col, Row, Button } from 'react-bootstrap';

function Header() {
    return (
      <Col>
          <Row>
            <Col><h1 className="float-start">HODL BANK</h1></Col>
            <Col><AddTokenButton /></Col>
            <Col><ConnectWalletButton /></Col>
          </Row>
          
      </Col>
    );
  }
  
  export default Header;