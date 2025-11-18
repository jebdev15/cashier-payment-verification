import React from "react";

const DailyCollectionReport = () => {
  React.useEffect(() => {
    // Auto-print after render
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-size: 14px;
        }

        body {
          font-family: "Times New Roman", serif;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5in;
          }
          body {
            margin: 0;
          }
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        tbody th,
        tbody td,
        thead th,
        thead td,
        tfoot th,
        tfoot td {
          border: 2px solid #000;
        }

        th.no-border,
        td.no-border {
          border: none;
        }

        tr.no-border > th,
        tr.no-border > td {
          border: none !important;
        }

        .text-center {
          text-align: center;
        }

        .text-left {
          text-align: left;
        }

        .text-right {
          text-align: right;
        }

        .text-bold {
          font-weight: bold;
        }

        .padded {
          padding: 2px 0;
        }

        .heading {
          font-size: 16px;
        }

        .hidden {
          visibility: collapse;
        }

        .spacer {
          height: 2em;
        }

        .info-row > th > div {
          display: block;
          padding: 0.5em 0;
        }

        .info-row > th > div p {
          display: flex;
          flex-shrink: 0;
        }

        .info-row > th > div p span {
          flex-grow: 1;
          border-bottom: 1px solid #000;
          margin-left: 0.25em;
          margin-right: 15%;
        }

        .info-row > th:first-of-type div p span {
          margin-right: 30%;
        }

        .signatories-row td {
          text-align: center;
        }

        .signatories-row td:not(:first-child):not(:last-child) {
          border-left: none;
          border-right: none;
        }

        .signatories-row td:first-child {
          border-right: none;
        }

        .signatories-row td:last-child {
          border-left: none;
        }

        .signatory-area {
          padding-top: 1em;
          display: flex;
          flex-direction: column;
          gap: 2em;
        }

        .signatory-area > div:last-child {
          display: flex;
          flex-direction: column;
        }

        .signatory-area > div:last-child span {
          height: 1em;
          border-bottom: 1px solid #000;
          display: block;
          padding-top: 4px;
        }

        .header-height {
          height: 4.5em;
        }
      `}</style>

      <table>
        <thead>
          <tr className="hidden no-border">
            <td width="8%"></td>
            <td width="12%"></td>
            <td width="24%"></td>
            <td width="24%"></td>
            <td width="8%"></td>
            <td width="8%"></td>
            <td width="8%"></td>
            <td width="8%"></td>
          </tr>
          <tr className="no-border">
            <th colSpan={8} className="text-right heading">
              <em>Annex G</em>
            </th>
          </tr>
          <tr className="no-border">
            <th colSpan={8} className="heading padded">
              REPORT OF DAILY COLLECTION DIRECTION DIRECTLY DEPOSITED TO THE AGENCY'S BANK ACCOUNT
            </th>
          </tr>
          <tr className="no-border">
            <th colSpan={8} className="padded">
              Date: <span></span>
            </th>
          </tr>
          <tr className="no-border info-row">
            <th colSpan={3} className="text-left padded">
              <div>
                <p>Entity Name : <span></span></p>
                <p>Fund Cluster : <span></span></p>
                <p>Bank / Account number : <span></span></p>
              </div>
            </th>
            <th colSpan={2}></th>
            <th colSpan={3} className="text-right padded">
              <div>
                <p>Report No. : <span></span></p>
                <p>Sheet No : <span></span></p>
                <p>Date : <span></span></p>
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
          <tr>
            <td>&nbsp;</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td>Sub-total per front-end system</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td>Total</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td colSpan={8} className="spacer"></td>
          </tr>
          <tr className="signatories-row">
            <td colSpan={3}></td>
            <td>
              <div className="signatory-area">
                <div>
                  <p className="text-bold text-left">CERTIFIED CORRECT:</p>
                </div>
                <div>
                  <div>
                    <span className="padded"></span>
                    <p className="padded">Name and Signature</p>
                  </div>
                  <div>
                    <span className="padded"></span>
                    <p className="padded">Official Designation</p>
                  </div>
                </div>
              </div>
            </td>
            <td colSpan={4}></td>
          </tr>
        </tfoot>
      </table>
    </>
  );
};

export default DailyCollectionReport;
