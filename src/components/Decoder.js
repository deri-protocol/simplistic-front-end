import abis from '../utils/abis'
import {ethers} from 'ethers'
import {useState} from 'react'

const Decoder = () => {
    const [raw, setRaw] = useState('')
    const [parsed, setParsed] = useState('')

    const simplify = (data) => {
        if (data instanceof ethers.BigNumber) {
            return ethers.utils.formatUnits(data, 18)
        } else if (Array.isArray(data)) {
            return data.map((item) => (simplify(item)))
        } else if (data.constructor == Object) {
            let res = {}
            for (let [key, value] of Object.entries(data)) {
                res[key] = simplify(value)
            }
            return res
        } else {
            return data
        }
    }

    const onChangeRaw = (data) => {
        setRaw(data)
        try {
            let iface = new ethers.utils.Interface(abis.PoolImplementation)
            let p = iface.parseTransaction({data})
            p = {
                name: p.name,
                sighash: p.sighash,
                signature: p.signature,
                args: p.args
            }
            setParsed(JSON.stringify(simplify(p), null, 4))
        } catch (e) {
            setParsed('Cannot parse transaction data!')
        }
    }

    return (
        <div>
            <br/>
            <h3>Transaction Data Parser</h3>
            <textarea rows='20' cols='100' value={raw} onChange={(e) => onChangeRaw(e.target.value)} />
            <textarea rows='20' cols='100' value={parsed} />
        </div>
    )
}

export default Decoder
