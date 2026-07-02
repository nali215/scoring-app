'use client'

import { useMemo, useRef, useState } from 'react'
import { CheckCircle2, Download, FileSpreadsheet, RotateCcw, Upload } from 'lucide-react'
import { RosterTable } from '@/components/roster-table'
import { StatusPill } from '@/components/status-pill'
import { useRoster } from '@/lib/use-roster'
import { parseSpreadsheet, type ParsedSheet } from '@/lib/parse-file'
import {
  autoMapHeaders,
  buildDraftTeams,
  previewMerge,
  rosterFields,
  rosterSummary,
  type ColumnMapping,
  type MergeResult,
  type RosterFieldKey
} from '@/lib/roster'

const TEMPLATE_HEADERS = [
  'Division',
  'Player 1 First Name',
  'Player 1 Last Name',
  'Player 1 Email',
  'Player 2 First Name',
  'Player 2 Last Name',
  'Seed'
]

function templateCsv(): string {
  const sample = ["Men's Doubles", 'Omar', 'Khan', 'omar@example.com', 'Sam', 'Park', '1']
  return `${TEMPLATE_HEADERS.join(',')}\n${sample.join(',')}\n`
}

export function RosterManager() {
  const { roster, error, importDrafts, updateTeam, updatePlayer, deleteTeam, resetRoster } = useRoster()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [parsed, setParsed] = useState<ParsedSheet | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [lastImport, setLastImport] = useState<MergeResult[] | null>(null)

  const summary = rosterSummary(roster)

  const draftResult = useMemo(() => {
    if (!parsed) return null
    return buildDraftTeams(parsed.rows, mapping)
  }, [parsed, mapping])

  const preview = useMemo<MergeResult[]>(() => {
    if (!draftResult) return []
    return previewMerge(roster, draftResult.drafts)
  }, [draftResult, roster])

  const addedCount = preview.filter((entry) => entry.status === 'added').length
  const updatedCount = preview.filter((entry) => entry.status === 'updated').length

  async function handleFile(file: File | undefined) {
    if (!file) return
    setParseError(null)
    setLastImport(null)
    try {
      const sheet = await parseSpreadsheet(file)
      if (sheet.headers.length === 0) {
        setParseError('No columns detected in that file.')
        return
      }
      setParsed(sheet)
      setMapping(autoMapHeaders(sheet.headers))
      setFileName(file.name)
    } catch {
      setParseError('Could not read that file. Use a .csv or .xlsx export.')
    }
  }

  function setColumn(index: number, field: RosterFieldKey) {
    setMapping((current) => ({ ...current, [index]: field }))
  }

  async function runImport() {
    if (!draftResult || draftResult.drafts.length === 0) return
    setImporting(true)
    const payload = await importDrafts(draftResult.drafts)
    setImporting(false)
    if (payload) {
      setLastImport(payload.results as MergeResult[])
      setParsed(null)
      setMapping({})
      setFileName('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function cancelImport() {
    setParsed(null)
    setMapping({})
    setFileName('')
    setParseError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function downloadTemplate() {
    const blob = new Blob([templateCsv()], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'roster-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="text-court-600" />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Teams &amp; players</p>
            <h2 className="text-2xl font-black text-slate-950">Batch import from Google Forms / Sheets</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadTemplate} className="inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700">
            <Download size={14} />
            Template CSV
          </button>
          <button
            onClick={() => resetRoster()}
            className="inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700"
          >
            <RotateCcw size={14} />
            Clear roster
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-3">
        <div className="border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Teams</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{summary.teams}</p>
        </div>
        <div className="border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Players</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{summary.players}</p>
        </div>
        <div className="border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Divisions</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{summary.divisions}</p>
        </div>
      </div>

      {error && <p className="mx-6 mb-4 border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}

      {!parsed ? (
        <div className="px-6 pb-6">
          <label className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center hover:border-slate-950">
            <Upload className="text-slate-400" />
            <p className="mt-3 font-black text-slate-950">Upload roster file</p>
            <p className="mt-1 text-sm text-slate-500">
              In Google Sheets choose File → Download → CSV or Excel (.xlsx), then upload here.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </label>
          {parseError && <p className="mt-3 border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{parseError}</p>}

          {lastImport && (
            <div className="mt-4 border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 size={18} />
                <p className="font-black">Import complete</p>
              </div>
              <p className="mt-1 text-sm font-semibold text-emerald-800">
                {lastImport.filter((entry) => entry.status === 'added').length} added ·{' '}
                {lastImport.filter((entry) => entry.status === 'updated').length} updated
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="px-6 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <StatusPill>{fileName}</StatusPill>
              <StatusPill tone="success">{addedCount} new</StatusPill>
              <StatusPill tone="warning">{updatedCount} update</StatusPill>
              {draftResult && draftResult.errors.length > 0 && (
                <StatusPill tone="danger">{draftResult.errors.length} skipped</StatusPill>
              )}
            </div>
            <button onClick={cancelImport} className="text-sm font-bold text-slate-500 hover:text-slate-950">
              Cancel
            </button>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="border border-slate-200">
              <p className="border-b border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-950">1. Map columns</p>
              <div className="max-h-72 overflow-auto p-3">
                {parsed.headers.map((header, index) => (
                  <div key={index} className="mb-2 grid grid-cols-[1fr_1fr] items-center gap-2">
                    <span className="truncate text-sm font-semibold text-slate-600" title={header}>
                      {header || `Column ${index + 1}`}
                    </span>
                    <select
                      value={mapping[index] ?? 'ignore'}
                      onChange={(event) => setColumn(index, event.target.value as RosterFieldKey)}
                      className="border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-950"
                    >
                      {rosterFields.map((field) => (
                        <option key={field.key} value={field.key}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200">
              <p className="border-b border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-950">2. Preview</p>
              <div className="max-h-72 overflow-auto">
                {draftResult && draftResult.drafts.length > 0 ? (
                  draftResult.drafts.map((draft, index) => (
                    <div key={`${draft.rowNumber}-${index}`} className="flex items-center justify-between gap-2 border-b border-slate-100 p-3 last:border-b-0">
                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-950">{draft.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {draft.division} · {draft.players.map((player) => `${player.firstName} ${player.lastName}`.trim()).join(', ')}
                        </p>
                      </div>
                      <StatusPill tone={preview[index]?.status === 'updated' ? 'warning' : 'success'}>
                        {preview[index]?.status === 'updated' ? 'Update' : 'New'}
                      </StatusPill>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm text-slate-500">No valid rows yet. Map at least Division and Player 1 first name.</p>
                )}
              </div>
            </div>
          </div>

          {draftResult && draftResult.errors.length > 0 && (
            <div className="mt-3 border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-black">Skipped rows</p>
              <ul className="mt-1 list-inside list-disc">
                {draftResult.errors.slice(0, 5).map((rowError) => (
                  <li key={rowError.rowNumber}>Row {rowError.rowNumber}: {rowError.message}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={runImport}
            disabled={importing || !draftResult || draftResult.drafts.length === 0}
            className="mt-4 inline-flex items-center gap-2 bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {importing ? 'Importing…' : `Import ${addedCount + updatedCount} teams`}
          </button>
        </div>
      )}

      <div className="border-t border-slate-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-950">Roster</h3>
          <StatusPill>{summary.teams} teams</StatusPill>
        </div>
        <RosterTable
          roster={roster}
          onUpdateTeam={updateTeam}
          onUpdatePlayer={updatePlayer}
          onDeleteTeam={deleteTeam}
        />
      </div>
    </section>
  )
}
