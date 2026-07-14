/**
 * Shared responsive HTML shell for all transactional emails.
 * Table-based layout for maximum email-client compatibility.
 */
export function emailLayout({ appName, title, bodyHtml, footerNote = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
          <tr>
            <td style="background-color:#16A34A;padding:24px 32px;">
              <span style="color:#FFFFFF;font-size:20px;font-weight:700;">${appName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#111827;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#F8FAFC;border-top:1px solid #E5E7EB;">
              <p style="margin:0;color:#6B7280;font-size:12px;line-height:18px;">
                ${footerNote || `If you did not request this email, you can safely ignore it.`}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buttonHtml(url, label) {
  return `<a href="${url}" target="_blank" style="display:inline-block;background-color:#16A34A;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin-top:16px;">${label}</a>`;
}

export function codeBlockHtml(code) {
  return `<div style="background-color:#DCFCE7;color:#14532D;font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;padding:16px;border-radius:8px;margin:20px 0;">${code}</div>`;
}
