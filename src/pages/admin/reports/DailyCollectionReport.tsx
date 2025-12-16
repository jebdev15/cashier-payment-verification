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
  reportNo?: string;
  fundClusters?: string;
  startSheetNo?: number;
  totalSheets?: number;
}

const ROWS_PER_PAGE = 22; // Fixed rows per page to match official format

const buildPages = (rows: TransactionRow[]) => {
  const pages: TransactionRow[][] = [];
  for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) {
    const pageData = rows.slice(i, i + ROWS_PER_PAGE);
    // Pad with empty rows to reach fixed row count
    while (pageData.length < ROWS_PER_PAGE) {
      pageData.push({
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
    pages.push(pageData);
  }
  if (pages.length === 0) {
    // Create one page with all empty rows if no data
    const emptyPage: TransactionRow[] = [];
    for (let i = 0; i < ROWS_PER_PAGE; i++) {
      emptyPage.push({
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
    pages.push(emptyPage);
  }
  return pages;
};

const DailyCollectionReport: React.FC<Props> = ({ 
  from, 
  to, 
  rows, 
  reportNo: propReportNo, 
  fundClusters: propFundClusters,
  startSheetNo = 1,
  totalSheets: propTotalSheets
}) => {
  const pages = React.useMemo(() => buildPages(rows), [rows]);
  const grandTotal = rows.reduce((acc, r) => acc + (r.total || 0), 0);
  const totalTaxes = rows.reduce((acc, r) => acc + (r.taxes || 0), 0);
  const totalFees = rows.reduce((acc, r) => acc + (r.fees || 0), 0);
  const totalOther = rows.reduce((acc, r) => acc + (r.other || 0), 0);

  // Use provided report metadata or generate fallback
  const reportNo = propReportNo || `${new Date(from).getFullYear()}-${String(new Date(from).getMonth() + 1).padStart(2, '0')}-001`;
  const fundClusters = propFundClusters || '01';
  const totalSheets = propTotalSheets || pages.length;

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: 13in 8.5in; /* Long (8.5 x 13) Landscape */
            margin: 0;
            padding: 0;
          }
          .no-print { display: none !important; }
          .report-page { page-break-after: always; }
          .report-page:last-of-type { page-break-after: auto; }
        }
        * { margin:0; padding:0; box-sizing:border-box; font-size:11px; }
        body { font-family: "Arial", sans-serif; }
        table { width:100%; border-collapse:collapse; margin:0; }
        tbody th, tbody td, thead th, thead td, tfoot th, tfoot td { border:1px solid #000; padding:3px 4px; }
        th.no-border, td.no-border, .no-border { border:none !important; }
        .text-center { text-align:center; }
        .text-right { text-align:right; }
        .text-left { text-align:left; }
        .text-bold { font-weight:bold; }
        .heading { font-size:12px; font-weight:bold; margin:0; }
        .sub-heading { font-size:11px; margin:0; }
        .header-row { background:#f5f5f5; }
        .vertical-text { writing-mode: vertical-rl; text-orientation: mixed; padding:8px 4px !important; }
        .row-height { height:24px; }
        .footer-row { border-top:2px solid #000; }
        .signature-box { min-height:60px; padding-top:40px; border-top:1px solid #000; margin-top:2px; }
        .card-wrapper { background:#fff; border-radius:8px; padding:12px; box-shadow:0 2px 8px rgba(0,0,0,.1); overflow:auto; }
        .entity-info { font-size:10px; line-height:1.4; margin:0; }
        .info-table { border:none; margin:4px 0; }
        .info-table td { border:none; padding:1px 4px; }
        .d-flex { display:flex; }
        .justify-between { justify-content:space-between; }
      `}</style>
      <div className="card-wrapper">
        {pages.map((pageRows, pageIndex) => {
          // Only sum rows that have actual data (non-empty)
          const pageTotal = pageRows.reduce((acc, r) => acc + (r.date ? (r.total || 0) : 0), 0);
          const pageTaxes = pageRows.reduce((acc, r) => acc + (r.date ? (r.taxes || 0) : 0), 0);
          const pageFees = pageRows.reduce((acc, r) => acc + (r.date ? (r.fees || 0) : 0), 0);
          const pageOther = pageRows.reduce((acc, r) => acc + (r.date ? (r.other || 0) : 0), 0);
          
          return (
            <div className="report-page" key={pageIndex}>
              {/* Header Section */}
              <div className="text-right sub-heading text-bold" style={{marginBottom:'2px'}}><em>Annex G</em></div>
              <div className="text-center heading" style={{marginBottom:'4px'}}>
                REPORT OF DAILY COLLECTION DIRECTLY DEPOSITED TO THE AGENCY'S BANK ACCOUNT
              </div>
              <div className="sub-heading text-center text-bold" style={{marginBottom:'4px'}}>Date: {from}</div>
              
              {/* Entity Information */}
              <table className="info-table">
                <tbody>
                  <tr>
                    <td style={{width:'50%'}} className="entity-info">
                      <div><strong>Entity Name:</strong> Carlos Hilado Memorial State University</div>
                      <div><strong>Fund Cluster:</strong> {fundClusters}</div>
                      <div><strong>Bank / Account number:</strong> 123-456-789</div>
                    </td>
                    <td style={{width:'50%'}} className="entity-info text-right">
                      <div><strong>Report No.:</strong> {reportNo}</div>
                      <div><strong>Sheet No.:</strong> {startSheetNo + pageIndex} of {startSheetNo + totalSheets - 1}</div>
                      <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Main Table */}
              <table>
                <thead>
                  <tr className="header-row">
                    <th rowSpan={3} style={{width:'6%'}}>Date</th>
                    <th rowSpan={3} style={{width:'12%'}}>eOR / transaction<br/>confirmation number</th>
                    <th rowSpan={3} style={{width:'18%'}}>Payor</th>
                    <th rowSpan={3} style={{width:'24%'}}>Particulars</th>
                    <th colSpan={4} className="text-center">Amount</th>
                  </tr>
                  <tr className="header-row">
                    <th rowSpan={2} style={{width:'10%'}}>Total</th>
                    <th colSpan={3} className="text-center">Breakdown of Collections</th>
                  </tr>
                  <tr className="header-row">
                    <th style={{width:'10%'}}>Taxes<br/>(account code)</th>
                    <th style={{width:'10%'}}>Fees<br/>(account code)</th>
                    <th style={{width:'10%'}}>(account code)</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r, i) => (
                    <tr key={i} className="row-height">
                      <td className="text-center">{r.date}</td>
                      <td className="text-center">{r.confirmationNumber}</td>
                      <td>{r.payor}</td>
                      <td>{r.particulars}</td>
                      <td className="text-right">{r.total ? r.total.toFixed(2) : ""}</td>
                      <td className="text-right">{r.taxes ? r.taxes.toFixed(2) : ""}</td>
                      <td className="text-right">{r.fees ? r.fees.toFixed(2) : ""}</td>
                      <td className="text-right">{r.other ? r.other.toFixed(2) : ""}</td>
                    </tr>
                  ))}
                  {/* Page Subtotal */}
                  <tr className="footer-row text-bold">
                    <td colSpan={4} className="text-right">Sub-total (This Page):</td>
                    <td className="text-right">{pageTotal.toFixed(2)}</td>
                    <td className="text-right">{pageTaxes ? pageTaxes.toFixed(2) : ""}</td>
                    <td className="text-right">{pageFees ? pageFees.toFixed(2) : ""}</td>
                    <td className="text-right">{pageOther ? pageOther.toFixed(2) : ""}</td>
                  </tr>
                  {/* Grand Total on last page */}
                  {pageIndex === pages.length - 1 && (
                    <tr className="footer-row text-bold" style={{backgroundColor:'#f0f0f0'}}>
                      <td colSpan={4} className="text-right">TOTAL:</td>
                      <td className="text-right">{grandTotal.toFixed(2)}</td>
                      <td className="text-right">{totalTaxes ? totalTaxes.toFixed(2) : ""}</td>
                      <td className="text-right">{totalFees ? totalFees.toFixed(2) : ""}</td>
                      <td className="text-right">{totalOther ? totalOther.toFixed(2) : ""}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                      <tr>
                        
                      </tr>
                    </tfoot>
              </table>

              {/* Signature Section - Only on last page */}
              {pageIndex === pages.length - 1 && (
                <div style={{marginTop:'20px'}}>
                  <table style={{border:'none'}}>
                    <tfoot>
                      <tr>
                        <td colSpan={3} style={{minWidth:"200px", border:'none'}}></td>
                        <td colSpan={1} style={{border:'none'}}>
                          <div className="text-bold" style={{marginBottom:'4px'}}>CERTIFIED CORRECT:</div>
                          <div className="signature-box text-center" style={{ border:'none' }}>
                            <div className="text-bold" style={{borderBottom:'1px solid #000', marginBottom:'4px', paddingBottom:'2px'}}></div>
                            <div>Name and Signature</div>
                            <div style={{marginTop:'8px', borderBottom:'1px solid #000', marginBottom:'4px', paddingBottom:'2px'}}></div>
                            <div>Official Designation</div>
                          </div>
                        </td>
                        <td colSpan={4} style={{minWidth:"220px", border:'none'}}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default React.memo(DailyCollectionReport);
