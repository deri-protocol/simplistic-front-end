import {useState} from 'react'
import {Dropdown, DropdownButton, Button, Form} from 'react-bootstrap'

const MarketsInfo = ({market, marketsInfo, onChangeMarket, onMint, onApprove, onAddLiquidity, onRemoveLiquidity, onAddMargin, onRemoveMargin}) => {

    const [amount, setAmount] = useState('')

    const info = marketsInfo[market] || {}

    return (
        <div>
            <DropdownButton id="dropdown-basic-button" title={market} onSelect={(e) => onChangeMarket(e)}>
                {Object.values(marketsInfo).map((m) => (
                    <Dropdown.Item active={m.balanceLp || m.balanceTd} key={m.bSymbol} eventKey={m.bSymbol}>{m.bSymbol}</Dropdown.Item>
                ))}
            </DropdownButton>
            <table>
            <tbody>
                <tr>
                    <th>BToken</th>
                    <th>Address</th>
                    <th>Price</th>
                    <th>Balance in Wallet</th>
                    <th>Balance in Lp Vault</th>
                    <th>Balance in Td Vault</th>
                </tr>
                <tr>
                    <td>{info.bSymbol}</td>
                    <td>{info.bAddress}</td>
                    <td>{info.price}</td>
                    <td>{info.balance || '---'}</td>
                    <td>{info.balanceLp || '---'}</td>
                    <td>{info.balanceTd || '---'}</td>
                </tr>
            </tbody>
            </table>
            <br/>
            <Button disabled={info.bSymbol === 'BNB'} onClick={() => onMint(info.bSymbol)}>Mint</Button>
            <Button disabled={info.approved || info.bSymbol === 'BNB'} onClick={() => onApprove(info.bSymbol)}>Approve</Button>
            <Form.Control value={amount} onChange={(e) => {setAmount(e.target.value)}} />
            <Button onClick={() => onAddLiquidity(info.bSymbol, amount)}>Add Liquidity</Button>
            <Button onClick={() => onRemoveLiquidity(info.bSymbol, amount)}>Remove Liquidity</Button>
            <Button onClick={() => onAddMargin(info.bSymbol, amount)}>Add Margine</Button>
            <Button onClick={() => onRemoveMargin(info.bSymbol, amount)}>Remove Margin</Button>
        </div>
    )

}

export default MarketsInfo
