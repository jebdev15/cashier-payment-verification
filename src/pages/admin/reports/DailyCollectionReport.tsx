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

const ROWS_PER_PAGE = 18; // Adjusted for better fitting with fixed height

const buildPages = (rows: TransactionRow[]) => {
  const pages: TransactionRow[][] = [];
  for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) {
    const pageData = rows.slice(i, i + ROWS_PER_PAGE);
    pages.push(pageData);
  }
  if (pages.length === 0) {
    pages.push([]);
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
  const fundClusters = propFundClusters || '';
  // const totalSheets = propTotalSheets || pages.length;
  console.log({ to, propTotalSheets})
  return (
    <>
      <style>{`
        @media print {
          @page {
            size: 13in 8.5in; /* Long (8.5 x 13) Landscape */
            margin: 0.25in;
            padding: 0;
          }
          .no-print { display: none !important; }
          .report-page { page-break-after: always; height: 8in; }
          .report-page:last-of-type { page-break-after: auto; }
        }
        * { margin:0; padding:0; box-sizing:border-box; font-size:10px; }
        body { font-family: "Arial", sans-serif; }
        table { width:100%; border-collapse:collapse; margin:0; table-layout:fixed; }
        tbody th, tbody td, thead th, thead td, tfoot th, tfoot td { border:1px solid #000; padding:2px 3px; word-wrap:break-word; }
        th.no-border, td.no-border, .no-border { border:none !important; }
        .text-center { text-align:center; }
        .text-right { text-align:right; }
        .text-left { text-align:left; }
        .text-bold { font-weight:bold; }
        .heading { font-size:11px; font-weight:bold; margin:0; line-height:1.2; padding:1px 0; }
        .sub-heading { font-size:10px; margin:0; line-height:1.2; padding:1px 0; }
        .header-row { background:#f5f5f5; }
        .vertical-text { writing-mode: vertical-rl; text-orientation: mixed; padding:6px 3px !important; }
        .row-height { height:22px; }
        .footer-row { border-top:2px solid #000; }
        .signature-box { min-height:50px; padding-top:10px; border-top:1px solid #000; margin-top:2px; }
        .card-wrapper { background:#fff; border-radius:0; padding:0; box-shadow:none; overflow:hidden; max-width:100%; }
        .card-wrapper::-webkit-scrollbar { display: none; }
        .entity-info { font-size:9px; line-height:1.2; margin:0; padding:1px 0; }
        .info-table { border:none; margin:2px 0; }
        .info-table td { border:none; padding:1px 4px; vertical-align:top; }
        .report-page { margin:0; padding:12px; min-height:700px; max-height:700px; display:flex; flex-direction:column; }
        .page-header { flex-shrink:0; height:120px; overflow:hidden; }
        .page-body { flex-shrink:0; min-height: 450px; max-height: 450px; overflow:hidden; display:flex; flex-direction:column; }
        .page-footer { flex-shrink:0; height:100px; margin-top:0; overflow:visible; }
        .table-container { height:100%; overflow:visible; display:flex; flex-direction:column; }
        .table-container table { height:100%; display:flex; flex-direction:column; }
        .table-container thead { flex-shrink:0; display:table; width:100%; table-layout:fixed; }
        .table-container tbody { flex:1; display:block; overflow:hidden; }
        .table-container tbody tr { display:table; width:100%; table-layout:fixed; }
        .table-container tfoot { flex-shrink:0; display:table; width:100%; table-layout:fixed; }
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
              {/* Fixed Header Section */}
              <div className="page-header">
                <div className="text-right sub-heading text-bold" style={{marginBottom:'0'}}><em>Annex G</em></div>
                <div className="text-center heading" style={{marginBottom:'1px'}}>
                  REPORT OF DAILY COLLECTION DIRECTLY DEPOSITED TO THE AGENCY'S BANK ACCOUNT
                </div>
                <div className="sub-heading text-center text-bold" style={{marginBottom:'1px'}}>Date: {from}</div>
                
                {/* Entity Information */}
                <table className="info-table">
                  <tbody>
                    <tr>
                      <td style={{width:'50%'}} className="entity-info">
                        <div><strong>Entity Name:</strong> Carlos Hilado Memorial State University</div>
                        <div><strong>Fund Cluster:</strong> {fundClusters}</div>
                        <div><strong>Bank / Account number:</strong> 123-456-789</div>
                      </td>
                      <td style={{width:'10%'}} className="entity-info">
                        <div><strong>Report No.:</strong> {reportNo}</div>
                        {/* <div><strong>Sheet No.:</strong> {startSheetNo + pageIndex} of {startSheetNo + totalSheets - 1}</div> */}
                        <div><strong>Sheet No.:</strong> {startSheetNo + pageIndex}</div>
                        <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Body Section with Table */}
              <div className="page-body">
                <div className="table-container">
                  <table>
                <thead>
                  <tr className="header-row">
                    <th colSpan={2} style={{ width: '18%' }}>Deposit</th>
                    <th colSpan={6} style={{ width: '82%' }}></th>
                  </tr>
                  <tr className="header-row">
                    <th rowSpan={3} style={{width:'6%'}}>Date</th>
                    <th rowSpan={3} style={{width:'12%'}}>eOR / transaction<br/>confirmation number</th>
                    <th rowSpan={3} style={{width:'18%'}}>Payor</th>
                    <th rowSpan={3} style={{width:'32%'}}>Particulars</th>
                    <th colSpan={4} style={{width:'32%'}} className="text-center">Amount</th>
                  </tr>
                  <tr className="header-row">
                    <th rowSpan={2} style={{width:'8%'}}>Total</th>
                    <th colSpan={3} className="text-center">Breakdown of Collections</th>
                  </tr>
                  <tr className="header-row">
                    <th style={{width:'8%'}}>Taxes<br/>(account code)</th>
                    <th style={{width:'8%'}}>Fees<br/>(account code)</th>
                    <th style={{width:'8%'}}>(account code)</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r, i) => (
                    <tr key={i} className="row-height">
                      <td className="text-center" style={{width:'6%'}}>{r.date}</td>
                      <td className="text-center" style={{width:'12%'}}>{r.confirmationNumber}</td>
                      <td style={{width:'18%'}}>{r.payor}</td>
                      <td style={{width:'32%'}}>{r.particulars}</td>
                      <td className="text-right" style={{width:'8%'}}>{r.total ? r.total.toFixed(2) : ""}</td>
                      <td className="text-right" style={{width:'8%'}}>{r.taxes ? r.taxes.toFixed(2) : ""}</td>
                      <td className="text-right" style={{width:'8%'}}>{r.fees ? r.fees.toFixed(2) : ""}</td>
                      <td className="text-right" style={{width:'8%'}}>{r.other ? r.other.toFixed(2) : ""}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {/* Page Subtotal */}
                  <tr className="footer-row text-bold">
                    <td colSpan={4} className="text-right" style={{width:'68%'}}>Sub-total (This Page):</td>
                    <td className="text-right" style={{width:'10%'}}>{pageTotal.toFixed(2)}</td>
                    <td className="text-right" style={{width:'10%'}}>{pageTaxes ? pageTaxes.toFixed(2) : ""}</td>
                    <td className="text-right" style={{width:'10%'}}>{pageFees ? pageFees.toFixed(2) : ""}</td>
                    <td className="text-right" style={{width:'10%'}}>{pageOther ? pageOther.toFixed(2) : ""}</td>
                  </tr>
                  {/* Grand Total on last page */}
                  {pageIndex === pages.length - 1 && (
                    <tr className="footer-row text-bold" style={{backgroundColor:'#f0f0f0'}}>
                      <td colSpan={4} className="text-right" style={{width:'68%'}}>TOTAL:</td>
                      <td className="text-right" style={{width:'10%'}}>{grandTotal.toFixed(2)}</td>
                      <td className="text-right" style={{width:'10%'}}>{totalTaxes ? totalTaxes.toFixed(2) : ""}</td>
                      <td className="text-right" style={{width:'10%'}}>{totalFees ? totalFees.toFixed(2) : ""}</td>
                      <td className="text-right" style={{width:'10%'}}>{totalOther ? totalOther.toFixed(2) : ""}</td>
                    </tr>
                  )}
                </tfoot>
                  </table>
                </div>
              </div>

              {/* Fixed Footer Section */}
              <div className="page-footer">
                {/* Signature Section - Only on last page */}
                {pageIndex === pages.length - 1 && (
                <div style={{marginTop:'8px'}}>
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
            </div>
          );
        })}
      </div>
    </>
  );
};

export default React.memo(DailyCollectionReport);
