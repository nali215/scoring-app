import { randomBytes } from 'node:crypto'
import { writeFileSync, existsSync } from 'node:fs'
if (existsSync('.env.local')) throw new Error('.env.local already exists. Update it manually to preserve your settings.')
const password = randomBytes(12).toString('base64url')
writeFileSync('.env.local', `ADMIN_PASSWORD=${password}\nAUTH_SECRET=${randomBytes(32).toString('hex')}\nALLOW_LOCAL_STORAGE=true\nCOURT1_PASSWORD=Court1!\nCOURT2_PASSWORD=Court2!\nCOURT3_PASSWORD=Court3!\n`, { mode: 0o600 })
console.log('Local admin configuration created in .env.local. Keep this file private.')
console.log(`Your admin password: ${password}`)
