import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
const profile = '0xf8d6e0586b0a20c7'

fcl.config({
  "accessNode.api": "http://Localhost:8888",
});

async function main() {
  let msg = {}

  let val = t.Struct()
  const encoded = await fcl.send([
    fcl.script`
      import SentMessageContract from ${profile}
      pub fun main(msg: SentMessageContract.myMsg) : SentMessageContract.myMsg {
        return msg
      }
    `,
    fcl.args([
      fcl.arg(
        {
          fields: [
            { name: 'toChain', value: 'hello' },
            { name: 'data', value: val },
          ],
        },
        t.Struct(`A.${profile.replace(/^0x/, '')}.SentMessageContract.myMsg`, [
          { name: 'toChain', value: t.String },
          { name: 'data', value: t.Struct },
        ]),
      ),
    ]),
  ])
  const resp = await fcl.decode(encoded)
  console.log(resp)
}

main()