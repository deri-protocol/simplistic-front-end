import {useState} from 'react'
import {Dropdown, DropdownButton, Button, Form} from 'react-bootstrap'

const SymbolsInfo = ({symbol, symbolsInfo, onChangeSymbol, onTrade}) => {

    const [amount, setAmount] = useState('')
    const [priceLimit, setPriceLimit] = useState('')

    const symbolInfo = symbolsInfo[symbol]

    const check = (value) => {
        return value && +value !== 0 ? value : '---'
    }

    return (
        <div>
            <div>
            <DropdownButton id="dropdown-basic-button" title={symbol?.toUpperCase()} onSelect={(e) => onChangeSymbol(e)}>
                {Object.keys(symbolsInfo).map((s) => (
                    <Dropdown.Item active={+symbolsInfo[s]?.userVolume !== 0} key={s} eventKey={s}>{s?.toUpperCase()}</Dropdown.Item>
                ))}
            </DropdownButton>
            <Form.Label>Volume:</Form.Label>
            <Form.Control value={amount} onChange={(e) => {setAmount(e.target.value)}} />
            <Form.Label>Price Limit:</Form.Label>
            <Form.Control value={priceLimit} onChange={(e) => {setPriceLimit(e.target.value)}} />
            <Button onClick={() => onTrade(symbol, amount, priceLimit)}>Trade</Button>
            </div>
            <table>
            <tbody>
                {Object.keys(symbolInfo || {}).slice(0,11).map((key) => (
                    <tr key={key}>
                        <th key='name'>{key}</th>
                        <td key='value'>{check(symbolInfo[key])}</td>
                    </tr>
                ))}
            </tbody>
            </table>
            <table>
            <tbody>
                {Object.keys(symbolInfo || {}).slice(11,21).map((key) => (
                    <tr key={key}>
                        <th key='name'>{key}</th>
                        <td key='value'>{check(symbolInfo[key])}</td>
                    </tr>
                ))}
            </tbody>
            </table>
            <table>
            <tbody>
                {Object.keys(symbolInfo || {}).slice(21).map((key) => (
                    <tr key={key}>
                        <th key='name'>{key}</th>
                        <td key='value'>{check(symbolInfo[key])}</td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
    )

}

export default SymbolsInfo
