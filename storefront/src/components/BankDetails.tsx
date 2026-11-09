'use client'

import { useState } from 'react'
import type { BankDetails as Bank } from '@/lib/types'

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s+/g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* the value is still visible to copy by hand */
    }
  }
  return (
    <div className="bank__row">
      <dt>{label}</dt>
      <dd>
        <span className="bank__val">{value}</span>
        <button type="button" className="bank__copy" onClick={copy} aria-label={`Copy ${label.toLowerCase()}`}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        <span className="visually-hidden" role="status">{copied ? `${label} copied` : ''}</span>
      </dd>
    </div>
  )
}

/** The account customers transfer the advance to. Renders nothing until the owner fills it in. */
export function BankDetails({ bank }: { bank?: Bank }) {
  if (!bank?.accountNumber && !bank?.iban) return null
  return (
    <dl className="bank">
      {bank.bankName ? (
        <div className="bank__row">
          <dt>Bank</dt>
          <dd><span className="bank__val">{bank.bankName}{bank.branch ? `, ${bank.branch}` : ''}</span></dd>
        </div>
      ) : null}
      {bank.accountTitle ? (
        <div className="bank__row">
          <dt>Account title</dt>
          <dd><span className="bank__val">{bank.accountTitle}</span></dd>
        </div>
      ) : null}
      {bank.accountNumber ? <CopyRow label="Account number" value={bank.accountNumber} /> : null}
      {bank.iban ? <CopyRow label="IBAN" value={bank.iban} /> : null}
    </dl>
  )
}
