import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
const profile = '0xf8d6e0586b0a20c7'

fcl.config({
  "accessNode.api": "http://Localhost:8888",
});

async function main() {
  const encoded = await fcl.send([
    fcl.script`
      import HelloWorld from ${profile}
      pub fun main(foo: HelloWorld.Foo) : HelloWorld.Foo {
        return foo
      }
    `,
    fcl.args([
      fcl.arg(
        {
          fields: [
            { name: 'a', value: 'hello' },
            { name: 'b', value: 37 },
          ],
        },
        t.Struct(`A.${profile.replace(/^0x/, '')}.HelloWorld.Foo`, [
          { name: 'a', value: t.String },
          { name: 'b', value: t.Int },
        ]),
      ),
    ]),
  ])
  const resp = await fcl.decode(encoded)
  console.log(resp)
}

main()