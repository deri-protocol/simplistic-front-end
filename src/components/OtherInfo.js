import {useState} from 'react'
import {Button, Form} from 'react-bootstrap'

const OtherInfo = ({xvsBalance, onLiquidate, onClaimXVSLp, onClaimXVSTd}) => {

    const [address, setAddress] = useState('')

    return (
        <div>
            <Form.Control id='addr' value={address} onChange={(e) => {setAddress(e.target.value)}} />
            <Button onClick={() => onLiquidate(address)}>Liquidate</Button>
            <br/>
            <br/>
            <Form.Label>XVS Balance: {xvsBalance || '---'}</Form.Label>
            <Button onClick={() => onClaimXVSLp()}>Claim Venus Lp</Button>
            <Button onClick={() => onClaimXVSTd()}>Claim Venus Td</Button>
        </div>
    )

}

export default OtherInfo
