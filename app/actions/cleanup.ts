'use server'

import fs from 'fs'
import path from 'path'

export async function cleanupDownloads(maxAgeHours = 24) {
  const downloadsDir = path.join(process.cwd(), 'downloads')
  
  if (!fs.existsSync(downloadsDir)) {
    return
  }

  const files = fs.readdirSync(downloadsDir)
  const now = Date.now()
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000

  files.forEach(file => {
    const filePath = path.join(downloadsDir, file)
    const stats = fs.statSync(filePath)
    const fileAge = now - stats.mtimeMs

    if (fileAge > maxAgeMs) {
      fs.unlinkSync(filePath)
    }
  })
} 