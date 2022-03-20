import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { defaultTokens } from '../models/defaultTokens';
import { ethers } from 'ethers';
import moment from 'moment';

function DeployVaultForm(props) {
    const loading = props.loading;
    const onChange = props.onChange;
    const onSubmit = props.onSubmit;
    const onDeployStrategy = props.onDeployStrategy;
    const formData = props.formData;


    return <><h3 className="mb-4 mt-3">Create Vault</h3>
    <Form onSubmit={onSubmit}><Form.Group as={Row} className="mb-3">
      <Form.Label column sm={3}>Name</Form.Label>
      <Col sm={9}><Form.Control type="input" name="name" placeholder="Get Rich Quick Strategy" onChange={onChange} value={formData.name} /></Col>
    </Form.Group>
    <Form.Group as={Row} className="">
      <Form.Label column sm={3}>
        Deposit
      </Form.Label>
      <Col sm={9}>
        <InputGroup className="mb-3">
          <Form.Control type="number" step="0.1" name="deposit" onChange={onChange}
            value={formData.deposit} />
          <InputGroup.Text>ETH&nbsp;</InputGroup.Text>
        </InputGroup>
      </Col>
    </Form.Group>
    <Form.Group as={Row} className="mb-3">
      <Form.Label column sm={3}>
        Due In
      </Form.Label>
      <Col sm={9}>
        <InputGroup className="mb-3">
          <Form.Control type="number" name="dueIn" min="7" max="3650" step="1" onChange={onChange} value={formData.dueIn} />
          <InputGroup.Text>DAYS</InputGroup.Text>
        </InputGroup>
      </Col>
    </Form.Group>
    <h4>Tokens</h4>

    <Form.Group as={Row} className="mb-1">
      <InputGroup className="mb-3">
        <Form.Select sm={3} name="token1" onChange={onChange}>
          <option key={'token1_default'} value="">Choose Token</option>
          {defaultTokens.map((token, i) => <option key={i} value={token.address}>{token.name}</option>)}
        </Form.Select>
        <Form.Control type="number" name="token1ratio" min="1" max="100" step="1" onChange={onChange} value={formData.token1ratio} />
        <InputGroup.Text>%</InputGroup.Text>
      </InputGroup>
    </Form.Group>

    <Form.Group as={Row} className="mb-1">
      <InputGroup className="mb-3">
        <Form.Select sm={3} name="token2" onChange={onChange}>
          <option key={'token2_default'} value="">Choose Token</option>
          {defaultTokens.map((token, i) => <option key={i} value={token.address}>{token.name}</option>)}
        </Form.Select>
        <Form.Control type="number" name="token2ratio" min="1" max="100" step="1" onChange={onChange} value={formData.token2ratio} />
        <InputGroup.Text>%</InputGroup.Text>
      </InputGroup>
    </Form.Group>

    <Form.Group as={Row} className="mb-1">
      <InputGroup className="mb-3">
        <Form.Select sm={3} name="token3" onChange={onChange}>
          <option key={'token3_default'} value="">Choose Token</option>
          {defaultTokens.map((token, i) => <option key={i} value={token.address}>{token.name}</option>)}
        </Form.Select>
        <Form.Control type="number" name="token3ratio" min="1" max="100" step="1" onChange={onChange} value={formData.token3ratio} />
        <InputGroup.Text>%</InputGroup.Text>
      </InputGroup>
    </Form.Group>

    <Form.Group as={Row} className="mb-1">
      <div className="text-center"><Button variant="dark" className="w-50 mt-3" type="submit" disabled={loading} onClick={() => !loading ? onDeployStrategy : null}>{loading ? 'Processing…' : 'DEPLOY'}</Button></div>
    </Form.Group>
    </Form>
    </>;
}

export default DeployVaultForm;