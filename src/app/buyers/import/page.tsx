'use client'
import Papa from 'papaparse'
import { useState } from 'react'
import { buyerSchema } from '@/lib/zod/buyerSchema'

export default function ImportPage() {
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rows = results.data as any[]
        const errList: any[] = []
        const validRows: any[] = []

        rows.slice(0, 200).forEach((row, i) => {
          const result = buyerSchema.safeParse(row)
          if (!result.success) {
            errList.push({
              row: i + 2, // +2 to account for header + 0-index
              message: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
            })
          } else {
            validRows.push(result.data)
          }
        })

        setParsedRows(validRows)
        setErrors(errList)
      }
    })
  }

  const handleImport = async () => {
    const res = await fetch('/api/buyers/import', {
      method: 'POST',
      body: JSON.stringify(parsedRows),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await res.json()
    alert(data.message)
  }

  return (
    <div className="p-4">
      <input type="file" accept=".csv" onChange={handleFile} />
      {errors.length > 0 && (
        <div className="mt-4">
          <h2>Errors:</h2>
          <ul className="text-red-600">
            {errors.map((err, idx) => (
              <li key={idx}>Row {err.row}: {err.message}</li>
            ))}
          </ul>
        </div>
      )}
      {parsedRows.length > 0 && (
        <div className="mt-4">
          <button className="bg-green-600 text-white px-4 py-2" onClick={handleImport}>
            Import {parsedRows.length} Valid Rows
          </button>
        </div>
      )}
    </div>
  )
}
