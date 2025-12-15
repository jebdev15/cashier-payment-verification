import React from "react";

type TransactionRow = {
  date: string;
  confirmationNumber: string;
  payor: string;
  particulars: string;
  total: number;
  taxes: number;
  fees: number;
  other: number;
};

interface Props {
  from: string;
  to: string;
  rows: TransactionRow[];
}

const ROWS_PER_PAGE = 22; // adjust if template needs more/less body lines

const buildPages = (rows: TransactionRow[]) => {
  const pages: TransactionRow[][] = [];
  for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) {
    pages.push(rows.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);
  // pad each page
  return pages.map(page => {
    const padded = [...page];
    while (padded.length < ROWS_PER_PAGE) {
      padded.push({
        date: "",
        confirmationNumber: "",
        payor: "",
        particulars: "",
        total: 0,
        taxes: 0,
        fees: 0,
        other: 0
      });
    }
    return padded;
  });
};

const DailyCollectionReport: React.FC<Props> = ({ from, to, rows }) => {
  const pages = React.useMemo(() => buildPages(rows), [rows]);
  const subTotal = rows.reduce((acc, r) => acc + (r.total || 0), 0);

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: 13in 8.5in; /* Long (8.5 x 13) Landscape */
            margin: 0.5in;
          }
          .no-print { display: none !important; }
          .report-page { page-break-after: always; }
          .report-page:last-of-type { page-break-after: auto; }
        }
        * { margin:0; padding:0; box-sizing:border-box; font-size:14px; }
        body { font-family: "Times New Roman", serif; }
        table { width:100%; border-collapse:collapse; }
        tbody th, tbody td, thead th, thead td, tfoot th, tfoot td { border:2px solid #000; }
        th.no-border, td.no-border, .no-border { border:none !important; }
        .text-center { text-align:center; }
        .text-right { text-align:right; }
        .text-bold { font-weight:bold; }
        .padded { padding:2px 0; }
        .heading { font-size:16px; }
        .spacer { height:2em; }
        .info-row > th > div { display:block; padding:0.5em 0; }
        .info-row > th > div p { display:flex; flex-shrink:0; }
        .info-row > th > div p span { flex-grow:1; border-bottom:1px solid #000; margin-left:.25em; margin-right:15%; }
        .info-row > th:first-of-type div p span { margin-right:30%; }
        .signatories-row td { text-align:center; }
        .signatories-row td:not(:first-child):not(:last-child){ border-left:none; border-right:none; }
        .signatories-row td:first-child{ border-right:none; }
        .signatories-row td:last-child{ border-left:none; }
        .signatory-area { padding-top:1em; display:flex; flex-direction:column; gap:2em; }
        .signatory-area > div:last-child { display:flex; flex-direction:column; }
        .signatory-area > div:last-child span { height:1em; border-bottom:1px solid #000; display:block; padding-top:4px; }
        .header-height { height:4.5em; }
        .card-wrapper { background:#fff; border-radius:12px; padding:16px; box-shadow:0 2px 6px rgba(0,0,0,.12); overflow:auto; }
      `}</style>
      <div className="card-wrapper">
        {pages.map((pageRows, pageIndex) => (
          <div className="report-page" key={pageIndex}>
            <table>
              <thead>
                <tr className="no-border">
                  <th colSpan={8} className="text-right heading"><em>Annex G</em></th>
                </tr>
                <tr className="no-border">
                  <th colSpan={8} className="heading padded">
                    REPORT OF DAILY COLLECTION DIRECTLY DEPOSITED TO THE AGENCY'S BANK ACCOUNT
                  </th>
                </tr>
                <tr className="no-border">
                  <th colSpan={8} className="padded">Date: {from}</th>
                </tr>
                <tr className="no-border info-row">
                  <th colSpan={3} className="padded">
                    <div>
                      <p>Entity Name : <span>Carlos Hilado Memorial State University</span></p>
                      <p>Fund Cluster : <span>01</span></p>
                      <p>Bank / Account number : <span>123-456-789</span></p>
                    </div>
                  </th>
                  <th colSpan={2}></th>
                  <th colSpan={3} className="padded">
                    <div>
                      <p>Report No. : <span>001</span></p>
                      <p>Sheet No : <span>{pageIndex + 1}</span></p>
                      <p>Date : <span>{new Date().toLocaleDateString()}</span></p>
                    </div>
                  </th>
                </tr>
                <tr>
                  <th colSpan={2} rowSpan={2}>Deposit</th>
                  <th rowSpan={3}>Payor</th>
                  <th rowSpan={3}>Particulars</th>
                  <th colSpan={4}>Amount</th>
                </tr>
                <tr>
                  <th rowSpan={2}>Total</th>
                  <th colSpan={3}>Breakdown of Collections</th>
                </tr>
                <tr>
                  <th className="header-height">Date</th>
                  <th>eOR / transaction confirmation number</th>
                  <th>Taxes<br /><br />(account code)</th>
                  <th>Fees<br /><br />(account code)</th>
                  <th><br /><br />(account code)</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.date}</td>
                    <td>{r.confirmationNumber}</td>
                    <td>{r.payor}</td>
                    <td>{r.particulars}</td>
                    <td className="text-right">{r.total ? r.total.toFixed(2) : ""}</td>
                    <td className="text-right">{r.taxes ? r.taxes.toFixed(2) : ""}</td>
                    <td className="text-right">{r.fees ? r.fees.toFixed(2) : ""}</td>
                    <td className="text-right">{r.other ? r.other.toFixed(2) : ""}</td>
                  </tr>
                ))}
              </tbody>
              {pageIndex === pages.length - 1 && (
                <tfoot>
                  <tr>
                    <td colSpan={3}></td>
                    <td className="text-bold">Sub-total per front-end system</td>
                    <td className="text-right text-bold">{subTotal.toFixed(2)}</td>
                    <td></td><td></td><td></td>
                  </tr>
                  <tr>
                    <td colSpan={3}></td>
                    <td className="text-bold">Total</td>
                    <td className="text-right text-bold">{subTotal.toFixed(2)}</td>
                    <td></td><td></td><td></td>
                  </tr>
                  <tr><td colSpan={8} className="spacer"></td></tr>
                  <tr className="signatories-row">
                    <td colSpan={3}></td>
                    <td>
                      <div className="signatory-area">
                        <div><p className="text-bold text-left">CERTIFIED CORRECT:</p></div>
                        <div>
                          <div><span className="padded"></span><p className="padded">Name and Signature</p></div>
                          <div><span className="padded"></span><p className="padded">Official Designation</p></div>
                        </div>
                      </div>
                    </td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ))}
      </div>
    </>
  );
};

export default React.memo(DailyCollectionReport);
