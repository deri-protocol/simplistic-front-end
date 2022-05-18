
const UserInfo = ({userInfo}) => {

    const check = (value) => {
        return value && +value !== 0 ? value : '---'
    }

    return (
        <div>
            <table>
            <tbody>
                <tr>
                    <th>User</th>
                    <th>TokenId</th>
                    <th>Reserved B0</th>
                    <th>Vault Liquidity/Margin</th>
                    <th>Total Liquidity/Margin</th>
                </tr>
                <tr>
                    <th>As Lp</th>
                    <td>{check(userInfo.lTokenId)}</td>
                    <td>{check(userInfo.lpAmountB0)}</td>
                    <td>{check(userInfo.lpVaultLiquidity)}</td>
                    <td>{check(userInfo.liquidity)}</td>
                </tr>
                <tr>
                    <th>As Trader</th>
                    <td>{check(userInfo.pTokenId)}</td>
                    <td>{check(userInfo.tdAmountB0)}</td>
                    <td>{check(userInfo.tdVaultLiquidity)}</td>
                    <td>{check(userInfo.margin)}</td>
                </tr>
            </tbody>
            </table>
        </div>
    )

}

export default UserInfo
