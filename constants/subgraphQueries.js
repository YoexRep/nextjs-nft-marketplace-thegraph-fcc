import { gql } from "@apollo/client"

const GET_ACTIVE_ITEMS = gql`
    {
        activeItems(
            skip: 8
            take: 100
            where: { buyer: "0x0000000000000000000000000000000000000000" }
        ) {
            id
            buyer
            seller
            nftAddress
            tokenId
            price
        }
    }
`
export default GET_ACTIVE_ITEMS
