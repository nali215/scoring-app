export type ParsedSheet = {
  headers: string[]
  rows: string[][]
}

export function parseCsv(text: string): ParsedSheet {
  const records: string[][] = []
  let field = ''
  let record: string[] = []
  let inQuotes = false

  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i]

    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      record.push(field)
      field = ''
    } else if (char === '\n') {
      record.push(field)
      records.push(record)
      record = []
      field = ''
    } else {
      field += char
    }
  }

  if (field !== '' || record.length > 0) {
    record.push(field)
    records.push(record)
  }

  const nonEmpty = records.filter((row) => row.some((cell) => cell.trim() !== ''))
  const [headers = [], ...rows] = nonEmpty

  return {
    headers: headers.map((header) => header.trim()),
    rows
  }
}

export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const name = file.name.toLowerCase()

  if (name.endsWith('.csv') || file.type === 'text/csv') {
    const text = await file.text()
    return parseCsv(text)
  }

  const readXlsxFile = (await import('read-excel-file/browser')).default
  const rows = (await readXlsxFile(file)) as unknown as unknown[][]
  const stringRows = rows.map((row) => row.map((cell) => (cell === null || cell === undefined ? '' : String(cell).trim())))
  const [headers = [], ...dataRows] = stringRows

  return {
    headers: headers.map((header) => header.trim()),
    rows: dataRows
  }
}
