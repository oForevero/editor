const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { v4: uuidv4 } = require('uuid')

const app = express()
const upload = multer({ dest: '/tmp/uploads/' })

app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')))

app.post('/api/convert', upload.single('file'), (req, res) => {
  const inputPath = req.file.path
  const outputDir = path.dirname(inputPath)
  const outputHtml = path.join(outputDir, uuidv4() + '.html')

  const cmd = `libreoffice --headless --convert-to html:"HTML" "${inputPath}" --outdir "${outputDir}"`

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
      return res.status(500).send('转换失败')
    }

    const convertedPath = inputPath.replace(/\.docx$/, '.html')
    fs.readFile(convertedPath, 'utf8', (err, data) => {
      if (err) return res.status(500).send('读取失败')
      res.send(data)
    })
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
