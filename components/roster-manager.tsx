'use client'

import { useMemo, useRef, useState } from 'react'
import { CheckCircle2, Download, FileSpreadsheet, RotateCcw, Upload } from 'lucide-react'
import { RosterTable } from '@/components/roster-table'
import { StatusPill } from '@/components/status-pill'
import { Button, Card, SectionHeader } from '@/components/ui'
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
  const draftResult = useMemo(() => (parsed ? buildDraftTeams(parsed.rows, mapping) : null), [parsed, mapping])
  const preview = useMemo<MergeResult[]>(() => (draftResult ? previewMerge(roster, draftResult.drafts) : []), [draftResult, roster])
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

  async function runImport() {
    if (!draftResult || draftResult.drafts.length === 0) return
    setImporting(true)
    const payload = await importDrafts(draftResult.drafts)
    setImporting(false)
    if (payload) {
      setLastImport(payload.results as MergeResult[])
      cancelImport()
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

  const stats = [
    { label: 'Teams', value: summary.teams },
    { label: 'Players', value: summary.players },
    { label: 'Divisions', value: summary.divisions }
  ]

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line p-6">
        <SectionHeader
          eyebrow="Teams & players"
          title="Import from Google Forms / Sheets"
          description="Download your Google Sheet as CSV or Excel and upload it. Matching teams are updated, new teams are added."
          icon={FileSpreadsheet}
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={downloadTemplate}>
                <Download size={14} />
                Template
              </Button>
              <Button variant="secondary" size="sm" onClick={() => resetRoster()}>
                <RotateCcw size={14} />
                Clear
              </Button>
            </div>
          }
        />
        <div className="mt-5 grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-line bg-slate-50/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{stat.label}</p>
              <p className="tabular mt-1 text-2xl font-bold text-ink">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {error ? <p className="border-b border-rose-100 bg-rose-50 px-6 py-2.5 text-sm font-semibold text-rose-700">{error}</p> : null}

      {!parsed ? (
        <div className="p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-slate-50/60 p-10 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-line">
              <Upload size={20} />
            </span>
            <p className="mt-3 text-sm font-bold text-ink">Upload roster file</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              In Google Sheets: File → Download → Comma-separated values (.csv) or Microsoft Excel (.xlsx).
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </label>
          {parseError ? <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{parseError}</p> : null}
          {lastImport ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
              <CheckCircle2 size={18} />
              <p className="text-sm font-semibold">
                Imported — {lastImport.filter((entry) => entry.status === 'added').length} added,{' '}
                {lastImport.filter((entry) => entry.status === 'updated').length} updated.
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="brand">{fileName}</StatusPill>
              <StatusPill tone="success">{addedCount} new</StatusPill>
              <StatusPill tone="warning">{updatedCount} update</StatusPill>
              {draftResult && draftResult.errors.length > 0 ? <StatusPill tone="danger">{draftResult.errors.length} skipped</StatusPill> : null}
            </div>
            <button onClick={cancelImport} className="text-sm font-semibold text-slate-500 hover:text-ink">
              Cancel
            </button>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-line">
              <p className="border-b border-line bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">1 · Map columns</p>
              <div className="max-h-72 space-y-2 overflow-auto p-3">
                {parsed.headers.map((header, index) => (
                  <div key={index} className="grid grid-cols-2 items-center gap-2">
                    <span className="truncate text-sm font-medium text-slate-600" title={header}>
                      {header || `Column ${index + 1}`}
                    </span>
                    <select
                      value={mapping[index] ?? 'ignore'}
                      onChange={(event) => setMapping((current) => ({ ...current, [index]: event.target.value as RosterFieldKey }))}
                      className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none"
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

            <div className="overflow-hidden rounded-lg border border-line">
              <p className="border-b border-line bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">2 · Preview</p>
              <div className="max-h-72 overflow-auto">
                {draftResult && draftResult.drafts.length > 0 ? (
                  draftResult.drafts.map((draft, index) => (
                    <div key={`${draft.rowNumber}-${index}`} className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5 last:border-b-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink">{draft.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {draft.division} · {draft.players.map((p) => `${p.firstName} ${p.lastName}`.trim()).join(', ')}
                        </p>
                      </div>
                      <StatusPill tone={preview[index]?.status === 'updated' ? 'warning' : 'success'}>
                        {preview[index]?.status === 'updated' ? 'Update' : 'New'}
                      </StatusPill>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm text-slate-500">Map at least Division and Player 1 first name to see a preview.</p>
                )}
              </div>
            </div>
          </div>

          {draftResult && draftResult.errors.length > 0 ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-bold">Skipped rows</p>
              <ul className="mt-1 list-inside list-disc">
                {draftResult.errors.slice(0, 5).map((rowError) => (
                  <li key={rowError.rowNumber}>Row {rowError.rowNumber}: {rowError.message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <Button
            className="mt-4"
            onClick={runImport}
            disabled={importing || !draftResult || draftResult.drafts.length === 0}
          >
            {importing ? 'Importing…' : `Import ${addedCount + updatedCount} teams`}
          </Button>
        </div>
      )}

      <div className="border-t border-line p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink">Roster</h3>
          <StatusPill>{summary.teams} teams</StatusPill>
        </div>
        <RosterTable roster={roster} onUpdateTeam={updateTeam} onUpdatePlayer={updatePlayer} onDeleteTeam={deleteTeam} />
      </div>
    </Card>
  )
}
