import {Dropdown, DropdownButton} from 'react-bootstrap'

const PoolInfo = ({poolId, poolIds, poolInfo, onChangePoolId}) => {

    return (
        <div>
            <DropdownButton id="dropdown-basic-button" title={poolId?.toUpperCase()} onSelect={(e) => onChangePoolId(e)}>
                {poolIds.map((pid) => (
                    <Dropdown.Item key={pid} eventKey={pid}>{pid?.toUpperCase()}</Dropdown.Item>
                ))}
            </DropdownButton>
            <table>
            <tbody>
                <tr>
                    <th>Pool</th>
                    <th>Address</th>
                    <th>Reserved B0</th>
                    <th>Liquidity</th>
                    <th>Lps Pnl</th>
                    <th>CumulativePnlPerLiquidity</th>
                    <th>ProtocolFeeAccrued</th>
                    <th>InitialMarginRequired</th>
                </tr>
                <tr>
                    <td>{poolId?.toUpperCase()}</td>
                    <td>{poolInfo.pool}</td>
                    <td>{poolInfo.reservedB0}</td>
                    <td>{poolInfo.liquidity}</td>
                    <td>{poolInfo.lpsPnl}</td>
                    <td>{poolInfo.cumulativePnlPerLiquidity}</td>
                    <td>{poolInfo.protocolFeeAccrued}</td>
                    <td>{poolInfo.initialMarginRequired}</td>
                </tr>
            </tbody>
            </table>
        </div>
    )

}

export default PoolInfo
