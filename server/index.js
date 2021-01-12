const Koa = require('koa')
const cors = require('koa-cors2')
const formidable = require('formidable')
const {argv} = require('yargs')
const {compressFile} = require('./utils')
const app = new Koa()

const main = async (ctx, next) => {
  if (ctx.method.toLowerCase() === 'post' && ctx.url === '/compress') {
    const form = formidable({multiples: true})
    await new Promise((resolve, reject) => {
      form.parse(ctx.req, async (err, fields, files) => {
        if (err) {
          reject(err)
          return
        }
        const {rate, useTinify} = fields
        const {
          file,
          file: {type},
        } = files
        try {
          const compressedBuffer = await compressFile({
            file,
            rate,
            useTinify,
          })
          ctx.type = type
          ctx.status = 200
          ctx.body = compressedBuffer
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
    await next()
    return
  }
}

app.use(cors())
app.use(main)

const port = argv.port
app.listen(port, () => {
  console.log(`slice compressor server is starting at port ${port}`)
})
