'use client'

import Papa from 'papaparse'
import { useState } from 'react'
import { buyerSchema } from '@/lib/zod/buyerSchema'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type ValidationError = {
  row: number
  message: string
}

export default function ImportPage() {
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function normalizeBhk(rawBhk: unknown): string | undefined {
    if (typeof rawBhk !== 'string') return undefined
    const trimmed = rawBhk.trim()
    if (trimmed === '' || trimmed === '-') return undefined
    const mapping: Record<string, string> = {
      'Studio': 'Studio',
      '1': 'One',
      '2': 'Two', 
      '3': 'Three',
      '4': 'Four',
      'One': '1',
      'Two': '2',
      'Three': '3',
      'Four': '4',
    }
    return mapping[trimmed] ?? undefined
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSuccessMessage(null)
    setParsedRows([])
    setErrors([])

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rows = results.data as any[]
        const validRows: any[] = []
        const errList: ValidationError[] = []

        rows.slice(0, 200).forEach((row, index) => {
          let normalizedBhk = normalizeBhk(row.bhk)
        
          if (row.propertyType !== 'Apartment' && row.propertyType !== 'Villa') {
            normalizedBhk = undefined
          }
        
          row.bhk = normalizedBhk
          console.log(`Row ${index + 2} after normalizeBhk:`, row.bhk)
        
          const result = buyerSchema.safeParse(row)
          if (!result.success) {
            console.log('Validation errors:', result.error.errors)
            errList.push({
              row: index + 2,
              message: result.error.errors
                .map(e => `${e.path.join('.')}: ${e.message}`)
                .join(', '),
            })
          } else {
            validRows.push(result.data)
          }
        })      

        setParsedRows(validRows)
        setErrors(errList)
      },
    })
  }

  const handleImport = async () => {
    setIsLoading(true)
    setSuccessMessage(null)

    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) {
      alert('You must be logged in to import leads.')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/buyers/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsedRows),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Import failed')
      }

      setSuccessMessage(data.message)
      setParsedRows([])
    } catch (err: any) {
      alert(`Import failed: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">CSV Buyer Import</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="mb-4"
      />

      {errors.length > 0 && (
        <div className="mt-4">
          <h2 className="text-red-700 font-semibold mb-2">Validation Errors ({errors.length}):</h2>
          <div className="overflow-auto max-h-96 border border-gray-300 rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Row</th>
                  <th className="border px-3 py-2 text-left">Message</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err, idx) => (
                  <tr key={idx}>
                    <td className="border px-3 py-1">{err.row}</td>
                    <td className="border px-3 py-1 text-red-600">{err.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {parsedRows.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          <div className="text-green-700">
            {parsedRows.length} valid row{parsedRows.length > 1 ? 's' : ''} ready to import.
          </div>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            onClick={handleImport}
            disabled={isLoading}
          >
            {isLoading ? 'Importing...' : `Import ${parsedRows.length} Row${parsedRows.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 text-green-700 font-medium">
          ✅ {successMessage}
        </div>
      )}
    </div>
  )
}
